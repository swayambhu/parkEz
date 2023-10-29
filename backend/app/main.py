import os
import stripe
import logging
from starlette.responses import JSONResponse
from fastapi import FastAPI, HTTPException, Depends
from fastapi.staticfiles import StaticFiles  # <-- Added import
from app.database.Models import Models
from app.database.database import engine
from app.routers.Authentication import authentication
from app.routers.Business import business
from app.routers import services
from app.routers.Billing import billing
from app.routers.Lots import lots
from app.routers.Ads import ads
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.DEBUG)

Models.Base.metadata.create_all(bind=engine)
app = FastAPI()

# Mount the directory to serve all files from ~/parkEz/backend/app/lots/
app.mount("/lots", StaticFiles(directory="app/lots/"), name="lots")  # <-- Added line

origins = [
    "http://localhost:3000",
    "http://dev.gruevy.com",
    "https://dev.gruevy.com",
    "https://qa.gruevy.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authentication.router)
app.include_router(business.router)
app.include_router(services.router)
app.include_router(billing.router)
app.include_router(lots.router)
app.include_router(ads.ads_router)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@app.get("/")
async def main():
    return {"message": "Hello World"}
