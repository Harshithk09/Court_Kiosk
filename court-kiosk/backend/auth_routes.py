from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash, generate_password_hash
import os
import jwt
from datetime import datetime, timedelta
from functools import wraps

auth_bp = Blueprint('auth', __name__)

# In a real application, these would be stored in a database
# For demo purposes, we'll use hardcoded credentials
ADMIN_USERS = {
    'admin': {
        'password_hash': generate_password_hash('admin123'),
        'name': 'Administrator',
        'role': 'admin'
    },
    'facilitator': {
        'password_hash': generate_password_hash('facilitator123'),
        'name': 'Court Facilitator',
        'role': 'facilitator'
    },
    'staff': {
        'password_hash': generate_password_hash('staff123'),
        'name': 'Court Staff',
        'role': 'staff'
    }
}

# JWT secret key - in production, use a secure random key
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')

def token_required(f):
    """Decorator to protect routes that require authentication"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            # Decode token
            data = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
            current_user = ADMIN_USERS.get(data['username'])
            
            if not current_user:
                return jsonify({'message': 'Invalid token'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login endpoint"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({
                'success': False,
                'error': 'Username and password are required'
            }), 400
        
        # Check if user exists
        if username not in ADMIN_USERS:
            return jsonify({
                'success': False,
                'error': 'Invalid username or password'
            }), 401
        
        user = ADMIN_USERS[username]
        
        # Check password
        if not check_password_hash(user['password_hash'], password):
            return jsonify({
                'success': False,
                'error': 'Invalid username or password'
            }), 401
        
        # Generate JWT token
        token = jwt.encode({
            'username': username,
            'name': user['name'],
            'role': user['role'],
            'exp': datetime.utcnow() + timedelta(hours=24)  # Token expires in 24 hours
        }, JWT_SECRET_KEY, algorithm="HS256")
        
        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'username': username,
                'name': user['name'],
                'role': user['role']
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Login failed. Please try again.'
        }), 500

@auth_bp.route('/verify', methods=['GET'])
@token_required
def verify_token(current_user):
    """Verify token endpoint"""
    return jsonify({
        'success': True,
        'user': {
            'username': current_user.get('username'),
            'name': current_user.get('name'),
            'role': current_user.get('role')
        }
    })

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout endpoint (client-side token removal)"""
    return jsonify({
        'success': True,
        'message': 'Logged out successfully'
    })

# Example protected route
@auth_bp.route('/admin/test', methods=['GET'])
@token_required
def admin_test(current_user):
    """Test endpoint for protected routes"""
    return jsonify({
        'success': True,
        'message': f'Hello {current_user["name"]}, you have access to this protected route!'
    })

