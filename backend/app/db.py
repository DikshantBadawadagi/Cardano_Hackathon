import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import InvalidURI

load_dotenv()

# Read environment variable; if empty, use the default localhost URI
raw_uri = os.getenv("MONGO_URI", "").strip()
if not raw_uri:
	MONGO_URI = "mongodb://localhost:27017"
else:
	MONGO_URI = raw_uri

# Basic scheme validation
if not (MONGO_URI.startswith("mongodb://") or MONGO_URI.startswith("mongodb+srv://")):
	print(f"Warning: MONGO_URI has invalid scheme or is malformed: '{MONGO_URI}'. Falling back to 'mongodb://localhost:27017'.")
	MONGO_URI = "mongodb://localhost:27017"

try:
	client = MongoClient(MONGO_URI)
except InvalidURI as e:
	print(f"Invalid MONGO_URI '{MONGO_URI}': {e}. Falling back to 'mongodb://localhost:27017'.")
	client = MongoClient("mongodb://localhost:27017")
except Exception as e:
	print(f"Failed to create MongoClient with '{MONGO_URI}': {e}. Falling back to 'mongodb://localhost:27017'.")
	client = MongoClient("mongodb://localhost:27017")

db = client["maukikh_db"]
