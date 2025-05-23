# app/routers/subscriptions.py
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import json, logging
from typing import List, Optional
from datetime import datetime, timedelta

import stripe

from app.schemas import subscription as schemas
from app.models.subscription import SubscriptionPlan, Subscription
from app.models.user import User
from app.models.product import Category
from app.utils.auth import get_current_active_user, get_current_admin_user, get_current_user_optional
from app.utils.payments import (
    create_stripe_customer, create_stripe_checkout_session,
    PLAN_MAPPING, calculate_next_billing_date
)
from app.database import get_db
from app.config import settings

logger = logging.getLogger(__name__)

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
    request: Request,
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
            detail=f"Combinazione piano/periodo non valida: {price_key}"
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
    
    # Ottieni URL di base con percorso API corretto
    base_url = str(request.base_url).rstrip('/')
    api_prefix = settings.API_PREFIX
    
    # Assicurati che l'URL di redirect includa anche il prefisso API
    success_url = f"{base_url}{api_prefix}/subscriptions/redirect-success/{{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{base_url}{api_prefix}/subscriptions/redirect-cancel/{{CHECKOUT_SESSION_ID}}"
    
    logger.info(f"Creazione checkout per utente {current_user.id}, piano {plan.id}, periodo {checkout_data.billing_period}")
    logger.info(f"URL di successo: {success_url}")
    logger.info(f"URL di annullamento: {cancel_url}")
    
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

@router.get("/verify-session/{session_id}")
async def verify_checkout_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Verifica una sessione di checkout Stripe"""
    try:
        # Recupera la sessione da Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        logger.info(f"Sessione recuperata: {session.id}, stato pagamento: {session.payment_status}")
        
        # Verifica se la sessione è stata pagata
        if session.payment_status != "paid":
            logger.info(f"Sessione non pagata: {session_id}")
            return {
                "status": "pending",
                "message": "Il pagamento non è ancora stato completato"
            }
        
        # Estrai l'ID utente dai metadati della sessione
        user_id = session.metadata.get("user_id")
        if not user_id:
            logger.error(f"Metadati utente mancanti nella sessione: {session_id}")
            return {
                "status": "error",
                "message": "Impossibile identificare l'utente per questa sessione"
            }
        
        # Trova l'utente nel database
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.error(f"Utente non trovato: {user_id}")
            return {
                "status": "error",
                "message": "Utente non trovato"
            }
        
        # Controlla se esiste già un abbonamento per questa sessione
        existing_subscription = db.query(Subscription).filter(
            Subscription.user_id == user_id,
            Subscription.stripe_subscription_id == session.subscription
        ).first()
        
        if existing_subscription:
            logger.info(f"Abbonamento già esistente per la sessione: {session_id}")
            return {
                "status": "success",
                "message": "Abbonamento già attivato",
                "subscription_id": existing_subscription.id,
                "session_id": session_id
            }
        
        # Ottieni i metadati dalla sessione
        plan_id = session.metadata.get("plan_id")
        billing_period = session.metadata.get("billing_period")
        
        # Ottieni il piano
        plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
        if not plan:
            logger.error(f"Piano non trovato: {plan_id}")
            return {
                "status": "error",
                "message": "Piano non trovato"
            }
        
        # Calcola le date di inizio e fine abbonamento
        start_date = datetime.utcnow()
        end_date = calculate_next_billing_date(billing_period)
        
        # Crea l'abbonamento
        subscription = Subscription(
            user_id=user_id,
            plan_id=plan_id,
            start_date=start_date,
            end_date=end_date,
            is_active=True,
            billing_period=billing_period,
            next_billing_date=end_date,
            stripe_customer_id=session.customer,
            stripe_subscription_id=session.subscription
        )
        
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        
        logger.info(f"Abbonamento creato con successo: {subscription.id}")
        
        return {
            "status": "success",
            "message": "Abbonamento attivato con successo",
            "subscription_id": subscription.id,
            "session_id": session_id
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Errore Stripe: {e}")
        return {
            "status": "error",
            "message": f"Errore durante la verifica: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Errore nella verifica della sessione: {e}")
        return {
            "status": "error",
            "message": "Errore interno del server"
        }

@router.get("/cancel-checkout")
async def cancel_checkout(
    session_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_user)
):
    """Gestisce l'annullamento di un checkout"""
    logger.info(f"Checkout annullato dall'utente {current_user.id} - Sessione: {session_id}")
    
    return {
        "status": "cancelled",
        "message": "Checkout annullato dall'utente"
    }

