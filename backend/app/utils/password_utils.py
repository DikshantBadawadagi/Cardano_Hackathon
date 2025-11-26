from passlib.context import CryptContext
from passlib.exc import UnknownHashError

# Use argon2 which accepts arbitrary-length inputs and is modern/secure
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    if password is None:
        raise ValueError("password cannot be None")
    try:
        return pwd_context.hash(password)
    except Exception as e:
        # Likely missing argon2-cffi or misconfiguration; raise clearer error
        raise RuntimeError("Password hashing failed. Ensure 'argon2-cffi' and 'passlib' are installed.") from e


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except (ValueError, UnknownHashError):
        return False
    except Exception as e:
        # If verification fails due to missing backend, surface a clear error
        raise RuntimeError("Password verification failed. Ensure 'argon2-cffi' and 'passlib' are installed.") from e
