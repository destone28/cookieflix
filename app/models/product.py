# app/models/product.py
from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    slug = Column(String, unique=True)
    description = Column(String)
    image_url = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Relazioni
    designs = relationship("Design", back_populates="category")

class Design(Base):
    __tablename__ = "designs"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text)
    category_id = Column(Integer, ForeignKey("categories.id"))
    image_url = Column(String)
    model_url = Column(String, nullable=True)  # Per il modello 3D
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relazioni
    category = relationship("Category", back_populates="designs")
    votes = relationship("Vote", back_populates="design")

class Vote(Base):
    __tablename__ = "votes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    design_id = Column(Integer, ForeignKey("designs.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relazioni
    user = relationship("User", back_populates="votes")
    design = relationship("Design", back_populates="votes")