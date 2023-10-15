from fastapi import APIRouter, HTTPException, Depends

from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.Models.Models import LotMetadata
from app.database.schemas.Lots import LotMetadataInDB
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
