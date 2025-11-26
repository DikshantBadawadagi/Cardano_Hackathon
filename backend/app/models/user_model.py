from datetime import datetime
from app.utils.password_utils import hash_password


class UserModel:
    collection_name = "users"

    def __init__(self, email, password, name=None):
        self.email = email.lower().strip()
        # Use centralized helper which normalizes long passwords before bcrypt
        self.password_hash = hash_password(password)
        self.name = name
        self.created_at = datetime.utcnow()
        self.email_verified = False
    
    def to_dict(self):
        return {
            "email": self.email,
            "password_hash": self.password_hash,
            "name": self.name,
            "created_at": self.created_at,
            "email_verified": self.email_verified,
        }
