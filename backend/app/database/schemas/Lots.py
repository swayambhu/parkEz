from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CamImageBase(BaseModel):
    image: str
    timestamp: Optional[datetime]  # Will be set automatically if not provided
    camera_name: str
    human_labels: Optional[str]
    model_labels: Optional[str]

class CamImageCreate(CamImageBase):
    pass

class CamImageInDB(CamImageBase):
    id: int

class LotMetadataBase(BaseModel):
    id: str
    name: str
    owner_id: Optional[int]
    gps_coordinates: Optional[str]
    state: Optional[str]
    zip: Optional[str]
    city: Optional[str]

class LotMetadataCreate(LotMetadataBase):
    pass

class LotMetadataInDB(LotMetadataBase):
    pass

class CamMetadataBase(BaseModel):
    name: str
    lot_id: str

class CamMetadataCreate(CamMetadataBase):
    pass

class CamMetadataInDB(CamMetadataBase):
    pass

class LPRMetadataBase(BaseModel):
    name: str
    lot_id: str
    passcode: str

class LPRMetadataCreate(LPRMetadataBase):
    pass

class LPRMetadataInDB(LPRMetadataBase):
    pass

class LicensePlateReadingBase(BaseModel):
    lpr_id: str
    plate_number: str
    timestamp: Optional[datetime]  

class LicensePlateReadingCreate(LicensePlateReadingBase):
    pass

class LicensePlateReadingInDB(LicensePlateReadingBase):
    id: int
