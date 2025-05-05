# admin_token_generator.py
import sqlite3
import os
import jwt
from datetime import datetime, timedelta
import secrets

# Configurazione
SECRET_KEY = "supersecretkey"  # Usa lo stesso di settings.SECRET_KEY
ALGORITHM = "HS256"  # Usa lo stesso di settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = 10080  # 7 giorni

# Funzione per generare token JWT
def create_access_token(data, expires_delta=None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Trova il percorso del database
db_path = "cookieflix.db"
if not os.path.exists(db_path):
    db_path = "./app/cookieflix.db"
if not os.path.exists(db_path):
    print(f"Database non trovato! Percorsi verificati: cookieflix.db, ./app/cookieflix.db")
    exit(1)

# Connessione al database
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Trova l'utente admin
cursor.execute("SELECT id, email, is_admin FROM users WHERE email = ?", ("admin@cookieflix.com",))
user = cursor.fetchone()

if not user:
    print("Utente admin non trovato!")
    exit(1)

if not user['is_admin']:
    print("L'utente non è admin! Aggiornalo prima con enable_admin.py")
    exit(1)

# Genera il token
token_data = {"sub": str(user['id'])}
access_token = create_access_token(token_data)

print("\n=== TOKEN ADMIN GENERATO ===")
print(f"User ID: {user['id']}")
print(f"Email: {user['email']}")
print(f"Token: {access_token}")
print("\nCopia questo token e usalo come Bearer token nelle richieste API o")
print("salvalo nel localStorage del browser come 'admin_token'")
print("\nEsempio di come salvare il token nella console del browser:")
print(f"localStorage.setItem('admin_token', '{access_token}')")
print("\n==============================")

conn.close()