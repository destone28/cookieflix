# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.schemas import user as schemas
from app.models.user import User
from app.utils.auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_active_user
)
from app.utils.csrf import generate_csrf_token
from app.database import get_db
from app.config import settings

router = APIRouter(prefix=f"{settings.API_PREFIX}/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.User)
async def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Verifica se l'utente esiste già
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email già registrata"
        )
    
    # Crea il nuovo utente
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        referred_by=user_data.referred_by
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/token", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Verifica credenziali
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenziali non valide",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Genera token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.get("/csrf-token")
async def get_csrf_token():
    """Genera un nuovo token CSRF"""
    token = generate_csrf_token()
    return {"csrf_token": token}

@router.post("/token", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Verifica credenziali
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # Verifica se l'account è bloccato
    if user and user.account_locked_until and user.account_locked_until > datetime.utcnow():
        logger.warning(f"Tentativo di accesso a un account bloccato: {user.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Account temporaneamente bloccato. Riprova dopo {user.account_locked_until}"
        )
    
    # Verifica credenziali
    if not user or not verify_password(form_data.password, user.hashed_password):
        # Gestione tentativi falliti
        if user:
            user.failed_login_attempts += 1
            
            # Blocca l'account dopo 5 tentativi falliti
            if user.failed_login_attempts >= 5:
                user.account_locked_until = datetime.utcnow() + timedelta(minutes=15)
                logger.warning(f"Account bloccato per {user.email} dopo 5 tentativi falliti")
            
            db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenziali non valide",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Reset tentativi falliti dopo login riuscito
    if user.failed_login_attempts > 0:
        user.failed_login_attempts = 0
        user.account_locked_until = None
        db.commit()
    
    # Genera token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

# Endpoint temporaneo per il debug
@router.get("/debug/admin-token")
async def get_admin_token(db: Session = Depends(get_db)):
    """Endpoint temporaneo per debugging - RIMUOVERE IN PRODUZIONE"""
    # Troviamo l'utente admin
    admin_user = db.query(User).filter(User.email == "admin@cookieflix.com").first()
    
    if not admin_user:
        raise HTTPException(status_code=404, detail="Utente admin non trovato")
    
    # Assicuriamoci che sia admin
    if not admin_user.is_admin:
        admin_user.is_admin = True
        db.commit()
        db.refresh(admin_user)
    
    # Generiamo il token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(admin_user.id)},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": admin_user.id,
            "email": admin_user.email,
            "is_admin": admin_user.is_admin
        }
    }