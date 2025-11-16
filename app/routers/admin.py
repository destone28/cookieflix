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
from app.schemas import user as user_schemas
from app.models.activity import Activity
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


# =============================================================================
# DESIGN MANAGEMENT ENDPOINTS
# =============================================================================

@router.post("/designs", response_model=product_schemas.Design, dependencies=admin_dependency)
async def create_design(
    design_data: product_schemas.DesignCreate,
    db: Session = Depends(get_db)
):
    """Crea un nuovo design"""
    # Verifica che la categoria esista
    category = db.query(Category).filter(Category.id == design_data.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria non trovata"
        )

    # Crea il nuovo design
    new_design = Design(
        name=design_data.name,
        description=design_data.description,
        category_id=design_data.category_id,
        image_url=design_data.image_url,
        model_url=design_data.model_url
    )

    db.add(new_design)
    db.commit()
    db.refresh(new_design)

    logger.info(f"Admin created new design: {new_design.name} (ID: {new_design.id}) in category {category.name}")
    return new_design


@router.get("/designs/{design_id}", response_model=product_schemas.DesignWithCategory, dependencies=admin_dependency)
async def get_design_by_id(
    design_id: int,
    db: Session = Depends(get_db)
):
    """Ottiene un design specifico per ID con informazioni categoria"""
    design = db.query(Design).filter(Design.id == design_id).first()

    if not design:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Design non trovato"
        )

    # Aggiungi conteggio voti
    votes_count = db.query(func.count(Vote.id)).filter(
        Vote.design_id == design.id
    ).scalar()
    setattr(design, 'votes_count', votes_count)

    return design


@router.put("/designs/{design_id}", response_model=product_schemas.Design, dependencies=admin_dependency)
async def update_design(
    design_id: int,
    design_data: product_schemas.DesignUpdate,
    db: Session = Depends(get_db)
):
    """Aggiorna un design esistente"""
    design = db.query(Design).filter(Design.id == design_id).first()

    if not design:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Design non trovato"
        )

    # Verifica che la nuova categoria esista (se fornita)
    if design_data.category_id and design_data.category_id != design.category_id:
        category = db.query(Category).filter(Category.id == design_data.category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria non trovata"
            )
        design.category_id = design_data.category_id

    # Aggiorna gli altri campi se forniti
    if design_data.name is not None:
        design.name = design_data.name
    if design_data.description is not None:
        design.description = design_data.description
    if design_data.image_url is not None:
        design.image_url = design_data.image_url
    if design_data.model_url is not None:
        design.model_url = design_data.model_url
    if design_data.is_active is not None:
        design.is_active = design_data.is_active

    db.commit()
    db.refresh(design)

    logger.info(f"Admin updated design ID {design_id}")
    return design


@router.delete("/designs/{design_id}", dependencies=admin_dependency)
async def delete_design(
    design_id: int,
    permanent: bool = False,
    db: Session = Depends(get_db)
):
    """
    Elimina o disattiva un design

    Args:
        design_id: ID del design
        permanent: Se True, elimina permanentemente. Se False (default), disattiva solo
    """
    design = db.query(Design).filter(Design.id == design_id).first()

    if not design:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Design non trovato"
        )

    # Conta i voti associati
    votes_count = db.query(func.count(Vote.id)).filter(
        Vote.design_id == design_id
    ).scalar()

    if permanent:
        # Elimina prima tutti i voti associati
        if votes_count > 0:
            db.query(Vote).filter(Vote.design_id == design_id).delete()
            logger.info(f"Deleted {votes_count} votes for design ID {design_id}")

        db.delete(design)
        message = f"Design '{design.name}' eliminato permanentemente (con {votes_count} voti)"
        logger.warning(f"Admin permanently deleted design ID {design_id}")
    else:
        design.is_active = False
        message = f"Design '{design.name}' disattivato ({votes_count} voti preservati)"
        logger.info(f"Admin deactivated design ID {design_id}")

    db.commit()

    return {
        "message": message,
        "design_id": design_id,
        "votes_count": votes_count,
        "permanent": permanent
    }


# =============================================================================
# USER MANAGEMENT ENDPOINTS
# =============================================================================

@router.get("/users", dependencies=admin_dependency)
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    is_admin: Optional[bool] = None,
    has_subscription: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Ottiene lista completa utenti con filtri avanzati"""
    query = db.query(User)

    # Applica filtri
    if search:
        query = query.filter(
            (User.email.ilike(f"%{search}%")) | (User.full_name.ilike(f"%{search}%"))
        )
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    if is_admin is not None:
        query = query.filter(User.is_admin == is_admin)
    if has_subscription is not None:
        if has_subscription:
            query = query.filter(
                User.id.in_(
                    db.query(Subscription.user_id).filter(Subscription.is_active == True)
                )
            )
        else:
            query = query.filter(
                ~User.id.in_(
                    db.query(Subscription.user_id).filter(Subscription.is_active == True)
                )
            )

    # Conta il totale prima di applicare skip/limit
    total = query.count()

    # Applica paginazione
    users = query.offset(skip).limit(limit).all()

    # Aggiungi info abbonamento per ogni utente
    result_users = []
    for user in users:
        user_dict = user_schemas.User.from_orm(user).dict()
        # Aggiungi conteggio abbonamenti attivi
        active_subscriptions = db.query(func.count(Subscription.id)).filter(
            Subscription.user_id == user.id,
            Subscription.is_active == True
        ).scalar()
        user_dict['active_subscriptions_count'] = active_subscriptions
        result_users.append(user_dict)

    return {
        "items": result_users,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/users/{user_id}", response_model=user_schemas.User, dependencies=admin_dependency)
async def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Ottiene dettagli completi di un utente specifico"""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utente non trovato"
        )

    return user


