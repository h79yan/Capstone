from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.api.database import get_db
from app.api.auth import decode_access_token
from app.api.models import CustomerHistory, OrderTable , CustomerAccount
from sqlalchemy import asc, desc
from fastapi.responses import JSONResponse


router = APIRouter()

class OrderHistoryRequest(BaseModel):
    order_number: str
    
# Debug All Request Headers
@router.get("/debug/headers")
async def debug_headers(request: Request):
    """Print all request headers for debugging."""
    headers = dict(request.headers)
    print(f" Request Headers: {headers}")  
    return headers


# Fix Token Extraction
def get_token_from_header(request: Request):
    """Extract the token from Authorization header correctly."""
    auth_header = request.headers.get("Authorization")

    print(f" Raw Authorization Header: {auth_header}")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")

    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization Format")

    token = auth_header.split(" ")[1]  # Correctly extract the token
    print(f" Extracted Token from Headers: {token}")
    return token


# Extract Phone Number from Token
def get_phone_number_from_token(request: Request):
    token = get_token_from_header(request) 
    print(f" Token Before Decoding: {token}")  

    try:
        payload = decode_access_token(token) 
        print(f" Decoded Payload: {payload}")  
    except Exception as e:
        print(f" Token decoding error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")

    phone_number = payload.get("sub")
    if not phone_number:
        print(" Token does not contain 'sub' field!") 
        raise HTTPException(status_code=401, detail="Invalid token")

    print(f" Extracted Phone Number from Token: {phone_number}")
    return phone_number


# Fetch Orders Using Phone Number
@router.get("/orders")
def get_customer_orders(
    db: Session = Depends(get_db),
    customer_number: str = Depends(get_phone_number_from_token)
):
    """Fetch full order details from `order_table` sorted by `due_date`."""
    print(f" Looking up orders for customer_number: {customer_number}") 

    # Get order numbers from `customer_history_table`
    order_records = db.query(CustomerHistory.order_number).filter(
        CustomerHistory.customer_number == customer_number
    ).all()

    order_numbers = [record.order_number for record in order_records]

    if not order_numbers:
        print(" No orders found for this customer")
        return {"message": "No orders found for this customer", "customer_number": customer_number}

    # Fetch full order details from `order_table` and sort by `due_date`
    orders = (
    db.query(OrderTable)
    .filter(
        OrderTable.order_number.in_(order_numbers),
        OrderTable.status != "cart"
    )
    .order_by(desc(OrderTable.due_date)) 
    .all()
        )


    if not orders:
        print(" No matching orders in order_table")
        return {"message": "No orders found in order_table", "customer_number": customer_number}

    # Convert orders to JSON-friendly format, including address details
    order_list = []
    for order in orders:
        order_list.append({
            "order_number": order.order_number,
            "due_date": order.due_date,
            "status": order.status,
            "customer_id": order.customer_id,
            "restaurant_id": order.restaurant_id,
            "items_count": order.items_count,
            "subtotal": order.subtotal,
            "taxes": order.taxes,
            "fooditems": order.fooditems,
            "total": order.subtotal + order.taxes,
            "restaurant_name": order.restaurant_name,
            "state": order.state,
            "city": order.city,
            "street_address": order.street_address,
            "postal_code": order.postal_code,
            "latitude": float(order.latitude) if order.latitude else None, 
            "longitude": float(order.longitude) if order.longitude else None, 
        })

    print(f" Retrieved Orders (sorted by due_date): {order_list}") 

    return {
        "message": "Orders retrieved successfully",
        "customer_number": customer_number,
        "orders": order_list 
    }

@router.post("/history")
def add_order_to_customer_history(
    request: OrderHistoryRequest, 
    db: Session = Depends(get_db),
    customer_number: str = Depends(get_phone_number_from_token)
):
    """
    Insert a new record into `customer_history_table` when an order is placed.
    """
    print(f" Adding order {request.order_number} to history for customer: {customer_number}") 

    # Ensure `customer_number` is treated as a string
    customer_number = str(customer_number)

    # Check if order exists in `order_table`
    order = db.query(OrderTable).filter(OrderTable.order_number == request.order_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Prevent duplicate entries
    existing_history = db.query(CustomerHistory).filter(
        CustomerHistory.customer_number == customer_number,
        CustomerHistory.order_number == request.order_number
    ).first()
    
    if existing_history:
        print(" Order already exists in customer history, skipping insert.")
        return {"message": "Order already exists in customer history"}

    # Insert order into `customer_history_table`
    new_history = CustomerHistory(
        customer_number=customer_number,
        order_number=request.order_number
    )

    db.add(new_history)
    db.commit()
    db.refresh(new_history)

    print(f"Successfully added order {request.order_number} to customer history!")
    return {"message": "Order added to customer history", "order_number": request.order_number}

@router.get("/decode-token")
def decode_token(request: Request, db: Session = Depends(get_db)):
    """
    Extracts the phone number from the JWT token and verifies if it exists in the database.
    """
    token = request.headers.get("Authorization")
    
    if not token:
        raise HTTPException(status_code=401, detail="Missing Authorization Header")
    
    if not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization Format")
    
    token = token.split(" ")[1]

    try:
        decoded_data = decode_access_token(token)
        phone_number = decoded_data.get("sub")

        if not phone_number:
            raise HTTPException(status_code=400, detail="Invalid token data")

        # Verify if phone number exists in the database
        user = db.query(CustomerAccount).filter(CustomerAccount.phone_number == phone_number).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {"phone_number": phone_number}
    
    except Exception as e:
        print(f"Token decoding error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")