import os
import uuid
from fastapi.routing import APIRouter
from fastapi import Form, File, UploadFile, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.Models.Models import Ad
from app.database.schemas.Ads import AdCreate

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
    business_id: int = Form(...),
    url: str = Form(...),
    image_change_interval: int = Form(...),
    top_banner_image1: UploadFile = File(None),
    top_banner_image2: UploadFile = File(None),
    db: Session = Depends(get_db)  # Assuming you have a function `get_db` to get the database session
):
    # Save files
    file_path1 = save_upload_file(top_banner_image1, ADS_DIR) if top_banner_image1 else None
    file_path2 = save_upload_file(top_banner_image2, ADS_DIR) if top_banner_image2 else None

    # Create Ad instance
    ad = Ad(
        name=name,
        start_date=start_date,
        end_date=end_date,
        business_id=business_id,
        url=url,
        image_change_interval=image_change_interval,
        top_banner_image1_path=file_path1,
        top_banner_image2_path=file_path2
    )
    db.add(ad)
    db.commit()
    db.refresh(ad)

    return {"message": "Ad created successfully", "ad": ad}


# Old working but does nothing but print
# @ads_router.post("/create")
# async def create_ad(
#     name: str = Form(...),
#     start_date: str = Form(...),
#     end_date: str = Form(...),
#     business_id: int = Form(...),
#     url: str = Form(...),
#     image_change_interval: int = Form(...),
#     top_banner_image1: UploadFile = File(None),
#     top_banner_image2: UploadFile = File(None)
# ):
#     # Print the data received
#     print("Received ad data:")
#     print("Name:", name)
#     print("Start Date:", start_date)
#     print("End Date:", end_date)
#     print("Business ID:", business_id)
#     print("URL:", url)
#     print("Image Change Interval:", image_change_interval)
    
#     if top_banner_image1:
#         print(f"Received file {top_banner_image1.filename} for top_banner_image1")

#     if top_banner_image2:
#         print(f"Received file {top_banner_image2.filename} for top_banner_image2")

#     # Since we're not doing anything, you can return a simple message for testing purposes
#     return {"message": "Data received"}
