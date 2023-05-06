from pydantic import BaseModel

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

    class Config:
        orm_mode = True