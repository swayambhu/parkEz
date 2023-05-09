from sqlalchemy.orm import Session
from app.database.database import get_db
from fastapi import Depends, HTTPException, status
from app.database.Models.Models import Users, Employees
from app.database.schemas import Services

def get_user(username: str, db: Session):
    user = db.query(Users).filter(Users.username == username).first()
    return user    
   
    
def create_user(username: str, password: str, db: Session):
    user = Users(username= username, password= password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_employee(employee: Services.EmployeeCreate, db: Session):
    employee = Employees(
        full_name=employee.full_name,
        email= employee.email,
        phone_no= employee.phone_no,
        address= employee.address
    )
    
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee