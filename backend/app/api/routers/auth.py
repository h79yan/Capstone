from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.database import get_db
from app.api.models import CustomerAccount
from app.api.schemas import (
    CustomerAccountCreate, PhoneVerificationRequest, PhoneVerificationResponse,
    OTPVerificationRequest, SignInRequest, SignInResponse, ChangePasswordRequest
)
from app.api.auth import hash_password, create_access_token, verify_password
from app.api.otp import generate_otp, send_otp

router = APIRouter()

FACEBOOK_CLIENT_ID="1131285361812691"
FACEBOOK_CLIENT_SECRET= "89394a6bf09d11fc2a74f04fd153aa46"
FACEBOOK_REDIRECT_URI= "https://quefood-api.com/api/auth/facebook/callback"

# SEND OTP
@router.post("/send-otp", response_model=PhoneVerificationResponse)
def send_otp_endpoint(phone_verification: PhoneVerificationRequest, db: Session = Depends(get_db)):
    existing_user = db.query(CustomerAccount).filter(CustomerAccount.phone_number == phone_verification.phone_number).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    otp = generate_otp()
    send_otp(phone_verification.phone_number, otp)

    new_user = CustomerAccount(
        phone_number=phone_verification.phone_number,
        otp=otp,
        verified=False,
        manager_account_name="NA",
        manager_account_password="NA",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "OTP sent successfully"}

@router.post("/resend-otp", response_model=PhoneVerificationResponse)
def resend_otp(phone_verification: PhoneVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(CustomerAccount).filter(CustomerAccount.phone_number == phone_verification.phone_number).first()
    if not user:
        raise HTTPException(status_code=400, detail="Phone number not registered")
    otp = generate_otp()
    send_otp(phone_verification.phone_number, otp)

    user.otp = otp
    db.commit()

    return {"message": "OTP sent successfully"}

# VERIFY OTP
@router.post("/verify-otp", response_model=PhoneVerificationResponse)
def verify_otp(request: OTPVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(CustomerAccount).filter(CustomerAccount.phone_number == request.phone_number).first()
    if not user or user.otp != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    user.verified = True
    user.otp = None
    db.commit()
    return {"message": "Phone number verified successfully"}

# SIGNUP
@router.post("/signup")
def signup(customer: CustomerAccountCreate, db: Session = Depends(get_db)):
    print("Signup Data:", customer.dict())  # Debugging

    existing_user = db.query(CustomerAccount).filter(CustomerAccount.phone_number == customer.phone_number).first()
    if not existing_user:
        raise HTTPException(status_code=400, detail="Phone number not registered. Please send OTP first.")

    if not existing_user.verified:
        raise HTTPException(status_code=400, detail="Phone number not verified.")

    hashed_password = hash_password(customer.manager_account_password)
    existing_user.manager_account_name = customer.manager_account_name
    existing_user.manager_account_password = hashed_password
    existing_user.email = customer.email
    existing_user.verified = True

    db.commit()
    db.refresh(existing_user)
    return {"message": "Signup successful. You can now log in."}

# SIGNIN
@router.post("/signin", response_model=SignInResponse)
def signin(customer: SignInRequest, db: Session = Depends(get_db)):
    user = db.query(CustomerAccount).filter(CustomerAccount.phone_number == customer.phone_number).first()

    if not user:
        raise HTTPException(status_code=404, detail="Phone number not registered. Please sign up.")
    
    if not user.verified:
        raise HTTPException(status_code=401, detail="Phone number not verified. Please verify OTP.")

    if not verify_password(customer.password, user.manager_account_password):
        raise HTTPException(status_code=401, detail="Invalid phone number or password")

    access_token = create_access_token(data={"sub": user.phone_number})
    return {"access_token": access_token, "token_type": "bearer"}

# GOOGLE SIGN-IN (Fixed)
@router.post("/google-signin")
def google_signin(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    name = data.get("name")

    user = db.query(CustomerAccount).filter(CustomerAccount.email == email).first()
    print('call google sign in')

    if not user:
        print("User not found for email:", email)
        raise HTTPException(status_code=404, detail="User not found. Please sign up with phone number first.")

    # Generate token for existing users
    token = create_access_token(data={"sub": user.phone_number})
    return {"access_token": token}

@router.post("/apple-signin")
def apple_signin(data: dict, db: Session = Depends(get_db)):
    
    apple_id = data.get("apple_id")
    email = data.get("email")
    full_name = data.get("full_name")

    user = db.query(CustomerAccount).filter(CustomerAccount.manager_account_name == apple_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please sign up with phone number first.")

    token = create_access_token(data={"sub": user.phone_number})
    return {"access_token": token}

@router.get("/facebook/callback")
def facebook_callback(code: str, db: Session = Depends(get_db)):
    """
    This endpoint is called by Facebook after the user logs in.
    """

    # Step 1: Exchange the `code` for an access token
    token_url = f"https://graph.facebook.com/v12.0/oauth/access_token"
    params = {
        "client_id": FACEBOOK_CLIENT_ID,
        "client_secret": FACEBOOK_CLIENT_SECRET,
        "redirect_uri": FACEBOOK_REDIRECT_URI,
        "code": code,
    }

    response = requests.get(token_url, params=params)
    token_data = response.json()

    if "access_token" not in token_data:
        raise HTTPException(status_code=400, detail="Failed to get access token from Facebook")

    access_token = token_data["access_token"]

    # Step 2: Fetch user profile
    user_info_url = "https://graph.facebook.com/me?fields=id,email,name"
    headers = {"Authorization": f"Bearer {access_token}"}

    user_info_response = requests.get(user_info_url, headers=headers)
    user_info = user_info_response.json()

    if "email" not in user_info:
        raise HTTPException(status_code=400, detail="Facebook login failed: No email provided")

    email = user_info["email"]
    name = user_info["name"]

    # Step 3: Check if user exists in DB
    user = db.query(CustomerAccount).filter(CustomerAccount.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please sign up with phone number first.")

    # Step 4: Generate JWT token
    token = create_access_token(data={"sub": user.phone_number})
    
    return {"access_token": token}

# REQUEST PASSWORD CHANGE
@router.post("/request-password-change", response_model=PhoneVerificationResponse)
def request_password_change(phone_verification: PhoneVerificationRequest, db: Session = Depends(get_db)):
    user = db.query(CustomerAccount).filter(CustomerAccount.phone_number == phone_verification.phone_number).first()
    if not user:
        raise HTTPException(status_code=400, detail="Phone number not registered")

    otp = generate_otp()
    send_otp(phone_verification.phone_number, otp)

    user.otp = otp
    db.commit()

    return {"message": "OTP sent successfully"}

# CHANGE PASSWORD
@router.post("/change-password", response_model=PhoneVerificationResponse)
def change_password(request: ChangePasswordRequest, db: Session = Depends(get_db)):
    user = db.query(CustomerAccount).filter(CustomerAccount.phone_number == request.phone_number).first()
    if not user:
        raise HTTPException(status_code=400, detail="Phone number not registered")

    if verify_password(request.new_password, user.manager_account_password):
        raise HTTPException(status_code=400, detail="New password cannot be the same as the current password")

    hashed_password = hash_password(request.new_password)
    user.manager_account_password = hashed_password
    db.commit()

    return {"message": "Password changed successfully"}
