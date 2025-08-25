# Court Kiosk Backend - Cleaned Up

This backend has been cleaned up and consolidated for better maintainability and security.

## File Structure

### Core Application Files
- `app.py` - Main Flask application (port 5001)
- `enhanced_app.py` - Enhanced Flask application with queue management (port 5000)
- `config.py` - **Single source of truth for all configuration and API keys**
- `models.py` - Database models
- `queue_manager.py` - Queue management system
- `requirements.txt` - Python dependencies

### Utilities
- `utils/llm_service.py` - LLM integration service
- `utils/` - Other utility modules

### Configuration
- `env.template` - Template for environment variables
- `.env` - Your actual environment variables (create from template)

### Data
- `flowchart.json` - Flowchart data
- `instance/` - Database files

## API Key Management

**All API keys are now centralized in `config.py`** and loaded from environment variables.

### Required Environment Variables

Create a `.env` file in the backend directory with:

```bash
# Required API Keys
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FACILITATOR_EMAIL=facilitator@court.gov

# Database Configuration
DATABASE_URL=sqlite:///court_kiosk.db

# Server Configuration
PORT=5000
FLASK_DEBUG=False
SECRET_KEY=your-secret-key-here
```

### Optional Environment Variables

```bash
# Service endpoints
SEARCH_SERVICE_URL=http://localhost:8000
QUEUE_SERVICE_URL=http://localhost:5001
RAG_SERVICE_URL=http://localhost:8000

# Additional API keys
GOOGLE_API_KEY=your_google_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Queue configuration
DEFAULT_QUEUE_PRIORITY=C
MAX_QUEUE_NUMBER=999

# CORS settings
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=INFO
```

## Setup Instructions

1. **Copy the environment template:**
   ```bash
   cp env.template .env
   ```

2. **Edit `.env` with your actual values:**
   - Get your OpenAI API key from https://platform.openai.com/
   - Set up Gmail app password for email notifications
   - Configure other settings as needed

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```bash
   # For enhanced version (recommended)
   python enhanced_app.py
   
   # For basic version
   python app.py
   ```

## Removed Files

The following redundant files have been removed:
- `flask_app.py` - Old Flask application
- `server.js` - Node.js server (not needed)
- `package.json` - Node.js dependencies
- `package-lock.json` - Node.js lock file
- `test_app.py` - Test file
- `test_queue.py` - Test file
- `routes/semanticSearch.js` - Node.js route
- `utils/supabaseClient.js` - Node.js utility
- `node_modules/` - Node.js modules

## Benefits of Cleanup

1. **Single Configuration Source**: All API keys and settings are in `config.py`
2. **Better Security**: No hardcoded API keys in multiple files
3. **Simplified Structure**: Removed redundant and unused files
4. **Easier Maintenance**: Clear separation of concerns
5. **Consistent Environment**: All applications use the same configuration

## Validation

The system now validates required API keys on startup and provides clear warnings if any are missing.

## Support

If you need to add new API keys or configuration options, add them to `config.py` and update the `env.template` file.
