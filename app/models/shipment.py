# app/models/shipment.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class Shipment(Base):
    __tablename__ = "shipments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    tracking_number = Column(String, nullable=True)
    status = Column(String)  # 'processed', 'shipped', 'delivered'
    shipped_date = Column(DateTime, nullable=True)
    estimated_delivery_date = Column(DateTime, nullable=True)
    delivered_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relazioni
    user = relationship("User", back_populates="shipments")
    shipment_items = relationship("ShipmentItem", back_populates="shipment")

class ShipmentItem(Base):
    __tablename__ = "shipment_items"
    
    id = Column(Integer, primary_key=True, index=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"))
    design_id = Column(Integer, ForeignKey("designs.id"))
    quantity = Column(Integer, default=1)
    
    # Relazioni
    shipment = relationship("Shipment", back_populates="shipment_items")
    design = relationship("Design")