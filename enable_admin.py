# enable_admin.py
import sqlite3
import os

# Trova il percorso del database
db_path = "cookieflix.db"
if not os.path.exists(db_path):
    db_path = "./app/cookieflix.db"
if not os.path.exists(db_path):
    print(f"Database non trovato! Percorsi verificati: cookieflix.db, ./app/cookieflix.db")
    exit(1)

# Connessione al database
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row  # Per accedere alle colonne per nome
cursor = conn.cursor()

# Verifica se l'utente admin esiste
cursor.execute("SELECT id, email, is_admin, is_active FROM users WHERE email = ?", ("admin@cookieflix.com",))
user = cursor.fetchone()

if user:
    print(f"Utente trovato: {user['email']}")
    print(f"ID: {user['id']}")
    print(f"Is admin: {user['is_admin']}")
    print(f"Is active: {user['is_active']}")
    
    # Se non è admin, rendiamolo admin
    if not user['is_admin']:
        cursor.execute("UPDATE users SET is_admin = 1 WHERE id = ?", (user['id'],))
        conn.commit()
        print("Utente aggiornato a admin!")
    else:
        print("L'utente è già admin")
else:
    print("Utente admin non trovato!")

conn.close()