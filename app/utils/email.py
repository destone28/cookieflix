# app/utils/email.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from app.config import settings

logger = logging.getLogger(__name__)

def send_email(recipient_email: str, subject: str, body: str, html_body: str = None):
    """
    Invia un'email utilizzando le credenziali configurate
    
    Args:
        recipient_email: L'indirizzo email del destinatario
        subject: L'oggetto dell'email
        body: Il corpo dell'email in formato testo
        html_body: Il corpo dell'email in formato HTML (opzionale)
    
    Returns:
        bool: True se l'invio è riuscito, False altrimenti
    """
    try:
        # Verifica che le credenziali siano configurate
        if not all([settings.EMAIL_SENDER, settings.EMAIL_PASSWORD, settings.EMAIL_SERVER]):
            logger.error("Configurazione email mancante")
            return False
        
        # Crea il messaggio
        message = MIMEMultipart("alternative")
        message["From"] = settings.EMAIL_SENDER
        message["To"] = recipient_email
        message["Subject"] = subject
        
        # Aggiungi versione testo
        message.attach(MIMEText(body, "plain"))
        
        # Aggiungi versione HTML se fornita
        if html_body:
            message.attach(MIMEText(html_body, "html"))
        
        # Connetti al server e invia
        with smtplib.SMTP_SSL(settings.EMAIL_SERVER, settings.EMAIL_PORT) as server:
            server.login(settings.EMAIL_SENDER, settings.EMAIL_PASSWORD)
            server.sendmail(settings.EMAIL_SENDER, recipient_email, message.as_string())
            logger.info(f"Email inviata a {recipient_email}: {subject}")
            return True
            
    except Exception as e:
        logger.error(f"Errore nell'invio dell'email: {e}")
        return False