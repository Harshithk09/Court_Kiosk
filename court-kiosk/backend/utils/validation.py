"""
Input Validation Utilities
===========================
Comprehensive validation functions for all user inputs
"""

import re
from typing import Optional, Dict, Any, List
import bleach

# ============================================================================
# EMAIL VALIDATION
# ============================================================================

EMAIL_REGEX = re.compile(
    r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
)

def validate_email(email: str) -> Dict[str, Any]:
    """Validate email address"""
    if not email:
        return {
            'valid': False,
            'error': 'Email is required'
        }
    
    email = email.strip()
    
    if len(email) < 5:
        return {
            'valid': False,
            'error': 'Email is too short'
        }
    
    if len(email) > 254:
        return {
            'valid': False,
            'error': 'Email is too long'
        }
    
    if not EMAIL_REGEX.match(email):
        return {
            'valid': False,
            'error': 'Invalid email format'
        }
    
    if email.count('@') != 1:
        return {
            'valid': False,
            'error': 'Email must contain exactly one @ symbol'
        }
    
    local, domain = email.split('@')
    
    if not local or not domain:
        return {
            'valid': False,
            'error': 'Invalid email structure'
        }
    
    if len(local) > 64:
        return {
            'valid': False,
            'error': 'Email local part is too long'
        }
    
    if '.' not in domain:
        return {
            'valid': False,
            'error': 'Email domain must contain at least one dot'
        }
    
    return {
        'valid': True,
        'error': None,
        'email': email.lower()
    }

# ============================================================================
# PHONE NUMBER VALIDATION
# ============================================================================

PHONE_PATTERNS = [
    re.compile(r'^\+1[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$'),
    re.compile(r'^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$'),
    re.compile(r'^\d{10}$'),
    re.compile(r'^\d{3}[\s.-]\d{3}[\s.-]\d{4}$'),
]

def validate_phone_number(phone: str, country_code: str = 'US') -> Dict[str, Any]:
    """Validate phone number"""
    if not phone:
        return {
            'valid': False,
            'error': 'Phone number is required'
        }
    
    phone = phone.strip()
    digits_only = re.sub(r'\D', '', phone)
    
    if country_code == 'US':
        if len(digits_only) < 10:
            return {
                'valid': False,
                'error': 'Phone number is too short'
            }
        
        if len(digits_only) > 11:
            return {
                'valid': False,
                'error': 'Phone number is too long'
            }
        
        if len(digits_only) == 11 and digits_only.startswith('1'):
            digits_only = digits_only[1:]
        
        valid_format = any(pattern.match(phone) for pattern in PHONE_PATTERNS)
        
        if not valid_format and len(digits_only) != 10:
            return {
                'valid': False,
                'error': 'Invalid phone number format'
            }
        
        formatted = f"({digits_only[:3]}) {digits_only[3:6]}-{digits_only[6:]}"
        
        return {
            'valid': True,
            'error': None,
            'formatted': formatted,
            'digits': digits_only
        }
    else:
        if len(digits_only) < 7 or len(digits_only) > 15:
            return {
                'valid': False,
                'error': 'Invalid international phone number length'
            }
        
        return {
            'valid': True,
            'error': None,
            'formatted': phone,
            'digits': digits_only
        }

# ============================================================================
# TEXT INPUT VALIDATION
# ============================================================================

def validate_text_input(
    text: str,
    field_name: str,
    min_length: int = 1,
    max_length: int = 500,
    allow_empty: bool = False,
    allowed_chars: Optional[str] = None
) -> Dict[str, Any]:
    """Validate text input with length and character restrictions"""
    if text is None:
        text = ""
    
    text = text.strip()
    
    if not text:
        if allow_empty:
            return {
                'valid': True,
                'error': None,
                'sanitized': text
            }
        else:
            return {
                'valid': False,
                'error': f'{field_name} is required'
            }
    
    if len(text) < min_length:
        return {
            'valid': False,
            'error': f'{field_name} must be at least {min_length} characters'
        }
    
    if len(text) > max_length:
        return {
            'valid': False,
            'error': f'{field_name} cannot exceed {max_length} characters'
        }
    
    if allowed_chars:
        if not re.match(allowed_chars, text):
            return {
                'valid': False,
                'error': f'{field_name} contains invalid characters'
            }
    
    # Sanitize HTML (prevent XSS)
    sanitized = bleach.clean(text, tags=[], strip=True)
    
    return {
        'valid': True,
        'error': None,
        'sanitized': sanitized
    }

# ============================================================================
# NAME VALIDATION
# ============================================================================

def validate_name(name: str) -> Dict[str, Any]:
    """Validate person's name"""
    NAME_PATTERN = r"^[a-zA-Z\s\-'\.]+$"
    
    return validate_text_input(
        text=name,
        field_name='Name',
        min_length=2,
        max_length=100,
        allow_empty=False,
        allowed_chars=NAME_PATTERN
    )

# ============================================================================
# CASE TYPE VALIDATION
# ============================================================================

