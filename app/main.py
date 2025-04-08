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