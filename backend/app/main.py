from fastapi import FastAPI
from app.database.Models import Users
from app.database.database import engine
from app.routers import authentication


Users.Base.metadata.create_all(bind= engine)
app = FastAPI()

app.include_router(authentication.router)