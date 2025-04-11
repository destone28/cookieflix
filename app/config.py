# app/config.py
import os
from pydantic import BaseSettings  # Importa BaseSettings direttamente da Pydantic 1.x
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
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "../.env/FRONTEND_URL")

    # Email settings
    EMAIL_SERVER: str = os.getenv("EMAIL_SERVER", "smtp.gmail.com")
    EMAIL_PORT: int = int(os.getenv("EMAIL_PORT", "465"))
    EMAIL_SENDER: str = os.getenv("EMAIL_SENDER", "")
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "")
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@cookieflix.com")

    print(f"FRONTEND_URL: {FRONTEND_URL}")
    
    class Config:
        # Configurazione per Pydantic 1.x
        case_sensitive = False

settings = Settings()