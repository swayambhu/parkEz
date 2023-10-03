from fastapi.routing import APIRouter
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.schemas.Users import UserCreate
from app.database.schemas.Billing import PaymentIntent
from app.database.schemas.Business import BusinessCreate, Business, BusinessType
from app.database.schemas.ExternalUsers import ExternalUserIn, ExternalUserCreate, ExternalUser
from app.database.Queries import business_query, external_users_query
from app.database.Models import Models
from app.auth.OAuth2 import get_business_user
from app import utils
from fastapi import FastAPI, HTTPException,Depends
from starlette.responses import JSONResponse
import stripe
router = APIRouter(
    prefix="/billing",
    tags=["billing"],
)

@router.post("/create-payment-intent/")
async def create_payment_intent(data: PaymentIntent):
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=data.amount, 
            currency=data.currency, 
        )
        return JSONResponse(content=payment_intent)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
