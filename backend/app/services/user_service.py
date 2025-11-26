from typing import Optional
from app.db import db
from app.models.user_model import UserModel
from app.utils.password_utils import hash_password, verify_password
from bson.objectid import ObjectId


class UserService:
    collection = db[UserModel.collection_name]

    @staticmethod
    def _normalize_doc(doc: Optional[dict]) -> Optional[dict]:
        if not doc:
            return None
        # Create a shallow copy and stringify ObjectId
        out = dict(doc)
        if '_id' in out:
            try:
                out['_id'] = str(out['_id'])
            except Exception:
                pass
        return out

    @staticmethod
    def create_user(email: str, password: str, name: Optional[str] = None) -> dict:
        email_norm = email.lower().strip()
        existing = UserService.collection.find_one({"email": email_norm})
        if existing:
            raise ValueError("User already exists")

        user = UserModel(email=email_norm, password=password, name=name)
        doc = user.to_dict()
        result = UserService.collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return UserService._normalize_doc(doc)

    @staticmethod
    def find_by_email(email: str) -> Optional[dict]:
        doc = UserService.collection.find_one({"email": email.lower().strip()})
        return UserService._normalize_doc(doc)

    @staticmethod
    def authenticate(email: str, password: str) -> Optional[dict]:
        # find_by_email returns a normalized doc
        raw = UserService.collection.find_one({"email": email.lower().strip()})
        doc = UserService._normalize_doc(raw)
        if not doc:
            return None
        hashed = doc.get("password_hash")
        if not verify_password(password, hashed):
            return None
        return doc

    @staticmethod
    def get_by_id(user_id: str) -> Optional[dict]:
        try:
            oid = ObjectId(user_id)
        except Exception:
            return None
        doc = UserService.collection.find_one({"_id": oid})
        return UserService._normalize_doc(doc)

    @staticmethod
    def update_user(user_id: str, update: dict) -> Optional[dict]:
        try:
            oid = ObjectId(user_id)
        except Exception:
            return None

        if "password" in update:
            update["password_hash"] = hash_password(update.pop("password"))
        UserService.collection.update_one({"_id": oid}, {"$set": update})
        doc = UserService.collection.find_one({"_id": oid})
        return UserService._normalize_doc(doc)
