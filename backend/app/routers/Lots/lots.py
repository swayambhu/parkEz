import os, json, torch, shutil
from datetime import datetime
from PIL import Image
from sqlalchemy.orm import Session
from fastapi.templating import Jinja2Templates
from torch import nn, optim
import torchvision.transforms as transforms
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Query
from app.database.database import get_db
from app.database.Models.Models import LotMetadata, CamImage, CamMetadata
from app.database.schemas.Lots import CamImageCreate, CamImageInDB, LotMetadataInDB
from typing import List, Dict, Optional


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

    # Extract the datetime from the filename
    dt_str = date_code[8:]
    date_str = date_code[:8]
    date_time_str = date_str + ' ' + dt_str[:2] + ':' + dt_str[2:]
    date_time_obj = datetime.strptime(date_time_str, '%Y%m%d %H:%M')

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
        lot_image.timestamp = date_time_obj
    else:
        lot_image = CamImage(image=filename, camera_name=camera_name, timestamp=date_time_obj)

    # Load data from spots.json
    spots_file_path = os.path.join('app', 'lots', camera_name, 'spots.json')
    with open(spots_file_path, 'r') as spots_file:
        spots_data = json.load(spots_file)

    labels = {key: False for key in spots_data.keys()}

    for spot in spots_data.keys():
        x, x_w, y, y_h = spots_data[spot]
        cropped_image = pil_image.crop((x, y, x_w, y_h))

        # Convert cropped image of spot to form usable by ML model using transform defined elsewhere
        input_tensor = transform(cropped_image)
        input_tensor = input_tensor.unsqueeze(0)  # Add a batch dimension

        model = CNN()  # Instantiate your model
        model_path = os.path.join('app', 'lots', camera_name, 'models', spot + '.pth')

        # Load the saved model state into the model
        # model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
        model.load_state_dict(torch.load(model_path)) 
        model.eval()  

        with torch.no_grad():
            output = model(input_tensor)
            _, predicted = torch.max(output, 1)

        # Access the prediction result
        prediction = predicted.item()
        if prediction == 0: 
            labels[spot] = True


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

# CNN model good at determining if car in spot, from notebook, will separate to another file eventually for organization
class CNN(nn.Module):
    def __init__(self):
        super(CNN, self).__init__()
        
        # Convolutional layer 1
        self.conv1 = nn.Conv2d(3, 64, kernel_size=3, stride=1, padding=1)  
        self.bn1 = nn.BatchNorm2d(64)
        self.relu1 = nn.ReLU()

        # Convolutional layer 2
        self.conv2 = nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1)
        self.bn2 = nn.BatchNorm2d(128)
        self.relu2 = nn.ReLU()
        
        # Convolutional layer 3
        self.conv3 = nn.Conv2d(128, 256, kernel_size=3, stride=1, padding=1)
        self.bn3 = nn.BatchNorm2d(256)
        self.relu3 = nn.ReLU()

        # Convolutional layer 4
        self.conv4 = nn.Conv2d(256, 512, kernel_size=3, stride=1, padding=1)
        self.bn4 = nn.BatchNorm2d(512)
        self.relu4 = nn.ReLU()

        # Convolutional layer 5
        self.conv5 = nn.Conv2d(512, 512, kernel_size=3, stride=1, padding=1)
        self.bn5 = nn.BatchNorm2d(512)
        self.relu5 = nn.ReLU()

        # Max pool layer
        self.pool = nn.MaxPool2d(kernel_size=2)

        # Dropout layer
        self.dropout = nn.Dropout(p=0.5)

        # Fully connected layers
        self.fc1 = nn.Linear(512 * 8 * 8, 1024)
        self.fc2 = nn.Linear(1024, 512)
        self.fc3 = nn.Linear(512, 2)

    def forward(self, x):
        # Convolutional layer 1
        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu1(out)
        out = self.pool(out)

        # Convolutional layer 2
        out = self.conv2(out)
        out = self.bn2(out)
        out = self.relu2(out)
        out = self.pool(out)

        # Convolutional layer 3
        out = self.conv3(out)
        out = self.bn3(out)
        out = self.relu3(out)
        out = self.pool(out)

        # Convolutional layer 4
        out = self.conv4(out)
        out = self.bn4(out)
        out = self.relu4(out)
        out = self.pool(out)

        # Convolutional layer 5
        out = self.conv5(out)
        out = self.bn5(out)
        out = self.relu5(out)
        out = self.pool(out)

        # Flatten for fully connected layer
        out = out.view(out.size(0), -1)

        # Fully connected layer 1
        out = self.fc1(out)
        out = self.dropout(out)

        # Fully connected layer 2
        out = self.fc2(out)
        out = self.dropout(out)

        # Fully connected layer 3
        out = self.fc3(out)

        return out


# Originally in Model_Maker notebook, this preps cropped parking spaces for ML processing
transform = transforms.Compose([
    transforms.Resize((256, 256)),  # Resize to 256x256
    transforms.ToTensor(),  # Convert to PyTorch tensor
    transforms.Normalize((0.5,0.5,0.5,), (0.5,0.5,0.5,))  # Normalize pixel values in the range [-1, 1]
])

