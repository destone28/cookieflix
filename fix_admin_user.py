# fix_admin_user.py
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
cursor = conn.cursor()

# Cerca l'utente admin
cursor.execute("SELECT id, email, is_admin FROM users WHERE email = ?", ("admin@cookieflix.com",))
user = cursor.fetchone()

if user:
    print(f"Utente trovato: ID {user[0]}, Email {user[1]}")
    print(f"Is admin: {user[2]}")
    
    # Imposta l'utente come admin
    cursor.execute("UPDATE users SET is_admin = 1 WHERE id = ?", (user[0],))
    conn.commit()
    print("Utente aggiornato a admin!")
else:
    print("Utente admin non trovato!")

conn.close()