@router.get("/users/{user_id}/activity", dependencies=admin_dependency)
async def get_user_activity(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Ottiene lo storico attività di un utente"""
    # Verifica che l'utente esista
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utente non trovato"
        )

    # Recupera attività
    total = db.query(func.count(Activity.id)).filter(Activity.user_id == user_id).scalar()
    activities = db.query(Activity).filter(
        Activity.user_id == user_id
    ).order_by(Activity.timestamp.desc()).offset(skip).limit(limit).all()

    return {
        "user_id": user_id,
        "user_email": user.email,
        "total": total,
        "items": [
            {
                "id": activity.id,
                "action": activity.action,
                "timestamp": activity.timestamp,
                "metadata": activity.metadata
            }
            for activity in activities
        ]
    }


@router.put("/users/{user_id}", response_model=user_schemas.User, dependencies=admin_dependency)
async def update_user(
    user_id: int,
    user_data: user_schemas.AdminUserUpdate,
    db: Session = Depends(get_db)
):
    """Aggiorna un utente (admin ha accesso completo a tutti i campi)"""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utente non trovato"
        )

    # Verifica unicità email se viene modificata
    if user_data.email and user_data.email != user.email:
        existing = db.query(User).filter(
            User.email == user_data.email,
            User.id != user_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email già utilizzata da un altro utente"
            )
        user.email = user_data.email

    # Aggiorna campi se forniti
    update_fields = []
    if user_data.full_name is not None:
        user.full_name = user_data.full_name
        update_fields.append("full_name")
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
        update_fields.append("is_active")
    if user_data.is_admin is not None:
        user.is_admin = user_data.is_admin
        update_fields.append("is_admin")
    if user_data.credit_balance is not None:
        user.credit_balance = user_data.credit_balance
        update_fields.append("credit_balance")
    if user_data.address is not None:
        user.address = user_data.address
        update_fields.append("address")
    if user_data.street_number is not None:
        user.street_number = user_data.street_number
        update_fields.append("street_number")
    if user_data.city is not None:
        user.city = user_data.city
        update_fields.append("city")
    if user_data.zip_code is not None:
        user.zip_code = user_data.zip_code
        update_fields.append("zip_code")
    if user_data.country is not None:
        user.country = user_data.country
        update_fields.append("country")
    if user_data.birthdate is not None:
        user.birthdate = user_data.birthdate
        update_fields.append("birthdate")

    db.commit()
    db.refresh(user)

    logger.info(f"Admin updated user ID {user_id}, fields: {', '.join(update_fields)}")
    return user


@router.delete("/users/{user_id}", dependencies=admin_dependency)
async def delete_user(
    user_id: int,
    permanent: bool = False,
    db: Session = Depends(get_db)
):
    """
    Elimina o disattiva un utente

    Args:
        user_id: ID dell'utente
        permanent: Se True, elimina permanentemente. Se False (default), disattiva solo
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utente non trovato"
        )

    # Verifica se è admin
    if user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossibile eliminare un utente amministratore"
        )

    # Conta dati associati
    subscriptions_count = db.query(func.count(Subscription.id)).filter(
        Subscription.user_id == user_id
    ).scalar()
    votes_count = db.query(func.count(Vote.id)).filter(Vote.user_id == user_id).scalar()
    activities_count = db.query(func.count(Activity.id)).filter(Activity.user_id == user_id).scalar()

    if permanent:
        # Verifica abbonamenti attivi
        active_subs = db.query(func.count(Subscription.id)).filter(
            Subscription.user_id == user_id,
            Subscription.is_active == True
        ).scalar()
        if active_subs > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Impossibile eliminare: l'utente ha {active_subs} abbonamento/i attivo/i"
            )

        # Elimina dati associati
        db.query(Vote).filter(Vote.user_id == user_id).delete()
        db.query(Activity).filter(Activity.user_id == user_id).delete()
        db.query(Subscription).filter(Subscription.user_id == user_id).delete()

        db.delete(user)
        message = f"Utente '{user.email}' eliminato permanentemente"
        logger.warning(f"Admin permanently deleted user ID {user_id} ({user.email})")
    else:
        user.is_active = False
        message = f"Utente '{user.email}' disattivato"
        logger.info(f"Admin deactivated user ID {user_id} ({user.email})")

    db.commit()

    return {
        "message": message,
        "user_id": user_id,
        "email": user.email,
        "subscriptions_count": subscriptions_count,
        "votes_count": votes_count,
        "activities_count": activities_count,
        "permanent": permanent
    }