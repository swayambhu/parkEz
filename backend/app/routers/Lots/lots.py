import os, json, torch, shutil
from PIL import Image
from sqlalchemy.orm import Session
from fastapi.templating import Jinja2Templates
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from app.database.database import get_db
from app.database.Models.Models import LotMetadata, CamImage
from app.database.schemas.Lots import CamImageCreate, CamImageInDB, LotMetadataInDB
from typing import List

router = APIRouter(
    prefix="/lot",
    tags=["lot"],
)

@router.get("/all", response_model=List[LotMetadataInDB])
def get_all_lots(db: Session = Depends(get_db)):
    lots = db.query(LotMetadata).all()
    if not lots:
        raise HTTPException(status_code=404, detail="No lots found.")
    
    # Convert each LotMetadata (from SQLAlchemy) to LotMetadataInDB (Pydantic model)
    return [LotMetadataInDB.parse_obj({k: v for k, v in lot.__dict__.items() if k != "_sa_instance_state"}) for lot in lots]

@router.post("/upload-image/", response_model=CamImageInDB)
async def upload_image(
    passcode: str,
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # Basic authentication
    if passcode != 'tokensecurity':
        raise HTTPException(status_code=401, detail="Invalid passcode")

    filename = image.filename
    camera_name, date_code = os.path.splitext(filename)[0].split("_")

    # Save the uploaded image first
    image_save_path = os.path.join('app', 'lots', camera_name, 'photos', image.filename)
    with open(image_save_path, 'wb') as buffer:
        shutil.copyfileobj(image.file, buffer)

    # Convert saved image to a cv2 image for ML processing
    pil_image = Image.open(image_save_path)

    # Check if an image with the same filename already exists
    lot_image = db.query(CamImage).filter(CamImage.image.ilike(f"%{filename}%")).first()
    if lot_image:
        lot_image.image = filename
    else:
        lot_image = CamImage(image=filename, camera_name=camera_name)

    # Load data from spots.json
    spots_file_path = os.path.join('app', 'lots', camera_name, 'spots.json')
    with open(spots_file_path, 'r') as spots_file:
        spots_data = json.load(spots_file)

    labels = {key: False for key in spots_data.keys()}

    for spot in spots_data.keys():
        x, x_w, y, y_h = spots_data[spot]
        cropped_image = pil_image.crop((x, y, x_w, y_h))
        # Future home of ml code

    lot_image.human_labels = json.dumps(labels)
    lot_image.model_labels = json.dumps(labels)
    db.add(lot_image)
    db.commit()

    return CamImageInDB(
        id=lot_image.id,
        image=lot_image.image,
        camera_name=lot_image.camera_name,
        human_labels=lot_image.human_labels,
        model_labels=lot_image.model_labels
    )
