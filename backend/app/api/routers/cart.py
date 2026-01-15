from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from uuid import uuid4
from typing import List, Dict
from datetime import datetime
from sqlalchemy import func
from sqlalchemy.orm.attributes import flag_modified

router = APIRouter()

@router.post("/cart", response_model=schemas.CartRead)
def create_or_get_cart(
    cart_data: schemas.CartCreate,
    db: Session = Depends(get_db)
):
    """
    Get the user's open cart or create one if none exists.
    """
    # Look up the customer by phone number
    customer = db.query(models.CustomerAccount).filter(
        models.CustomerAccount.phone_number == cart_data.phone_number
    ).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Look up the restaurant by ID
    restaurant = db.query(models.Restaurant).filter(
        models.Restaurant.restaurant_id == cart_data.restaurant_id
    ).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    address = db.query(models.Address).filter(
        models.Address.restaurant_id == cart_data.restaurant_id
    ).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    # Check if there's already an open cart for this customer
    existing_cart = db.query(models.OrderTable).filter(
        models.OrderTable.customer_id == customer.customer_id,
        models.OrderTable.restaurant_id == cart_data.restaurant_id,
        models.OrderTable.status == "cart"
    ).first()

    if existing_cart:
        return existing_cart

    # Determine the next order number
    last_order = db.query(models.OrderTable).order_by(models.OrderTable.order_number.desc()).first()
    if last_order:
        last_order_number_str = last_order.order_number
        try:
            last_order_number = int(last_order_number_str[1:])  # Extract digits and convert to int
            next_order_number = last_order_number + 1
            next_order_number_str = f"A{next_order_number:07d}"  # Format with leading zeros
        except ValueError:
            # Handle the case where the last order number is not in the expected format
            next_order_number_str = "A0000001"  # Or some other default starting value
    else:
        next_order_number_str = "A0000001"

    # Otherwise, create a new cart
    new_cart = models.OrderTable(
        order_number=next_order_number_str,
        due_date=datetime.utcnow(),
        status="cart",
        customer_id=customer.customer_id,
        restaurant_id=cart_data.restaurant_id,
        restaurant_name=restaurant.restaurant_name,
        items_count=0,
        subtotal=0.0,
        taxes=0.0,
        fooditems=[],
        state = address.state,
        city = address.city,
        street_address = address.street_address,
        postal_code = address.postal_code,
        latitude = address.latitude,
        longitude = address.longitude
    )
    db.add(new_cart)
    db.commit()
    db.refresh(new_cart)
    return new_cart

@router.get("/cart/{order_number}", response_model=schemas.CartRead)
def get_cart(order_number: str, db: Session = Depends(get_db)):
    """
    Retrieve a cart by order_number.
    """
    if not order_number:
        raise HTTPException(status_code=400, detail="Order number is required")

    print(f"📥 Received request for order_number: {order_number}")

    cart = db.query(models.OrderTable).filter(
        models.OrderTable.order_number == order_number,
        models.OrderTable.status == "cart"
    ).first()

    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found or not open")

    print(f"Cart found: {cart}")
    
    return cart


@router.put("/cart/{order_number}/prepare", response_model=schemas.CartRead)
def prepare_order(
    order_number: str,
    db: Session = Depends(get_db)
):
    """
    Update the status of an order to 'prepare' by order_number.
    """
    # Fetch the order
    order = db.query(models.OrderTable).filter(
        models.OrderTable.order_number == order_number
    ).first()

    # Handle case where order is not found
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Update the status to 'prepare'
    order.status = "prepare"

    # Commit changes to the database
    db.commit()
    db.refresh(order)

    print(f"Order {order_number} status updated to 'prepare'")

    return order



@router.put("/cart/{order_number}/items", response_model=schemas.CartRead)
def add_item_to_cart(
    order_number: str,
    item: Dict,  # Change to Dict
    db: Session = Depends(get_db)
):
    """
    Add an item to the cart's fooditems array.
    """
    cart = db.query(models.OrderTable).filter(
        models.OrderTable.order_number == order_number,
        models.OrderTable.status == "cart"
    ).first()

    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found or not open")

    # Fetch menu info
    menu_item = db.query(models.Menu).filter(
        models.Menu.menu_id == item['menu_id'],
        models.Menu.food_name == item['food_name'],
        models.Menu.restaurant_id == cart.restaurant_id
    ).first()
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    # Ensure quantity is provided and valid
    quantity = item.get('quantity', 1)
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than zero")

    # Check if the item already exists in the cart
    current_items = cart.fooditems or []
    current_items = current_items.copy()  # Create a copy to avoid modifying the original list directly
    existing_item_index = -1


    for index, existing_item in enumerate(current_items):
        if existing_item["menu_id"] == menu_item.menu_id and existing_item["food_name"] == menu_item.food_name:
            existing_item_index = index
            break

    if existing_item_index != -1:
        # Increment the quantity of the existing item
        current_items[existing_item_index]["quantity"] += 1
        current_items[existing_item_index]["line_total"] = float(current_items[existing_item_index]["unit_price"]) * current_items[existing_item_index]["quantity"]
    else:
        # Build a new CartItem
        line_total = float(menu_item.food_price) * quantity
        new_item = {
            "menu_id": menu_item.menu_id,
            "food_name": menu_item.food_name,
            "quantity": quantity,
            "unit_price": float(menu_item.food_price),
            "line_total": line_total
        }
        current_items.append(new_item)

    # Update the cart's fooditems
    cart.fooditems = current_items

    flag_modified(cart, "fooditems")


    # Recalculate
    cart.items_count = sum(i["quantity"] for i in current_items)
    cart.subtotal = sum(i["line_total"] for i in current_items)
    cart.taxes = round(cart.subtotal * 0.1, 2)  # example 10% tax
    db.flush()
    try: 
        db.commit()
    except Exception as e:
        print(f"Error during commit: {e}")
    db.refresh(cart)
    print(f"Cart after commit: {cart.fooditems}") #log cart after commit.
    return cart

