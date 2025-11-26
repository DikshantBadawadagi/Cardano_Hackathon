from flask import Blueprint, request, jsonify, current_app, make_response, g
from app.services.user_service import UserService
import hashlib
import logging
logger = logging.getLogger(__name__)
from app.utils.jwt_utils import generate_token, decode_token
from functools import wraps

auth_bp = Blueprint('auth', __name__)


def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Try cookie first
        token = request.cookies.get('access_token')
        # Allow Authorization header as fallback
        if not token:
            auth_header = request.headers.get('Authorization')
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header[len('Bearer '):]

        if not token:
            return jsonify({"error": "Missing auth token"}), 401

        try:
            payload = decode_token(token)
            user_id = payload.get('user_id')
            user = UserService.get_by_id(user_id)
            if not user:
                return jsonify({"error": "Invalid token user"}), 401
            # attach to flask global
            g.current_user = user
        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 401

        return f(*args, **kwargs)
    return decorated


@auth_bp.route('/register', methods=['POST'])
def register():
    # Accept JSON or form-data
    data = request.get_json(silent=True)
    if data is None:
        # fallback to form data (multipart/form-data or application/x-www-form-urlencoded)
        data = request.form.to_dict()

    email = data.get('email')
    password = data.get('password')
    name = data.get('name')

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    try:
        # Debug: log password byte length and normalized digest length (no plaintext)
        try:
            pw_bytes_len = len(password.encode('utf-8')) if password is not None else 0
            normalized = hashlib.sha256(password.encode('utf-8')).hexdigest() if password is not None else ''
            logger.debug(f"Register attempt: password_bytes={pw_bytes_len}, normalized_len={len(normalized)}")
        except Exception:
            logger.debug("Register attempt: could not compute password debug info")

        user = UserService.create_user(email=email, password=password, name=name)
        # Do not return password_hash
        user.pop('password_hash', None)
        return jsonify({"user": user}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 409
    except Exception as e:
        # Log full traceback to console for debugging
        logger.exception("Unhandled exception in register endpoint")
        # Return generic message (include short error text for easier debugging locally)
        return jsonify({"error": "Internal server error", "detail": str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    # Accept JSON or form-data
    data = request.get_json(silent=True)
    if data is None:
        data = request.form.to_dict()

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    user = UserService.authenticate(email=email, password=password)
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    # Create token with user id
    token = generate_token({"user_id": str(user.get('_id'))})
    resp = make_response(jsonify({"message": "logged in"}))
    # Set cookie - secure flags left configurable by environment
    resp.set_cookie('access_token', token, httponly=True, samesite='Lax')
    return resp


@auth_bp.route('/logout', methods=['POST'])
@auth_required
def logout():
    resp = make_response(jsonify({"message": "logged out"}))
    resp.set_cookie('access_token', '', expires=0)
    return resp


@auth_bp.route('/me', methods=['GET'])
@auth_required
def me():
    user = g.current_user
    user_copy = {k: v for k, v in user.items() if k != 'password_hash'}
    return jsonify({"user": user_copy})


@auth_bp.route('/users/<user_id>', methods=['PUT', 'PATCH'])
@auth_required
def update_user(user_id):
    # Only allow updating own user or admin role (no admin role presently)
    current = g.current_user
    if str(current.get('_id')) != user_id:
        return jsonify({"error": "Cannot update another user"}), 403

    # Accept JSON or form-data
    data = request.get_json(silent=True)
    if data is None:
        data = request.form.to_dict()

    allowed = ['name', 'password']
    update = {k: v for k, v in data.items() if k in allowed}
    if not update:
        return jsonify({"error": "No valid fields provided"}), 400

    updated = UserService.update_user(user_id, update)
    if not updated:
        return jsonify({"error": "User not found or update failed"}), 404
    updated.pop('password_hash', None)
    return jsonify({"user": updated})
