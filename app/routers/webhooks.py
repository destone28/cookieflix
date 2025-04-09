# app/routers/webhooks.py
from fastapi import APIRouter, Request, Depends, HTTPException, status
from sqlalchemy.orm import Session
import stripe
import json
import logging
from datetime import datetime, timedelta

from app.database import get_db
from app.config import settings
from app.models.subscription import Subscription
from app.models.user import User

router = APIRouter(prefix=f"{settings.API_PREFIX}/webhooks", tags=["Webhooks"])
logger = logging.getLogger(__name__)

@router.post("/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Webhook per gestire gli eventi di Stripe"""
    # Ottieni il payload e la firma
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature")
    
    try:
        # Verifica la firma dell'evento
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Payload non valido
        logger.error(f"Payload non valido: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payload non valido")
    except stripe.error.SignatureVerificationError as e:
        # Firma non valida
        logger.error(f"Firma non valida: {str(e)}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Firma non valida")
    
    # Gestisci l'evento
    if event["type"] == "checkout.session.completed":
        logger.info(f"Checkout completato: {event['data']['object']['id']}")
        session = event["data"]["object"]
        
        # Ottieni i metadati della sessione
        user_id = session.get("metadata", {}).get("user_id")
        plan_id = session.get("metadata", {}).get("plan_id")
        billing_period = session.get("metadata", {}).get("billing_period")
        
        if not all([user_id, plan_id, billing_period]):
            logger.error("Metadati mancanti nel checkout session")
            return {"status": "error", "message": "Metadati mancanti"}
        
        # Ottieni l'utente e verifica
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.error(f"Utente non trovato: {user_id}")
            return {"status": "error", "message": "Utente non trovato"}
        
        # Calcola la data di fine abbonamento
        start_date = datetime.utcnow()
        if billing_period == "monthly":
            end_date = start_date + timedelta(days=30)
        elif billing_period == "quarterly":
            end_date = start_date + timedelta(days=90)
        elif billing_period == "semiannual":
            end_date = start_date + timedelta(days=180)
        else:  # annual
            end_date = start_date + timedelta(days=365)
        
        # Crea l'abbonamento
        subscription = Subscription(
            user_id=user_id,
            plan_id=plan_id,
            start_date=start_date,
            end_date=end_date,
            is_active=True,
            billing_period=billing_period,
            next_billing_date=end_date,
            stripe_customer_id=session.get("customer"),
            stripe_subscription_id=session.get("subscription")
        )
        
        db.add(subscription)
        db.commit()
        
        logger.info(f"Abbonamento creato per l'utente {user_id}")
        return {"status": "success", "message": "Abbonamento creato"}
    
    elif event["type"] == "customer.subscription.updated":
        logger.info(f"Abbonamento aggiornato: {event['data']['object']['id']}")
        stripe_subscription = event["data"]["object"]
        
        # Trova l'abbonamento nel database
        subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == stripe_subscription.id
        ).first()
        
        if not subscription:
            logger.error(f"Abbonamento non trovato: {stripe_subscription.id}")
            return {"status": "error", "message": "Abbonamento non trovato"}
        
        # Aggiorna lo stato dell'abbonamento
        subscription.is_active = stripe_subscription.status == "active"
        
        # Se attivo, aggiorna la data di fine
        if subscription.is_active:
            current_period_end = datetime.fromtimestamp(stripe_subscription.current_period_end)
            subscription.end_date = current_period_end
            subscription.next_billing_date = current_period_end
        
        db.commit()
        logger.info(f"Abbonamento {stripe_subscription.id} aggiornato")
        return {"status": "success", "message": "Abbonamento aggiornato"}
    
    elif event["type"] == "customer.subscription.deleted":
        logger.info(f"Abbonamento cancellato: {event['data']['object']['id']}")
        stripe_subscription = event["data"]["object"]
        
        # Trova l'abbonamento nel database
        subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == stripe_subscription.id
        ).first()
        
        if not subscription:
            logger.error(f"Abbonamento non trovato: {stripe_subscription.id}")
            return {"status": "error", "message": "Abbonamento non trovato"}
        
        # Disattiva l'abbonamento
        subscription.is_active = False
        db.commit()
        
        logger.info(f"Abbonamento {stripe_subscription.id} disattivato")
        return {"status": "success", "message": "Abbonamento disattivato"}
    
    elif event["type"] == "invoice.payment_failed":
        logger.warning(f"Pagamento fallito: {event['data']['object']['id']}")
        invoice = event["data"]["object"]
        
        # Trova l'abbonamento associato
        if invoice.get("subscription"):
            subscription = db.query(Subscription).filter(
                Subscription.stripe_subscription_id == invoice["subscription"]
            ).first()
            
            if subscription:
                # Segna il pagamento come fallito nel log
                logger.warning(f"Pagamento fallito per l'abbonamento {subscription.id} dell'utente {subscription.user_id}")
                
                # Potremmo inviare una notifica all'utente qui
                
        return {"status": "received", "message": "Pagamento fallito registrato"}
    
    # Per altri tipi di eventi, registra e restituisci OK
    logger.info(f"Evento ricevuto: {event['type']}")
    return {"status": "received", "message": f"Evento {event['type']} ricevuto"}