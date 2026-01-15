from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from app.api.database import engine, Base
from app.api.routers import auth, restaurant, menu, photo, cart
from app.api.routers.CustomerFunction import router as customer_router
import stripe
import os
from dotenv import load_dotenv

load_dotenv()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Initialize FastAPI app
app = FastAPI(title="QueFood Backend")

# Create database tables
Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(restaurant.router, prefix="/api/restaurant", tags=["Restaurants"])
app.include_router(customer_router, prefix="/api/customer", tags=["Customer"])
app.include_router(menu.router, prefix="/api/menu", tags=["Menu"])
app.include_router(photo.router, prefix="/api", tags=["Photos"])
app.include_router(cart.router, prefix="/api", tags=["Cart"])

# Define Pydantic model to receive amount from frontend
class PaymentRequest(BaseModel):
    amount: int  # Amount in cents (e.g., 1000 = $10.00)

# Updated Payment Intent endpoint
@app.post("/api/payment-intent")
async def create_payment_intent(payment_request: PaymentRequest):
    try:
        amount = payment_request.amount  # Extract dynamic amount
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Invalid amount")

        # Create a PaymentIntent with the correct amount
        intent = stripe.PaymentIntent.create(
            amount=amount,  # Amount should now be dynamic
            currency="usd",
            automatic_payment_methods={"enabled": True},
        )
        return {"client_secret": intent.client_secret}
    except Exception as e:
        return {"error": str(e)}

# Root route
@app.get("/")
def root():
    return {"message": "Welcome to QueFood Backend!"}
