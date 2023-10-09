from pydantic import BaseModel
from enum import Enum
from datetime import datetime
from typing import Optional

class BusinessType(str, Enum):
    ADVERTISERS = "ADVERTISERS"
    BUSINESS = "BUSINESS"

class BusinessBase(BaseModel):
    email: str
    name: str
    phone_no: str
    address: str
    stripe_customer_id: Optional[str]
    type: BusinessType | str
    
class BusinessCreate(BusinessBase):
    stripe_customer_id: Optional[str]
    password: str
    card_token: str
    
class Business(BusinessBase):
    id: int
    date_joined: datetime
    is_active: bool
    
    class Config:
        orm_mode = True

class BusinessUsers(Business):
    pass

    class Config:
        orm_mode = True

class PaymentToken(BaseModel):
    token: str