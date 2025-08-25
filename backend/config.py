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
    
    # Service endpoints - configurable via environment variables
    SEARCH_SERVICE_URL = os.getenv('SEARCH_SERVICE_URL', 'http://localhost:8000')
    QUEUE_SERVICE_URL = os.getenv('QUEUE_SERVICE_URL', 'http://localhost:5001')
    RAG_SERVICE_URL = os.getenv('RAG_SERVICE_URL', 'http://localhost:8000')
    
    # OpenAI configuration
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    
    # File paths
    FLOWCHART_FILE = os.getenv('FLOWCHART_FILE', 'flowchart.json')
    
    # Queue configuration
    DEFAULT_QUEUE_PRIORITY = os.getenv('DEFAULT_QUEUE_PRIORITY', 'C')
    MAX_QUEUE_NUMBER = int(os.getenv('MAX_QUEUE_NUMBER', '999'))
    
    # Security
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    
    # CORS configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # Logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    @staticmethod
    def get_search_url():
        """Get the search service URL with proper error handling"""
        url = Config.SEARCH_SERVICE_URL
        if not url:
            raise ValueError("SEARCH_SERVICE_URL not configured")
        return url.rstrip('/')
    
    @staticmethod
    def get_queue_url():
        """Get the queue service URL with proper error handling"""
        url = Config.QUEUE_SERVICE_URL
        if not url:
            raise ValueError("QUEUE_SERVICE_URL not configured")
        return url.rstrip('/')
    
    @staticmethod
    def get_rag_url():
        """Get the RAG service URL with proper error handling"""
        url = Config.RAG_SERVICE_URL
        if not url:
            raise ValueError("RAG_SERVICE_URL not configured")
        return url.rstrip('/') 