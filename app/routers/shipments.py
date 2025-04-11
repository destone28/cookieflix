# app/routers/shipments.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.schemas import shipment as schemas
from app.models.shipment import Shipment, ShipmentItem
from app.models.product import Design
from app.models.user import User
from app.utils.auth import get_current_active_user, get_current_admin_user
from app.database import get_db
from app.config import settings

router = APIRouter(prefix=f"{settings.API_PREFIX}/shipments", tags=["Shipments"])

@router.get("/my", response_model=List[schemas.ShipmentWithItems])
async def get_my_shipments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Ottiene le spedizioni dell'utente corrente"""
    shipments = db.query(Shipment)\
        .filter(Shipment.user_id == current_user.id)\
        .order_by(Shipment.created_at.desc())\
        .all()
    
    # Carica i design per ogni item
    for shipment in shipments:
        for item in shipment.shipment_items:
            item.design = db.query(Design).filter(Design.id == item.design_id).first()
    
    return shipments

@router.post("/", response_model=schemas.Shipment, status_code=status.HTTP_201_CREATED)
async def create_shipment(
    shipment_data: schemas.ShipmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)  # Solo admin
):
    """Crea una nuova spedizione (solo admin)"""
    new_shipment = Shipment(**shipment_data.dict())
    db.add(new_shipment)
    db.commit()
    db.refresh(new_shipment)
    return new_shipment

@router.post("/{shipment_id}/items", response_model=schemas.ShipmentItem)
async def add_shipment_item(
    shipment_id: int,
    item_data: schemas.ShipmentItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)  # Solo admin
):
    """Aggiunge un item a una spedizione (solo admin)"""
    # Verifica che la spedizione esista
    shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Spedizione non trovata"
        )
    
    # Verifica che il design esista
    design = db.query(Design).filter(Design.id == item_data.design_id).first()
    if not design:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Design non trovato"
        )
    
    # Crea l'item
    new_item = ShipmentItem(
        shipment_id=shipment_id,
        design_id=item_data.design_id,
        quantity=item_data.quantity
    )
    
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    
    return new_item