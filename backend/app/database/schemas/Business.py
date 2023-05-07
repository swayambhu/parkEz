from pydantic import BaseModel
from enum import Enum
from datetime import datetime

class BusinessType(str, Enum):
    ADVERTISERS = "ADVERTISERS"
    BUSINESS = "BUSINESS"

class BusinessBase(BaseModel):
    email: str
    name: str
    phone_no: str
    address: str
    type: BusinessType | str
    
class BusinessCreate(BusinessBase):
    password: str
    

    
class Business(BusinessBase):
    id: int
    date_joined: datetime
    is_active: bool
    
    class Config:
        orm_mode = True
    