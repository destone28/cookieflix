# Cookieflix - Documentazione del Progetto

## Panoramica del Progetto

**Cookieflix** è un servizio di abbonamento che fornisce cookie cutters stampati in 3D. Gli utenti si iscrivono a un piano mensile, trimestrale, semestrale o annuale, scelgono le categorie tematiche preferite, e ricevono mensilmente un set di cookie cutters basati sui temi votati dalla community.

## Obiettivo del Progetto

Sviluppare una piattaforma web completa che consenta:
- Gestione abbonamenti con diversi piani
- Sistema di votazione per i design dei cookie cutters
- Integrazione pagamenti con Stripe
- Backend in Python con FastAPI
- Frontend in Flutter/FlutterFlow

## Struttura del Progetto

```
cookieflix/
│
├── app/                   # Directory principale del backend
│   ├── __init__.py
│   ├── main.py            # Entry point dell'applicazione
│   ├── config.py          # Configurazioni e variabili d'ambiente
│   ├── database.py        # Configurazione del database
│   ├── seed.py            # Seed dei dati iniziali
│   │
│   ├── models/            # Modelli del database
│   │   ├── user.py
│   │   ├── subscription.py
│   │   └── product.py
│   │
│   ├── schemas/           # Schemi Pydantic per validazione
│   │   ├── user.py
│   │   ├── subscription.py
│   │   └── product.py
│   │
│   ├── routers/           # Router API
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── products.py
│   │   └── subscriptions.py
│   │
│   ├── utils/             # Utility
│   │   ├── auth.py
│   │   └── payments.py
│   │
│   ├── static/            # File statici
│   │   ├── img/
│   │   │   ├── categories/
│   │   │   └── designs/
│   │   └── uploads/
│   │
│   └── templates/         # Template HTML
│
├── venv/                  # Ambiente virtuale Python
│
├── .env                   # File per variabili d'ambiente
│
└── requirements.txt       # Dipendenze Python
```

## Setup completato

1. Creazione del progetto e ambiente virtuale
2. Installazione dipendenze:
   ```
   fastapi==0.99.0 uvicorn==0.22.0 pydantic==1.10.8 sqlalchemy==2.0.16 
   python-jose==3.3.0 passlib==1.7.4 python-multipart python-dotenv 
   stripe==5.4.0 pillow aiofiles jinja2 email-validator
   ```
3. Configurazione database e modelli
4. Implementazione delle API di autenticazione
5. Implementazione delle API per categorie, design e abbonamenti
6. Implementazione del sistema di seed per dati di test

## File implementati

### app/config.py
```python
# app/config.py
import os
from pydantic import BaseSettings
from dotenv import load_dotenv

load_dotenv()  # Carica variabili dall'eventuale file .env

class Settings(BaseSettings):
    # Generale
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Cookieflix")
    API_PREFIX: str = os.getenv("API_PREFIX", "/api")
    DEBUG: bool = os.getenv("DEBUG", "False") == "True"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cookieflix.db")
    
    # Sicurezza
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 giorni
    
    # Stripe
    STRIPE_API_KEY: str = os.getenv("STRIPE_API_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    
    # Frontend
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    class Config:
        case_sensitive = False

settings = Settings()
```

### app/database.py
```python
# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import logging

# Configurazione logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Connessione al database
logger.info(f"Connecting to database: {settings.DATABASE_URL}")
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args=connect_args,
    pool_pre_ping=True  # Verifica connessione prima dell'utilizzo
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency per ottenere la sessione DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### app/main.py
```python
# app/main.py
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import logging
import time
import os

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import auth, users, products, subscriptions
from app.seed import seed_database

# Configurazione logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Inizializzazione app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API per il servizio di abbonamento Cookieflix",
    version="0.1.0",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    openapi_tags=[
        {"name": "Authentication", "description": "Operazioni di autenticazione"},
        {"name": "Users", "description": "Gestione utenti"},
        {"name": "Products", "description": "Categorie, design e voti"},
        {"name": "Subscriptions", "description": "Gestione abbonamenti"},
    ]
)

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware per logging e sicurezza
@app.middleware("http")
async def log_and_add_headers(request: Request, call_next):
    # Logging
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.4f}s")
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; img-src 'self' data:;"
    
    return response

