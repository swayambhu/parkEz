import os
import base64
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

def image_to_base64(file_path: str) -> str:
    with open(file_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')
    
def save_upload_file(upload_file: UploadFile, dest_folder: str, ad_name: str, index: int) -> str:
    """
    Save uploaded file to destination folder and return its file path.
    """
    try:
        # Create the directory if it doesn't exist
        if not os.path.exists(dest_folder):
            os.makedirs(dest_folder)
        
        # Naming the file based on ad name and index
        file_name = f"{ad_name}_{index}.jpg"
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
    # Check if ad name is already in use
    existing_ad = db.query(Models.Ad).filter(Models.Ad.name == name).first()
    if existing_ad:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ad name already in use"
        )

    # Get business_id from the currently logged in user's email
    try:
        business = db.query(Models.Business).filter(Models.Business.email == current_user.username).one()
        business_id = business.id
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No business associated with the current user"
        )

    # Directory path based on business id
    business_dir = os.path.join(ADS_DIR, str(business_id))

    # Save files
    file_path1 = save_upload_file(top_banner_image1, business_dir, name, 1) if top_banner_image1 else None
    file_path2 = save_upload_file(top_banner_image2, business_dir, name, 2) if top_banner_image2 else None 
    file_path3 = save_upload_file(top_banner_image3, business_dir, name, 3) if top_banner_image3 else None

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


@ads_router.get("/current_user_ads")
async def get_current_user_ads(
    current_user: Users.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        business = db.query(Models.Business).filter(Models.Business.email == current_user.username).one()
        business_id = business.id
    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No business associated with the current user"
        )

    ads = db.query(Models.Ad).filter(Models.Ad.business_id == business_id).all()

    ads_list = []
    for ad in ads:
        ad_dict = ad.__dict__
        if ad.top_banner_image1_path:
            ad_dict['top_banner_image1_base64'] = image_to_base64(ad.top_banner_image1_path)
        if ad.top_banner_image2_path:
            ad_dict['top_banner_image2_base64'] = image_to_base64(ad.top_banner_image2_path)
        if ad.top_banner_image3_path:
            ad_dict['top_banner_image3_base64'] = image_to_base64(ad.top_banner_image3_path)
        ads_list.append(ad_dict)

    return {"ads": ads_list}
