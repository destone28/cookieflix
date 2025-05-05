# fix_circular_dependency.py
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

# Verifica se l'utente admin esiste
cursor.execute("SELECT id, email, is_admin, is_active FROM users WHERE email = ?", ("admin@cookieflix.com",))
user = cursor.fetchone()

if user:
    print(f"Utente trovato: ID {user[0]}, Email {user[1]}")
    print(f"Is admin: {user[2]}")
    print(f"Is active: {user[3]}")
    
    # Se non è admin, rendiamolo admin
    if not user[2]:
        cursor.execute("UPDATE users SET is_admin = 1 WHERE id = ?", (user[0],))
        conn.commit()
        print("Utente aggiornato a admin!")
    else:
        print("L'utente è già admin")
else:
    print("Utente admin non trovato!")

conn.close()