import os
import base64
from datetime import date
from random import choice
from typing import List, Optional
from fastapi.routing import APIRouter
from fastapi import Form, File, UploadFile, Depends, HTTPException, Body, status, Request
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm.exc import NoResultFound
from app.database.database import get_db
from app.database.Models.Models import Ad
from app.database.Models import Models
from app.database.schemas.Ads import AdCreate
from app.database.schemas import Users, Token, Auth
from app.auth.OAuth2 import hash_password, authenticate_user, create_access_token, validate_token, get_current_user
from app.routers.Authentication.authentication import get_current_authenticated_user

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


# @ads_router.post("/create")
# async def create_ad(
#     name: str = Form(...),
#     start_date: str = Form(...),
#     end_date: str = Form(...),
#     url: str = Form(...),
#     image_change_interval: int = Form(...),
#     top_banner_image1: UploadFile = File(None),
#     top_banner_image2: UploadFile = File(None),
#     top_banner_image3: UploadFile = File(None),
#     current_user: Users.User = Depends(get_current_user),
#     db: Session = Depends(get_db),
#     lot_ids: List[int] = Form(...)

# ):
#     # Check if ad name is already in use
#     existing_ad = db.query(Models.Ad).filter(Models.Ad.name == name).first()
#     if existing_ad:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Ad name already in use"
#         )

#     # Get business_id from the currently logged in user's email
#     try:
#         business = db.query(Models.Business).filter(Models.Business.email == current_user.username).one()
#         business_id = business.id
#     except NoResultFound:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="No business associated with the current user"
#         )

#     # Directory path based on business id
#     business_dir = os.path.join(ADS_DIR, str(business_id))

#     # Save files
#     file_path1 = save_upload_file(top_banner_image1, business_dir, name, 1) if top_banner_image1 else None
#     file_path2 = save_upload_file(top_banner_image2, business_dir, name, 2) if top_banner_image2 else None 
#     file_path3 = save_upload_file(top_banner_image3, business_dir, name, 3) if top_banner_image3 else None

#     # Create Ad instance
#     ad = Ad(
#         name=name,
#         start_date=start_date,
#         end_date=end_date,
#         business_id=business_id,
#         url=url,
#         image_change_interval=image_change_interval,
#         top_banner_image1_path=file_path1,
#         top_banner_image2_path=file_path2,
#         top_banner_image3_path=file_path3
#     )
#     db.add(ad)
#     db.commit()
#     db.refresh(ad)

#     for lot_id in lot_ids:
#         print(lot_id)
#         association = Models.ad_lot_association.insert().values(ad_id=ad.advert_id, lot_id=lot_id)
#         db.execute(association)
#     db.commit()


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

        # Add lot metadata for the ad
        ad_dict["lots"] = [lot.__dict__ for lot in ad.lots]

        if ad.top_banner_image1_path:
            ad_dict['top_banner_image1_base64'] = image_to_base64(ad.top_banner_image1_path)
        if ad.top_banner_image2_path:
            ad_dict['top_banner_image2_base64'] = image_to_base64(ad.top_banner_image2_path)
        if ad.top_banner_image3_path:
            ad_dict['top_banner_image3_base64'] = image_to_base64(ad.top_banner_image3_path)
        ads_list.append(ad_dict)

    return {"ads": ads_list}

# @ads_router.put("/update/{advert_id}")
# async def update_ad(
#     advert_id: int,
#     name: str = Form(None),
#     start_date: str = Form(None),
#     end_date: str = Form(None),
#     url: str = Form(None),
#     image_change_interval: int = Form(None),
#     top_banner_image1: UploadFile = File(None),
#     top_banner_image2: UploadFile = File(None),
#     top_banner_image3: UploadFile = File(None),
#     current_user: Users.User = Depends(get_current_authenticated_user),
#     db: Session = Depends(get_db),
#     lot_ids: Optional[str] = Form(None)
# ):
#     # Fetch the ad from the database
#     ad = db.query(Models.Ad).filter(Models.Ad.advert_id == advert_id).first()
#     if not ad:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Ad not found"
#         )

