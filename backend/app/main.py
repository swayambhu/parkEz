from fastapi import FastAPI
from app.database.Models import Models
from app.database.database import engine
from app.routers.Authentication import authentication
from app.routers.Business import business


Models.Base.metadata.create_all(bind= engine)
app = FastAPI()

app.include_router(authentication.router)
app.include_router(business.router)