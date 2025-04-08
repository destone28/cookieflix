# app/schemas/subscription.py
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class SubscriptionPlanBase(BaseModel):
    name: str
    description: str
    categories_count: int
    items_per_month: int
    monthly_price: float
    quarterly_price: float
    semiannual_price: float
    annual_price: float
    features: List[str]

class SubscriptionPlanCreate(SubscriptionPlanBase):
    slug: str
    is_popular: bool = False
    is_active: bool = True

class SubscriptionPlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    categories_count: Optional[int] = None
    items_per_month: Optional[int] = None
    monthly_price: Optional[float] = None
    quarterly_price: Optional[float] = None
    semiannual_price: Optional[float] = None
    annual_price: Optional[float] = None
    features: Optional[List[str]] = None
    is_popular: Optional[bool] = None
    is_active: Optional[bool] = None

class SubscriptionPlan(SubscriptionPlanBase):
    id: int
    slug: str
    is_popular: bool
    is_active: bool
    
    class Config:
        orm_mode = True

class CreateCheckoutSession(BaseModel):
    plan_slug: str
    billing_period: str  # monthly, quarterly, semiannual, annual

class CheckoutSessionResponse(BaseModel):
    checkout_url: str

class SubscriptionBase(BaseModel):
    user_id: int
    plan_id: int
    billing_period: str
    
class SubscriptionCreate(SubscriptionBase):
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None

class Subscription(SubscriptionBase):
    id: int
    start_date: datetime
    end_date: Optional[datetime] = None
    is_active: bool
    next_billing_date: Optional[datetime] = None
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    
    class Config:
        orm_mode = True
        
class SubscriptionWithPlan(Subscription):
    plan: SubscriptionPlan
    
    class Config:
        orm_mode = True