# Crea tabelle del database
Base.metadata.create_all(bind=engine)

# Seed database
with SessionLocal() as db:
    seed_database(db)

# Registrazione routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(subscriptions.router)

# Cartella statica e template
try:
    app.mount("/static", StaticFiles(directory="app/static"), name="static")
    templates = Jinja2Templates(directory="app/templates")
except Exception as e:
    logger.warning(f"Impossibile montare directory static: {e}")

# Root
@app.get("/")
def read_root():
    return {"message": f"Benvenuto su {settings.PROJECT_NAME} API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
```

### app/models/user.py
```python
# app/models/user.py
from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Float, Table
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base

# Tabella di collegamento per relazione many-to-many utente-categoria
user_category_preference = Table(
    "user_category_preference",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("category_id", Integer, ForeignKey("categories.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    referral_code = Column(String, unique=True, index=True, default=lambda: uuid.uuid4().hex[:8])
    referred_by = Column(String, nullable=True)
    credit_balance = Column(Float, default=0)
    stripe_customer_id = Column(String, nullable=True)
    
    # Relazioni
    subscriptions = relationship("Subscription", back_populates="user")
    votes = relationship("Vote", back_populates="user")
    preferred_categories = relationship("Category", secondary=user_category_preference)
```

### app/models/subscription.py
```python
# app/models/subscription.py
from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta

from app.database import Base

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)  # Starter, Creator, Master, Collection
    slug = Column(String, unique=True)
    description = Column(String)
    categories_count = Column(Integer)
    items_per_month = Column(Integer)
    monthly_price = Column(Float)
    quarterly_price = Column(Float)
    semiannual_price = Column(Float)
    annual_price = Column(Float)
    is_popular = Column(Boolean, default=False)
    features = Column(String)  # JSON serialized list
    is_active = Column(Boolean, default=True)
    
    # Relazioni
    subscriptions = relationship("Subscription", back_populates="plan")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"))
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    billing_period = Column(String)  # monthly, quarterly, semiannual, annual
    next_billing_date = Column(DateTime)
    stripe_customer_id = Column(String, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)
    
    # Relazioni
    user = relationship("User", back_populates="subscriptions")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
```

### app/models/product.py
```python
# app/models/product.py
from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    slug = Column(String, unique=True)
    description = Column(String)
    image_url = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Relazioni
    designs = relationship("Design", back_populates="category")

class Design(Base):
    __tablename__ = "designs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    category_id = Column(Integer, ForeignKey("categories.id"))
    image_url = Column(String)
    model_url = Column(String, nullable=True)  # Per il modello 3D
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relazioni
    category = relationship("Category", back_populates="designs")
    votes = relationship("Vote", back_populates="design")

class Vote(Base):
    __tablename__ = "votes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    design_id = Column(Integer, ForeignKey("designs.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relazioni
    user = relationship("User", back_populates="votes")
    design = relationship("Design", back_populates="votes")
```

### app/utils/auth.py
```python
# app/utils/auth.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import secrets
import string

from app.database import get_db
from app.models.user import User
from app.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_PREFIX}/auth/token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenziali non valide",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Utente non attivo"
        )
        
    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    return current_user

# Funzione per verificare ruolo admin
async def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Permessi insufficienti"
        )
    return current_user

# Generazione codice referral
def generate_referral_code(length=8):
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))
```

### app/utils/payments.py
```python
# app/utils/payments.py
import stripe
from fastapi import HTTPException, status
import logging
from datetime import datetime, timedelta

from app.config import settings

# Configurazione Stripe
stripe.api_key = settings.STRIPE_API_KEY
logger = logging.getLogger(__name__)