@router.get("/verify-session/{session_id}")
async def verify_checkout_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """Verifica una sessione di checkout Stripe e conferma l'abbonamento"""
    try:
        # Recupera la sessione da Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        
        # Se l'utente non è autenticato, richiedi login
        if not current_user:
            logger.info(f"Verifica sessione {session_id} richiede autenticazione")
            return {
                "status": "requires_login",
                "message": "Per verificare lo stato dell'abbonamento è necessario accedere"
            }
        
        # Verifica che la sessione appartenga all'utente corrente
        user_id_from_session = session.metadata.get("user_id")
        if user_id_from_session and str(user_id_from_session) != str(current_user.id):
            logger.warning(f"Tentativo di verifica sessione di un altro utente: {session_id}")
            return {
                "status": "error",
                "message": "Non hai il permesso di verificare questa sessione"
            }
        
        # Verifica se la sessione è stata pagata
        if session.payment_status != "paid":
            logger.info(f"Sessione non pagata: {session_id}")
            return {
                "status": "pending",
                "message": "Il pagamento non è ancora stato completato"
            }
        
        # Controlla se esiste già un abbonamento per questa sessione
        existing_subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id,
            Subscription.stripe_subscription_id == session.subscription
        ).first()
        
        if existing_subscription:
            logger.info(f"Abbonamento già esistente per la sessione: {session_id}")
            return {
                "status": "success",
                "message": "Abbonamento già attivato",
                "subscription_id": existing_subscription.id
            }
        
        # Ottieni i metadati dalla sessione
        plan_id = session.metadata.get("plan_id")
        billing_period = session.metadata.get("billing_period")
        
        # Ottieni il piano
        plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == plan_id).first()
        if not plan:
            logger.error(f"Piano non trovato: {plan_id}")
            return {
                "status": "error",
                "message": "Piano non trovato"
            }
        
        # Calcola le date di inizio e fine abbonamento
        start_date = datetime.utcnow()
        end_date = calculate_next_billing_date(billing_period)
        
        # Crea l'abbonamento
        subscription = Subscription(
            user_id=current_user.id,
            plan_id=plan_id,
            start_date=start_date,
            end_date=end_date,
            is_active=True,
            billing_period=billing_period,
            next_billing_date=end_date,
            stripe_customer_id=session.customer,
            stripe_subscription_id=session.subscription
        )
        
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        
        logger.info(f"Abbonamento creato con successo: {subscription.id}")
        
        return {
            "status": "success",
            "message": "Abbonamento attivato con successo",
            "subscription_id": subscription.id
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Errore Stripe: {e}")
        return {
            "status": "error",
            "message": f"Errore durante la verifica: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Errore nella verifica della sessione: {e}")
        return {
            "status": "error",
            "message": "Errore interno del server"
        }
    
@router.get("/cancel-checkout")
async def cancel_checkout(
    session_id: Optional[str] = Query(None)
):
    """Gestisce l'annullamento di un checkout"""
    logger.info(f"Checkout annullato - Sessione: {session_id}")
    
    return {
        "status": "cancelled",
        "message": "Checkout annullato"
    }

@router.get("/redirect-success/{session_id}")
async def redirect_success(
    session_id: str,
    request: Request
):
    """Redirect alla pagina di successo frontend dopo la verifica della sessione"""
    frontend_url = settings.FRONTEND_URL
    return RedirectResponse(url=f"{frontend_url}/checkout/success?session_id={session_id}")

@router.get("/redirect-cancel/{session_id}")
async def redirect_cancel(
    session_id: str,
    request: Request
):
    """Redirect alla pagina di annullamento frontend dopo l'annullamento del checkout"""
    frontend_url = settings.FRONTEND_URL
    return RedirectResponse(url=f"{frontend_url}/checkout/cancel?session_id={session_id}")

@router.get("/redirect-success/{session_id}")
async def redirect_success(
    session_id: str,
    request: Request
):
    """Redirect alla pagina di successo frontend dopo la verifica della sessione"""
    frontend_url = settings.FRONTEND_URL
    logger.info(f"Redirecting to success page with session: {session_id}")
    return RedirectResponse(url=f"{frontend_url}/checkout/success?session_id={session_id}")

@router.get("/redirect-cancel/{session_id}")
async def redirect_cancel(
    session_id: str,
    request: Request
):
    """Redirect alla pagina di annullamento frontend dopo l'annullamento del checkout"""
    frontend_url = settings.FRONTEND_URL
    logger.info(f"Redirecting to cancel page with session: {session_id}")
    return RedirectResponse(url=f"{frontend_url}/checkout/cancel?session_id={session_id}")