import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import InvalidURI

load_dotenv()

# Require MONGO_URI to be explicitly set (Atlas connection string).
# Do NOT fall back to localhost/Compass. Raise clear errors so the
# developer knows to set the env var or .env entry.
raw_uri = os.getenv("MONGO_URI")
if not raw_uri:
	raise RuntimeError(
		"MONGO_URI environment variable is not set.\n"
		"Set MONGO_URI to your MongoDB Atlas connection string in the environment or .env file.\n"
		"Example: MONGO_URI='mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/mydb'")

MONGO_URI = raw_uri.strip()

# Basic scheme validation
if not (MONGO_URI.startswith("mongodb://") or MONGO_URI.startswith("mongodb+srv://")):
	raise RuntimeError("MONGO_URI must start with 'mongodb://' or 'mongodb+srv://'. Got: %r" % MONGO_URI)

try:
	client = MongoClient(MONGO_URI)
	# Optionally attempt a server_info() call to force a connection and show
	# early errors (will raise on failure). Comment out if you want lazy connect.
	try:
		client.admin.command('ping')
	except Exception:
		# Let the outer except handle connection errors
		pass
except InvalidURI as e:
	raise RuntimeError(f"Invalid MONGO_URI '{MONGO_URI}': {e}") from e
except Exception as e:
	raise RuntimeError(
		f"Failed to create MongoClient with '{MONGO_URI}': {e}\n"
		"Check network connectivity, DNS, OpenSSL versions, and that dnspython is installed for SRV URIs.") from e

db = client["maukikh_db"]
