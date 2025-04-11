# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.schemas import user as schemas
from app.models.user import User
from app.utils.auth import get_current_active_user, get_password_hash
from app.database import get_db
from app.config import settings

router = APIRouter(prefix=f"{settings.API_PREFIX}/users", tags=["Users"])

@router.get("/me", response_model=schemas.User)
async def get_current_user_me(current_user: User = Depends(get_current_active_user)):
    """Ottiene i dati dell'utente corrente"""
    return current_user

@router.put("/me", response_model=schemas.User)
async def update_user_me(
    user_data: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Aggiorna i dati dell'utente corrente"""
    # Validazione: se tutti i campi dell'indirizzo sono presenti, devono essere tutti compilati
    address_fields = ['address', 'street_number', 'city', 'zip_code', 'country']
    address_data = {field: user_data.dict().get(field) for field in address_fields if field in user_data.dict()}
    
    if address_data:
        # Se almeno un campo indirizzo è stato fornito, verifichiamo che siano presenti tutti
        missing_fields = [field for field in address_fields if field in address_data and not address_data[field]]
        if missing_fields:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"I seguenti campi dell'indirizzo sono obbligatori: {', '.join(missing_fields)}"
            )
    
    # Aggiorna solo i campi forniti
    for field, value in user_data.dict(exclude_unset=True).items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/referral-code", response_model=dict)
async def get_referral_code(
    current_user: User = Depends(get_current_active_user)
):
    """Ottiene il codice referral dell'utente corrente"""
    return {"referral_code": current_user.referral_code}