# Mapping dei piani Cookieflix vs product/price IDs di Stripe
PLAN_MAPPING = {
    # Starter
    "starter_monthly": "price_starter_monthly",
    "starter_quarterly": "price_starter_quarterly",
    "starter_semiannual": "price_starter_semiannual",
    "starter_annual": "price_starter_annual",
    
    # Creator
    "creator_monthly": "price_creator_monthly",
    "creator_quarterly": "price_creator_quarterly",
    "creator_semiannual": "price_creator_semiannual",
    "creator_annual": "price_creator_annual",
    
    # Master
    "master_monthly": "price_master_monthly",
    "master_quarterly": "price_master_quarterly",
    "master_semiannual": "price_master_semiannual",
    "master_annual": "price_master_annual",
    
    # Collection
    "collection_monthly": "price_collection_monthly",
    "collection_quarterly": "price_collection_quarterly",
    "collection_semiannual": "price_collection_semiannual",
    "collection_annual": "price_collection_annual",
}

def calculate_next_billing_date(billing_period):
    """Calcola la prossima data di fatturazione"""
    today = datetime.utcnow()
    if billing_period == "monthly":
        return today + timedelta(days=30)
    elif billing_period == "quarterly":
        return today + timedelta(days=90)
    elif billing_period == "semiannual":
        return today + timedelta(days=180)
    elif billing_period == "annual":
        return today + timedelta(days=365)
    else:
        raise ValueError(f"Periodo di fatturazione non valido: {billing_period}")

def create_stripe_customer(email, name, metadata=None):
    """Crea un cliente Stripe"""
    try:
        customer = stripe.Customer.create(
            email=email,
            name=name,
            metadata=metadata or {}
        )
        logger.info(f"Cliente Stripe creato: {customer.id} per {email}")
        return customer.id
    except stripe.error.StripeError as e:
        logger.error(f"Errore nella creazione del cliente Stripe: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Errore di pagamento: {str(e)}"
        )

def create_stripe_checkout_session(customer_id, price_id, success_url, cancel_url, metadata=None):
    """Crea una sessione di checkout Stripe"""
    try:
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata or {}
        )
        logger.info(f"Sessione checkout creata: {checkout_session.id}")
        return checkout_session
    except stripe.error.StripeError as e:
        logger.error(f"Errore nella creazione della sessione checkout: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Errore di pagamento: {str(e)}"
        )

def get_stripe_subscription(subscription_id):
    """Ottiene i dettagli di un abbonamento Stripe"""
    try:
        return stripe.Subscription.retrieve(subscription_id)
    except stripe.error.StripeError as e:
        logger.error(f"Errore nel recupero dell'abbonamento Stripe: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Errore di pagamento: {str(e)}"
        )

def cancel_stripe_subscription(subscription_id):
    """Cancella un abbonamento Stripe"""
    try:
        return stripe.Subscription.delete(subscription_id)
    except stripe.error.StripeError as e:
        logger.error(f"Errore nella cancellazione dell'abbonamento Stripe: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Errore di pagamento: {str(e)}"
        )
```

### app/schemas/user.py
```python
# app/schemas/user.py
from typing import Optional, List
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    referred_by: Optional[str] = None
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('La password deve contenere almeno 8 caratteri')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    
class Token(BaseModel):
    access_token: str
    token_type: str
    
class TokenData(BaseModel):
    user_id: Optional[int] = None

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    referral_code: str
    credit_balance: float
    created_at: datetime
    
    class Config:
        orm_mode = True
```

### app/schemas/subscription.py
```python
# app/schemas/subscription.py
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class SubscriptionPlanBase(BaseModel):
    name: str
    description: str
    categories_count: int
    items_per_month: int
    monthly_price: float
    quarterly_price: float
    semiannual_price: float
    annual_price: float
    features: List[str]

class SubscriptionPlanCreate(SubscriptionPlanBase):
    slug: str
    is_popular: bool = False
    is_active: bool = True

class SubscriptionPlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    categories_count: Optional[int] = None
    items_per_month: Optional[int] = None
    monthly_price: Optional[float] = None
    quarterly_price: Optional[float] = None
    semiannual_price: Optional[float] = None
    annual_price: Optional[float] = None
    features: Optional[List[str]] = None
    is_popular: Optional[bool] = None
    is_active: Optional[bool] = None

class SubscriptionPlan(SubscriptionPlanBase):
    id: int
    slug: str
    is_popular: bool
    is_active: bool
    
    class Config:
        orm_mode = True

