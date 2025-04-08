# app/utils/payments.py
import stripe
from fastapi import HTTPException, status
import logging
from datetime import datetime, timedelta

from app.config import settings

# Configurazione Stripe
stripe.api_key = settings.STRIPE_API_KEY
logger = logging.getLogger(__name__)

# Mapping dei piani Cookieflix vs product/price IDs di Stripe
PLAN_MAPPING = {
    # Starter
    "starter_monthly": "price_starter_monthly",
    "starter_quarterly": "price_starter_quarterly",
    "starter_semiannual": "price_starter_semiannual",
    "starter_annual": "price_starter_annual",
    
    # Creator
    "creator_monthly": "price_creator_monthly",
    "creator_quarterly": "price_creator_quarterly",
    "creator_semiannual": "price_creator_semiannual",
    "creator_annual": "price_creator_annual",
    
    # Master
    "master_monthly": "price_master_monthly",
    "master_quarterly": "price_master_quarterly",
    "master_semiannual": "price_master_semiannual",
    "master_annual": "price_master_annual",
    
    # Collection
    "collection_monthly": "price_collection_monthly",
    "collection_quarterly": "price_collection_quarterly",
    "collection_semiannual": "price_collection_semiannual",
    "collection_annual": "price_collection_annual",
}

def calculate_next_billing_date(billing_period):
    """Calcola la prossima data di fatturazione"""
    today = datetime.utcnow()
    if billing_period == "monthly":
        return today + timedelta(days=30)
    elif billing_period == "quarterly":
        return today + timedelta(days=90)
    elif billing_period == "semiannual":
        return today + timedelta(days=180)
    elif billing_period == "annual":
        return today + timedelta(days=365)
    else:
        raise ValueError(f"Periodo di fatturazione non valido: {billing_period}")

def create_stripe_customer(email, name, metadata=None):
    """Crea un cliente Stripe"""
    try:
        customer = stripe.Customer.create(
            email=email,
            name=name,
            metadata=metadata or {}
        )
        logger.info(f"Cliente Stripe creato: {customer.id} per {email}")
        return customer.id
    except stripe.error.StripeError as e:
        logger.error(f"Errore nella creazione del cliente Stripe: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Errore di pagamento: {str(e)}"
        )

def create_stripe_checkout_session(customer_id, price_id, success_url, cancel_url, metadata=None):
    """Crea una sessione di checkout Stripe"""
    try:
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata or {}
        )
        logger.info(f"Sessione checkout creata: {checkout_session.id}")
        return checkout_session
    except stripe.error.StripeError as e:
        logger.error(f"Errore nella creazione della sessione checkout: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Errore di pagamento: {str(e)}"
        )