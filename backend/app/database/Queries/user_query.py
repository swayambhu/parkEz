from sqlalchemy.orm import Session
from app.database.database import get_db
from fastapi import Depends, HTTPException, status
from app.database.Models.Users import Users

def get_user(username: str, db: Session):
    user = db.query(Users).filter(Users.username == username).first()
    return user    
   
    
def create_user(username: str, password: str, db: Session):
    user = Users(username= username, password= password)
    print(user)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

