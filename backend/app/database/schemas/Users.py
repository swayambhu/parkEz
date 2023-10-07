from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    username: str
    
class UserCreate(UserBase):
    password: str


class UserInDB(UserCreate):
    pass

class User(UserBase):
    username: str
    is_active: bool
    created_at: datetime
    class Config:
        orm_mode = True