@router.put("/cart/{order_number}/items/{menu_id}", response_model=schemas.CartRead)
def remove_item_from_cart(
    order_number: str,
    item: Dict,  # Use item dictionary for consistency
    db: Session = Depends(get_db)
):
    """
    Remove an item from the cart by menu_id or decrement its quantity.
    """

    cart = db.query(models.OrderTable).filter(
        models.OrderTable.order_number == order_number,
        models.OrderTable.status == "cart"
    ).first()

    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found or not open")

    # Fetch menu info (optional, but good for validation)
    menu_item = db.query(models.Menu).filter(
        models.Menu.menu_id == item['menu_id'],
        models.Menu.food_name == item['food_name'],
        models.Menu.restaurant_id == cart.restaurant_id
    ).first()
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    # Check if the item already exists in the cart
    current_items = cart.fooditems or []
    current_items = current_items.copy()  # Create a copy to avoid modifying the original list directly
    existing_item_index = -1

    for index, existing_item in enumerate(current_items):
        if existing_item["menu_id"] == menu_item.menu_id and existing_item["food_name"] == menu_item.food_name:
            existing_item_index = index
            break

    if existing_item_index != -1:
        # Decrement the quantity of the existing item
        if current_items[existing_item_index]["quantity"] > 1:
            current_items[existing_item_index]["quantity"] -= 1
            current_items[existing_item_index]["line_total"] = float(current_items[existing_item_index]["unit_price"]) * current_items[existing_item_index]["quantity"]
        else:
            print(f"Item exists with quantity 1, removing item")  # Log when removing
            del current_items[existing_item_index]
    else:
        # Item not found in cart
        raise HTTPException(status_code=404, detail="Item not found in cart")


    # Update the cart's fooditems
    cart.fooditems = current_items

    flag_modified(cart, "fooditems")

    # Recalculate
    cart.items_count = sum(i["quantity"] for i in current_items)
    cart.subtotal = sum(i["line_total"] for i in current_items)
    cart.taxes = round(cart.subtotal * 0.1, 2)  # example 10% tax

    db.flush()
    try:
        db.commit()
    except Exception as e:
        print(f"Error during commit: {e}")
    db.refresh(cart)
    print(f"Cart after commit: {cart.fooditems}")  # Log cart after commit
    return cart

@router.post("/cart/{order_number}/checkout", response_model=schemas.CartRead)
def checkout_cart(
    order_number: str,
    db: Session = Depends(get_db)
):
    """
    Checkout the cart (set status to something else, e.g. 'new' or 'pending').
    """
    cart = db.query(models.OrderTable).filter(
        models.OrderTable.order_number == order_number,
        models.OrderTable.status == "cart"
    ).first()

    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found or not open")

    # Move from 'cart' to 'new' or 'pending'
    cart.status = "new"
    db.commit()
    db.refresh(cart)
    return cart

@router.get("/cart/customer/{phone_number}/{restaurant_id}", response_model=schemas.CartRead)
def get_cart_by_customer_and_restaurant(
    phone_number: str,
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve a cart by customer phone number and restaurant ID.
    """
    customer = db.query(models.CustomerAccount).filter(models.CustomerAccount.phone_number == phone_number).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    cart = db.query(models.OrderTable).filter(
        models.OrderTable.customer_id == customer.customer_id,
        models.OrderTable.restaurant_id == restaurant_id,
        models.OrderTable.status == "cart"
    ).first()

    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    return cart

@router.get("/carts/{phone_number}", response_model=List[schemas.CartRead])
def get_all_carts_by_customer(
    phone_number: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve all carts by customer ID.
    """
    customer = db.query(models.CustomerAccount).filter(models.CustomerAccount.phone_number == phone_number).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    carts = db.query(models.OrderTable).filter(
        models.OrderTable.customer_id == customer.customer_id,
        models.OrderTable.status == "cart"
    ).all()

    if not carts:
        raise HTTPException(status_code=404, detail="No carts found for this customer")

    return carts

@router.get("/restaurant/{restaurant_id}", response_model=schemas.RestaurantRead)
def get_all_carts_by_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db)
):
    #get restaurant by id
    restaurant = db.query(models.Restaurant).filter(models.Restaurant.restaurant_id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    
    #return restaurant name and address
    return restaurant

#delete cart
@router.delete("/cart/{phone_number}/{restaurant_id}", response_model=schemas.CartRead)
def delete_cart(
    phone_number: str,
    restaurant_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete a cart by customer phone number and restaurant ID.
    """
    customer = db.query(models.CustomerAccount).filter(models.CustomerAccount.phone_number == phone_number).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    cart = db.query(models.OrderTable).filter(
        models.OrderTable.customer_id == customer.customer_id,
        models.OrderTable.restaurant_id == restaurant_id,
        models.OrderTable.status == "cart"
    ).first()

    if not cart:
        raise HTTPException(status_code=404, detail="Cart not found")

    db.delete(cart)
    db.commit()
    return cart