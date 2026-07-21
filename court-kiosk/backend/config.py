import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Safe local-dev CORS defaults (never use '*' with credentials)
_DEFAULT_CORS = 'http://localhost:3000,http://127.0.0.1:3000'


class Config:
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///court_kiosk.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Email configuration
    EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
    EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
    EMAIL_USER = os.getenv('EMAIL_USER')
    EMAIL_PASS = os.getenv('EMAIL_PASS')
    FACILITATOR_EMAIL = os.getenv('FACILITATOR_EMAIL')
    
    # Resend email service
    RESEND_API_KEY = os.getenv('RESEND_API_KEY')
    RESEND_FROM_DOMAIN = os.getenv('RESEND_FROM_DOMAIN')
    RESEND_FROM_EMAIL = os.getenv('RESEND_FROM_EMAIL')
    
    # Service endpoints
    SEARCH_SERVICE_URL = os.getenv('SEARCH_SERVICE_URL', 'http://localhost:8000')
    QUEUE_SERVICE_URL = os.getenv('QUEUE_SERVICE_URL', 'http://localhost:5001')
    RAG_SERVICE_URL = os.getenv('RAG_SERVICE_URL', 'http://localhost:8000')
    
    # API Keys
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    # File paths
    FLOWCHART_FILE = os.getenv('FLOWCHART_FILE', 'flowchart.json')
    
    # Queue configuration
    DEFAULT_QUEUE_PRIORITY = os.getenv('DEFAULT_QUEUE_PRIORITY', 'C')
    MAX_QUEUE_NUMBER = int(os.getenv('MAX_QUEUE_NUMBER', '999'))
    
    # Security — require SECRET_KEY in production; weak default only for local SQLite
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        SECRET_KEY = 'dev-only-insecure-secret-key'
        if os.getenv('FLASK_ENV') == 'production' or os.getenv('RENDER') or os.getenv('VERCEL'):
            logger.warning('SECRET_KEY is not set — sessions are insecure. Set SECRET_KEY in the environment.')

    # Bootstrap admin (only created when ADMIN_PASSWORD is set; never hardcode a default password)
    ADMIN_USERNAME = os.getenv('ADMIN_USERNAME', 'admin')
    ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@court.gov')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')  # required to create/reset bootstrap admin

    # Optional shared secret for kiosk LLM endpoints (X-Kiosk-Key header)
    KIOSK_API_KEY = os.getenv('KIOSK_API_KEY')

    # CORS — comma-separated allowlist. Never default to '*'
    _cors_raw = os.getenv('CORS_ORIGINS', _DEFAULT_CORS).strip()
    if _cors_raw == '*':
        logger.warning('CORS_ORIGINS=* is insecure; prefer an explicit allowlist.')
        CORS_ORIGINS = ['*']
    else:
        CORS_ORIGINS = [o.strip() for o in _cors_raw.split(',') if o.strip()]
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    # Server configuration
    PORT = int(os.getenv('PORT', '5001'))
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    @staticmethod
    def get_search_url():
        """Get the search service URL with proper error handling"""
        return Config.SEARCH_SERVICE_URL
    
    @staticmethod
    def validate_required_keys():
        """Validate that required API keys are present"""
        required_keys = ['OPENAI_API_KEY']
        missing_keys = [key for key in required_keys if not getattr(Config, key)]
        
        if missing_keys:
            print(f"Warning: Missing required API keys: {', '.join(missing_keys)}")
            print("Some features may not work properly.")
            return False
        return True
