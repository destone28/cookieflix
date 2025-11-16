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
from app.schemas import product as product_schemas
import re
import unicodedata

import logging


def slugify(text: str) -> str:
    """Converte un testo in slug URL-friendly"""
    # Normalizza unicode
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    # Converti in minuscolo e rimuovi caratteri non alfanumerici
    text = re.sub(r'[^\w\s-]', '', text.lower())
    # Sostituisci spazi con trattini
    text = re.sub(r'[-\s]+', '-', text).strip('-')
    return text

# Middleware che verifica che l'utente sia un admin
admin_dependency = [Depends(get_current_admin_user)]
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


# =============================================================================
# CATEGORY MANAGEMENT ENDPOINTS
# =============================================================================

@router.post("/categories", response_model=product_schemas.Category, dependencies=admin_dependency)
async def create_category(
    category_data: product_schemas.CategoryCreate,
    db: Session = Depends(get_db)
):
    """Crea una nuova categoria"""
    # Verifica se esiste già una categoria con lo stesso nome o slug
    existing = db.query(Category).filter(
        (Category.name == category_data.name) | (Category.slug == category_data.slug)
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esiste già una categoria con questo nome o slug"
        )

    # Crea la nuova categoria
    new_category = Category(
        name=category_data.name,
        slug=category_data.slug,
        description=category_data.description,
        image_url=category_data.image_url or ""
    )

    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    logger.info(f"Admin created new category: {new_category.name} (ID: {new_category.id})")
    return new_category


@router.get("/categories/{category_id}", response_model=product_schemas.Category, dependencies=admin_dependency)
async def get_category_by_id(
    category_id: int,
    db: Session = Depends(get_db)
):
    """Ottiene una categoria specifica per ID"""
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria non trovata"
        )

    # Aggiungi conteggio design
    design_count = db.query(func.count(Design.id)).filter(
        Design.category_id == category.id
    ).scalar()
    setattr(category, 'design_count', design_count)

    return category


@router.put("/categories/{category_id}", response_model=product_schemas.Category, dependencies=admin_dependency)
async def update_category(
    category_id: int,
    category_data: product_schemas.CategoryUpdate,
    db: Session = Depends(get_db)
):
    """Aggiorna una categoria esistente"""
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria non trovata"
        )

    # Verifica unicità del nome se viene modificato
    if category_data.name and category_data.name != category.name:
        existing = db.query(Category).filter(
            Category.name == category_data.name,
            Category.id != category_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Esiste già una categoria con questo nome"
            )
        category.name = category_data.name
        # Auto-genera slug dal nuovo nome
        category.slug = slugify(category_data.name)

    # Aggiorna gli altri campi se forniti
    if category_data.description is not None:
        category.description = category_data.description
    if category_data.image_url is not None:
        category.image_url = category_data.image_url
    if category_data.is_active is not None:
        category.is_active = category_data.is_active

    db.commit()
    db.refresh(category)

    logger.info(f"Admin updated category ID {category_id}")
    return category


@router.delete("/categories/{category_id}", dependencies=admin_dependency)
async def delete_category(
    category_id: int,
    permanent: bool = False,
    db: Session = Depends(get_db)
):
    """
    Elimina o disattiva una categoria

    Args:
        category_id: ID della categoria
        permanent: Se True, elimina permanentemente. Se False (default), disattiva solo
    """
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria non trovata"
        )

    # Verifica se ci sono design associati
    design_count = db.query(func.count(Design.id)).filter(
        Design.category_id == category_id
    ).scalar()

    if permanent:
        if design_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Impossibile eliminare: ci sono {design_count} design associati a questa categoria"
            )
        db.delete(category)
        message = f"Categoria '{category.name}' eliminata permanentemente"
        logger.warning(f"Admin permanently deleted category ID {category_id}")
    else:
        category.is_active = False
        message = f"Categoria '{category.name}' disattivata"
        logger.info(f"Admin deactivated category ID {category_id}")

    db.commit()

    return {
        "message": message,
        "category_id": category_id,
        "design_count": design_count,
        "permanent": permanent
    }