# app/utils/rate_limit.py
from fastapi import HTTPException, Request, status
import time
from collections import defaultdict
import threading

# Semplice implementazione di rate limiting in-memory
# In produzione, usare Redis o altro sistema distribuito
class RateLimiter:
    def __init__(self, times: int, seconds: int):
        self.times = times  # Numero massimo di richieste
        self.seconds = seconds  # Periodo di tempo in secondi
        self.requests = defaultdict(list)  # IP -> lista di timestamp
        self.lock = threading.Lock()
        
    async def check(self, request: Request):
        client_ip = request.client.host
        current_time = time.time()
        
        with self.lock:
            # Rimuovi i timestamp più vecchi del periodo
            self.requests[client_ip] = [
                timestamp for timestamp in self.requests[client_ip]
                if current_time - timestamp < self.seconds
            ]
            
            # Verifica se l'utente ha superato il limite
            if len(self.requests[client_ip]) >= self.times:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Troppe richieste. Riprova più tardi."
                )
            
            # Aggiungi il timestamp attuale
            self.requests[client_ip].append(current_time)

# Rate limiter per endpoint di login: 5 tentativi ogni 60 secondi
login_limiter = RateLimiter(times=5, seconds=60)