VALID_CASE_TYPES = ['DVRO', 'DIVORCE', 'CHRO', 'CUSTODY', 'OTHER', 'OTHER_FAMILY_LAW']
VALID_PRIORITIES = ['A', 'B', 'C', 'D']

def validate_case_type(case_type: str) -> Dict[str, Any]:
    """Validate case type"""
    if not case_type:
        return {
            'valid': False,
            'error': 'Case type is required'
        }
    
    case_type = case_type.strip().upper()
    
    if case_type not in VALID_CASE_TYPES:
        return {
            'valid': False,
            'error': f'Invalid case type. Must be one of: {", ".join(VALID_CASE_TYPES)}'
        }
    
    return {
        'valid': True,
        'error': None,
        'case_type': case_type
    }

def validate_priority(priority: str) -> Dict[str, Any]:
    """Validate priority level"""
    if not priority:
        return {
            'valid': False,
            'error': 'Priority is required'
        }
    
    priority = priority.strip().upper()
    
    if priority not in VALID_PRIORITIES:
        return {
            'valid': False,
            'error': f'Invalid priority. Must be one of: {", ".join(VALID_PRIORITIES)}'
        }
    
    return {
        'valid': True,
        'error': None,
        'priority': priority
    }

# ============================================================================
# QUEUE NUMBER VALIDATION
# ============================================================================

def validate_queue_number(queue_number: Any) -> Dict[str, Any]:
    """Validate queue number"""
    if queue_number is None:
        return {
            'valid': False,
            'error': 'Queue number is required'
        }
    
    if isinstance(queue_number, str):
        try:
            queue_number = int(queue_number)
        except ValueError:
            return {
                'valid': False,
                'error': 'Queue number must be a number'
            }
    
    if not isinstance(queue_number, int):
        return {
            'valid': False,
            'error': 'Queue number must be an integer'
        }
    
    if queue_number < 1 or queue_number > 9999:
        return {
            'valid': False,
            'error': 'Queue number must be between 1 and 9999'
        }
    
    return {
        'valid': True,
        'error': None,
        'queue_number': queue_number
    }

# ============================================================================
# REQUEST PAYLOAD VALIDATION
# ============================================================================

def validate_email_request(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate email request payload"""
    errors = []
    validated_data = {}
    
    # Validate email
    email = data.get('email')
    email_result = validate_email(email)
    if not email_result['valid']:
        errors.append(f"Email: {email_result['error']}")
    else:
        validated_data['email'] = email_result['email']
    
    # Validate case_data if present
    case_data = data.get('case_data', {})
    
    if 'case_type' in case_data:
        case_type_result = validate_case_type(case_data['case_type'])
        if not case_type_result['valid']:
            errors.append(f"Case type: {case_type_result['error']}")
        else:
            validated_data['case_type'] = case_type_result['case_type']
    
    if 'user_name' in case_data and case_data['user_name']:
        name_result = validate_name(case_data['user_name'])
        if not name_result['valid']:
            errors.append(f"Name: {name_result['error']}")
        else:
            validated_data['user_name'] = name_result['sanitized']
    
    if 'phone_number' in case_data and case_data['phone_number']:
        phone_result = validate_phone_number(case_data['phone_number'])
        if not phone_result['valid']:
            errors.append(f"Phone: {phone_result['error']}")
        else:
            validated_data['phone_number'] = phone_result['formatted']
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'validated_data': validated_data
    }

def validate_queue_request(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate add to queue request"""
    errors = []
    validated_data = {}
    
    # Validate case type (required)
    case_type = data.get('case_type')
    case_type_result = validate_case_type(case_type)
    if not case_type_result['valid']:
        errors.append(case_type_result['error'])
    else:
        validated_data['case_type'] = case_type_result['case_type']
    
    # Validate priority (required)
    priority = data.get('priority') or data.get('priority_level')
    priority_result = validate_priority(priority)
    if not priority_result['valid']:
        errors.append(priority_result['error'])
    else:
        validated_data['priority'] = priority_result['priority']
        validated_data['priority_level'] = priority_result['priority']
    
    # Validate user name (optional)
    user_name = data.get('user_name')
    if user_name:
        name_result = validate_name(user_name)
        if not name_result['valid']:
            errors.append(name_result['error'])
        else:
            validated_data['user_name'] = name_result['sanitized']
    
    # Validate email (optional)
    user_email = data.get('user_email')
    if user_email:
        email_result = validate_email(user_email)
        if not email_result['valid']:
            errors.append(email_result['error'])
        else:
            validated_data['user_email'] = email_result['email']
    
    # Validate phone (optional)
    phone_number = data.get('phone_number')
    if phone_number:
        phone_result = validate_phone_number(phone_number)
        if not phone_result['valid']:
            errors.append(phone_result['error'])
        else:
            validated_data['phone_number'] = phone_result['formatted']
    
    # Validate language (optional)
    language = data.get('language', 'en')
    if language not in ['en', 'es']:
        errors.append('Language must be "en" or "es"')
    else:
        validated_data['language'] = language
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'validated_data': validated_data
    }

