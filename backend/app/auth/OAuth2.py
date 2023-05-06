from fastapi import Cookie, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from .. import config
from datetime import datetime, timedelta
from app.database.Queries import user_query
from app.database.database import get_db
from sqlalchemy.orm import Session
from app.database.schemas import Token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")



        
# Password Hashing
def hash_password(plain_password):
    return pwd_context.hash(plain_password)

# Password Verification
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)
    
    
# Authenticate User
def authenticate_user(username: str, password: str, db: Session):
    user = user_query.get_user(username= username, db=db)
    
    if not user:
        return False
    
    if not verify_password(password, user.password):
        return False
    
    return user 


# Create Access Token
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)
    return encoded_jwt

# validate token
def validate_token(credentials_exception: HTTPException, access_token : str = Cookie("access_token")):
    try:
        payload = jwt.decode(token = access_token, key = config.SECRET_KEY, algorithms=[config.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return False
        token_data = Token.TokenData(username=username)
        return token_data
    except JWTError:
        raise credentials_exception

# get current user
def get_current_user(access_token: str = Cookie("access_token"), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials"
    )
    token_data = validate_token(access_token = access_token, credentials_exception= credentials_exception)
    user = user_query.get_user(db = db, username= token_data.username)
    if user is None:
        raise credentials_exception
    return user
    