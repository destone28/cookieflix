# app/seed.py
import json
from sqlalchemy.orm import Session
import logging

from app.models import User, SubscriptionPlan, Category, Design

from app.utils.auth import get_password_hash

logger = logging.getLogger(__name__)

def seed_database(db: Session):
    """Popola il database con dati di test"""
    logger.info("Iniziando seed del database...")
    
    # Crea utente admin
    if not db.query(User).filter(User.email == "admin@cookieflix.com").first():
        logger.info("Creazione utente admin...")
        admin_user = User(
            email="admin@cookieflix.com",
            hashed_password=get_password_hash("adminpassword"),
            full_name="Admin Cookieflix",
            is_active=True,
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
    
    # Crea piani di abbonamento
    if db.query(SubscriptionPlan).count() == 0:
        logger.info("Creazione piani di abbonamento...")
        plans = [
            {
                "name": "Starter",
                "slug": "starter",
                "description": "Piano base per iniziare",
                "categories_count": 1,
                "items_per_month": 4,
                "monthly_price": 15.90,
                "quarterly_price": 42.90,
                "semiannual_price": 76.30,
                "annual_price": 133.50,
                "features": json.dumps([
                    "4 cookie cutters al mese",
                    "1 categoria a scelta",
                    "Accesso alla community"
                ]),
                "is_popular": False,
                "is_active": True
            },
            {
                "name": "Creator",
                "slug": "creator",
                "description": "Il piano più popolare",
                "categories_count": 2,
                "items_per_month": 7,
                "monthly_price": 23.90,
                "quarterly_price": 64.50,
                "semiannual_price": 114.70,
                "annual_price": 200.80,
                "features": json.dumps([
                    "7 cookie cutters al mese",
                    "2 categorie a scelta",
                    "Accesso alla community",
                    "Anteprima nuovi design"
                ]),
                "is_popular": True,
                "is_active": True
            },
            {
                "name": "Master",
                "slug": "master",
                "description": "Per veri appassionati",
                "categories_count": 3,
                "items_per_month": 10,
                "monthly_price": 29.90,
                "quarterly_price": 80.70,
                "semiannual_price": 143.50,
                "annual_price": 251.20,
                "features": json.dumps([
                    "10 cookie cutters al mese",
                    "3 categorie a scelta",
                    "Accesso alla community",
                    "Anteprima nuovi design",
                    "Accesso esclusivo a design speciali"
                ]),
                "is_popular": False,
                "is_active": True
            },
            {
                "name": "Collection",
                "slug": "collection",
                "description": "L'esperienza completa",
                "categories_count": 100,  # Tutte le categorie
                "items_per_month": 15,
                "monthly_price": 42.90,
                "quarterly_price": 115.80,
                "semiannual_price": 205.90,
                "annual_price": 360.40,
                "features": json.dumps([
                    "15 cookie cutters al mese",
                    "Tutte le categorie",
                    "Accesso alla community",
                    "Anteprima nuovi design",
                    "Accesso esclusivo a design speciali",
                    "Design su richiesta (1 al mese)"
                ]),
                "is_popular": False,
                "is_active": True
            }
        ]
        
        for plan_data in plans:
            plan = SubscriptionPlan(**plan_data)
            db.add(plan)
        
        db.commit()
    
    # Crea categorie
    if db.query(Category).count() == 0:
        logger.info("Creazione categorie...")
        categories = [
            {
                "name": "Serie TV e Film",
                "slug": "serie-tv-film",
                "description": "Design ispirati ai tuoi film e serie TV preferiti",
                "image_url": "/static/img/categories/tv-film.jpg",
                "is_active": True
            },
            {
                "name": "Videogiochi",
                "slug": "videogiochi",
                "description": "Personaggi e simboli dai videogiochi più amati",
                "image_url": "/static/img/categories/videogiochi.jpg",
                "is_active": True
            },
            {
                "name": "Feste Stagionali",
                "slug": "feste-stagionali",
                "description": "Design per ogni festività e stagione",
                "image_url": "/static/img/categories/feste.jpg",
                "is_active": True
            },
            {
                "name": "Animali e Creature",
                "slug": "animali-creature",
                "description": "Animali reali e creature fantastiche",
                "image_url": "/static/img/categories/animali.jpg",
                "is_active": True
            },
            {
                "name": "Architettura e Monumenti",
                "slug": "architettura-monumenti",
                "description": "Riproduzioni di edifici e monumenti famosi",
                "image_url": "/static/img/categories/architettura.jpg",
                "is_active": True
            },
            {
                "name": "Botanica e Fiori",
                "slug": "botanica-fiori",
                "description": "Fiori dettagliati e motivi botanici",
                "image_url": "/static/img/categories/botanica.jpg",
                "is_active": True
            },
            {
                "name": "Sport e Squadre",
                "slug": "sport-squadre",
                "description": "Celebra la tua squadra e sport preferito",
                "image_url": "/static/img/categories/sport.jpg",
                "is_active": True
            },
            {
                "name": "Professioni e Hobby",
                "slug": "professioni-hobby",
                "description": "Strumenti e simboli di mestieri e hobby",
                "image_url": "/static/img/categories/professioni.jpg",
                "is_active": True
            }
        ]
        
        for category_data in categories:
            category = Category(**category_data)
            db.add(category)
        
        db.commit()
    
    # Crea immagini di default per le categorie
    # Nota: in un ambiente reale le immagini dovrebbero essere caricate
    # Creiamo delle immagini placeholder per lo sviluppo
    import os
    from PIL import Image, ImageDraw, ImageFont
    
    img_folder = "app/static/img/categories"
    os.makedirs(img_folder, exist_ok=True)
    
    # Crea immagini placeholder per le categorie
    if os.path.exists(img_folder) and len(os.listdir(img_folder)) < 8:
        logger.info("Creazione immagini placeholder per categorie...")
        categories = db.query(Category).all()
        color_map = {
            "serie-tv-film": (255, 107, 107),  # Corallo
            "videogiochi": (78, 205, 196),     # Turchese
            "feste-stagionali": (255, 209, 102), # Ambra
            "animali-creature": (170, 59, 56),  # Rosso scuro
            "architettura-monumenti": (45, 152, 152), # Verde acqua
            "botanica-fiori": (190, 177, 59),   # Giallo-verde
            "sport-squadre": (87, 117, 144),    # Blu-grigio
            "professioni-hobby": (77, 83, 60)   # Verde oliva
        }
        
        for category in categories:
            img_path = f"{img_folder}/{category.slug}.jpg"
            if not os.path.exists(img_path):
                # Crea immagine placeholder
                img = Image.new('RGB', (400, 300), color=color_map.get(category.slug, (200, 200, 200)))
                d = ImageDraw.Draw(img)
                
                # Aggiungi testo (in un ambiente reale useresti un vero font)
                try:
                    font = ImageFont.load_default()
                    d.text((150, 150), category.name, fill=(255, 255, 255), font=font)
                except Exception as e:
                    d.text((150, 150), category.name, fill=(255, 255, 255))
                
                img.save(img_path)
                
                # Aggiorna URL immagine nella categoria
                category.image_url = f"/static/img/categories/{category.slug}.jpg"
        
        db.commit()
    
    # Crea alcuni design di esempio
    if db.query(Design).count() == 0:
        logger.info("Creazione design di esempio...")
        # Recupera le categorie
        categories = {cat.slug: cat.id for cat in db.query(Category).all()}
        
        designs = [
            # Categoria Serie TV e Film
            {
                "name": "Spada Laser",
                "description": "Ispirata alla famosa saga spaziale",
                "category_id": categories["serie-tv-film"],
                "image_url": "/static/img/designs/spada-laser.jpg",
                "is_active": True
            },
            {
                "name": "Cappello dello Stregone",
                "description": "Dal mondo magico del giovane mago",
                "category_id": categories["serie-tv-film"],
                "image_url": "/static/img/designs/cappello-stregone.jpg",
                "is_active": True
            },
            
            # Categoria Videogiochi
            {
                "name": "Fungo Power-Up",
                "description": "Il classico fungo che ti fa crescere",
                "category_id": categories["videogiochi"],
                "image_url": "/static/img/designs/fungo.jpg",
                "is_active": True
            },
            {
                "name": "Controller Retro",
                "description": "Controller della console anni '90",
                "category_id": categories["videogiochi"],
                "image_url": "/static/img/designs/controller.jpg",
                "is_active": True
            },
            
            # Categoria Feste
            {
                "name": "Albero di Natale Dettagliato",
                "description": "Albero con decorazioni in rilievo",
                "category_id": categories["feste-stagionali"],
                "image_url": "/static/img/designs/albero-natale.jpg",
                "is_active": True
            }
        ]
        
        for design_data in designs:
            design = Design(**design_data)
            db.add(design)
        
        db.commit()
        
        # Crea immagini placeholder per i design
        img_folder = "app/static/img/designs"
        os.makedirs(img_folder, exist_ok=True)
        
        # Crea immagini placeholder per i design
        if os.path.exists(img_folder):
            logger.info("Creazione immagini placeholder per design...")
            designs = db.query(Design).all()
            
            for design in designs:
                img_path = f"{img_folder}/{design.id}.jpg"
                if not os.path.exists(img_path):
                    # Crea immagine placeholder
                    img = Image.new('RGB', (400, 300), color=(100, 100, 100))
                    d = ImageDraw.Draw(img)
                    
                    # Aggiungi testo
                    try:
                        font = ImageFont.load_default()
                        d.text((150, 150), design.name, fill=(255, 255, 255), font=font)
                    except Exception as e:
                        d.text((150, 150), design.name, fill=(255, 255, 255))
                    
                    img.save(img_path)
                    
                    # Aggiorna URL immagine
                    design.image_url = f"/static/img/designs/{design.id}.jpg"
            
            db.commit()
    
    logger.info("Seed del database completato!")

# Funzione per esecuzione diretta
def run_seed():
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()