from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)

# In-memory user storage (for demo purposes; use a database in production)
users = {}

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400

    if username in users:
        return jsonify({'success': False, 'message': 'User already exists'}), 409

    hashed_password = generate_password_hash(password)
    users[username] = hashed_password
    return jsonify({'success': True, 'message': 'User created successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400

    if username not in users or not check_password_hash(users[username], password):
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

    # Dummy token for demo
    token = f"dummy-jwt-{username}"
    return jsonify({'success': True, 'token': token}), 200
