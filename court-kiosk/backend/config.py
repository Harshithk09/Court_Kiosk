import os
from dotenv import load_dotenv

load_dotenv()

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
    
    # Service endpoints - configurable via environment variables
    SEARCH_SERVICE_URL = os.getenv('SEARCH_SERVICE_URL', 'http://localhost:8000')
    QUEUE_SERVICE_URL = os.getenv('QUEUE_SERVICE_URL', 'http://localhost:5001')
    RAG_SERVICE_URL = os.getenv('RAG_SERVICE_URL', 'http://localhost:8000')
    
    # API Keys - Single source of truth for all API keys
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    
    # File paths
    FLOWCHART_FILE = os.getenv('FLOWCHART_FILE', 'flowchart.json')
    
    # Queue configuration
    DEFAULT_QUEUE_PRIORITY = os.getenv('DEFAULT_QUEUE_PRIORITY', 'C')
    MAX_QUEUE_NUMBER = int(os.getenv('MAX_QUEUE_NUMBER', '999'))
    
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    
    # CORS configuration - Allow all origins for global access
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',') if os.getenv('CORS_ORIGINS') else ['*']
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    # Server configuration
    PORT = int(os.getenv('PORT', '5000'))
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