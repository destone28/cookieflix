# app/utils/csrf.py
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import secrets
import time
from typing import Dict, Optional

# Bearer token security
security = HTTPBearer()

# Token store (in-memory per semplicità, usare Redis in produzione)
csrf_tokens: Dict[str, float] = {}
TOKEN_EXPIRY = 3600  # 1 ora

def generate_csrf_token() -> str:
    """Genera un nuovo token CSRF"""
    token = secrets.token_urlsafe(32)
    csrf_tokens[token] = time.time() + TOKEN_EXPIRY
    return token

def clean_expired_tokens():
    """Pulisce i token scaduti"""
    current_time = time.time()
    expired = [token for token, expiry in csrf_tokens.items() if expiry < current_time]
    for token in expired:
        csrf_tokens.pop(token, None)

def validate_csrf_token(token: str) -> bool:
    """Valida un token CSRF"""
    clean_expired_tokens()
    if token not in csrf_tokens:
        return False
    
    # Token usato una sola volta (rimuovi dopo l'uso)
    expiry = csrf_tokens.pop(token)
    return time.time() < expiry

async def csrf_protection(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Middleware per la protezione CSRF"""
    if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
        token = credentials.credentials
        if not validate_csrf_token(token):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Token CSRF non valido o scaduto"
            )
    return True