import bcrypt
import os
from functools import wraps
from flask import request, jsonify, session
from datetime import datetime, timedelta

class SecurityManager:
    def __init__(self, app):
        self.app = app
        self.setup_session(app)
        self.setup_rate_limiting()
    
    def setup_session(self, app):
        """Configure Flask session for admin authentication"""
        app.config['SECRET_KEY'] = os.getenv('SESSION_SECRET', 'your-secret-key-change-this')
        app.config['SESSION_TYPE'] = 'filesystem'
        app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=8)
        
        # Security headers
        @app.after_request
        def add_security_headers(response):
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-Frame-Options'] = 'DENY'
            response.headers['X-XSS-Protection'] = '1; mode=block'
            return response
    
    def setup_rate_limiting(self):
        """Simple rate limiting for login attempts"""
        self.login_attempts = {}
        self.max_attempts = 5
        self.lockout_duration = 900  # 15 minutes
    
    def hash_password(self, password):
        """Hash a password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password, hashed):
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    def check_rate_limit(self, ip):
        """Check if IP is rate limited"""
        now = datetime.now()
        if ip in self.login_attempts:
            attempts, last_attempt = self.login_attempts[ip]
            if now - last_attempt < timedelta(seconds=self.lockout_duration):
                if attempts >= self.max_attempts:
                    return False
            else:
                # Reset attempts after lockout period
                self.login_attempts[ip] = (0, now)
        return True
    
    def record_login_attempt(self, ip, success):
        """Record a login attempt"""
        now = datetime.now()
        if ip in self.login_attempts:
            attempts, _ = self.login_attempts[ip]
            if success:
                # Reset on successful login
                self.login_attempts[ip] = (0, now)
            else:
                self.login_attempts[ip] = (attempts + 1, now)
        else:
            self.login_attempts[ip] = (0 if success else 1, now)
    
    def require_admin(self, f):
        """Decorator to require admin authentication"""
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not session.get('is_admin'):
                return jsonify({'error': 'Unauthorized'}), 401
            return f(*args, **kwargs)
        return decorated_function
    
    def login_admin(self, username, password):
        """Authenticate admin user"""
        expected_username = os.getenv('ADMIN_USERNAME', 'admin')
        expected_password_hash = os.getenv('ADMIN_PASSWORD_HASH')
        
        if not expected_password_hash:
            # Generate a default hash if not set
            default_password = 'admin123'
            expected_password_hash = self.hash_password(default_password)
            print(f"WARNING: No ADMIN_PASSWORD_HASH set. Using default password: {default_password}")
            print(f"Set ADMIN_PASSWORD_HASH={expected_password_hash} in your .env file")
        
        if username == expected_username and self.verify_password(password, expected_password_hash):
            session['is_admin'] = True
            session['admin_username'] = username
            session['login_time'] = datetime.now().isoformat()
            return True
        return False
    
    def logout_admin(self):
        """Logout admin user"""
        session.clear()
        return True

# Global security manager instance
security_manager = None

def init_security(app):
    """Initialize security manager"""
    global security_manager
    security_manager = SecurityManager(app)
    return security_manager

def get_security_manager():
    """Get the global security manager instance"""
    return security_manager
