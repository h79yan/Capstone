from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime, Boolean, Numeric, LargeBinary, DECIMAL
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from .database import Base
from sqlalchemy.ext.mutable import MutableList

# Address Table
class Address(Base):
    __tablename__ = "address_table"

    restaurant_id = Column(Integer, ForeignKey("restaurant_table.restaurant_id"), primary_key=True, index=True)
    state = Column(String, nullable=False)
    city = Column(String, nullable=False)
    street_address = Column(String, nullable=False)
    postal_code = Column(Integer, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Relationship with Restaurant
    restaurant = relationship("Restaurant", back_populates="address")


# Customer Account Table
class CustomerAccount(Base):
    __tablename__ = "customer_account_table"

    customer_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    phone_number = Column(String(15), unique=True, nullable=False) 
    manager_account_name = Column(String(255), nullable=False)
    manager_account_password = Column(String(255), nullable=False)
    address = Column(String(255), nullable=True)
    verified = Column(Boolean, default=True) 
    otp = Column(String(6), nullable=True) 
    email = Column(String(255), unique=True, nullable=True)

    # Relationship with Orders
    orders = relationship("OrderTable", back_populates="customer")

    # Relationship with Customer History
    customer_history = relationship("CustomerHistory", back_populates="customer")


# Manager Account Table
class ManagerAccount(Base):
    __tablename__ = "manager_account_table"

    manager_id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurant_table.restaurant_id"), nullable=False)
    manager_account_name = Column(String(255), nullable=False)
    manager_account_password = Column(String(255), nullable=False)

    # Relationship with Restaurant
    restaurant = relationship("Restaurant", back_populates="managers")


# Customer History Table
class CustomerHistory(Base):
    __tablename__ = "customer_history_table"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True) 
    customer_number = Column(String(15), ForeignKey("customer_account_table.phone_number"), nullable=False)
    order_number = Column(String, ForeignKey("order_table.order_number"), nullable=False)

    # Relationship with Customer Account
    customer = relationship("CustomerAccount", back_populates="customer_history")

    # Relationship with Order Table
    order = relationship("OrderTable", back_populates="customer_histories")


# Menu Table
class Menu(Base):
    __tablename__ = "menu_table"

    menu_id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurant_table.restaurant_id"), nullable=False)
    category = Column(String(255), nullable=False)
    food_name = Column(String(255), nullable=False)
    food_description = Column(String, nullable=True)
    food_price = Column(Numeric, nullable=False)
    availability = Column(Boolean, default=True)

    # Relationship with Restaurant
    restaurant = relationship("Restaurant", back_populates="menus")


# Order Table
class OrderTable(Base):
    __tablename__ = "order_table"

    order_number = Column(String, primary_key=True, index=True)
    due_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), nullable=True, default="Pending")
    customer_id = Column(Integer, ForeignKey("customer_account_table.customer_id"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurant_table.restaurant_id"), nullable=False)
    restaurant_name = Column(String(255), nullable=True) 
    items_count = Column(Integer, nullable=False, default=1)
    subtotal = Column(Float, nullable=False, default=0.0)
    taxes = Column(Float, nullable=False, default=0.0)
    fooditems = Column(MutableList.as_mutable(JSON), nullable=False) 

    # New Address Columns
    state = Column(String(255), nullable=True)
    city = Column(String(255), nullable=True)
    street_address = Column(String(255), nullable=True)
    postal_code = Column(String(20), nullable=True)
    latitude = Column(DECIMAL(9, 6), nullable=True)
    longitude = Column(DECIMAL(9, 6), nullable=True)

    # Relationship with Customer
    customer = relationship("CustomerAccount", back_populates="orders")

    # Relationship with Customer History
    customer_histories = relationship("CustomerHistory", back_populates="order")

    # Relationship with Restaurant
    restaurant = relationship("Restaurant", back_populates="orders")

# Restaurant Table
class Restaurant(Base):
    __tablename__ = "restaurant_table"

    restaurant_id = Column(Integer, primary_key=True, index=True)
    restaurant_name = Column(String(255), nullable=False)
    ratings = Column(Numeric, nullable=True)
    restaurant_type = Column(String(255), nullable=True)
    pricing_levels = Column(String(50), nullable=True)

    # Relationships
    menus = relationship("Menu", back_populates="restaurant")
    managers = relationship("ManagerAccount", back_populates="restaurant")
    orders = relationship("OrderTable", back_populates="restaurant")
    address = relationship("Address", back_populates="restaurant", uselist=False)
    photos = relationship("RestaurantPhotos", back_populates="restaurant")  # Added
    

class RestaurantPhotos(Base):
    __tablename__ = "restaurant_photos"

    photo_id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurant_table.restaurant_id"), nullable=False)
    food_name = Column(String(500), nullable=True) 
    file_name = Column(String, nullable=False) 
    content_type = Column(String, nullable=False) 
    photo_data = Column(LargeBinary, nullable=False) 
    upload_time = Column(DateTime, default=datetime.utcnow) 

    # Relationship with Restaurant
    restaurant = relationship("Restaurant", back_populates="photos")