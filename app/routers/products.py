# app/routers/products.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import os
from datetime import datetime, timedelta

from app.schemas import product as schemas
from app.models.product import Category, Design, Vote
from app.models.user import User
from app.models.subscription import Subscription
from app.utils.auth import get_current_active_user, get_current_admin_user
from app.database import get_db
from app.config import settings

router = APIRouter(prefix=f"{settings.API_PREFIX}/products", tags=["Products"])

@router.get("/categories", response_model=List[schemas.Category])
async def get_categories(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Ottiene tutte le categorie attive"""
    categories = db.query(Category)\
        .filter(Category.is_active == True)\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return categories

@router.get("/categories/{slug}", response_model=schemas.Category)
async def get_category(
    slug: str,
    db: Session = Depends(get_db)
):
    """Ottiene i dettagli di una categoria specifica"""
    category = db.query(Category)\
        .filter(Category.slug == slug, Category.is_active == True)\
        .first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria non trovata"
        )
    
    return category

@router.get("/designs", response_model=List[schemas.Design])
async def get_designs(
    category_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Ottiene tutti i design attivi, opzionalmente filtrati per categoria"""
    query = db.query(Design).join(Category)\
        .filter(Design.is_active == True, Category.is_active == True)
    
    if category_id:
        query = query.filter(Design.category_id == category_id)
    
    # Aggiungi conteggio voti
    designs = query.offset(skip).limit(limit).all()
    
    # Aggiungi conteggio voti per ogni design
    for design in designs:
        votes_count = db.query(func.count(Vote.id))\
            .filter(Vote.design_id == design.id)\
            .scalar()
        setattr(design, 'votes_count', votes_count)
    
    return designs

@router.post("/vote", response_model=schemas.Vote)
async def vote_for_design(
    vote_data: schemas.VoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Vota per un design"""
    # Verifica se l'utente ha un abbonamento attivo
    subscription = db.query(Subscription)\
        .filter(Subscription.user_id == current_user.id, Subscription.is_active == True)\
        .first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo gli utenti con abbonamento attivo possono votare"
        )
    
    # Verifica se il design esiste ed è attivo
    design = db.query(Design).filter(Design.id == vote_data.design_id, Design.is_active == True).first()
    if not design:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Design non trovato"
        )
    
    # Verifica se l'utente ha già votato questo design
    existing_vote = db.query(Vote)\
        .filter(Vote.user_id == current_user.id, Vote.design_id == vote_data.design_id)\
        .first()
    
    if existing_vote:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hai già votato per questo design"
        )
    
    # Verifica limite di voti per utente (max 3 per categoria al mese)
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    next_month = month_start + timedelta(days=32)
    next_month_start = next_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    votes_count = db.query(func.count(Vote.id))\
        .join(Design, Vote.design_id == Design.id)\
        .filter(
            Vote.user_id == current_user.id,
            Design.category_id == design.category_id,
            Vote.created_at >= month_start,
            Vote.created_at < next_month_start
        ).scalar()
    
    if votes_count >= 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hai raggiunto il limite di 3 voti mensili per questa categoria"
        )
    
    # Crea il voto
    new_vote = Vote(
        user_id=current_user.id,
        design_id=vote_data.design_id
    )
    db.add(new_vote)
    db.commit()
    db.refresh(new_vote)
    
    return new_vote

@router.get("/my-votes", response_model=List[schemas.Design])
async def get_my_votes(
    category_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Ottiene i design votati dall'utente, opzionalmente filtrati per categoria"""
    query = db.query(Design)\
        .join(Vote, Design.id == Vote.design_id)\
        .filter(Vote.user_id == current_user.id, Design.is_active == True)
    
    if category_id:
        query = query.filter(Design.category_id == category_id)
    
    designs = query.all()
    
    # Aggiungi conteggio voti per ogni design
    for design in designs:
        votes_count = db.query(func.count(Vote.id))\
            .filter(Vote.design_id == design.id)\
            .scalar()
        setattr(design, 'votes_count', votes_count)
    
    return designs