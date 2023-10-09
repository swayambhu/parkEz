import stripe
from fastapi.routing import APIRouter
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.schemas import Users
from app.database.schemas.Users import UserCreate
from app.database.schemas.Business import BusinessCreate, Business, BusinessType, PaymentToken
from app.database.schemas.ExternalUsers import ExternalUserIn, ExternalUserCreate, ExternalUser
from app.auth.OAuth2 import hash_password, authenticate_user, create_access_token, validate_token, get_current_user
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

@router.get("/payment_methods")
async def get_payment_methods(current_user: Users.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_data = jsonable_encoder(current_user)
    
    business = db.query(Models.Business).filter(Models.Business.email == user_data["username"]).one()

    payment_methods = stripe.PaymentMethod.list(
        customer=business.stripe_customer_id,
        type="card",
    )

    # Fetching the Stripe customer to get the default payment method.
    customer = stripe.Customer.retrieve(business.stripe_customer_id)
    default_payment_method = customer.invoice_settings.default_payment_method

    # Augmenting each payment method with a "is_default" boolean.
    for method in payment_methods["data"]:
        method["is_default"] = method.id == default_payment_method

    return {"payment_methods": payment_methods["data"]}


@router.post("/add_payment_method")
async def add_payment_method(token_data: PaymentToken, current_user: Users.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_data = jsonable_encoder(current_user)
    business = db.query(Models.Business).filter(Models.Business.email == user_data["username"]).one()

    try:
        payment_method = stripe.PaymentMethod.attach(
            token_data.token,
            customer=business.stripe_customer_id,
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")

    return {"payment_method": payment_method}

@router.delete("/delete_payment_method/{payment_method_id}")
async def delete_payment_method(payment_method_id: str, current_user: Users.User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        stripe.PaymentMethod.detach(payment_method_id)
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Stripe error: {str(e)}")

    return {"detail": "Payment method deleted successfully"}

@router.put("/update_default_payment_method/{payment_method_id}")
async def update_default_payment_method(payment_method_id: str, current_user: Users.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_data = jsonable_encoder(current_user)
    business = db.query(Models.Business).filter(Models.Business.email == user_data["username"]).one()

    try:
        stripe.Customer.modify(
            business.stripe_customer_id,
            invoice_settings={
                'default_payment_method': payment_method_id,
            },
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Stripe error: {str(e)}")

    return {"detail": "Default payment method updated successfully"}

@router.get("/invoices")
async def get_invoices(current_user: Users.User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_data = jsonable_encoder(current_user)
    business = db.query(Models.Business).filter(Models.Business.email == user_data["username"]).one()

    invoices = stripe.Invoice.list(customer=business.stripe_customer_id)

    invoices_data = [{
        "id": inv.id,
        "description": inv.lines.data[0].description if inv.lines.data else "",
        "status": inv.status,
        "start_date": inv.lines.data[0].period.start if inv.lines.data else None,
        "end_date": inv.lines.data[0].period.end if inv.lines.data else None,
        "price_per_item": (inv.lines.data[0].amount / 100 / inv.lines.data[0].quantity) if inv.lines.data and inv.lines.data[0].quantity and inv.lines.data[0].quantity > 0 else None,  # Price for 1 of the top item
        "quantity": inv.lines.data[0].quantity if inv.lines.data else None,
        "total": (inv.total / 100) if hasattr(inv, 'total') else None  # Convert cents to dollars
    } for inv in invoices.data]

    return {"invoices": invoices_data}

@router.post("/pay_invoice/{invoice_id}")
async def pay_invoice(invoice_id: str, current_user: Users.User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        # Pay the invoice
        stripe.Invoice.pay(invoice_id)
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Stripe error: {str(e)}")

    return {"detail": "Invoice paid successfully"}
