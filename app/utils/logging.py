# app/utils/logging.py
import logging
import json
from datetime import datetime
import os
from logging.handlers import RotatingFileHandler

class JsonFormatter(logging.Formatter):
    """Formattatore che produce log in formato JSON"""
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        
        # Aggiungi eccezione se presente
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
        
        # Aggiungi campi extra
        for key, value in record.__dict__.items():
            if key not in ["args", "exc_info", "exc_text", "levelname", "levelno", 
                           "lineno", "module", "msecs", "message", "msg", "name", 
                           "pathname", "process", "processName", "relativeCreated", 
                           "thread", "threadName", "funcName"]:
                log_record[key] = value
        
        return json.dumps(log_record)

def setup_logging(app_name="cookieflix", log_level=logging.INFO):
    """Configura il logging dell'applicazione"""
    # Crea directory logs se non esiste
    os.makedirs("logs", exist_ok=True)
    
    # Configura logger root
    logger = logging.getLogger()
    logger.setLevel(log_level)
    
    # Handler per console
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    logger.addHandler(console_handler)
    
    # Handler per file con rotazione
    file_handler = RotatingFileHandler(
        filename=f"logs/{app_name}.log",
        maxBytes=10485760,  # 10MB
        backupCount=10,
        encoding="utf8"
    )
    file_handler.setFormatter(JsonFormatter())
    logger.addHandler(file_handler)
    
    # Imposta livelli specifici per moduli terze parti troppo verbosi
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy").setLevel(logging.WARNING)
    
    return logger