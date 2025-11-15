#!/usr/bin/env python3
"""
Environment Variable Validation Script

Validates that all required and recommended environment variables are set.
Run this script before starting the application to ensure proper configuration.

Usage:
    python validate_env.py
    python validate_env.py --strict  # Exit with error code if validation fails
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_success(message):
    print(f"{Colors.GREEN}✓{Colors.RESET} {message}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠{Colors.RESET} {message}")

def print_error(message):
    print(f"{Colors.RED}✗{Colors.RESET} {message}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ{Colors.RESET} {message}")

def print_header(message):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{message}{Colors.RESET}")
    print("=" * len(message))

# Required environment variables (application won't work without these)
REQUIRED_VARS = {
    'OPENAI_API_KEY': {
        'description': 'OpenAI API key for AI-powered case analysis',
        'example': 'sk-...',
        'validate': lambda v: v.startswith('sk-') if v else False
    },
    'SECRET_KEY': {
        'description': 'Secret key for session management and encryption',
        'example': 'your-secret-key-here (change in production!)',
        'validate': lambda v: len(v) >= 32 if v else False
    }
}

# Recommended environment variables (application works but may have limited functionality)
RECOMMENDED_VARS = {
    'RESEND_API_KEY': {
        'description': 'Resend API key for email delivery',
        'example': 're_...',
        'required_for': 'Email functionality',
        'validate': lambda v: v.startswith('re_') if v else False
    },
    'DATABASE_URL': {
        'description': 'Database connection URL',
        'example': 'sqlite:///court_kiosk.db (dev) or postgresql://... (prod)',
        'required_for': 'Database operations',
        'validate': lambda v: True if v else False
    },
    'FACILITATOR_EMAIL': {
        'description': 'Email address for facilitator notifications',
        'example': 'facilitator@court.gov',
        'required_for': 'Staff notifications',
        'validate': lambda v: '@' in v if v else False
    }
}

# Optional environment variables (nice to have)
OPTIONAL_VARS = {
    'CORS_ORIGINS': {
        'description': 'Comma-separated list of allowed CORS origins',
        'example': 'http://localhost:3000,https://court-kiosk.vercel.app',
        'default': '* (allows all origins)'
    },
    'LOG_LEVEL': {
        'description': 'Logging level (DEBUG, INFO, WARNING, ERROR)',
        'example': 'INFO',
        'default': 'INFO'
    },
    'PORT': {
        'description': 'Port number for the Flask server',
        'example': '5000',
        'default': '5000'
    },
    'FLASK_DEBUG': {
        'description': 'Enable Flask debug mode (True/False)',
        'example': 'False',
        'default': 'False'
    }
}

def validate_env_var(var_name, var_config):
    """Validate a single environment variable"""
    value = os.getenv(var_name)
    is_set = value is not None and value.strip() != ''
    
    if not is_set:
        return False, None, "Not set"
    
    # Run validation function if provided
    if 'validate' in var_config:
        is_valid = var_config['validate'](value)
        if not is_valid:
            return True, False, "Invalid format"
    
    return True, True, "Valid"

def check_required_vars():
    """Check required environment variables"""
    print_header("Required Environment Variables")
    all_valid = True
    
    for var_name, var_config in REQUIRED_VARS.items():
        is_set, is_valid, message = validate_env_var(var_name, var_config)
        
        if not is_set:
            print_error(f"{var_name}: {message}")
            print_info(f"  Description: {var_config['description']}")
            print_info(f"  Example: {var_config['example']}")
            all_valid = False
        elif is_valid is False:
            print_warning(f"{var_name}: {message}")
            print_info(f"  Description: {var_config['description']}")
            print_info(f"  Example: {var_config['example']}")
            all_valid = False
        else:
            # Mask sensitive values
            value = os.getenv(var_name)
            masked_value = value[:8] + '...' if len(value) > 8 else '***'
            print_success(f"{var_name}: Set ({masked_value})")
    
    return all_valid

def check_recommended_vars():
    """Check recommended environment variables"""
    print_header("Recommended Environment Variables")
    warnings = []
    
    for var_name, var_config in RECOMMENDED_VARS.items():
        is_set, is_valid, message = validate_env_var(var_name, var_config)
        
        if not is_set:
            print_warning(f"{var_name}: {message}")
            print_info(f"  Description: {var_config['description']}")
            print_info(f"  Required for: {var_config.get('required_for', 'N/A')}")
            print_info(f"  Example: {var_config['example']}")
            warnings.append(var_name)
        elif is_valid is False:
            print_warning(f"{var_name}: {message}")
            print_info(f"  Description: {var_config['description']}")
            warnings.append(var_name)
        else:
            # Mask sensitive values
            value = os.getenv(var_name)
            if 'API_KEY' in var_name or 'SECRET' in var_name:
                masked_value = value[:8] + '...' if len(value) > 8 else '***'
            else:
                masked_value = value
            print_success(f"{var_name}: Set ({masked_value})")
    
    return warnings

def check_optional_vars():
    """Check optional environment variables"""
    print_header("Optional Environment Variables")
    
    for var_name, var_config in OPTIONAL_VARS.items():
        value = os.getenv(var_name)
        if value:
            print_success(f"{var_name}: Set ({value})")
        else:
            default = var_config.get('default', 'Not set')
            print_info(f"{var_name}: {default}")
            print_info(f"  Description: {var_config['description']}")

def main():
    """Main validation function"""
    print(f"\n{Colors.BOLD}Environment Variable Validation{Colors.RESET}")
    print("=" * 50)
    
    # Check required variables
    required_valid = check_required_vars()
    
    # Check recommended variables
    recommended_warnings = check_recommended_vars()
    
    # Check optional variables
    check_optional_vars()
    
    # Summary
    print_header("Validation Summary")
    
    if required_valid:
        print_success("All required environment variables are set")
    else:
        print_error("Some required environment variables are missing or invalid")
    
    if recommended_warnings:
        print_warning(f"{len(recommended_warnings)} recommended variable(s) missing:")
        for var in recommended_warnings:
            print(f"  - {var}")
        print_info("Application will work but some features may be limited")
    else:
        print_success("All recommended environment variables are set")
    
    # Exit code
    strict_mode = '--strict' in sys.argv
    if strict_mode and not required_valid:
        print(f"\n{Colors.RED}Validation failed in strict mode. Exiting with error code.{Colors.RESET}")
        sys.exit(1)
    elif not required_valid:
        print(f"\n{Colors.YELLOW}Warning: Some required variables are missing. Application may not work correctly.{Colors.RESET}")
        sys.exit(1)
    else:
        print(f"\n{Colors.GREEN}Validation passed!{Colors.RESET}")
        sys.exit(0)

if __name__ == '__main__':
    main()

