from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.api.database import get_db
from app.api.models import RestaurantPhotos

router = APIRouter()

@router.get("/photos/{file_name}", response_class=Response)
def get_photo(file_name: str, db: Session = Depends(get_db)):
    photo = db.query(RestaurantPhotos).filter(RestaurantPhotos.file_name == file_name).first()

    if not photo:
        raise HTTPException(status_code=404, detail="Image not found")

    return Response(content=photo.photo_data, media_type=photo.content_type)