#     # Permissions check
#     entitlement_category = current_user["entitlement_category"]
#     allowed_employee_types = [
#         Models.TypesOfEmployees.CUSTOMER_SUPPORT.value, 
#         Models.TypesOfEmployees.ADVERTISING_SPECIALIST.value
#     ]
#     if entitlement_category not in allowed_employee_types:
#         try:
#             business = db.query(Models.Business).filter(Models.Business.email == current_user["username"]).one()
#             business_id = business.id
#         except NoResultFound:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="No business associated with the current user"
#             )
        
#         if ad.business_id != business_id:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="You don't have permission to update this ad"
#             )
#     if lot_ids:
#         print(f"Received lot_ids: {lot_ids}")  # Temporary debugging statement
#         # Ensure that every part of the lot_ids string is a valid integer
#         try:
#             lot_id_list = [int(id_str) for id_str in lot_ids.split(',')]
#         except ValueError as e:
#             raise HTTPException(
#                 status_code=status.HTTP_400_BAD_REQUEST,
#                 detail=f"Invalid lot_ids value received: {e}"
#             )
#     # Directory path based on business id
#     business_dir = os.path.join(ADS_DIR, str(ad.business_id))

#     # Update ad details if provided
#     if name:
#         ad.name = name
#     if start_date:
#         ad.start_date = start_date
#     if end_date:
#         ad.end_date = end_date
#     if url:
#         ad.url = url
#     if image_change_interval:
#         ad.image_change_interval = image_change_interval
#     if top_banner_image1:
#         file_path1 = save_upload_file(top_banner_image1, business_dir, name, 1)
#         if file_path1:
#             ad.top_banner_image1_path = file_path1
#     if top_banner_image2:
#         file_path2 = save_upload_file(top_banner_image2, business_dir, name, 2)
#         if file_path2:
#             ad.top_banner_image2_path = file_path2
#     if top_banner_image3:
#         file_path3 = save_upload_file(top_banner_image3, business_dir, name, 3)
#         if file_path3:
#             ad.top_banner_image3_path = file_path3

#     # Delete existing associations
#     db.query(Models.ad_lot_association).filter(Models.ad_lot_association.c.ad_id == advert_id).delete()

#     # Add new associations if lot_ids are provided
#     if lot_ids:
#         # Convert the comma-separated string to a list of integers
#         lot_id_list = [int(id_str) for id_str in lot_ids.split(',')]
#         for lot_id in lot_id_list:
#             association = Models.ad_lot_association.insert().values(ad_id=advert_id, lot_id=lot_id)
#             db.execute(association)

#     db.commit()

#     return {"message": "Ad updated successfully"}

@ads_router.get("/details/{advert_id}")
async def get_ad_details(
    advert_id: int,
    current_user: Users.User = Depends(get_current_authenticated_user),
    db: Session = Depends(get_db)
):
    # Fetch the ad from the database
    ad = db.query(Models.Ad).filter(Models.Ad.advert_id == advert_id).first()
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ad not found"
        )

    # If the current user is a permitted employee type
    entitlement_category = current_user["entitlement_category"]
    allowed_employee_types = [
        Models.TypesOfEmployees.CUSTOMER_SUPPORT.value, 
        Models.TypesOfEmployees.ADVERTISING_SPECIALIST.value
    ]
    if entitlement_category not in allowed_employee_types:
        # Check if the ad belongs to the current user's business
        try:
            business = db.query(Models.Business).filter(Models.Business.email == current_user["username"]).one() 
            business_id = business.id
        except NoResultFound:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No business associated with the current user"
            )
        
        if ad.business_id != business_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this ad"
            )

    ad_dict = ad.__dict__

    # Add lot metadata for the ad
    ad_dict["lots"] = [lot.__dict__ for lot in ad.lots]

    # Convert image paths to base64 for sending in response
    if ad.top_banner_image1_path:
        ad_dict['top_banner_image1_base64'] = image_to_base64(ad.top_banner_image1_path)
    if ad.top_banner_image2_path:
        ad_dict['top_banner_image2_base64'] = image_to_base64(ad.top_banner_image2_path)
    if ad.top_banner_image3_path:
        ad_dict['top_banner_image3_base64'] = image_to_base64(ad.top_banner_image3_path)

    return {"ad": ad_dict}


