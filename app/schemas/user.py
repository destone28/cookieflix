# app/schemas/user.py
from app.utils.auth import is_strong_password
from typing import Optional, List
from pydantic import BaseModel, EmailStr, validator
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    referred_by: Optional[str] = None
    
    @validator('password')
    def password_strength(cls, v):
        if not is_strong_password(v):
            raise ValueError('La password deve contenere almeno 8 caratteri, inclusi maiuscole, minuscole, numeri e caratteri speciali')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    
class Token(BaseModel):
    access_token: str
    token_type: str
    
class TokenData(BaseModel):
    user_id: Optional[int] = None

class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    referral_code: str
    credit_balance: float
    created_at: datetime
    
    class Config:
        orm_mode = True