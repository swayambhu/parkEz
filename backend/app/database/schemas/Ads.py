from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AdBase(BaseModel):
    name: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    business_id: int
    url: str
    impressions: int = 0
    clicks: int = 0
    top_banner_image1: Optional[str]
    top_banner_image2: Optional[str]
    image_change_interval: int = 10

class AdCreate(AdBase):
    pass

class Ad(AdBase):
    advert_id: int
    
    class Config:
        orm_mode = True