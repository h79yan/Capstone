from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Customer Account Schemas
class CustomerAccountCreate(BaseModel):
    manager_account_name: str = Field(..., min_length=3, max_length=255)
    manager_account_password: str = Field(..., min_length=6, max_length=255)
    phone_number: str = Field(..., min_length=10, max_length=10)
    email: Optional[str] = Field(None, max_length=255)
    #address: Optional[AddressCreate]

class CustomerAccountOut(BaseModel):
    customer_id: int
    manager_account_name: str
    phone_number: Optional[str]
    email: Optional[str]  
    address: Optional[str]

    class Config:
        orm_mode = True


# Phone Verification Schemas
class PhoneVerificationRequest(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=10)

class OTPVerificationRequest(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=10)
    otp: str = Field(..., min_length=6, max_length=6)

class PhoneVerificationResponse(BaseModel):
    message: str


# Sign-In Schemas
class SignInRequest(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=10)
    password: str = Field(..., min_length=6, max_length=255)

class SignInResponse(BaseModel):
    access_token: str
    token_type: str

# Change Password Schemas
class ChangePasswordRequest(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=10)
    new_password: str = Field(..., min_length=6, max_length=255)

class CartItem(BaseModel):
    menu_id: int
    food_name: str
    quantity: int
    unit_price: float
    line_total: float

class CartCreate(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=10)
    restaurant_id: int

class CartAddItem(BaseModel):
    menu_id: int
    quantity: int

class CartRemoveItem(BaseModel):
    menu_id: int

class CartRead(BaseModel):
    order_number: str
    status: str
    customer_id: int
    restaurant_id: int
    items_count: int
    subtotal: float
    taxes: float
    fooditems: List[CartItem] = []
    due_date: Optional[datetime] = None
    # Use Pydantic fields instead of SQLAlchemy Column
    restaurant_name: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    street_address: Optional[str] = None
    postal_code: Optional[str] = None
    latitude: Optional[float] = None  # Convert from DECIMAL to float
    longitude: Optional[float] = None  # Convert from DECIMAL to float

    class Config:
        from_attributes = True  # Pydantic v2 replacement for orm_mode


class RestaurantRead(BaseModel):
    restaurant_name: str

    class Config:
        from_attributes = True  # Pydantic v2 replacement for orm_mode

