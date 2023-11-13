import os, io, json, torch, shutil
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
from sqlalchemy.orm import Session
from fastapi.templating import Jinja2Templates
from torch import nn, optim
import torchvision.transforms as transforms
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Query, Response
from app.database.database import get_db
from app.database.Models.Models import LotMetadata, CamImage, CamMetadata, Business
from app.database.schemas.Lots import CamImageCreate, CamImageInDB, LotMetadataInDB
from app.routers.Authentication.authentication import get_current_authenticated_user;
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

@router.get("/business_dashboard/")
def get_business_dashboard(
        db: Session = Depends(get_db), 
        user_data = Depends(get_current_authenticated_user),
        business_email: str = Query(None) 
    ) -> Dict:

    print(user_data)

    # Handle BUSINESS entitlement category
    if user_data['entitlement_category'] == 'BUSINESS':
        business_email = user_data['username']  # Use the logged in user's email for BUSINESS
    elif user_data['entitlement_category'] in ['CUSTOMER_SUPPORT', 'LOT_SPECIALIST']:
        if not business_email:
            raise HTTPException(status_code=400, detail="Business email is required for CUSTOMER_SUPPORT and LOT_SPECIALIST.")
    else:
        raise HTTPException(status_code=403, detail="Access not allowed. User must be of type BUSINESS, CUSTOMER_SUPPORT, or LOT_SPECIALIST.")

    # Get the business record using the provided or derived email
    business = db.query(Business).filter(Business.email == business_email).first()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found.")
    # Fetch all lots owned by the business
    owned_lots = db.query(LotMetadata).filter(LotMetadata.owner_id == business.id).all()
    if not owned_lots:
        raise HTTPException(status_code=404, detail="No lots found for this business.")

    # For the first lot, find associated cameras and process images
    url_name = owned_lots[0].url_name
    lot_instance = db.query(LotMetadata).filter(LotMetadata.url_name == url_name).first()
    cameras = db.query(CamMetadata).filter(CamMetadata.lot_id == lot_instance.id).all()
    
    images_data = []
    for camera in cameras:
        cam_images = db.query(CamImage).filter(CamImage.camera_name == camera.name).order_by(CamImage.timestamp.desc()).all()
        for image in cam_images:
            images_data.append({
                'image_url': os.path.join('lots', camera.name, 'photos', image.image),
                'name': lot_instance.name,
                'timestamp': image.timestamp,
                'human_labels': json.loads(image.human_labels),
                'model_labels': json.loads(image.model_labels)
            })

    # Fetching previous image, spots, and bestspots data once
    previous_image = db.query(CamImage).filter(CamImage.camera_name == cameras[0].name, CamImage.timestamp < cam_images[0].timestamp).order_by(CamImage.timestamp.desc()).first()
    previous_image_name_part = previous_image.image.split('_')[-1].replace('.jpg', '') if previous_image else cam_images[0].image.split('_')[-1].replace('.jpg', '')

    spots_path = os.path.join('app', 'lots', cameras[0].name, 'spots.json')
    bestspots_path = os.path.join('app', 'lots', cameras[0].name, 'bestspots.json')
    with open(spots_path, 'r') as spots_file:
        spots_data = json.load(spots_file)
    with open(bestspots_path, 'r') as bestspots_file:
        bestspots_data = json.load(bestspots_file)

    return {
        'images_data': images_data,
        'previous_image_name_part': previous_image_name_part,
        'spots': spots_data,
        'bestspots': bestspots_data
    }

@router.get("/all_businesses/")
def get_all_businesses(
        db: Session = Depends(get_db), 
        user_data = Depends(get_current_authenticated_user)
    ) -> List[Dict]:

    # Check if the user is either CUSTOMER_SUPPORT or LOT_SPECIALIST
    if user_data['entitlement_category'] not in ['CUSTOMER_SUPPORT', 'LOT_SPECIALIST']:
        raise HTTPException(status_code=403, detail="Access not allowed. User must be of type CUSTOMER_SUPPORT or LOT_SPECIALIST.")

    # Querying all businesses from the database
    businesses = db.query(Business).all()
    if not businesses:
        raise HTTPException(status_code=404, detail="No businesses found.")

    # Extracting required information from each business
    business_data = []
    for business in businesses:
        business_info = {
            'id': business.id,
            'email': business.email,
            'name': business.name
        }
        business_data.append(business_info)

    return business_data

