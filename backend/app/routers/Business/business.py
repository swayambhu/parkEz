from fastapi.routing import APIRouter
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.schemas.Business import BusinessCreate, Business, BusinessType
from app.database.Queries import business_query, user_query
from fastapi import Depends, HTTPException, status
from app.auth.OAuth2 import hash_password
from . import HTTPErrors
router = APIRouter(
    prefix="/business",
    tags=["business"],
)




# create business
@router.post("/create", response_model= Business)
async def create_business(businessCreate: BusinessCreate, db: Session = Depends(get_db)):
    
    #? Check if business Name, Email, phone number already exists
    business_dict = user_query.get_user(username=businessCreate.email, db=db) #? Business email
    business_name = business_query.get_business_by_name(name= businessCreate.email, db=db) #? Business name
    business_phone_no = business_query.get_business_by_phone_number(phone_no= businessCreate.phone_no, db=db) #? Business phone number
    
    
    #? If any of the above exists, raise an error
    if business_dict or business_name or business_phone_no: 
        raise HTTPErrors.business_already_exists
    
    #? If business type is not valid, raise an error
    try:
        businessCreate.type = BusinessType(businessCreate.type)
    except ValueError:
        raise HTTPErrors.business_type_not_valid
    
    
    #? else create business user
    
    
    #! First generate a hash of password 
    hashed_password = hash_password(businessCreate.password)
    
    #! Create the business user
    user_dict = user_query.create_user(username=businessCreate.email, password=hashed_password, db= db)

    #! Create the business
    business = business_query.create_business(business=businessCreate, db=db)
  
    #! Return the business
    business.type = business.type.value
    return business