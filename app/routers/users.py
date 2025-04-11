# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

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
    # Estrai i dati da aggiornare
    update_dict = user_data.dict(exclude_unset=True)
    
    # Debug: stampa i dati ricevuti
    print("Dati ricevuti per l'aggiornamento:", update_dict)
    
    # Gestione separata per l'indirizzo e la data di nascita
    
    # 1. Verifica se stiamo aggiornando l'indirizzo
    address_fields = ['address', 'street_number', 'city', 'zip_code', 'country']
    address_update = any(field in update_dict for field in address_fields)
    
    if address_update:
        # Controlla se abbiamo tutti i campi richiesti per l'indirizzo
        for field in address_fields:
            if field not in update_dict or not update_dict.get(field):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Tutti i campi dell'indirizzo sono obbligatori. Manca: {field}"
                )
    
    # 2. Gestione specifica della data di nascita
    if 'birthdate' in update_dict:
        birthdate_value = update_dict['birthdate']
        print(f"Aggiornamento della data di nascita: {birthdate_value} (tipo: {type(birthdate_value)})")
        
        try:
            # Se è una stringa, tenta di convertirla in datetime
            if isinstance(birthdate_value, str):
                # Gestisci formato ISO YYYY-MM-DD
                birthdate_value = datetime.fromisoformat(birthdate_value)
                update_dict['birthdate'] = birthdate_value
                print(f"Data convertita: {birthdate_value}")
            
            # Se è None, utilizza la data predefinita
            elif birthdate_value is None:
                update_dict['birthdate'] = datetime(1985, 1, 1)
                print("Utilizzo data predefinita: 1985-01-01")
                
        except ValueError as e:
            print(f"Errore nella conversione della data: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Formato data non valido. Usa YYYY-MM-DD"
            )
    
    # 3. Aggiorna i campi dell'utente
    for field, value in update_dict.items():
        print(f"Aggiornamento del campo {field} con valore {value}")
        setattr(current_user, field, value)
    
    # 4. Salva le modifiche
    db.commit()
    db.refresh(current_user)
    
    print("Utente aggiornato con successo:", current_user.__dict__)
    
    return current_user

@router.get("/referral-code", response_model=dict)
async def get_referral_code(
    current_user: User = Depends(get_current_active_user)
):
    """Ottiene il codice referral dell'utente corrente"""
    return {"referral_code": current_user.referral_code}