@router.get("/latest-jpg/", response_class=Response)
def get_latest_jpg_image(
        cam: str = Query(..., description="The name of the camera"),
        db: Session = Depends(get_db)
    ):
    if not cam:
        raise HTTPException(status_code=400, detail="Camera not specified.")

    try:
        lot_image = db.query(CamImage).filter(CamImage.camera_name == cam, CamImage.image.endswith('.jpg')).order_by(CamImage.timestamp.desc()).first()
        if not lot_image:
            raise HTTPException(status_code=404, detail="No JPG images found for this camera.")
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=500, detail="An error occurred while fetching the image.")

    image_path = os.path.join('app','lots', cam, 'photos', lot_image.image)
    image = Image.open(image_path)

    human_labels = json.loads(lot_image.human_labels)

    spots_path = os.path.join('app','lots', cam, 'spots.json')
    best_spots_path = os.path.join('app','lots', cam, 'bestspots.json')
    with open(spots_path, 'r') as spots_file:
        spots_data_view = json.load(spots_file)
    with open(best_spots_path, 'r') as bestspots_file:
        best_spots = json.load(bestspots_file)

    # Determine the best vacant spot
    best_vacant_spot = None
    for rank, spot in sorted(best_spots.items(), key=lambda item: int(item[0])):
        if not human_labels.get(spot, False):  # Spot is vacant
            best_vacant_spot = spot
            break

    # Resize the image
    base_width = 900
    w_percent = (base_width / float(image.size[0]))
    h_size = int((float(image.size[1]) * float(w_percent)))
    image = image.resize((base_width, h_size), Image.LANCZOS)

    # Create a draw object
    draw = ImageDraw.Draw(image)
    spot_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24) 
    shadow_color = 'black'

    for spot, coordinates in reversed(spots_data_view.items()):
        x1, y1, x2, y2 = coordinates
        correct_coordinates = [x1 * w_percent, x2 * w_percent, y1 * w_percent, y2 * w_percent]
        if human_labels.get(spot, False):
            color = 'red'  # Occupied spots
        elif spot == best_vacant_spot:
            color = 'green'  # Best vacant spot
        else:
            color = 'blue'  # Other vacant spots
        draw.rectangle(correct_coordinates, outline=color, width=5)

        # Calculate position for the spot label
        label_x = (correct_coordinates[2] - 25)
        label_y = (correct_coordinates[1] - 25)

        # Draw shadow/outline
        for offset in [(1, 1), (-1, -1), (1, -1), (-1, 1)]:
            shadow_position = (label_x + offset[0], label_y + offset[1])
            draw.text(shadow_position, spot, font=spot_font, fill=shadow_color)

        # Draw original text
        draw.text((label_x, label_y), spot, font=spot_font, fill=color)

    # Draw the text and rectangles
    text = lot_image.timestamp.strftime("%l:%M%p %-m/%-d/%Y").lower().strip()
    text_position = (image.width - 450, image.height - 50)
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 30)

    shadow_color = 'black'
    for offset in [(2, 2), (-2, -2), (2, -2), (-2, 2)]:
        shadow_position = (text_position[0] + offset[0], text_position[1] + offset[1])
        draw.text(shadow_position, text, font=font, fill=shadow_color)

    draw.text(text_position, text, font=font, fill="white")  # Change "white" to your desired text color

    # Save the image to a BytesIO object
    byte_arr = io.BytesIO()
    image.save(byte_arr, format='JPEG')
    byte_arr.seek(0)  # seek back to the start after saving

    # Create a response
    response = Response(content=byte_arr.getvalue(), media_type="image/jpeg")

    # Add anti-caching headers
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'

    # Return the image data as a response
    return response

@router.get("/latest-info-jpg/", response_class=Response)
def get_vacant_spots_info(cam: str = Query(..., description="The name of the camera"), db: Session = Depends(get_db)):
    if not cam:
        raise HTTPException(status_code=400, detail="Camera not specified.")

    try:
        lot_image = db.query(CamImage).filter(CamImage.camera_name == cam).order_by(CamImage.timestamp.desc()).first()
        if not lot_image:
            raise HTTPException(status_code=404, detail="Camera data not found.")
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=500, detail="An error occurred while fetching the camera data.")

    human_labels = json.loads(lot_image.human_labels)

    best_spots_path = os.path.join('app', 'lots', cam, 'bestspots.json')
    with open(best_spots_path, 'r') as bestspots_file:
        best_spots = json.load(bestspots_file)

    vacant_spots = [spot for spot, occupied in human_labels.items() if not occupied]
    best_vacant_spot = None
    for rank, spot in sorted(best_spots.items(), key=lambda item: int(item[0])):
        if spot in vacant_spots:
            best_vacant_spot = spot
            break

    # Create an image for text
    img_width, img_height = 900, 200
    image = Image.new('RGB', (img_width, img_height), color='white')
    draw = ImageDraw.Draw(image)

    # Text setup
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
    vacant_spots_text = "Vacant Spots: " + ", ".join(vacant_spots)
    best_spot_text = "Best Vacant Spot: " + best_vacant_spot if best_vacant_spot else "No vacant spots available"

    # Draw text
    text_position_vacant = (10, 50)
    text_position_best = (10, 100)
    draw.text(text_position_vacant, vacant_spots_text, font=font, fill="black")
    draw.text(text_position_best, best_spot_text, font=font, fill="black")

    # Save the image to a BytesIO object
    byte_arr = io.BytesIO()
    image.save(byte_arr, format='JPEG')
    byte_arr.seek(0)  # seek back to the start after saving

    # Create a response
    response = Response(content=byte_arr.getvalue(), media_type="image/jpeg")

    # Add anti-caching headers
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'

    # Return the image data as a response
    return response

@router.get("/latest-image-info/")
def get_vacant_spots_text(
        cam: str = Query(..., description="The name of the camera"),
        db: Session = Depends(get_db)
    ):
    if not cam:
        raise HTTPException(status_code=400, detail="Camera not specified.")

    try:
        lot_image = db.query(CamImage).filter(CamImage.camera_name == cam).order_by(CamImage.timestamp.desc()).first()
        if not lot_image:
            raise HTTPException(status_code=404, detail="Camera data not found.")
    except Exception as e:
        # Log the exception e
        raise HTTPException(status_code=500, detail="An error occurred while fetching the camera data.")

    human_labels = json.loads(lot_image.human_labels)

    best_spots_path = os.path.join('app','lots', cam, 'bestspots.json')
    with open(best_spots_path, 'r') as bestspots_file:
        best_spots = json.load(bestspots_file)

    vacant_spots = [spot for spot, occupied in human_labels.items() if not occupied]
    best_vacant_spot = None
    for rank, spot in sorted(best_spots.items(), key=lambda item: int(item[0])):
        if spot in vacant_spots:
            best_vacant_spot = spot
            break

    response_text = f"Vacant Spots: {', '.join(vacant_spots)}\nBest Vacant Spot: {best_vacant_spot if best_vacant_spot else 'None'}"
    return response_text
