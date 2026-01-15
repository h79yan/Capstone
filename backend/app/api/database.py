from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()  # Load environment variables from .env

# Construct the DATABASE_URL from individual components
DB_USER = os.getenv("DB_USER")
PASSWORD = quote_plus(os.getenv("PASSWORD"))  # URL-encode the password
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")
DATABASE = os.getenv("DATABASE")

DATABASE_URL = f"postgresql://{DB_USER}:{PASSWORD}@{HOST}:{PORT}/{DATABASE}"

if not DATABASE_URL:
    raise ValueError("No DATABASE_URL set for SQLAlchemy database")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Define the get_db function
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
