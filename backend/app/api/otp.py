import random
from twilio.rest import Client
import os

# Load environment variables for Twilio credentials
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def generate_otp() -> str:
    """Generate a 6-digit OTP."""
    return str(random.randint(100000, 999999))

def send_otp(phone_number: str, otp: str) -> None:
    """Send OTP to the given phone number via Twilio."""
    message = client.messages.create(
        body=f"Your QueFood verification code is {otp}",
        from_=TWILIO_PHONE_NUMBER,
        to=phone_number
    )
    print(f"OTP sent: {message.sid}")
