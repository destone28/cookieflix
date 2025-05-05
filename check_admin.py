# Crea un piccolo script Python che puoi eseguire dal terminale

from app.database import SessionLocal
from app.models.user import User

db = SessionLocal()
try:
    admin_user = db.query(User).filter(User.email == "admin@cookieflix.com").first()
    if admin_user:
        print(f"Utente trovato: {admin_user.email}")
        print(f"Is admin: {admin_user.is_admin}")
        print(f"Is active: {admin_user.is_active}")
    else:
        print("Utente admin non trovato!")
finally:
    db.close()