class CreateCheckoutSession(BaseModel):
    plan_slug: str
    billing_period: str  # monthly, quarterly, semiannual, annual

class CheckoutSessionResponse(BaseModel):
    checkout_url: str

class SubscriptionBase(BaseModel):
    user_id: int
    plan_id: int
    billing_period: str
    
class SubscriptionCreate(SubscriptionBase):
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None

class Subscription(SubscriptionBase):
    id: int
    start_date: datetime
    end_date: Optional[datetime] = None
    is_active: bool
    next_billing_date: Optional[datetime] = None
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    
    class Config:
        orm_mode = True
        
class SubscriptionWithPlan(Subscription):
    plan: SubscriptionPlan
    
    class Config:
        orm_mode = True
```

### app/schemas/product.py
```python
# app/schemas/product.py
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    description: str
    image_url: Optional[str] = None
    
class CategoryCreate(CategoryBase):
    slug: str
    
class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class Category(CategoryBase):
    id: int
    slug: str
    is_active: bool
    
    class Config:
        orm_mode = True

class DesignBase(BaseModel):
    name: str
    description: str
    category_id: int
    image_url: str
    model_url: Optional[str] = None
    
class DesignCreate(DesignBase):
    pass
    
class DesignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    model_url: Optional[str] = None
    is_active: Optional[bool] = None

class Design(DesignBase):
    id: int
    created_at: datetime
    is_active: bool
    votes_count: Optional[int] = None
    
    class Config:
        orm_mode = True
        
class DesignWithCategory(Design):
    category: Category
    
    class Config:
        orm_mode = True

class VoteCreate(BaseModel):
    design_id: int
    
class Vote(BaseModel):
    id: int
    user_id: int
    design_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True
```

### app/routers/auth.py
```python
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
```

### app/routers/users.py
```python
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

