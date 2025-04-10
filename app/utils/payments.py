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
    "starter_monthly": "price_1RCNjVP2DMvOSV1TAqpxkBUk",
    "starter_quarterly": "price_1RCO0NP2DMvOSV1TVUWKzRGN",
    "starter_semiannual": "price_1RCO1sP2DMvOSV1Tbqda2dAl",
    "starter_annual": "price_1RCO2TP2DMvOSV1TXF7kj23D",
    
    # Hobbista
    "hobbista_monthly": "price_1RCNkxP2DMvOSV1Tg2pOXdq8",
    "hobbista_quarterly": "price_1RCO8ZP2DMvOSV1TTAPvn3zR",
    "hobbista_semiannual": "price_1RCO8yP2DMvOSV1TqspuQGWi",
    "hobbista_annual": "price_1RCO9lP2DMvOSV1TUnJEGFdE",
    
    # Creativo
    "creativo_monthly": "price_1RCNsUP2DMvOSV1Twc9eTOnv",
    "creativo_quarterly": "price_1RCOEsP2DMvOSV1TKEoSqTGC",
    "creativo_semiannual": "price_1RCOFcP2DMvOSV1TeWpYSiZq",
    "creativo_annual": "price_1RCOGAP2DMvOSV1TTk9pPgUS",
    
    # Professional
    "professional_monthly": "price_1RCNvcP2DMvOSV1TjA5xlsrc",
    "professional_quarterly": "price_1RCOGbP2DMvOSV1TGM7XCpbs",
    "professional_semiannual": "price_1RCOGyP2DMvOSV1TU4QlrRyx",
    "professional_annual": "price_1RCOHLP2DMvOSV1TUYwUfiaG",
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