# app/main.py
from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse
import logging
import time
import os
from datetime import datetime

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import auth, users, products, subscriptions, webhooks, shipments, admin
from app.seed import seed_database
from app.utils.logging import setup_logging
from app.utils.db_migrations import add_missing_columns
from app.models import User, Activity, SubscriptionPlan, Subscription, Category, Design, Vote

# Crea tabelle del database
Base.metadata.create_all(bind=engine)

# Aggiungi colonne mancanti se necessario
add_missing_columns(engine)

# Seed database
with SessionLocal() as db:
    seed_database(db)

# Configurazione logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = setup_logging(app_name="cookieflix", log_level=logging.INFO)

# Inizializzazione app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API per il servizio di abbonamento Cookieflix",
    version="0.1.0",
    docs_url=f"/docs",
    redoc_url=f"/redoc",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    openapi_tags=[
        {"name": "Authentication", "description": "Operazioni di autenticazione"},
        {"name": "Users", "description": "Gestione utenti"},
        {"name": "Products", "description": "Categorie, design e voti"},
        {"name": "Subscriptions", "description": "Gestione abbonamenti"},
    ]
)

# Middleware CORS
# allow_origins=[settings.FRONTEND_URL, "https://cdn.jsdelivr.net", "http://localhost:5173"],
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api")
def read_api_root():
    return {"message": f"Benvenuto su {settings.PROJECT_NAME} API"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Backend API is running"}

# Middleware per logging e sicurezza
@app.middleware("http")
async def unified_security_middleware(request: Request, call_next):
    # Logging
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.4f}s")
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data:;"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    return response


# Registrazione routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(products.router)
app.include_router(subscriptions.router)
app.include_router(webhooks.router)
app.include_router(shipments.router)
app.include_router(admin.router)

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

# Aggiunta a app/main.py
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    # Log dell'errore
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Si è verificato un errore interno. Il team tecnico è stato notificato."},
    )