@router.put("/me", response_model=schemas.User)
async def update_user_me(
    user_data: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Aggiorna i dati dell'utente corrente"""
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
```

### app/routers/products.py
```python
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
```

### app/routers/subscriptions.py
```python
# app/routers/subscriptions.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import json
from typing import List
from datetime import datetime, timedelta

from app.schemas import subscription as schemas
from app.models.subscription import SubscriptionPlan, Subscription
from app.models.user import User
from app.models.product import Category
from app.utils.auth import get_current_active_user, get_current_admin_user
from app.utils.payments import (
    create_stripe_customer, create_stripe_checkout_session,
    PLAN_MAPPING, calculate_next_billing_date
)
from app.database import get_db
from app.config import settings

router = APIRouter(prefix=f"{settings.API_PREFIX}/subscriptions", tags=["Subscriptions"])

@router.get("/plans", response_model=List[schemas.SubscriptionPlan])
async def get_subscription_plans(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Ottiene tutti i piani di abbonamento attivi"""
    plans = db.query(SubscriptionPlan)\
        .filter(SubscriptionPlan.is_active == True)\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    # Deserializza la lista di feature
    for plan in plans:
        plan.features = json.loads(plan.features) if plan.features else []
        
    return plans

@router.get("/plans/{slug}", response_model=schemas.SubscriptionPlan)
async def get_subscription_plan(
    slug: str,
    db: Session = Depends(get_db)
):
    """Ottiene i dettagli di un piano specifico"""
    plan = db.query(SubscriptionPlan)\
        .filter(SubscriptionPlan.slug == slug, SubscriptionPlan.is_active == True)\
        .first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Piano non trovato"
        )
    
    # Deserializza la lista di feature
    plan.features = json.loads(plan.features) if plan.features else []
    
    return plan

@router.post("/checkout", response_model=schemas.CheckoutSessionResponse)
async def create_checkout_session(
    checkout_data: schemas.CreateCheckoutSession,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Crea una sessione di checkout Stripe per l'abbonamento"""
    # Verifica piano e periodo
    plan = db.query(SubscriptionPlan)\
        .filter(SubscriptionPlan.slug == checkout_data.plan_slug, SubscriptionPlan.is_active == True)\
        .first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Piano non trovato"
        )
    
    if checkout_data.billing_period not in ["monthly", "quarterly", "semiannual", "annual"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Periodo di fatturazione non valido"
        )
    
    # Verifica se l'utente ha già un abbonamento attivo
    active_subscription = db.query(Subscription)\
        .filter(Subscription.user_id == current_user.id, Subscription.is_active == True)\
        .first()
    
    if active_subscription:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="L'utente ha già un abbonamento attivo"
        )
    
    # Ottieni chiave prezzo Stripe
    price_key = f"{checkout_data.plan_slug}_{checkout_data.billing_period}"
    stripe_price_id = PLAN_MAPPING.get(price_key)
    
    if not stripe_price_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Combinazione piano/periodo non valida"
        )
    
    # Crea o ottieni customer Stripe
    if not current_user.stripe_customer_id:
        stripe_customer_id = create_stripe_customer(
            email=current_user.email,
            name=current_user.full_name,
            metadata={"user_id": current_user.id}
        )
        # Aggiorna l'utente con l'ID cliente Stripe
        current_user.stripe_customer_id = stripe_customer_id
        db.commit()
    else:
        stripe_customer_id = current_user.stripe_customer_id
    
    # Crea session checkout
    success_url = f"{settings.FRONTEND_URL}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{settings.FRONTEND_URL}/checkout/cancel"
    
    metadata = {
        "user_id": current_user.id,
        "plan_id": plan.id,
        "billing_period": checkout_data.billing_period
    }
    
    checkout_session = create_stripe_checkout_session(
        customer_id=stripe_customer_id,
        price_id=stripe_price_id,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    return {"checkout_url": checkout_session.url}

@router.get("/my", response_model=schemas.SubscriptionWithPlan)
async def get_my_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Ottiene l'abbonamento attivo dell'utente"""
    subscription = db.query(Subscription)\
        .filter(Subscription.user_id == current_user.id, Subscription.is_active == True)\
        .first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nessun abbonamento attivo trovato"
        )
    
    # Carica il piano
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == subscription.plan_id).first()
    if plan:
        plan.features = json.loads(plan.features) if plan.features else []
    
    subscription.plan = plan
    
    return subscription

@router.post("/update-categories")
async def update_subscription_categories(
    category_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Aggiorna le categorie preferite dell'utente"""
    # Verifica se l'utente ha un abbonamento attivo
    subscription = db.query(Subscription)\
        .filter(Subscription.user_id == current_user.id, Subscription.is_active == True)\
        .first()
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo gli utenti con abbonamento attivo possono aggiornare le categorie"
        )
    
    # Verifica il limite di categorie
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == subscription.plan_id).first()
    if len(category_ids) > plan.categories_count:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Il tuo piano permette al massimo {plan.categories_count} categorie"
        )
    
    # Verifica che le categorie esistano
    categories = db.query(Category)\
        .filter(Category.id.in_(category_ids), Category.is_active == True)\
        .all()
    
    if len(categories) != len(category_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Una o più categorie non esistono o non sono attive"
        )
    
    # Aggiorna le categorie preferite
    current_user.preferred_categories = categories
    db.commit()
    
    return {"status": "success", "categories": categories}
```

### app/seed.py
```python
# app/seed.py
import json
from sqlalchemy.orm import Session
import logging

from app.models.user import User
from app.models.subscription import SubscriptionPlan
from app.models.product import Category, Design
from app.utils.auth import get_password_hash

logger = logging.getLogger(__name__)

