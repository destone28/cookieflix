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

import logging

# Middleware che verifica che l'utente sia un admin
# admin_dependency = [Depends(get_current_admin_user)]
admin_dependency = [] # Rimuovo temporaneamente la dipendenza per debug
router = APIRouter(prefix=f"{settings.API_PREFIX}/admin", tags=["Admin"])

logger = logging.getLogger(__name__)


# Endpoint di health check
@router.get("/health")
async def health_check(current_user: User = Depends(get_current_admin_user)):
    """Verifica lo stato del server admin"""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow(),
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "is_admin": current_user.is_admin
        },
        "environment": "development" if settings.DEBUG else "production"
    }

# Statistiche utenti
@router.get("/users/stats")
async def get_users_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    """Ottiene statistiche sugli utenti"""
    total_users = db.query(func.count(User.id)).scalar()
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    inactive_users = db.query(func.count(User.id)).filter(User.is_active == False).scalar()
    admin_users = db.query(func.count(User.id)).filter(User.is_admin == True).scalar()
    recent_users = db.query(func.count(User.id)).filter(User.created_at >= datetime.utcnow() - timedelta(days=30)).scalar()
    
    return {
        "total": total_users,
        "active": active_users,
        "inactive": inactive_users,
        "admins": admin_users,
        "recent": recent_users
    }

# Statistiche abbonamenti
@router.get("/subscriptions/stats")
async def get_subscriptions_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin_user)):
    """Ottiene statistiche sugli abbonamenti"""
    total_subscriptions = db.query(func.count(Subscription.id)).scalar()
    active_subscriptions = db.query(func.count(Subscription.id)).filter(Subscription.is_active == True).scalar()
    
    monthly = db.query(func.count(Subscription.id)).filter(
        Subscription.is_active == True, 
        Subscription.billing_period == "monthly"
    ).scalar()
    
    quarterly = db.query(func.count(Subscription.id)).filter(
        Subscription.is_active == True, 
        Subscription.billing_period == "quarterly"
    ).scalar()
    
    semiannual = db.query(func.count(Subscription.id)).filter(
        Subscription.is_active == True, 
        Subscription.billing_period == "semiannual"
    ).scalar()
    
    annual = db.query(func.count(Subscription.id)).filter(
        Subscription.is_active == True, 
        Subscription.billing_period == "annual"
    ).scalar()
    
    return {
        "total": total_subscriptions,
        "active": active_subscriptions,
        "by_period": {
            "monthly": monthly,
            "quarterly": quarterly,
            "semiannual": semiannual,
            "annual": annual
        }
    }

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

# Endpoint pubblico per health check (senza autenticazione)
@router.get("/public-health")
async def public_health_check():
    """Verifica lo stato del server admin (endpoint pubblico)"""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0",
        "environment": "development" if settings.DEBUG else "production"
    }