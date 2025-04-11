# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import logging
from passlib.context import CryptContext
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.schemas import user as schemas
from app.schemas import product as product_schemas
from app.models.user import User, user_category_preference
from app.models.product import Category
from app.utils.auth import get_current_active_user, get_password_hash, verify_password
from app.utils.email import send_email
from app.database import get_db
from app.config import settings

logger = logging.getLogger(__name__)

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

@router.post("/change-password", response_model=dict)
async def change_password(
    password_data: schemas.PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Cambia la password dell'utente"""
    # Verifica la password attuale
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password attuale non corretta"
        )
    
    # Verifica che la nuova password sia diversa dalla vecchia
    if password_data.current_password == password_data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nuova password deve essere diversa dalla precedente"
        )
    
    # Aggiorna la password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password aggiornata con successo"}

def send_deletion_email(admin_email: str, user_email: str, reason: str):
    """Invia email di richiesta cancellazione account"""
    subject = f"Richiesta di cancellazione account - {user_email}"
    
    # Corpo del messaggio
    body = f"""
    Un utente ha richiesto la cancellazione del proprio account.
    
    Dettagli:
    - Email: {user_email}
    - Motivo: {reason}
    
    Per procedere con la cancellazione, accedi al pannello di amministrazione.
    """
    
    # Versione HTML del messaggio
    html_body = f"""
    <html>
    <body>
        <h2>Richiesta di cancellazione account</h2>
        <p>Un utente ha richiesto la cancellazione del proprio account.</p>
        
        <h3>Dettagli:</h3>
        <ul>
            <li><strong>Email:</strong> {user_email}</li>
            <li><strong>Motivo:</strong> {reason}</li>
        </ul>
        
        <p>Per procedere con la cancellazione, accedi al <a href="{settings.FRONTEND_URL}/admin">pannello di amministrazione</a>.</p>
    </body>
    </html>
    """
    
    # Invia l'email
    return send_email(admin_email, subject, body, html_body)

@router.post("/request-deletion", response_model=dict)
async def request_account_deletion(
    deletion_data: schemas.AccountDeletionRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Richiede la cancellazione dell'account"""
    # Registra la richiesta nel log
    logger.info(f"Richiesta di cancellazione account ricevuta da {current_user.email}: {deletion_data.reason}")
    
    # Invia una email di notifica all'amministratore (in background)
    admin_email = settings.ADMIN_EMAIL
    background_tasks.add_task(
        send_deletion_email, 
        admin_email=admin_email,
        user_email=current_user.email,
        reason=deletion_data.reason
    )
    
    return {"message": "La tua richiesta di cancellazione è stata inviata. Verrai contattato a breve."}

@router.get("/preferred-categories", response_model=List[product_schemas.Category])
async def get_preferred_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Ottiene le categorie preferite dell'utente"""
    from app.schemas.product import Category as CategorySchema
    
    return current_user.preferred_categories