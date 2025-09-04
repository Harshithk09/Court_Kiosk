# Court Kiosk System - Comprehensive Guide

A comprehensive court kiosk system for Domestic Violence Restraining Orders (DVRO) with priority-based queue management, LLM integration, and dual frontend interfaces for court facilitators and users.

## 🚀 Features

### 🎯 Priority-Based Queue System
- **Priority Levels**: A (DV cases), B (Civil/Elder abuse), C (Workplace violence), D (General)
- **Queue Numbers**: Format A001, B002, etc. (similar to Kaiser blood test system)
- **Real-time Updates**: Live queue status and estimated wait times
- **Email Notifications**: Automatic alerts to facilitators for new cases

### 🤖 LLM Integration
- **Context-Aware Chat**: AI assistant with flowchart context
- **Progress Tracking**: Automatic case summary generation
- **Multi-language Support**: English and Spanish
- **Smart Recommendations**: Form suggestions and next steps

### 🖥️ Dual Frontend Interfaces
- **User Interface**: Clean, accessible kiosk interface
- **Admin Dashboard**: Comprehensive facilitator management system
- **Responsive Design**: Works on desktop, tablet, and mobile

### 📊 Case Management
- **Progress Tracking**: Real-time user progress through flowcharts
- **Case Assignment**: Facilitator assignment and management
- **Summary Generation**: AI-powered case summaries for staff
- **Document Recommendations**: Automatic form suggestions

## 🏗️ System Architecture

### Backend (Flask)
```
court-kiosk/backend/
├── app.py                    # Main Flask application
├── enhanced_app.py           # Enhanced version with LLM features
├── flask_app.py              # Basic Flask app
├── models.py                 # Database models
├── queue_manager.py          # Queue management logic
├── config.py                 # Configuration settings
├── server.js                 # Node.js server (if needed)
├── requirements.txt          # Python dependencies
├── flowchart.json            # Flow configuration
├── routes/                   # API routes
├── utils/                    # Utility functions
│   ├── llm_service.py        # LLM integration
│   ├── case_summary_service.py
│   └── email_service.py
└── instance/
    └── court_kiosk.db       # SQLite database
```

### Frontend (React)
```
court-kiosk/frontend/src/
├── components/               # Reusable React components
├── pages/                    # Page components
│   ├── AdminDashboard.jsx    # Facilitator dashboard
│   ├── DVROPage.jsx          # DVRO interface
│   ├── UserKiosk.jsx         # User kiosk interface
│   ├── SummaryPage.tsx       # Case summary page
│   ├── DVPage.tsx            # DV page
│   └── FlowRunner.tsx        # Flow runner
├── contexts/                 # React contexts
│   ├── LanguageContext.js    # Multi-language support
│   └── LocationContext.js    # Location context
├── utils/                    # Utility functions
└── data/                     # Data files
    └── complete_dvro.json    # DV flowchart data
```

## 📋 Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 16 or higher (version 22.x recommended)
- **npm** or **yarn**
- **OpenAI API key** (for LLM features)

## 🛠️ Installation & Setup

### 1. Clone and Navigate to Project
```bash
cd court-kiosk
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env  # if available
# Edit .env with your configuration
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install Node.js dependencies
npm install

# Start development server
npm start
```

### 4. Environment Variables
Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=sqlite:///court_kiosk.db

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FACILITATOR_EMAIL=facilitator@court.gov

# Service Endpoints
SEARCH_SERVICE_URL=http://localhost:8000
QUEUE_SERVICE_URL=http://localhost:5001
RAG_SERVICE_URL=http://localhost:8000
API_BASE_URL=http://localhost:8000

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Security
SECRET_KEY=your-secret-key-here

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🚀 Running the Application

### Quick Start (from court-kiosk directory)
```bash
# Use the main run script
./run.sh

# Or use specific startup scripts
./start-enhanced-system.sh    # Enhanced system with LLM
./start-enhanced.sh           # Enhanced features
./start-integrated.sh         # Integrated system
./start-new-features.sh       # New features
```

### Manual Start
```bash
# Terminal 1: Start backend
cd backend
source venv/bin/activate
python app.py
# Backend available at http://localhost:5000

# Terminal 2: Start frontend
cd frontend
npm start
# Frontend available at http://localhost:3000
```

### Access Points
- **User Interface**: `http://localhost:3000`
- **DVRO Flow**: `http://localhost:3000/dvro`
- **Admin Dashboard**: `http://localhost:3000/admin`
- **API Endpoints**: `http://localhost:5000/api/*`

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest test_*.py
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🔧 Configuration

### Queue Priority System
- **Priority A**: Domestic Violence cases (highest priority)
- **Priority B**: Civil/Elder abuse cases
- **Priority C**: Workplace violence cases
- **Priority D**: General cases (lowest priority)

### Flowchart Configuration
- Edit `backend/flowchart.json` to modify the DVRO flow
- Use `frontend/src/data/complete_dvro.json` for frontend flow data

## 📚 Documentation

- **PROJECT_STRUCTURE.md**: Complete project organization
- **MIGRATION_GUIDE.md**: Migration and setup guide
- **DEPLOYMENT.md**: Deployment instructions
- **INFORMATIONAL_NODES.md**: Flowchart node documentation

## 🐛 Troubleshooting

### Common Issues
1. **Port conflicts**: Ensure ports 3000 and 5000 are available
2. **Python environment**: Activate virtual environment before running backend
3. **Node modules**: Run `npm install` in frontend directory
4. **Database**: Check `backend/instance/` for database files

### Error Handling
- Backend includes comprehensive error handling and logging
- Frontend has null checks and error boundaries
- Check console logs for detailed error information

## 🤝 Contributing

1. Follow the existing code structure
2. Test changes thoroughly
3. Update documentation as needed
4. Use the provided startup scripts for testing

## 📄 License

This project is for court system use. Please ensure compliance with local regulations and security requirements.