def seed_database(db: Session):
    """Popola il database con dati di test"""
    logger.info("Iniziando seed del database...")
    
    # Crea utente admin
    if not db.query(User).filter(User.email == "admin@cookieflix.com").first():
        logger.info("Creazione utente admin...")
        admin_user = User(
            email="admin@cookieflix.com",
            hashed_password=get_password_hash("adminpassword"),
            full_name="Admin Cookieflix",
            is_active=True,
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
    
    # Crea piani di abbonamento
    if db.query(SubscriptionPlan).count() == 0:
        logger.info("Creazione piani di abbonamento...")
        plans = [
            {
                "name": "Starter",
                "slug": "starter",
                "description": "Piano base per iniziare",
                "categories_count": 1,
                "items_per_month": 4,
                "monthly_price": 15.90,
                "quarterly_price": 42.90,
                "semiannual_price": 76.30,
                "annual_price": 133.50,
                "features": json.dumps([
                    "4 cookie cutters al mese",
                    "1 categoria a scelta",
                    "Accesso alla community"
                ]),
                "is_popular": False,
                "is_active": True
            },
            {
                "name": "Creator",
                "slug": "creator",
                "description": "Il piano più popolare",
                "categories_count": 2,
                "items_per_month": 7,
                "monthly_price": 23.90,
                "quarterly_price": 64.50,
                "semiannual_price": 114.70,
                "annual_price": 200.80,
                "features": json.dumps([
                    "7 cookie cutters al mese",
                    "2 categorie a scelta",
                    "Accesso alla community",
                    "Anteprima nuovi design"
                ]),
                "is_popular": True,
                "is_active": True
            },
            {
                "name": "Master",
                "slug": "master",
                "description": "Per veri appassionati",
                "categories_count": 3,
                "items_per_month": 10,
                "monthly_price": 29.90,
                "quarterly_price": 80.70,
                "semiannual_price": 143.50,
                "annual_price": 251.20,
                "features": json.dumps([
                    "10 cookie cutters al mese",
                    "3 categorie a scelta",
                    "Accesso alla community",
                    "Anteprima nuovi design",
                    "Accesso esclusivo a design speciali"
                ]),
                "is_popular": False,
                "is_active": True
            },
            {
                "name": "Collection",
                "slug": "collection",
                "description": "L'esperienza completa",
                "categories_count": 100,  # Tutte le categorie
                "items_per_month": 15,
                "monthly_price": 42.90,
                "quarterly_price": 115.80,
                "semiannual_price": 205.90,
                "annual_price": 360.40,
                "features": json.dumps([
                    "15 cookie cutters al mese",
                    "Tutte le categorie",
                    "Accesso alla community",
                    "Anteprima nuovi design",
                    "Accesso esclusivo a design speciali",
                    "Design su richiesta (1 al mese)"
                ]),
                "is_popular": False,
                "is_active": True
            }
        ]
        
        for plan_data in plans:
            plan = SubscriptionPlan(**plan_data)
            db.add(plan)
        
        db.commit()
    
    # Crea categorie
    if db.query(Category).count() == 0:
        logger.info("Creazione categorie...")
        categories = [
            {
                "name": "Serie TV e Film",
                "slug": "serie-tv-film",
                "description": "Design ispirati ai tuoi film e serie TV preferiti",
                "image_url": "/static/img/categories/tv-film.jpg",
                "is_active": True
            },
            {
                "name": "Videogiochi",
                "slug": "videogiochi",
                "description": "Personaggi e simboli dai videogiochi più amati",
                "image_url": "/static/img/categories/videogiochi.jpg",
                "is_active": True
            },
            {
                "name": "Feste Stagionali",
                "slug": "feste-stagionali",
                "description": "Design per ogni festività e stagione",
                "image_url": "/static/img/categories/feste.jpg",
                "is_active": True
            },
            {
                "name": "Animali e Creature",
                "slug": "animali-creature",
                "description": "Animali reali e creature fantastiche",
                "image_url": "/static/img/categories/animali.jpg",
                "is_active": True
            },
            {
                "name": "Architettura e Monumenti",
                "slug": "architettura-monumenti",
                "description": "Riproduzioni di edifici e monumenti famosi",
                "image_url": "/static/img/categories/architettura.jpg",
                "is_active": True
            },
            {
                "name": "Botanica e Fiori",
                "slug": "botanica-fiori",
                "description": "Fiori dettagliati e motivi botanici",
                "image_url": "/static/img/categories/botanica.jpg",
                "is_active": True
            },
            {
                "name": "Sport e Squadre",
                "slug": "sport-squadre",
                "description": "Celebra la tua squadra e sport preferito",
                "image_url": "/static/img/categories/sport.jpg",
                "is_active": True
            },
            {
                "name": "Professioni e Hobby",
                "slug": "professioni-hobby",
                "description": "Strumenti e simboli di mestieri e hobby",
                "image_url": "/static/img/categories/professioni.jpg",
                "is_active": True
            }
        ]
        
        for category_data in categories:
            category = Category(**category_data)
            db.add(category)
        
        db.commit()
    
    # Crea immagini di default per le categorie
    # Nota: in un ambiente reale le immagini dovrebbero essere caricate
    # Creiamo delle immagini placeholder per lo sviluppo
    import os
    from PIL import Image, ImageDraw, ImageFont
    
    img_folder = "app/static/img/categories"
    os.makedirs(img_folder, exist_ok=True)
    
    # Crea immagini placeholder per le categorie
    if os.path.exists(img_folder) and len(os.listdir(img_folder)) < 8:
        logger.info("Creazione immagini placeholder per categorie...")
        categories = db.query(Category).all()
        color_map = {
            "serie-tv-film": (255, 107, 107),  # Corallo
            "videogiochi": (78, 205, 196),     # Turchese
            "feste-stagionali": (255, 209, 102), # Ambra
            "animali-creature": (170, 59, 56),  # Rosso scuro
            "architettura-monumenti": (45, 152, 152), # Verde acqua
            "botanica-fiori": (190, 177, 59),   # Giallo-verde
            "sport-squadre": (87, 117, 144),    # Blu-grigio
            "professioni-hobby": (77, 83, 60)   # Verde oliva
        }
        
        for category in categories:
            img_path = f"{img_folder}/{category.slug}.jpg"
            if not os.path.exists(img_path):
                # Crea immagine placeholder
                img = Image.new('RGB', (400, 300), color=color_map.get(category.slug, (200, 200, 200)))
                d = ImageDraw.Draw(img)
                
                # Aggiungi testo (in un ambiente reale useresti un vero font)
                try:
                    font = ImageFont.load_default()
                    d.text((150, 150), category.name, fill=(255, 255, 255), font=font)
                except Exception as e:
                    d.text((150, 150), category.name, fill=(255, 255, 255))
                
                img.save(img_path)
                
                # Aggiorna URL immagine nella categoria
                category.image_url = f"/static/img/categories/{category.slug}.jpg"
        
        db.commit()
    
    # Crea alcuni design di esempio
    if db.query(Design).count() == 0:
        logger.info("Creazione design di esempio...")
        # Recupera le categorie
        categories = {cat.slug: cat.id for cat in db.query(Category).all()}
        
        designs = [
            # Categoria Serie TV e Film
            {
                "name": "Spada Laser",
                "description": "Ispirata alla famosa saga spaziale",
                "category_id": categories["serie-tv-film"],
                "image_url": "/static/img/designs/spada-laser.jpg",
                "is_active": True
            },
            {
                "name": "Cappello dello Stregone",
                "description": "Dal mondo magico del giovane mago",
                "category_id": categories["serie-tv-film"],
                "image_url": "/static/img/designs/cappello-stregone.jpg",
                "is_active": True
            },
            
            # Categoria Videogiochi
            {
                "name": "Fungo Power-Up",
                "description": "Il classico fungo che ti fa crescere",
                "category_id": categories["videogiochi"],
                "image_url": "/static/img/designs/fungo.jpg",
                "is_active": True
            },
            {
                "name": "Controller Retro",
                "description": "Controller della console anni '90",
                "category_id": categories["videogiochi"],
                "image_url": "/static/img/designs/controller.jpg",
                "is_active": True
            },
            
            # Categoria Feste
            {
                "name": "Albero di Natale Dettagliato",
                "description": "Albero con decorazioni in rilievo",
                "category_id": categories["feste-stagionali"],
                "image_url": "/static/img/designs/albero-natale.jpg",
                "is_active": True
            }
        ]
        
        for design_data in designs:
            design = Design(**design_data)
            db.add(design)
        
        db.commit()
        
        # Crea immagini placeholder per i design
        img_folder = "app/static/img/designs"
        os.makedirs(img_folder, exist_ok=True)
        
        # Crea immagini placeholder per i design
        if os.path.exists(img_folder):
            logger.info("Creazione immagini placeholder per design...")
            designs = db.query(Design).all()
            
            for design in designs:
                img_path = f"{img_folder}/{design.id}.jpg"
                if not os.path.exists(img_path):
                    # Crea immagine placeholder
                    img = Image.new('RGB', (400, 300), color=(100, 100, 100))
                    d = ImageDraw.Draw(img)
                    
                    # Aggiungi testo
                    try:
                        font = ImageFont.load_default()
                        d.text((150, 150), design.name, fill=(255, 255, 255), font=font)
                    except Exception as e:
                        d.text((150, 150), design.name, fill=(255, 255, 255))
                    
                    img.save(img_path)
                    
                    # Aggiorna URL immagine
                    design.image_url = f"/static/img/designs/{design.id}.jpg"
            
            db.commit()
    
    logger.info("Seed del database completato!")

# Funzione per esecuzione diretta
def run_seed():
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
```

## Problemi Riscontrati e Soluzioni

### 1. Visualizzazione Swagger UI

Problema: La documentazione API (Swagger UI) non viene visualizzata correttamente. La pagina viene caricata (200 OK) ma appare vuota.

Soluzioni proposte:
- Personalizzazione dell'endpoint Swagger UI con HTML/JavaScript inline
- Correzione della configurazione CORS per permettere CDN
- Utilizzo di ReDoc come alternativa
- Installazione locale di Swagger UI

### 2. Compatibilità Pydantic

Problema: Conflitti tra versioni di Pydantic e pydantic-settings.

Soluzione:
- Utilizzo di versioni compatibili di FastAPI, Pydantic e altre dipendenze
- Uso diretto di BaseSettings da Pydantic 1.x

### 3. Python 3.12 Compatibilità

Problema: Python 3.12 è molto recente e alcune librerie potrebbero non essere completamente compatibili.

Soluzioni proposte:
- Downgrade a versioni specifiche delle librerie
- Possibilità di considerare Python 3.10 o 3.11 per maggiore compatibilità

## Test delle API

Anche se la documentazione Swagger UI non è visibile, le API funzionano correttamente e possono essere testate utilizzando Postman o altri strumenti:

1. **Postman**: https://www.postman.com/downloads/
2. **Insomnia**: https://insomnia.rest/download

### Esempi di richieste Postman:

#### Registrazione utente
```
POST http://localhost:8000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "full_name": "Test User",
  "password": "password123"
}
```

#### Login
```
POST http://localhost:8000/api/auth/token
Content-Type: application/x-www-form-urlencoded

