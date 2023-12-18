from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
# from app.database.schemas.Billing import PaymentIntent
# import stripe

router = APIRouter(
    prefix="/billing",
    tags=["billing"],
)

# @router.post("/create-payment-intent/")
# async def create_payment_intent(data: PaymentIntent):
#     try:
#         payment_intent = stripe.PaymentIntent.create(
#             amount=data.amount, 
#             currency=data.currency, 
#         )
#         return {"client_secret": payment_intent.client_secret}
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=str(e))