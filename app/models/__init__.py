# app/models/__init__.py
# Questo file garantisce che tutti i modelli vengano importati nell'ordine corretto

from app.models.activity import Activity
from app.models.user import User
from app.models.subscription import SubscriptionPlan, Subscription
from app.models.product import Category, Design, Vote

# Configura le relazioni dopo che tutte le classi sono definite
from sqlalchemy.orm import relationship
User.activities = relationship("Activity", back_populates="user")