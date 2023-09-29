from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from app.database.schemas import Users, Auth
from app.auth.OAuth2 import  authenticate_user, create_access_token, get_current_user
from app.database.schemas.Users import User
from app.database.Queries import user_query
from app.database.database import get_db
from sqlalchemy.orm import Session
from datetime import timedelta
from app import config, utils
from app.database.Queries.user_query import summarize_account as summarize_account_query


router = APIRouter(
    prefix="/users-account",
    tags=["Users Account"],
)

@router.get('/summarize-account')
async def summarize_account(user_type: str, access_token: str = Depends(get_current_user), db: Session = Depends(get_db)):
    user = User(**access_token.__dict__)
    if user:
        user_details = summarize_account_query(user_type=user_type, email = user.username, db=db)
        
    return user_details
    
     