import stripe
from fastapi.routing import APIRouter
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.schemas.Users import UserCreate
from app.database.schemas.Business import BusinessCreate, Business, BusinessType
from app.database.schemas.ExternalUsers import ExternalUserIn, ExternalUserCreate, ExternalUser
from app.database.Queries import business_query, external_users_query
from app.database.Models import Models
from fastapi import Depends, HTTPException, status
from app.auth.OAuth2 import get_business_user
from . import HTTPErrors, utils as business_utils
from app import utils
import traceback
import logging

logging.basicConfig(level=logging.INFO)

router = APIRouter(
    prefix="/business",
    tags=["business"],
)

# create business
@router.post("/create", response_model=Business)
async def create_business(businessCreate: BusinessCreate, db: Session = Depends(get_db)):
    logging.info(f"Received data: {businessCreate}")
    print(businessCreate)
    #? Check if business Name, Email, phone number already exists
    utils.user_exits(table=Models.Users, column=Models.Users.username, check_value=businessCreate.email, exception=HTTPErrors.business_already_exists, db=db)  # check email exists
    utils.user_exits(table=Models.Business, column=Models.Business.name, check_value=businessCreate.name, exception=HTTPErrors.business_already_exists, db=db)  # check name exists   
    utils.user_exits(table=Models.Business, column=Models.Business.phone_no, check_value=businessCreate.phone_no, exception=HTTPErrors.business_already_exists, db=db)  # Check phone_no exists    
    
    #! Create the business user
    user = UserCreate(username=businessCreate.email, password=businessCreate.password)
    user_dict = utils.create_user_auth(user=user, db=db)

    # Mapping for business types to price IDs
    PRICE_IDS = {
        "ADVERTISERS": "price_1NynvKDI89byjwRRIwPwtvTG",
        "BUSINESS": "price_1NynsNDI89byjwRRSEHnmba5"
    }

    # Create a Stripe customer
    try:
        stripe_customer = stripe.Customer.create(
            email=businessCreate.email,
            name=businessCreate.name
        )
    except Exception as e:
        print(traceback.format_exc()) # This will print the full traceback
        raise HTTPException(status_code=400, detail=str(e))    

    try:
        payment_method = stripe.PaymentMethod.attach(
            businessCreate.card_token,
            customer=stripe_customer.id,
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Stripe error: {str(e)}")


    # Set this payment method as the default for the customer
    try:
        stripe.Customer.modify(
            stripe_customer.id,
            invoice_settings={
                'default_payment_method': payment_method.id,
            },
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Stripe error: {str(e)}")

    # Set the Stripe customer ID in your business model
    businessCreate.stripe_customer_id = stripe_customer.id

    # Create the business with the stripe_customer_id
    business = business_query.create_business(business=businessCreate, db=db)

    # Return the business
    business.type = business.type.value
    return business


@router.post("/create-users", response_model=ExternalUser)
async def create_external_users(user_data: ExternalUserIn, business: str = Depends(get_business_user), db: Session = Depends(get_db)):
    user_email = business_utils.generate_email(full_name=user_data.name, phone_no=user_data.phone_no, business_name=business.name)
    user_password = business_utils.generate_password(full_name=user_data.name, business_name=business.name)
    
    #? Check if user already exists, or his phone_no already exists
    utils.user_exits(table=Models.Users, column=Models.Users.username, check_value=user_email, exception= HTTPErrors.business_user_already_exists, db=db)
    utils.user_exits(table=Models.ExternalUsers, column=Models.ExternalUsers.phone_no, check_value= user_data.phone_no, exception=HTTPErrors.business_user_already_exists, db=db)

    #! Create the External auth user
    user = UserCreate(username= user_email, password=user_password)
    user_dict = utils.create_user_auth(user=user, db=db)
    
    #! Create business user
    user_data.name = user_data.name.capitalize()
    user_data_in_db = ExternalUserCreate(**user_data.dict(), business_id=business.id, email=user_email)
    user = external_users_query.create_user(user=user_data_in_db, db=db) 
  
    
    return user