# app/models/user.py
from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Float, Table
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base

# Tabella di collegamento per relazione many-to-many utente-categoria
user_category_preference = Table(
    "user_category_preference",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("category_id", Integer, ForeignKey("categories.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    referral_code = Column(String, unique=True, index=True, default=lambda: uuid.uuid4().hex[:8])
    referred_by = Column(String, nullable=True)
    credit_balance = Column(Float, default=0)
    stripe_customer_id = Column(String, nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    account_locked_until = Column(DateTime, nullable=True)
    
    # Nuovi campi per indirizzo e data di nascita
    address = Column(String, nullable=True)
    street_number = Column(String, nullable=True)
    city = Column(String, nullable=True)
    zip_code = Column(String, nullable=True)
    country = Column(String, nullable=True)
    birthdate = Column(DateTime, nullable=True)
    
    # Relazioni
    subscriptions = relationship("Subscription", back_populates="user")
    votes = relationship("Vote", back_populates="user")
    preferred_categories = relationship("Category", secondary=user_category_preference)