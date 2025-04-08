# app/routers/subscriptions.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import json
from typing import List
from datetime import datetime, timedelta

from app.schemas import subscription as schemas
from app.models.subscription import SubscriptionPlan, Subscription
from app.models.user import User
from app.models.product import Category
from app.utils.auth import get_current_active_user, get_current_admin_user
from app.utils.payments import (
    create_stripe_customer, create_stripe_checkout_session,
    PLAN_MAPPING, calculate_next_billing_date
)
from app.database import get_db
from app.config import settings

router = APIRouter(prefix=f"{settings.API_PREFIX}/subscriptions", tags=["Subscriptions"])

@router.get("/plans", response_model=List[schemas.SubscriptionPlan])
async def get_subscription_plans(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Ottiene tutti i piani di abbonamento attivi"""
    plans = db.query(SubscriptionPlan)\
        .filter(SubscriptionPlan.is_active == True)\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    # Deserializza la lista di feature
    for plan in plans:
        plan.features = json.loads(plan.features) if plan.features else []
        
    return plans

@router.get("/plans/{slug}", response_model=schemas.SubscriptionPlan)
async def get_subscription_plan(
    slug: str,
    db: Session = Depends(get_db)
):
    """Ottiene i dettagli di un piano specifico"""
    plan = db.query(SubscriptionPlan)\
        .filter(SubscriptionPlan.slug == slug, SubscriptionPlan.is_active == True)\
        .first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Piano non trovato"
        )
    
    # Deserializza la lista di feature
    plan.features = json.loads(plan.features) if plan.features else []
    
    return plan

@router.post("/checkout", response_model=schemas.CheckoutSessionResponse)
async def create_checkout_session(
    checkout_data: schemas.CreateCheckoutSession,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Crea una sessione di checkout Stripe per l'abbonamento"""
    # Verifica piano e periodo
    plan = db.query(SubscriptionPlan)\
        .filter(SubscriptionPlan.slug == checkout_data.plan_slug, SubscriptionPlan.is_active == True)\
        .first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Piano non trovato"
        )
    
    if checkout_data.billing_period not in ["monthly", "quarterly", "semiannual", "annual"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Periodo di fatturazione non valido"
        )
    
    # Verifica se l'utente ha già un abbonamento attivo
    active_subscription = db.query(Subscription)\
        .filter(Subscription.user_id == current_user.id, Subscription.is_active == True)\
        .first()
    
    if active_subscription:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="L'utente ha già un abbonamento attivo"
        )
    
    # Ottieni chiave prezzo Stripe
    price_key = f"{checkout_data.plan_slug}_{checkout_data.billing_period}"
    stripe_price_id = PLAN_MAPPING.get(price_key)
    
    if not stripe_price_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Combinazione piano/periodo non valida"
        )
    
    # Crea o ottieni customer Stripe
    if not current_user.stripe_customer_id:
        stripe_customer_id = create_stripe_customer(
            email=current_user.email,
            name=current_user.full_name,
            metadata={"user_id": current_user.id}
        )
        # Aggiorna l'utente con l'ID cliente Stripe
        current_user.stripe_customer_id = stripe_customer_id
        db.commit()
    else:
        stripe_customer_id = current_user.stripe_customer_id
    
    # Crea session checkout
    success_url = f"{settings.FRONTEND_URL}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{settings.FRONTEND_URL}/checkout/cancel"
    
    metadata = {
        "user_id": current_user.id,
        "plan_id": plan.id,
        "billing_period": checkout_data.billing_period
    }
    
    checkout_session = create_stripe_checkout_session(
        customer_id=stripe_customer_id,
        price_id=stripe_price_id,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    return {"checkout_url": checkout_session.url}

@router.get("/my", response_model=schemas.SubscriptionWithPlan)
async def get_my_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Ottiene l'abbonamento attivo dell'utente"""
    subscription = db.query(Subscription)\
        .filter(Subscription.user_id == current_user.id, Subscription.is_active == True)\
        .first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nessun abbonamento attivo trovato"
        )
    
    # Carica il piano
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == subscription.plan_id).first()
    if plan:
        plan.features = json.loads(plan.features) if plan.features else []
    
    subscription.plan = plan
    
    return subscription

@router.post("/update-categories")
async def update_subscription_categories(
    category_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Aggiorna le categorie preferite dell'utente"""
    # Verifica se l'utente ha un abbonamento attivo
    subscription = db.query(Subscription)\
        .filter(Subscription.user_id == current_user.id, Subscription.is_active == True)\
        .first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo gli utenti con abbonamento attivo possono aggiornare le categorie"
        )
    
    # Verifica il limite di categorie
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == subscription.plan_id).first()
    if len(category_ids) > plan.categories_count:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Il tuo piano permette al massimo {plan.categories_count} categorie"
        )
    
    # Verifica che le categorie esistano
    categories = db.query(Category)\
        .filter(Category.id.in_(category_ids), Category.is_active == True)\
        .all()
    
    if len(categories) != len(category_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Una o più categorie non esistono o non sono attive"
        )
    
    # Aggiorna le categorie preferite
    current_user.preferred_categories = categories
    db.commit()
    
    return {"status": "success", "categories": categories}