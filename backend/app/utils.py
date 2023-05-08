from app.database.schemas.Users import UserCreate
from app.auth.OAuth2 import hash_password
from sqlalchemy.orm import Session
from app.database.Queries import user_query
from app.database.Models import Models

def create_user_auth(user: UserCreate, db: Session):
    hashed_password = hash_password(user.password)
    user_dict = user_query.create_user(username=user.username, password=hashed_password, db= db)
    return user_dict

def user_exits(table, column, check_value, exception, db: Session):
    user = db.query(table).filter(column == check_value).first()
    
    if user:
        raise exception
    
    return user
    