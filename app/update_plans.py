# app/update_plans.py
from sqlalchemy.orm import Session
import json
import logging

from app.database import SessionLocal
from app.models import SubscriptionPlan

logger = logging.getLogger(__name__)

def update_subscription_plans():
    db = SessionLocal()
    try:
        logger.info("Aggiornamento dei piani di abbonamento...")
        
        # Dati aggiornati dei piani
        updated_plans = [
            {
                "name": "Starter",
                "slug": "starter",
                "description": "La soluzione per i più timidi",
                "categories_count": 1,
                "items_per_month": 3,
                "monthly_price": 12.90,
                "quarterly_price": 34.83,
                "semiannual_price": 61.92,
                "annual_price": 108.36,
                "features": json.dumps([
                    "3 cookie cutters al mese",
                    "1 categoria a scelta",
                    "Spedizione gratuita"
                ]),
                "is_popular": False
            },
            {
                "name": "Hobbista",
                "slug": "hobbista",
                "description": "La scelta più popolare",
                "categories_count": 2,
                "items_per_month": 6,
                "monthly_price": 18.90,
                "quarterly_price": 51.03,
                "semiannual_price": 90.72,
                "annual_price": 158.76,
                "features": json.dumps([
                    "6+1 cookie cutters al mese",
                    "2 categorie a scelta",
                    "1 Cookie cutter del mese extra in più in omaggio",
                    "Spedizione gratuita"
                ]),
                "is_popular": True
            },
            {
                "name": "Creativo",
                "slug": "creativo",
                "description": "Dove le idee prendono form(in)a",
                "categories_count": 3,
                "items_per_month": 9,
                "monthly_price": 27.90,
                "quarterly_price": 75.33,
                "semiannual_price": 133.92,
                "annual_price": 234.36,
                "features": json.dumps([
                    "9+1 cookie cutters al mese",
                    "3 categorie a scelta",
                    "Possibilità di proporre nuovi cutters specifici",
                    "1 Cookie cutter del mese extra in più in omaggio",
                    "Spedizione gratuita"
                ]),
                "is_popular": False
            },
            {
                "name": "Professional",
                "slug": "professional",
                "description": "L'esperienza completa per veri professionisti",
                "categories_count": 5,
                "items_per_month": 15,
                "monthly_price": 39.90,
                "quarterly_price": 107.73,
                "semiannual_price": 192.52,
                "annual_price": 335.16,
                "features": json.dumps([
                    "15 cookie cutters al mese",
                    "Tutte le categorie",
                    "Possibilità di proporre nuovi cutters specifici",
                    "1 Cookie cutter del mese extra in più in omaggio",
                    "Il tuo voto sui design del mese vale x3",
                    "Spedizione gratuita"
                ]),
                "is_popular": False
            }
        ]
        
        # Ottieni i piani esistenti
        existing_plans = db.query(SubscriptionPlan).all()
        
        # Se non ci sono piani, aggiungi quelli nuovi
        if not existing_plans:
            for plan_data in updated_plans:
                plan = SubscriptionPlan(**plan_data, is_active=True)
                db.add(plan)
            logger.info("Aggiunti nuovi piani di abbonamento")
        else:
            # Altrimenti, aggiorna quelli esistenti in base all'indice
            for i, plan in enumerate(existing_plans):
                if i < len(updated_plans):
                    update_data = updated_plans[i]
                    for key, value in update_data.items():
                        setattr(plan, key, value)
                    setattr(plan, "is_active", True)
                    logger.info(f"Aggiornato piano: {plan.name}")
            
            # Se ci sono meno piani esistenti rispetto a quelli nuovi, aggiungi quelli mancanti
            if len(existing_plans) < len(updated_plans):
                for i in range(len(existing_plans), len(updated_plans)):
                    plan_data = updated_plans[i]
                    plan = SubscriptionPlan(**plan_data, is_active=True)
                    db.add(plan)
                    logger.info(f"Aggiunto nuovo piano: {plan_data['name']}")
        
        db.commit()
        logger.info("Aggiornamento dei piani completato!")
        
        # Verifica gli slug aggiornati
        updated_plans = db.query(SubscriptionPlan).all()
        for plan in updated_plans:
            logger.info(f"Piano: {plan.name}, Slug: {plan.slug}")
        
    except Exception as e:
        logger.error(f"Errore durante l'aggiornamento dei piani: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    update_subscription_plans()