@router.get("/lot_specific/")
def get_specific_image(
    lot: str = Query(...),
    image: str = Query(...),
    db: Session = Depends(get_db)
) -> Dict:
    
    if not lot or not image:
        raise HTTPException(status_code=400, detail="Lot or image name part not specified.")

    # Fetching lot and cameras data
    lot_instance = db.query(LotMetadata).filter(LotMetadata.url_name == lot).first()
    if not lot_instance:
        raise HTTPException(status_code=404, detail="No such lot found based on the given URL name.")

    cameras = db.query(CamMetadata).filter(CamMetadata.lot_id == lot_instance.id).all()
    camera_names = [camera.name for camera in cameras]
    print(camera_names[0])
    image_name = camera_names[0]  + '_' + image + '.jpg'

    lot_image = db.query(CamImage).filter(CamImage.image.ilike(f"%{image_name}%")).first()
    if not lot_image:
        raise HTTPException(status_code=404, detail="No images found for this camera.")

    # Assuming the image is stored in some storage system, replace 'path_to_storage' with appropriate method
    image_url = os.path.join('lots', camera_names[0], 'photos', lot_image.image)
    # Fetching previous and next images by timestamp
    previous_image = db.query(CamImage).filter(CamImage.camera_name == camera_names[0], CamImage.timestamp < lot_image.timestamp).order_by(CamImage.timestamp.desc()).first()
    next_image = db.query(CamImage).filter(CamImage.camera_name == camera_names[0], CamImage.timestamp > lot_image.timestamp).order_by(CamImage.timestamp).first()

    previous_image_name_part = previous_image.image.split('_')[-1].split('.')[0] if previous_image else image_name
    next_image_name_part = next_image.image.split('_')[-1].split('.')[0] if next_image else image_name

    # Assuming the spots and bestspots JSON files are located in a folder named 'models'
    spots_path = os.path.join('app', 'lots', camera_names[0], 'spots.json')
    bestspots_path = os.path.join('app','lots', camera_names[0], 'bestspots.json')

    with open(spots_path, 'r') as spots_file:
        spots_data = json.load(spots_file)
    with open(bestspots_path, 'r') as bestspots_file:
        bestspots_data = json.load(bestspots_file)

    human_labels = json.loads(lot_image.human_labels)
    model_labels = json.loads(lot_image.model_labels)

    return {
        'image_url': image_url,
        'name' : lot_instance.name,
        'timestamp': lot_image.timestamp,
        'human_labels': human_labels,
        'model_labels': model_labels,
        'previous_image_name_part': previous_image_name_part,
        'next_image_name_part': next_image_name_part,
        'spots': spots_data,
        'bestspots': bestspots_data
    }

@router.get("/lot_latest/")
def get_latest_image(url_name: str, db: Session = Depends(get_db)) -> Dict:
    if not url_name:
        raise HTTPException(status_code=400, detail="Lot URL name not specified.")

    # Fetching lot and cameras data
    lot_instance = db.query(LotMetadata).filter(LotMetadata.url_name == url_name).first()
    if not lot_instance:
        raise HTTPException(status_code=404, detail="No such lot found based on the given URL name.")

    cameras = db.query(CamMetadata).filter(CamMetadata.lot_id == lot_instance.id).all()
    camera_names = [camera.name for camera in cameras]

    # Fetching latest image for the camera
    lot_image = db.query(CamImage).filter(CamImage.camera_name == camera_names[0]).order_by(CamImage.timestamp.desc()).first()
    if not lot_image:
        raise HTTPException(status_code=404, detail="No images found for this camera.")

    # Assuming the image is stored in some storage system, replace 'path_to_storage' with appropriate method
    image_url = os.path.join('lots', camera_names[0], 'photos', lot_image.image)

    # Fetching previous image
    previous_image = db.query(CamImage).filter(CamImage.camera_name == camera_names[0], CamImage.timestamp < lot_image.timestamp).order_by(CamImage.timestamp.desc()).first()
    if previous_image:
        previous_image_name_part = previous_image.image.split('_')[-1].replace('.jpg', '')
    else:
        previous_image_name_part = lot_image.image.split('_')[-1].replace('.jpg', '')

    # Assuming the spots and bestspots JSON files are located in a folder named 'models'
    spots_path = os.path.join('app', 'lots', camera_names[0], 'spots.json')
    bestspots_path = os.path.join('app','lots', camera_names[0], 'bestspots.json')

    with open(spots_path, 'r') as spots_file:
        spots_data = json.load(spots_file)
    with open(bestspots_path, 'r') as bestspots_file:
        bestspots_data = json.load(bestspots_file)

    human_labels = json.loads(lot_image.human_labels)
    model_labels = json.loads(lot_image.model_labels)

    return {
        'image_url': image_url,
        'name' : lot_instance.name,
        'timestamp': lot_image.timestamp,
        'human_labels': human_labels,
        'model_labels': model_labels,
        'previous_image_name_part': previous_image_name_part,
        'spots': spots_data,
        'bestspots': bestspots_data
    }

    