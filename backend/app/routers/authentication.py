from fastapi import APIRouter, Depends

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

@router.get("/token")
async def create_access_token():
    return "Login"