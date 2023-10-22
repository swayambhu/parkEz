import os
import uuid
from fastapi.routing import APIRouter
from fastapi import Form, File, UploadFile, Depends, HTTPException, Body, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.exc import NoResultFound
from app.database.database import get_db
from app.database.Models.Models import Ad
from app.database.Models import Models
from app.database.schemas.Ads import AdCreate
from app.database.schemas import Users, Token, Auth
from app.auth.OAuth2 import hash_password, authenticate_user, create_access_token, validate_token, get_current_user



ads_router = APIRouter(
    prefix="/ads",
    tags=["ads"],
)

ADS_DIR = "app/ads"

def save_upload_file(upload_file: UploadFile, dest_folder: str) -> str:
    """
    Save uploaded file to destination folder and return its file path.
    """
    try:
        # Create the directory if it doesn't exist
        if not os.path.exists(dest_folder):
            os.makedirs(dest_folder)
        
        # Create a unique filename to avoid overwriting files
        file_name = f"{uuid.uuid4().hex}_{upload_file.filename}"
        file_path = os.path.join(dest_folder, file_name)

        # Write the file
        with open(file_path, "wb") as buffer:
            buffer.write(upload_file.file.read())

        return file_path

    except Exception as e:
        print(f"Failed to save the file. Reason: {e}")
        return None


@ads_router.post("/create")
async def create_ad(
    name: str = Form(...),
    start_date: str = Form(...),
    end_date: str = Form(...),
    url: str = Form(...),
    image_change_interval: int = Form(...),
    top_banner_image1: UploadFile = File(None),
    top_banner_image2: UploadFile = File(None),
    top_banner_image3: UploadFile = File(None),
    current_user: Users.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get business_id from the currently logged in user's email
    try:
        business = db.query(Models.Business).filter(Models.Business.email == current_user.username).one()
        business_id = business.id
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No business associated with the current user"
        )

    # Save files
    file_path1 = save_upload_file(top_banner_image1, ADS_DIR) if top_banner_image1 else None
    file_path2 = save_upload_file(top_banner_image2, ADS_DIR) if top_banner_image2 else None 
    file_path3 = save_upload_file(top_banner_image3, ADS_DIR) if top_banner_image3 else None

    # Create Ad instance
    ad = Ad(
        name=name,
        start_date=start_date,
        end_date=end_date,
        business_id=business_id,
        url=url,
        image_change_interval=image_change_interval,
        top_banner_image1_path=file_path1,
        top_banner_image2_path=file_path2,
        top_banner_image3_path=file_path3
    )
    db.add(ad)
    db.commit()
    db.refresh(ad)

    return {"message": "Ad created successfully", "ad": ad}
