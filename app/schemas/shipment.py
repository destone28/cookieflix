# app/schemas/shipment.py
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.schemas.product import Design

class ShipmentItemBase(BaseModel):
    design_id: int
    quantity: int = 1

class ShipmentItemCreate(ShipmentItemBase):
    pass

class ShipmentItem(ShipmentItemBase):
    id: int
    shipment_id: int
    
    class Config:
        orm_mode = True

class ShipmentBase(BaseModel):
    tracking_number: Optional[str] = None
    status: str
    shipped_date: Optional[datetime] = None
    estimated_delivery_date: Optional[datetime] = None
    delivered_date: Optional[datetime] = None

class ShipmentCreate(ShipmentBase):
    user_id: int

class Shipment(ShipmentBase):
    id: int
    user_id: int
    created_at: datetime
    shipment_items: List[ShipmentItem] = []
    
    class Config:
        orm_mode = True

class ShipmentWithItems(Shipment):
    
    class ShipmentItemWithDesign(ShipmentItem):
        design: Design
        
        class Config:
            orm_mode = True
    
    shipment_items: List[ShipmentItemWithDesign] = []
    
    class Config:
        orm_mode = True