# app/models/subscription.py
from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta

from app.database import Base

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)  # Starter, Creator, Master, Collection
    slug = Column(String, unique=True)
    description = Column(String)
    categories_count = Column(Integer)
    items_per_month = Column(Integer)
    monthly_price = Column(Float)
    quarterly_price = Column(Float)
    semiannual_price = Column(Float)
    annual_price = Column(Float)
    is_popular = Column(Boolean, default=False)
    features = Column(String)  # JSON serialized list
    is_active = Column(Boolean, default=True)
    
    # Relazioni
    subscriptions = relationship("Subscription", back_populates="plan")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(Integer, ForeignKey("subscription_plans.id"))
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    billing_period = Column(String)  # monthly, quarterly, semiannual, annual
    next_billing_date = Column(DateTime)
    stripe_customer_id = Column(String, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)
    
    # Relazioni
    user = relationship("User", back_populates="subscriptions")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")