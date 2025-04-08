# app/schemas/product.py
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    description: str
    image_url: Optional[str] = None
    
class CategoryCreate(CategoryBase):
    slug: str
    
class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class Category(CategoryBase):
    id: int
    slug: str
    is_active: bool
    
    class Config:
        orm_mode = True

class DesignBase(BaseModel):
    name: str
    description: str
    category_id: int
    image_url: str
    model_url: Optional[str] = None
    
class DesignCreate(DesignBase):
    pass
    
class DesignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    model_url: Optional[str] = None
    is_active: Optional[bool] = None

class Design(DesignBase):
    id: int
    created_at: datetime
    is_active: bool
    votes_count: Optional[int] = None
    
    class Config:
        orm_mode = True
        
class DesignWithCategory(Design):
    category: Category
    
    class Config:
        orm_mode = True

class VoteCreate(BaseModel):
    design_id: int
    
class Vote(BaseModel):
    id: int
    user_id: int
    design_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True