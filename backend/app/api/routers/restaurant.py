from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.database import get_db
from app.api.models import Restaurant, Address
from math import radians, cos, sin, asin, sqrt
from typing import List

router = APIRouter()

# Haversine formula to calculate distance between two points
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return R * c

@router.get("/", response_model=List[dict]) 
def get_nearby_restaurants(latitude: float, longitude: float, radius: float, db: Session = Depends(get_db)):
    try:
        # Join restaurant_table and address_table to get location data
        results = (
            db.query(Restaurant, Address)
            .join(Address, Restaurant.restaurant_id == Address.restaurant_id)
            .all()
        )

        nearby_restaurants = []
        for restaurant, address in results:
            if address.latitude and address.longitude:  # Fix Here
                distance = haversine(latitude, longitude, address.latitude, address.longitude)  # Fix Here
                if distance < radius:
                    nearby_restaurants.append({
                        "restaurant_id": restaurant.restaurant_id,
                        "restaurant_name": restaurant.restaurant_name,
                        "ratings": restaurant.ratings,
                        "restaurant_type": restaurant.restaurant_type,
                        "pricing_levels": restaurant.pricing_levels,
                        "address": {
                            "city": address.city,
                            "state": address.state,
                            "street_address": address.street_address,
                            "postal_code": address.postal_code,
                            "latitude": address.latitude,
                            "longitude": address.longitude  # Fix Here
                        },
                        "distance_km": round(distance, 2)
                    })

        # Sort by distance
        nearby_restaurants.sort(key=lambda x: x["distance_km"])
        return nearby_restaurants[:10]  # Limit results to 10

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
