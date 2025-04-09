# app/utils/activity.py
from fastapi import Request
from sqlalchemy.orm import Session
import json

from app.models.activity import Activity

async def log_activity(
    db: Session, 
    activity_type: str, 
    description: str, 
    user_id: int = None, 
    metadata: dict = None,
    request: Request = None
):
    """Registra un'attività nel database"""
    ip_address = None
    user_agent = None
    
    if request:
        ip_address = request.client.host
        user_agent = request.headers.get("user-agent")
    
    activity = Activity(
        user_id=user_id,
        type=activity_type,
        description=description,
        ip_address=ip_address,
        user_agent=user_agent,
        activity_data=metadata
    )
    
    db.add(activity)
    db.commit()
    
    return activity