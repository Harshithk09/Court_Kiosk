# Court Kiosk System - DVRO Flow

A comprehensive court kiosk system for Domestic Violence Restraining Orders (DVRO) with improved error handling, configuration management, and testing.

## Recent Fixes Applied

### Backend Issues Fixed:
1. **Tailwind Config Issue**: Removed embedded Tailwind configuration from `server.js` that was overriding Express module exports
2. **Form Handling**: Added null checks for forms and nextSteps arrays to prevent runtime errors
3. **Hard-coded Endpoints**: Created `config.py` with configurable service endpoints via environment variables
4. **Unprotected File Reads**: Added proper error handling for `flowchart.json` file operations
5. **Queue Numbering**: Fixed queue number extraction to handle case types with multiple characters
6. **Testing**: Added comprehensive test suite for both backend and frontend

### Frontend Issues Fixed:
1. **Missing Components**: Recreated `SummaryPage.jsx` component that was accidentally deleted
2. **Type Safety**: Added proper null checks and error handling
3. **Testing**: Added basic frontend tests

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8 or higher
- npm or yarn

### Installation

1. **Clone and navigate to the project:**
```bash
cd court-kiosk
```

2. **Install frontend dependencies:**
```bash
cd frontend
npm install
```

3. **Install backend dependencies:**
```bash
cd ../backend
npm install
pip install -r requirements.txt
```

### Running the Application

1. **Start the frontend (React):**
```bash
cd frontend
npm start
```
The frontend will be available at `http://localhost:3000`

2. **Start the backend (Flask):**
```bash
cd backend
python app.py
```
The backend will be available at `http://localhost:5000`

3. **Access the DVRO Flow:**
Navigate to `http://localhost:3000/dvro` to access the DVRO flow system.

## Configuration

### Environment Variables

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

# Base URL for semantic search service
API_BASE_URL=http://localhost:8000

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Security
SECRET_KEY=your-secret-key-here

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

Create a `.env` file in the frontend directory:

```env
# Base URL for API requests
VITE_API_URL=http://localhost:5001
```

## Testing

### Backend Tests
```bash
cd backend
npm test
# or
python test_app.py
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Features

### DVRO Flow System
- **Guided Questions**: Step-by-step questionnaire with contextual information
- **Bilingual Support**: English and Spanish language support
- **Form Recommendations**: Automatic form suggestions based on user answers
- **Priority Queue**: Automatic Priority A assignment for DVRO cases
- **Comprehensive Summary**: Detailed end summary with action steps

### Key Components
- `FlowRunner.jsx`: Main flow controller component
- `SummaryPage.jsx`: End summary display
- `dv_flow_combined.json`: Flow configuration
- `app.py`: Backend API with improved error handling
- `config.py`: Centralized configuration management

### Flow Structure
1. **Menu**: Choose DVRO action (new, respond, change/end, renew)
2. **Safety Check**: Immediate danger assessment
3. **Relationship**: Domestic vs non-domestic relationship
4. **Children**: Child custody considerations
5. **Support**: Financial support requests
6. **Forms Overview**: Required forms explanation
7. **Process Steps**: Filing, service, hearing preparation
8. **Summary**: Comprehensive case summary

## API Endpoints

### Core Endpoints
- `GET /api/health`: Health check
- `POST /api/generate-queue`: Generate queue number
- `GET /api/queue`: Get current queue
- `POST /api/call-next`: Call next person
- `POST /api/complete-case`: Complete case
- `POST /api/dvro_rag`: DVRO RAG system
- `GET /api/flowchart`: Get flowchart data

### Form Endpoints
- `POST /api/send-email`: Send form recommendations
- `POST /api/generate-pdf`: Generate PDF summary

## Error Handling

The system now includes comprehensive error handling:
- File read operations with proper error messages
- Null checks for all array operations
- Configurable service endpoints
- Graceful degradation for missing services
- Proper HTTP status codes and error responses

## Queue System

The queue system supports:
- Multiple case types (DVRO, Civil Harassment, etc.)
- Priority-based ordering (A, B, C)
- Multi-language support
- Robust queue number generation
- Status tracking (waiting, called, completed)

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update configuration as needed
4. Ensure error handling is in place
5. Test in both English and Spanish

## License

This project is for court system use and should be deployed according to local court policies and security requirements.
