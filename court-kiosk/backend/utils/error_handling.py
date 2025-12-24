"""
Error Handling Utilities
========================
Comprehensive error handling patterns and utilities
"""

import logging
import traceback
from functools import wraps
from flask import jsonify, request
from datetime import datetime

logger = logging.getLogger(__name__)

# ============================================================================
# ERROR RESPONSE BUILDER
# ============================================================================

class ErrorResponse:
    """Standardized error response builder"""
    
    @staticmethod
    def bad_request(message: str, errors: list = None):
        """400 Bad Request"""
        response = {
            'success': False,
            'error': message,
            'code': 'BAD_REQUEST'
        }
        if errors:
            response['errors'] = errors
        return jsonify(response), 400
    
    @staticmethod
    def unauthorized(message: str = "Unauthorized"):
        """401 Unauthorized"""
        return jsonify({
            'success': False,
            'error': message,
            'code': 'UNAUTHORIZED'
        }), 401
    
    @staticmethod
    def forbidden(message: str = "Forbidden"):
        """403 Forbidden"""
        return jsonify({
            'success': False,
            'error': message,
            'code': 'FORBIDDEN'
        }), 403
    
    @staticmethod
    def not_found(message: str = "Resource not found"):
        """404 Not Found"""
        return jsonify({
            'success': False,
            'error': message,
            'code': 'NOT_FOUND'
        }), 404
    
    @staticmethod
    def internal_error(message: str = "An internal error occurred", log_details: str = None):
        """500 Internal Server Error"""
        if log_details:
            logger.error(f"Internal error: {log_details}", exc_info=True)
        
        return jsonify({
            'success': False,
            'error': message,
            'code': 'INTERNAL_ERROR'
        }), 500
    
    @staticmethod
    def service_unavailable(message: str = "Service temporarily unavailable"):
        """503 Service Unavailable"""
        return jsonify({
            'success': False,
            'error': message,
            'code': 'SERVICE_UNAVAILABLE'
        }), 503

# ============================================================================
# ERROR LOGGING UTILITIES
# ============================================================================

def log_error_detailed(error: Exception, context: str = "", extra_data: dict = None):
    """Detailed error logging with context"""
    error_details = {
        'error_type': type(error).__name__,
        'error_message': str(error),
        'context': context,
        'timestamp': datetime.utcnow().isoformat()
    }
    
    if extra_data:
        error_details.update(extra_data)
    
    logger.error(
        f"{context} - {type(error).__name__}: {str(error)}",
        extra=error_details,
        exc_info=True  # Includes full traceback
    )

def log_error_with_traceback(error: Exception, context: str = ""):
    """Log error with full traceback"""
    logger.error(
        f"{context}: {str(error)}\n{traceback.format_exc()}",
        exc_info=True
    )

# ============================================================================
# CUSTOM EXCEPTIONS
# ============================================================================

class DatabaseError(Exception):
    """Custom exception for database errors"""
    pass

class EmailError(Exception):
    """Custom exception for email errors"""
    pass

class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass

class QueueError(Exception):
    """Custom exception for queue errors"""
    pass

# ============================================================================
# SPECIFIC ERROR HANDLERS
# ============================================================================

def handle_database_error(error: Exception, operation: str):
    """Handle database-specific errors"""
    logger.error(
        f"Database error during {operation}: {str(error)}",
        extra={
            'operation': operation,
            'error_type': type(error).__name__
        },
        exc_info=True
    )
    
    # Check for specific database errors
    error_msg = str(error).lower()
    
    if 'connection' in error_msg:
        return ErrorResponse.service_unavailable(
            "Database connection error. Please try again."
        )
    elif 'timeout' in error_msg:
        return ErrorResponse.service_unavailable(
            "Database operation timed out. Please try again."
        )
    elif 'duplicate' in error_msg or 'unique' in error_msg:
        return ErrorResponse.bad_request(
            "This record already exists."
        )
    else:
        return ErrorResponse.internal_error(
            "A database error occurred. Please try again."
        )

def handle_email_error(error: Exception, email_address: str):
    """Handle email-specific errors"""
    logger.error(
        f"Email error for {email_address}: {str(error)}",
        extra={
            'email': email_address,
            'error_type': type(error).__name__
        },
        exc_info=True
    )
    
    error_msg = str(error).lower()
    
    if 'smtp' in error_msg or 'connection' in error_msg:
        return ErrorResponse.service_unavailable(
            "Email service temporarily unavailable. Please try again later."
        )
    elif 'invalid' in error_msg or 'address' in error_msg:
        return ErrorResponse.bad_request(
            "Invalid email address."
        )
    else:
        return ErrorResponse.internal_error(
            "Failed to send email. Please try again."
        )

# ============================================================================
# ERROR HANDLING DECORATOR
# ============================================================================

def handle_errors(func):
    """Decorator to handle errors consistently across endpoints"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ValueError as e:
            logger.warning(f"Validation error in {func.__name__}: {str(e)}")
            return ErrorResponse.bad_request(str(e))
        except KeyError as e:
            logger.warning(f"Missing required field in {func.__name__}: {str(e)}")
            return ErrorResponse.bad_request(f"Missing required field: {str(e)}")
        except DatabaseError as e:
            return handle_database_error(e, func.__name__)
        except EmailError as e:
            return handle_email_error(e, "unknown")
        except Exception as e:
            log_error_detailed(
                error=e,
                context=f"Error in {func.__name__}",
                extra_data={
                    'endpoint': request.endpoint if request else None,
                    'method': request.method if request else None,
                    'path': request.path if request else None
                }
            )
            return ErrorResponse.internal_error()
    return wrapper

