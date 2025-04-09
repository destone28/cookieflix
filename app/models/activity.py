# app/models/activity.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class Activity(Base):
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    type = Column(String)  # login, logout, subscription, vote, ecc.
    description = Column(String)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    activity_data = Column(JSON, nullable=True)  # Dati aggiuntivi in formato JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relazioni
    user = relationship("User", back_populates="activities")