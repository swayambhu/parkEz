from pydantic import BaseModel
from datetime import datetime
class UserBase(BaseModel):
    username: str
    
class UserCreate(UserBase):
    password: str


class UserInDB(UserCreate):
    pass

class User(UserBase):
    id: int
    username: str
    is_active: bool
    created_at: datetime
    class Config:
        orm_mode = True