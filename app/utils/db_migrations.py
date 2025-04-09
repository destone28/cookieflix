# app/utils/db_migrations.py
import sqlite3
import logging
from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

logger = logging.getLogger(__name__)

def add_missing_columns(engine: Engine):
    """Aggiunge colonne mancanti alle tabelle esistenti"""
    # Ottieni l'ispettore per esaminare il database
    inspector = inspect(engine)
    
    # Definisci le colonne che devono essere presenti in ciascuna tabella
    required_columns = {
        "users": {
            "failed_login_attempts": "INTEGER DEFAULT 0",
            "account_locked_until": "TIMESTAMP NULL"
        },
        # Puoi aggiungere altre tabelle e colonne qui
    }
    
    conn = engine.raw_connection()
    try:
        for table, columns in required_columns.items():
            # Controlla se la tabella esiste
            if table in inspector.get_table_names():
                # Ottieni le colonne esistenti
                existing_columns = [col["name"] for col in inspector.get_columns(table)]
                
                # Aggiungi le colonne mancanti
                for column, definition in columns.items():
                    if column not in existing_columns:
                        logger.info(f"Aggiunta colonna {column} alla tabella {table}")
                        try:
                            # SQLite non supporta direttamente ALTER TABLE ADD COLUMN con DEFAULT
                            # quindi dobbiamo eliminare la parte DEFAULT
                            add_column_sql = f"ALTER TABLE {table} ADD COLUMN {column} {definition}"
                            conn.execute(add_column_sql)
                            conn.commit()
                            logger.info(f"Colonna {column} aggiunta alla tabella {table}")
                        except Exception as e:
                            logger.error(f"Errore nell'aggiunta della colonna {column}: {str(e)}")
                            conn.rollback()
    finally:
        conn.close()