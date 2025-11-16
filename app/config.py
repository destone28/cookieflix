# app/config.py
import os
import secrets
from pydantic import BaseSettings, validator
from dotenv import load_dotenv
import logging

load_dotenv()  # Carica variabili dall'eventuale file .env

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    # Generale
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Cookieflix")
    API_PREFIX: str = os.getenv("API_PREFIX", "/api")
    DEBUG: bool = os.getenv("DEBUG", "False") == "True"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cookieflix.db")

    # Sicurezza
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 giorni

    # Stripe
    STRIPE_API_KEY: str = os.getenv("STRIPE_API_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    # Frontend
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    ADMIN_FRONTEND_URL: str = os.getenv("ADMIN_FRONTEND_URL", "http://localhost:5174")

    # CORS
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174")

    # Email settings
    EMAIL_SERVER: str = os.getenv("EMAIL_SERVER", "smtp.gmail.com")
    EMAIL_PORT: int = int(os.getenv("EMAIL_PORT", "465"))
    EMAIL_SENDER: str = os.getenv("EMAIL_SENDER", "")
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "")
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@cookieflix.com")

    # Upload settings
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    MAX_UPLOAD_SIZE: int = int(os.getenv("MAX_UPLOAD_SIZE", "5242880"))  # 5MB default

    @validator("SECRET_KEY", pre=True, always=True)
    def validate_secret_key(cls, v):
        if not v or v == "":
            # Generate a secure random key for development
            generated_key = secrets.token_urlsafe(32)
            logger.warning(
                f"SECRET_KEY not set! Using generated key for this session: {generated_key[:10]}..."
            )
            logger.warning(
                "⚠️  PRODUCTION WARNING: Set a permanent SECRET_KEY in .env file!"
            )
            return generated_key
        if v == "supersecretkey":
            logger.error(
                "🚨 SECURITY ERROR: Using default SECRET_KEY! This is INSECURE for production!"
            )
        return v

    def get_allowed_origins_list(self) -> list:
        """Ritorna la lista di origini permesse per CORS"""
        if self.ENVIRONMENT == "production":
            return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
        else:
            # In development, permetti localhost
            return ["http://localhost:5173", "http://localhost:5174", self.FRONTEND_URL, self.ADMIN_FRONTEND_URL]

    class Config:
        # Configurazione per Pydantic 1.x
        case_sensitive = False

settings = Settings()

# Log configuration on startup
if settings.DEBUG:
    logger.info(f"Running in DEBUG mode")
    logger.info(f"FRONTEND_URL: {settings.FRONTEND_URL}")
    logger.info(f"ADMIN_FRONTEND_URL: {settings.ADMIN_FRONTEND_URL}")