@ads_router.get("/advertisers-ads-info")
async def get_advertisers_ads_info(
    current_user: Users.User = Depends(get_current_authenticated_user),
    db: Session = Depends(get_db)
):
    # Check if user has the right role
    entitlement_category = current_user["entitlement_category"]
    if entitlement_category not in [Models.TypesOfEmployees.CUSTOMER_SUPPORT.value, 
                                    Models.TypesOfEmployees.ADVERTISING_SPECIALIST.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this information"
        )

    # Get all advertiser type users
    advertisers = db.query(Models.Business).filter(Models.Business.type == Models.TypesOfBusiness.ADVERTISERS.value).all()

    # Extracting ads and required details for each advertiser
    advertisers_info = []
    for advertiser in advertisers:
        ads_info = []
        for ad in advertiser.ads:
            ad_data = {
                "advert_id": ad.advert_id,
                "name": ad.name,
                "start_date": ad.start_date,
                "end_date": ad.end_date,
                "url": ad.url,
                "impressions": ad.impressions,
                "clicks": ad.clicks,
            }

            # Convert image paths to base64 for sending in response
            if ad.top_banner_image1_path:
                ad_data['top_banner_image1_base64'] = image_to_base64(ad.top_banner_image1_path)
            if ad.top_banner_image2_path:
                ad_data['top_banner_image2_base64'] = image_to_base64(ad.top_banner_image2_path)
            if ad.top_banner_image3_path:
                ad_data['top_banner_image3_base64'] = image_to_base64(ad.top_banner_image3_path)

            # Add lot metadata for the ad
            ad_data["lots"] = [lot.__dict__ for lot in ad.lots]

            ads_info.append(ad_data)
        
        advertiser_data = {
            "email": advertiser.email,
            "ads": ads_info
        }
        advertisers_info.append(advertiser_data)

    return {"advertisers_info": advertisers_info}


# @ads_router.delete("/delete/{advert_id}")
# async def delete_ad(
#     advert_id: int,
#     current_user: Users.User = Depends(get_current_authenticated_user),
#     db: Session = Depends(get_db)
# ):
#     # Fetch the ad from the database
#     ad = db.query(Models.Ad).filter(Models.Ad.advert_id == advert_id).first()
#     if not ad:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Ad not found"
#         )

#     # Permissions check
#     entitlement_category = current_user["entitlement_category"]
#     allowed_employee_types = [
#         Models.TypesOfEmployees.CUSTOMER_SUPPORT.value, 
#         Models.TypesOfEmployees.ADVERTISING_SPECIALIST.value
#     ]

#     if entitlement_category not in allowed_employee_types:
#         # Check if the ad belongs to the current user's business
#         try:
#             business = db.query(Models.Business).filter(Models.Business.email == current_user["username"]).one()
#             business_id = business.id
#         except NoResultFound:
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="No business associated with the current user"
#             )
        
#         if ad.business_id != business_id:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="You don't have permission to delete this ad"
#             )

#     # Delete associations
#     db.query(Models.ad_lot_association).filter(Models.ad_lot_association.c.ad_id == advert_id).delete()
    
#     # Try deleting the ad itself
#     try:
#         db.delete(ad)
#         db.commit()
#         return {"message": "Ad deleted successfully"}
#     except IntegrityError:
#         db.rollback()
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Failed to delete ad. Ensure all references are removed first."
#         )

# @ads_router.post("/staff_ad_create/{business_id}")
# async def staff_create_ad(
#     business_id: int,
#     name: str = Form(...),
#     start_date: str = Form(...),
#     end_date: str = Form(...),
#     url: str = Form(...),
#     image_change_interval: int = Form(...),
#     top_banner_image1: UploadFile = File(None),
#     top_banner_image2: UploadFile = File(None),
#     top_banner_image3: UploadFile = File(None),
#     current_user: Users.User = Depends(get_current_authenticated_user),
#     db: Session = Depends(get_db),
#     lot_ids: List[int] = Form(...)
# ):
#     # Check if the current user is an allowed employee type
#     entitlement_category = current_user["entitlement_category"]
#     allowed_employee_types = [
#         Models.TypesOfEmployees.CUSTOMER_SUPPORT.value, 
#         Models.TypesOfEmployees.ADVERTISING_SPECIALIST.value
#     ]

#     if entitlement_category not in allowed_employee_types:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="You don't have permission to create ads on behalf of businesses"
#         )

#     # Check if ad name is already in use
#     existing_ad = db.query(Models.Ad).filter(Models.Ad.name == name).first()
#     if existing_ad:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Ad name already in use"
#         )

#     # Directory path based on business id
#     business_dir = os.path.join(ADS_DIR, str(business_id))

