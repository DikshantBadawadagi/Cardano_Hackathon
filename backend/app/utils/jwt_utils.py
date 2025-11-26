import os
import jwt
from datetime import datetime, timedelta

JWT_SECRET = os.getenv('JWT_SECRET', 'dev-secret')
JWT_ALGORITHM = 'HS256'
JWT_EXP_DELTA_SECONDS = int(os.getenv('JWT_EXP_SECONDS', 7 * 24 * 3600))


def generate_token(payload: dict) -> str:
    now = datetime.utcnow()
    to_encode = payload.copy()
    to_encode.update({
        'iat': now,
        'exp': now + timedelta(seconds=JWT_EXP_DELTA_SECONDS)
    })
    token = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token


def decode_token(token: str) -> dict:
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return data
    except jwt.ExpiredSignatureError:
        raise
    except Exception:
        raise
