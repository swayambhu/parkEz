from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.database import Base
import enum



class Users(Base):
    __tablename__ = "users"
    username = Column(String,primary_key=True, index=True)
    password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow())
    is_active = Column(Boolean, default=False)
  
class TypesOfBusiness(enum.Enum):
    ADVERTISERS = "ADVERTISERS"
    BUSINESS = "BUSINESS"
        
class Business(Base):
    __tablename__ = "business"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, ForeignKey("users.username"), unique=True)
    name = Column(String, unique=True)
    address = Column(String)
    phone_no = Column(String, unique=True, index=True)
    date_joined = Column(DateTime, default=datetime.utcnow())
    is_active = Column(Boolean, default=True)
    type = Column(Enum(TypesOfBusiness))



    