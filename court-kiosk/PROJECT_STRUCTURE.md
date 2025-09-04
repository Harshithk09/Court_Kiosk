# Court Kiosk Project Structure

This document outlines the complete structure of the Court Kiosk project, which has been consolidated and cleaned up into this directory.

## Directory Structure

```
court-kiosk/
├── backend/                    # Python Flask backend
│   ├── app.py                 # Main Flask application
│   ├── enhanced_app.py        # Enhanced version with LLM features
│   ├── flask_app.py           # Basic Flask app
│   ├── server.js              # Node.js server (if needed)
│   ├── models.py              # Database models
│   ├── config.py              # Configuration settings
│   ├── queue_manager.py       # Queue management system
│   ├── test_app.py            # Test application
│   ├── test_server.py         # Server tests
│   ├── run_server.py          # Server runner script
│   ├── requirements.txt       # Python dependencies
│   ├── flowchart.json         # Flow configuration
│   ├── routes/                # API routes
│   ├── utils/                 # Utility functions
│   │   ├── llm_service.py     # LLM integration
│   │   ├── case_summary_service.py
│   │   └── email_service.py
│   ├── instance/              # Database instance
│   └── venv/                  # Python virtual environment
├── frontend/                   # React frontend
│   ├── src/                   # Source code
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   │   ├── AdminDashboard.jsx    # Facilitator dashboard
│   │   │   ├── DVROPage.jsx          # DVRO interface
│   │   │   ├── UserKiosk.jsx         # User kiosk interface
│   │   │   ├── SummaryPage.tsx       # Case summary page
│   │   │   ├── DVPage.tsx            # DV page
│   │   │   └── FlowRunner.tsx        # Flow runner
│   │   ├── contexts/          # React contexts
│   │   ├── utils/             # Utility functions
│   │   └── data/              # Data files
│   ├── public/                # Public assets
│   ├── build/                 # Build output
│   ├── package.json           # Node.js dependencies
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── postcss.config.js      # PostCSS config
│   ├── build-test.sh          # Build test script
│   ├── complete_dvro.json     # DVRO flow data
│   └── node_modules/          # Node.js dependencies
├── openai/                     # OpenAI integration
├── venv/                      # Python virtual environment
├── chroma_service.py          # ChromaDB service
├── package.json               # Root-level dependencies
├── .gitignore                 # Git ignore rules
├── vercel.json                # Vercel deployment config
├── run.sh                     # Main run script
├── start-enhanced-system.sh   # Enhanced system startup
├── start-enhanced.sh          # Enhanced startup
├── start-integrated.sh        # Integrated startup
├── start-new-features.sh      # New features startup
├── dev-setup.sh               # Development setup
├── test_backend.py            # Backend tests
├── dv_flow_combined.json      # Combined flow data
├── PROJECT_STRUCTURE.md       # This file
├── MIGRATION_GUIDE.md         # Migration guide
├── cleanup_duplicates.sh      # Cleanup script
└── README.md                  # Main documentation
```

## Key Files

### Backend
- **app.py**: Main Flask application with all routes and functionality
- **enhanced_app.py**: Enhanced version with additional features
- **models.py**: Database models for the application
- **queue_manager.py**: Manages user queues and sessions
- **config.py**: Configuration settings and environment variables
- **server.js**: Node.js server (if needed)
- **routes/**: API routes directory

### Frontend
- **src/components/**: Reusable React components
- **src/pages/**: Page-level components including:
  - `SummaryPage.tsx`: Case summary page
  - `DVPage.tsx`: DV page
  - `FlowRunner.tsx`: Flow runner
  - `AdminDashboard.jsx`: Facilitator dashboard
  - `DVROPage.jsx`: DVRO interface
  - `UserKiosk.jsx`: User kiosk interface
- **src/contexts/**: React contexts for state management
- **src/utils/**: Utility functions and helpers
- **src/data/**: JSON data files for flows

### Configuration
- **package.json**: Root-level Node.js dependencies and scripts
- **frontend/package.json**: Frontend-specific dependencies
- **backend/requirements.txt**: Python dependencies
- **frontend/tailwind.config.js**: Tailwind CSS configuration
- **vercel.json**: Vercel deployment configuration

### Scripts
- **run.sh**: Main application runner
- **start-*.sh**: Various startup scripts for different configurations
- **dev-setup.sh**: Development environment setup
- **cleanup_duplicates.sh**: Script to remove duplicate files

## Recent Cleanup Actions

✅ **Duplicates Removed:**
- Removed duplicate `.nvmrc` files (kept frontend version)
- Removed duplicate `tailwind.config.js` files (kept frontend version)
- Removed duplicate `package-lock.json` files
- Removed duplicate README files (consolidated into one comprehensive README)

✅ **Files Reorganized:**
- Moved React components (`SummaryPage.tsx`, `DVPage.tsx`, `FlowRunner.tsx`) to `frontend/src/pages/`
- Consolidated all documentation into single, comprehensive files
- Maintained proper separation between backend and frontend

✅ **Structure Optimized:**
- Single source of truth for all project files
- Clear separation of concerns
- No file duplication
- Proper file locations

## Getting Started

1. **Setup Python Environment**:
   ```bash
   cd court-kiosk
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r backend/requirements.txt
   ```

2. **Setup Node.js Environment**:
   ```bash
   cd frontend
   npm install
   ```

3. **Run the Application**:
   ```bash
   # From court-kiosk directory
   ./run.sh
   # Or use specific startup scripts
   ./start-enhanced-system.sh
   ```

## Development

- **Backend development**: Work in the `backend/` directory
- **Frontend development**: Work in the `frontend/` directory
- **Configuration files**: Located at root level for easy access
- **Startup scripts**: Use the provided scripts for different configurations

## Notes

- This directory contains all project files consolidated from the root workspace
- All duplicates have been removed and files are properly organized
- The backend and frontend directories contain the main application code
- Configuration and startup scripts are at the root level for easy access
- React components are properly located in `frontend/src/pages/`
