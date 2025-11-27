from flask import request, g
from app.utils.jwt_utils import decode_token
from app.services.user_service import UserService


def init_auth_middleware(app):
    """Register a before_request handler that attaches user info to requests.

    Behavior:
    - Reads token from cookie `access_token` or `Authorization: Bearer <token>` header
    - Decodes JWT and fetches user using `UserService.get_by_id`
    - If a valid user is found, sets `request._id` to the user's id (string) and
      assigns `g.current_user` so existing code that uses either will work.

    This middleware is permissive: it does not abort requests when no token is
    present. It simply attaches user info when available.
    """

    @app.before_request
    def attach_user_from_token():
        token = None
        # Try cookie first
        token = request.cookies.get('access_token')

        # Fallback to Authorization header
        if not token:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header[len('Bearer '):]

        if not token:
            return None

        try:
            payload = decode_token(token)
            user_id = payload.get('user_id')
            if not user_id:
                return None

            user = UserService.get_by_id(user_id)
            if not user:
                return None

            # Attach to request and flask global for compatibility
            try:
                setattr(request, '_id', user_id)
            except Exception:
                # request is a proxy in Flask; best-effort attach
                pass
            g.current_user = user
        except Exception:
            # Do not raise/abort on token errors; treat as unauthenticated
            return None

    return None
