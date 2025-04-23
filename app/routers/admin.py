# app/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.models.subscription import Subscription, SubscriptionPlan
from app.models.product import Category, Design, Vote
from app.utils.auth import get_current_admin_user

router = APIRouter(prefix=f"{settings.API_PREFIX}/admin", tags=["Admin"])

# Middleware che verifica che l'utente sia un admin
admin_dependency = [Depends(get_current_admin_user)]

@router.get("/health", dependencies=admin_dependency)
async def admin_health_check():
    """Verifica lo stato del sistema admin"""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "admin"
    }

@router.get("/users/stats", dependencies=admin_dependency)
async def get_users_stats(db: Session = Depends(get_db)):
    """Statistiche sugli utenti"""
    try:
        total_users = db.query(func.count(User.id)).scalar()
        active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
        inactive_users = total_users - active_users
        
        # Utenti nuovi negli ultimi 30 giorni
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        new_users = db.query(func.count(User.id)).filter(User.created_at >= thirty_days_ago).scalar()
        
        # Utenti con abbonamento attivo
        users_with_active_subscription = db.query(
            func.count(User.id.distinct())
        ).join(Subscription).filter(Subscription.is_active == True).scalar()
        
        return {
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": inactive_users,
            "new_users_30d": new_users,
            "users_with_subscription": users_with_active_subscription,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Errore nel recupero delle statistiche: {str(e)}"
        )

@router.get("/subscriptions/stats", dependencies=admin_dependency)
async def get_subscriptions_stats(db: Session = Depends(get_db)):
    """Statistiche sugli abbonamenti"""
    try:
        total_subscriptions = db.query(func.count(Subscription.id)).scalar()
        active_subscriptions = db.query(func.count(Subscription.id)).filter(Subscription.is_active == True).scalar()
        
        # Abbonamenti per piano
        subscriptions_by_plan = []
        plans = db.query(SubscriptionPlan).all()
        for plan in plans:
            count = db.query(func.count(Subscription.id)).filter(
                Subscription.plan_id == plan.id,
                Subscription.is_active == True
            ).scalar()
            subscriptions_by_plan.append({
                "plan_id": plan.id,
                "plan_name": plan.name,
                "count": count
            })
        
        # Abbonamenti per periodicità
        monthly = db.query(func.count(Subscription.id)).filter(
            Subscription.billing_period == "monthly",
            Subscription.is_active == True
        ).scalar()
        quarterly = db.query(func.count(Subscription.id)).filter(
            Subscription.billing_period == "quarterly",
            Subscription.is_active == True
        ).scalar()
        semiannual = db.query(func.count(Subscription.id)).filter(
            Subscription.billing_period == "semiannual",
            Subscription.is_active == True
        ).scalar()
        annual = db.query(func.count(Subscription.id)).filter(
            Subscription.billing_period == "annual",
            Subscription.is_active == True
        ).scalar()
        
        return {
            "total_subscriptions": total_subscriptions,
            "active_subscriptions": active_subscriptions,
            "subscriptions_by_plan": subscriptions_by_plan,
            "periodicity": {
                "monthly": monthly,
                "quarterly": quarterly,
                "semiannual": semiannual,
                "annual": annual
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Errore nel recupero delle statistiche: {str(e)}"
        )

@router.get("/categories", dependencies=admin_dependency)
async def get_admin_categories(
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Ottiene le categorie con filtri avanzati"""
    query = db.query(Category)
    
    # Applica filtri
    if search:
        query = query.filter(Category.name.ilike(f"%{search}%"))
    if is_active is not None:
        query = query.filter(Category.is_active == is_active)
    
    # Conta il totale prima di applicare skip/limit
    total = query.count()
    
    # Applica paginazione
    query = query.offset(skip).limit(limit)
    
    categories = query.all()
    
    # Aggiungi conteggio design per ogni categoria
    for category in categories:
        design_count = db.query(func.count(Design.id)).filter(
            Design.category_id == category.id
        ).scalar()
        setattr(category, 'design_count', design_count)
    
    return {
        "items": categories,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/designs", dependencies=admin_dependency)
async def get_admin_designs(
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Ottiene i design con filtri avanzati"""
    query = db.query(Design)
    
    # Applica filtri
    if search:
        query = query.filter(Design.name.ilike(f"%{search}%"))
    if category_id:
        query = query.filter(Design.category_id == category_id)
    if is_active is not None:
        query = query.filter(Design.is_active == is_active)
    
    # Conta il totale prima di applicare skip/limit
    total = query.count()
    
    # Applica paginazione
    query = query.offset(skip).limit(limit)
    
    designs = query.all()
    
    # Aggiungi conteggio voti per ogni design
    for design in designs:
        votes_count = db.query(func.count(Vote.id)).filter(
            Vote.design_id == design.id
        ).scalar()
        setattr(design, 'votes_count', votes_count)
    
    return {
        "items": designs,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/system-info", dependencies=admin_dependency)
async def get_system_info():
    """Informazioni sul sistema"""
    return {
        "app_name": settings.PROJECT_NAME,
        "debug_mode": settings.DEBUG,
        "api_prefix": settings.API_PREFIX,
        "frontend_url": settings.FRONTEND_URL,
        "environment": "development" if settings.DEBUG else "production",
        "version": "0.1.0",
        "timestamp": datetime.utcnow().isoformat()
    }