from fastapi import FastAPI
from app.database.Models import Models
from app.database.database import engine
from app.routers.Authentication import authentication
from app.routers.Business import business
from app.routers import services
from app.routers.Users import users
from fastapi.middleware.cors import CORSMiddleware
import logging

logging.basicConfig(level=logging.DEBUG)

Models.Base.metadata.create_all(bind= engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authentication.router)
app.include_router(business.router)
app.include_router(services.router)
app.include_router(users.router)

@app.get("/")
async def main():
    return {"message": "Hello World"}