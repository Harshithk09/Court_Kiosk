"""
Authentication service for Court Kiosk system
Handles user authentication, session management, and authorization
"""

import secrets
import hashlib
import json
from datetime import datetime, timedelta
from flask import request
from models import db, User, UserSession, AuditLog

class AuthService:
    """Service for handling authentication and authorization"""
    
    SESSION_DURATION = timedelta(hours=8)  # 8 hour sessions
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION = timedelta(minutes=15)
    
    @staticmethod
    def create_user(username, email, password, role='admin'):
        """Create a new user"""
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return {'success': False, 'error': 'Username already exists'}
        
        if User.query.filter_by(email=email).first():
            return {'success': False, 'error': 'Email already exists'}
        
        # Create new user
        user = User(
            username=username,
            email=email,
            role=role
        )
        user.set_password(password)
        
        try:
            db.session.add(user)
            db.session.commit()
            
            # Log user creation
            AuthService.log_action(
                user_id=user.id,
                action='user_created',
                resource_type='user',
                resource_id=str(user.id),
                details={'username': username, 'role': role}
            )
            
            return {'success': True, 'user': user.to_dict()}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def authenticate_user(username, password):
        """Authenticate user with username and password"""
        user = User.query.filter_by(username=username, is_active=True).first()
        
        if not user:
            AuthService.log_action(
                action='login_failed',
                details={'username': username, 'reason': 'user_not_found'}
            )
            return {'success': False, 'error': 'Invalid credentials'}
        
        if not user.check_password(password):
            AuthService.log_action(
                user_id=user.id,
                action='login_failed',
                details={'username': username, 'reason': 'invalid_password'}
            )
            return {'success': False, 'error': 'Invalid credentials'}
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create session
        session = AuthService.create_session(user)
        
        # Log successful login
        AuthService.log_action(
            user_id=user.id,
            action='login_success',
            details={'username': username}
        )
        
        return {
            'success': True,
            'user': user.to_dict(),
            'session_token': session.session_token,
            'expires_at': session.expires_at.isoformat()
        }
    
    @staticmethod
    def create_session(user):
        """Create a new session for user"""
        # Clean up expired sessions
        AuthService.cleanup_expired_sessions()
        
        # Generate session token
        session_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + AuthService.SESSION_DURATION
        
        session = UserSession(
            user_id=user.id,
            session_token=session_token,
            expires_at=expires_at,
            ip_address=request.remote_addr if request else None,
            user_agent=request.headers.get('User-Agent') if request else None
        )
        
        db.session.add(session)
        db.session.commit()
        
        return session
    
    @staticmethod
    def validate_session(session_token):
        """Validate session token and return user"""
        if not session_token:
            return None
        
        session = UserSession.query.filter_by(session_token=session_token).first()
        
        if not session or session.is_expired():
            if session:
                # Remove expired session
                db.session.delete(session)
                db.session.commit()
            return None
        
        user = User.query.get(session.user_id)
        if not user or not user.is_active:
            return None
        
        return user
    
    @staticmethod
    def logout_user(session_token):
        """Logout user by invalidating session"""
        session = UserSession.query.filter_by(session_token=session_token).first()
        
        if session:
            user_id = session.user_id
            db.session.delete(session)
            db.session.commit()
            
            # Log logout
            AuthService.log_action(
                user_id=user_id,
                action='logout',
                details={'session_token': session_token[:8] + '...'}
            )
        
        return {'success': True}
    
    @staticmethod
    def cleanup_expired_sessions():
        """Remove expired sessions from database"""
        expired_sessions = UserSession.query.filter(
            UserSession.expires_at < datetime.utcnow()
        ).all()
        
        for session in expired_sessions:
            db.session.delete(session)
        
        if expired_sessions:
            db.session.commit()
    
    @staticmethod
    def log_action(user_id=None, action=None, resource_type=None, resource_id=None, details=None):
        """Log an action to the audit log"""
        try:
            audit_log = AuditLog(
                user_id=user_id,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                details=json.dumps(details) if details else None,
                ip_address=request.remote_addr if request else None,
                user_agent=request.headers.get('User-Agent') if request else None
            )
            
            db.session.add(audit_log)
            db.session.commit()
        except Exception as e:
            # Don't let audit logging break the main functionality
            print(f"Audit logging error: {e}")
    
    @staticmethod
    def get_audit_logs(limit=100, offset=0, user_id=None, action=None):
        """Get audit logs with optional filtering"""
        query = AuditLog.query
        
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        if action:
            query = query.filter_by(action=action)
        
        logs = query.order_by(AuditLog.timestamp.desc()).offset(offset).limit(limit).all()
        
        return [log.to_dict() for log in logs]
    
    @staticmethod
    def require_auth(f):
        """Decorator to require authentication for endpoints"""
        from functools import wraps
        
        @wraps(f)
        def decorated_function(*args, **kwargs):
            session_token = request.headers.get('Authorization')
            if session_token and session_token.startswith('Bearer '):
                session_token = session_token[7:]  # Remove 'Bearer ' prefix
            
            user = AuthService.validate_session(session_token)
            if not user:
                return {'error': 'Authentication required'}, 401
            
            # Add user to request context
            request.current_user = user
            return f(*args, **kwargs)
        
        return decorated_function
    
    @staticmethod
    def require_role(required_role):
        """Decorator to require specific role for endpoints"""
        from functools import wraps
        
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                if not hasattr(request, 'current_user'):
                    return {'error': 'Authentication required'}, 401
                
                user = request.current_user
                if user.role != required_role and user.role != 'admin':
                    return {'error': 'Insufficient permissions'}, 403
                
                return f(*args, **kwargs)
            return decorated_function
        return decorator
    
    @staticmethod
    def require_admin_whitelist(allowed_usernames=None, allowed_emails=None):
        """Decorator to restrict access to specific admin users only"""
        from functools import wraps
        import os
        
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                if not hasattr(request, 'current_user'):
                    return {'error': 'Authentication required'}, 401
                
                user = request.current_user
                
                # Get whitelist from environment or use defaults
                env_whitelist = os.getenv('ADMIN_WHITELIST', '')
                env_whitelist_emails = os.getenv('ADMIN_WHITELIST_EMAILS', '')
                
                # Combine provided lists with environment variables
                username_list = (allowed_usernames or []) + ([u.strip() for u in env_whitelist.split(',') if u.strip()] if env_whitelist else [])
                email_list = (allowed_emails or []) + ([e.strip() for e in env_whitelist_emails.split(',') if e.strip()] if env_whitelist_emails else [])
                
                # If whitelist is configured, check against it
                if username_list or email_list:
                    username_allowed = user.username in username_list if username_list else False
                    email_allowed = user.email in email_list if email_list else False
                    
                    if not (username_allowed or email_allowed):
                        AuthService.log_action(
                            user_id=user.id,
                            action='access_denied',
                            details={'username': user.username, 'email': user.email, 'reason': 'not_in_whitelist'}
                        )
                        return {'error': 'Access denied. This account is not authorized to access the admin dashboard.'}, 403
                
                # Also require admin role
                if user.role != 'admin':
                    return {'error': 'Insufficient permissions'}, 403
                
                return f(*args, **kwargs)
            return decorated_function
        return decorator