#     # Save files
#     file_path1 = save_upload_file(top_banner_image1, business_dir, name, 1) if top_banner_image1 else None
#     file_path2 = save_upload_file(top_banner_image2, business_dir, name, 2) if top_banner_image2 else None 
#     file_path3 = save_upload_file(top_banner_image3, business_dir, name, 3) if top_banner_image3 else None

#     # Create Ad instance
#     ad = Ad(
#         name=name,
#         start_date=start_date,
#         end_date=end_date,
#         business_id=business_id,
#         url=url,
#         image_change_interval=image_change_interval,
#         top_banner_image1_path=file_path1,
#         top_banner_image2_path=file_path2,
#         top_banner_image3_path=file_path3
#     )
#     db.add(ad)
#     db.commit()
#     db.refresh(ad)

#     for lot_id in lot_ids:
#         association = Models.ad_lot_association.insert().values(ad_id=ad.advert_id, lot_id=lot_id)
#         db.execute(association)
#     db.commit()

#     return {"message": "Ad created successfully"}

@ads_router.get("/get_advertisers")
async def get_advertiser_businesses(
    current_user: Users.User = Depends(get_current_authenticated_user),
    db: Session = Depends(get_db)
):
    # Check if the current user is allowed to access this endpoint
    entitlement_category = current_user["entitlement_category"]
    allowed_employee_types = [
        Models.TypesOfEmployees.CUSTOMER_SUPPORT.value, 
        Models.TypesOfEmployees.ADVERTISING_SPECIALIST.value
    ]
    if entitlement_category not in allowed_employee_types:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this endpoint"
        )

    # Fetch all advertiser businesses
    try:
        advertiser_businesses = db.query(Models.Business).filter(
            Models.Business.type == Models.TypesOfBusiness.ADVERTISERS.value
        ).all()

        # Convert ORM objects to dictionary
        businesses_list = []
        for business in advertiser_businesses:
            businesses_list.append(business.__dict__)

        return {"businesses": businesses_list}

    except NoResultFound:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No advertiser businesses found"
        )

@ads_router.post("/serve_ad/")
async def serve_ad_view(request: Request, db: Session = Depends(get_db)):
    
    # Get the lot id from request data
    data = await request.json()
    url_name = data.get('lot_id', None)
    if not url_name:
        raise HTTPException(status_code=400, detail="Lot ID not provided.")
    
    # Fetch the corresponding lot using the url_name
    lot = db.query(Models.LotMetadata).filter_by(url_name=url_name).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found.")
    lot_id = lot.id

    # Current date
    current_date = date.today()

    # Filter the ads further to only include ads where the current date is between the start date and the end date
    eligible_active_ads = db.query(Ad).join(Models.ad_lot_association).filter(
        Models.ad_lot_association.c.lot_id == lot_id,
        Ad.start_date <= current_date,
        Ad.end_date >= current_date
    ).all()


    # Randomly select one valid ad and increment its impressions
    selected_ad = choice(eligible_active_ads)
    selected_ad.impressions += 1
    db.commit()  # Commit changes to database. Assuming your db session supports it.

    # Convert image paths to Base64 encoded data
    image_keys = ['top_banner_image1_path', 'top_banner_image2_path', 'top_banner_image3_path']
    serialized_data = {
        "advert_id": selected_ad.advert_id,
        "name": selected_ad.name,
        "url": selected_ad.url,
        "impressions": selected_ad.impressions,
        "clicks": selected_ad.clicks,
        "seconds": selected_ad.image_change_interval
    }

    for key in image_keys:
        image_path = getattr(selected_ad, key)
        if image_path:  # Check if image_path exists for the ad
            with open(image_path, "rb") as image_file:
                base64_encoded = base64.b64encode(image_file.read()).decode('utf-8')
            serialized_data[key] = f"data:image/jpeg;base64,{base64_encoded}"
        else:
            serialized_data[key] = None

    return serialized_data

@ads_router.post("/increment_clicks/")
async def increment_clicks(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    advert_id = data.get('advert_id', None)
    # Fetch the ad from the database using advert_id
    ad = db.query(Ad).filter(Ad.advert_id == advert_id).first()
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ad not found"
        )

    # Increment clicks
    ad.clicks += 1
    db.commit()

    return {"message": "Click incremented successfully", "new_clicks": ad.clicks}