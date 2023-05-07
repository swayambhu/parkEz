from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Table, Column, Integer, String, MetaData, DateTime, ForeignKey, BigInteger
from sqlalchemy.sql import select, insert
import uuid
import datetime
import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


DATABASE_URL = "postgresql://parkez:parkez@localhost/parkez"

engine = create_engine(DATABASE_URL)
metadata = MetaData()

app = FastAPI()

origins = [
    "http://localhost:3000", 
]

@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
    return response


authentication = Table(
    "authentication",
    metadata,
    Column("username", String, primary_key=True),
    Column("password", String, nullable=False),
    Column("created_at", DateTime, default=datetime.datetime.utcnow),
)

business = Table(
    "business",
    metadata,
    Column("id", String, primary_key=True, default=lambda: str(uuid.uuid4())),
    Column("name", String, nullable=False),
    Column("contact_no", BigInteger, nullable=False),
    Column("address", String),
)

advertisers = Table(
    "advertisers",
    metadata,
    Column("id", String, primary_key=True, default=lambda: str(uuid.uuid4())),
    Column("name", String, nullable=False),
    Column("contact_no", BigInteger, nullable=False),
    Column("address", String),
)

external_users = Table(
    "external_users",
    metadata,
    Column("id", String, primary_key=True, default=lambda: str(uuid.uuid4())),
    Column("full_name", String, nullable=False),
    Column("phone_no", BigInteger, nullable=False),
    Column("email_id", String, ForeignKey("authentication.username")),
    Column("business_id", String, ForeignKey("business.id")),
    Column("advertisers_id", String, ForeignKey("advertisers.id")),
)

class AuthData(BaseModel):
    email: str
    password: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/authenticate")
async def authenticate(auth_data: AuthData):
    logging.info(f"Received data: {auth_data}")
    user_found = False
    password_valid = False
    created_at = None
    user_role = "N/A"
    email = None
    full_name = None


    with engine.connect() as connection:
        result = connection.execute(select(authentication).where(authentication.c.username == auth_data.email)).fetchone()
        if result:
            user_found = True
            created_at = result.created_at
            email = result.username
            if result.password == auth_data.password:
                password_valid = True
                ext_user = connection.execute(select(external_users).where(external_users.c.email_id == auth_data.email)).fetchone()
                if ext_user:
                    full_name = ext_user.full_name
                    if ext_user.business_id and not ext_user.advertisers_id:
                        user_role = "lotoperator"
                    elif ext_user.advertisers_id and not ext_user.business_id:
                        user_role = "advertiser"

    logging.info(f"Created at: {created_at}")
    return {"status": "success", "user_found": user_found, "password_valid": password_valid, "userrole": user_role, "username": email, "fullname":full_name}

@app.get("/auth_records")
async def get_auth_records():
    with engine.connect() as connection:
        result = connection.execute(select(authentication))
        records = result.fetchall()
        return [{"created_at": r.created_at, "username": r.username, "password": r.password} for r in records]

@app.get("/trial")
async def trial():
    return {"message": "Marsh marsh chan chan"}

class SignUpData(BaseModel):
    name: str
    email: str
    contact_no: int
    address: str
    password: str
    confirm_password: str
    accountType: str


@app.get("/fetch_data")
async def fetch_data():
    with engine.connect() as connection:
        auth_records = connection.execute(select(authentication)).fetchall()
        business_records = connection.execute(select(business)).fetchall()
        advertisers_records = connection.execute(select(advertisers)).fetchall()
        external_users_records = connection.execute(select(external_users)).fetchall()
    return {
        "authentication": [row._asdict() for row in auth_records],
        "business": [row._asdict() for row in business_records],
        "advertisers": [row._asdict() for row in advertisers_records],
        "external_users": [row._asdict() for row in external_users_records],
    }


@app.post("/signup")
async def create_account(signup_data: SignUpData):
    with engine.begin() as conn:

        logging.info(signup_data)
        result = conn.execute(select(authentication.c.username).where(authentication.c.username == signup_data.email)).fetchone()
        if result:
            raise HTTPException(status_code=400, detail="Email already exists")

        logging.info(signup_data.email)
        logging.info(signup_data.password)
        conn.execute(insert(authentication).values(username=signup_data.email, password=signup_data.password))

        user_data = {
            "full_name": signup_data.name,
            "phone_no": signup_data.contact_no,
            "email_id": signup_data.email,
        }
        if signup_data.accountType == "parking_lot_operator":
            business_id = str(uuid.uuid4())
            conn.execute(insert(business).values(id=business_id, name=signup_data.name, contact_no=signup_data.contact_no, address=signup_data.address))
            user_data["business_id"] = business_id
        elif signup_data.accountType == "advertiser":
            advertisers_id = str(uuid.uuid4())
            conn.execute(insert(advertisers).values(id=advertisers_id, name=signup_data.name, contact_no=signup_data.contact_no, address=signup_data.address))
            user_data["advertisers_id"] = advertisers_id
        else:
            raise HTTPException(status_code=400, detail="Invalid account type")

        conn.execute(insert(external_users).values(**user_data)) 

    return {"message": "Account created successfully"}