username=test@example.com&password=password123
```

#### Get profilo utente
```
GET http://localhost:8000/api/auth/me
Authorization: Bearer {token}
```

## Prossimi Passi

### 1. Frontend con FlutterFlow

- Registrazione e configurazione account FlutterFlow
- Creazione del design system (colori, tipografia, componenti)
- Implementazione delle pagine principali:
  - Landing page
  - Login/Registrazione
  - Dashboard utente
  - Pagina abbonamenti
  - Votazione design

### 2. Integrazione Stripe

- Creazione account Stripe (modalità test)
- Configurazione prodotti e prezzi
- Implementazione webhook
- Test ciclo di pagamento completo

### 3. Ottimizzazione e Sicurezza

- Miglioramento gestione errori
- Implementazione logging completo
- Test unitari e integrazione
- Monitoraggio

### 4. Deploy

- Preparazione per produzione
- Setup database PostgreSQL
- Deploy backend su servizio cloud (Render, Railway, DigitalOcean)
- Deploy frontend (Vercel, Netlify)

## Conclusione

Il progetto Cookieflix ha una solida fondazione backend con tutte le API necessarie implementate. Nonostante alcuni problemi di visualizzazione della documentazione, il backend è funzionale e pronto per l'integrazione con il frontend.

I prossimi passi si concentreranno principalmente sullo sviluppo dell'interfaccia utente con FlutterFlow e sull'integrazione del sistema di pagamento Stripe per completare il flusso di abbonamento.