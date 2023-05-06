from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from .. import config
from datetime import datetime, timedelta
pwd_context = CryptContext(schemes=["bcrypt"], deprecate="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")



        
# Password Hashing
def hash_password(self, plain_password):
    return pwd_context.hash(plain_password)

#Password Verification
def verify_password(self, plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)
    
    
    
