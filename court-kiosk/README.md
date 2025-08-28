# Court Kiosk System

A comprehensive court kiosk system for managing domestic violence restraining orders and other legal procedures with interactive flow navigation, high-resolution PDF exports, and hyperlinked forms.

## 🚀 Features

### ✅ High-Resolution PDF Export
- **Visual Flow Map PDF** - Landscape orientation with clear node layout
- **Detailed Flow PDF** - Portrait orientation with step-by-step documentation
- **Summary PDF** - Professional case summaries with form references
- **"Where Am I?" PDF** - Personalized progress summaries

### ✅ Hyperlinked Forms
- **Direct links** to California Courts official forms
- **Form descriptions** and download functionality
- **Complete form glossary** with all DVRO forms
- **Status tracking** (completed/pending forms)

### ✅ Interactive Flow Navigation
- **Dual-pane interface** - Wizard + Visual map
- **Synchronized navigation** - Click map to jump to steps
- **Search functionality** - Find nodes by title or content
- **Progress tracking** - Visual progress indicators

### ✅ Enhanced Case Summaries
- **Detailed situation analysis** - User circumstances and needs
- **Facilitator guidance** - Specific recommendations for court staff
- **"Where Am I?" system** - Procedural questions and personalized summaries
- **Safety assessment** - Urgency and risk evaluation

### ✅ Core System Features
- **Multi-language Support**: English and Spanish interfaces
- **Queue Management**: Intelligent case queuing system
- **AI Integration**: OpenAI-powered legal assistance
- **SMS Notifications**: Automated status updates
- **Admin Dashboard**: Comprehensive management interface
- **Responsive Design**: Works on kiosks and mobile devices

### ✅ Divorce Flow Ready
- **Generic architecture** - Works with any JSON flow structure
- **Extensible system** - Easy to add new flow types
- **Form integration** - Automatic form detection and linking

## 📁 Project Structure

```
Potential_Project/
├── backend/                 # Flask backend API
│   ├── enhanced_app.py      # Main Flask application
│   ├── chroma_service.py    # ChromaDB code search service
│   ├── instance/           # Database files
│   ├── utils/              # Utility modules
│   └── venv/               # Python virtual environment
├── frontend/               # React frontend application
│   ├── build/              # Production build
│   ├── public/             # Static assets
│   └── src/
│       ├── components/
│       │   ├── FlowMap.jsx          # Interactive flow map
│       │   ├── FlowMapPDFExport.jsx # High-resolution PDF export
│       │   ├── FlowMapSynced.jsx    # Synchronized map component
│       │   ├── FlowWizardSynced.jsx # Synchronized wizard
│       │   ├── FlowSyncStore.jsx    # State synchronization
│       │   ├── FlowSearchBar.jsx    # Node search functionality
│       │   ├── FlowLegend.jsx       # Map legend
│       │   ├── FormLinks.jsx        # Hyperlinked forms
│       │   ├── PDFExport.jsx        # PDF export utilities
│       │   ├── WhereAmISummary.jsx  # "Where Am I?" summary
│       │   └── DualPaneDemo.jsx     # Main layout component
│       ├── pages/
│       │   └── DualPaneDemoPage.jsx # Demo page
│       └── utils/
│           └── loadGraph.js         # Graph loading utility
├── openai/                 # OpenAI integration utilities
├── dev-setup.sh           # Development setup script
├── start-enhanced.sh      # Enhanced system startup
├── run.sh                 # Basic system startup
└── README.md              # This file
```

## 🛠️ Quick Start

### 1. Setup Development Environment
```bash
chmod +x dev-setup.sh
./dev-setup.sh
```

### 2. Start the Enhanced System
```bash
chmod +x start-enhanced.sh
./start-enhanced.sh
```

### 3. Start Basic System
```bash
chmod +x run.sh
./run.sh
```

## 📋 Dependencies

### Backend (Python)
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin resource sharing
- **Flask-SQLAlchemy** - Database ORM
- **python-dotenv** - Environment variable management
- **OpenAI** - AI integration
- **ChromaDB** - Vector database for code search

### Frontend (React)
- **React** - UI framework
- **ReactFlow** - Interactive flow diagrams
- **Dagre** - Graph layout engine
- **jsPDF** - PDF generation
- **html2canvas** - HTML to canvas conversion
- **Lucide React** - Icons
- **Tailwind CSS** - Styling

## 🎯 Usage

### For Court Staff
1. **Admin Login**: Access the admin dashboard for queue management
2. **Case Processing**: Use the dual-pane interface for efficient case handling
3. **PDF Export**: Generate high-resolution flow maps and detailed summaries
4. **Form Management**: Access hyperlinked forms with descriptions

### For Users
1. **Flow Navigation**: Interactive wizard guides through legal procedures
2. **Visual Maps**: Click on flow map to jump to specific steps
3. **Progress Tracking**: See where you are in the process
4. **Form Access**: Direct links to required court forms

## 🔧 Development

### Backend Development
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python enhanced_app.py
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Environment Variables
Create a `.env` file in the backend directory:
```env
OPENAI_API_KEY=your_openai_api_key
FLASK_SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///court_kiosk.db
```

## 📄 Documentation

- **Enhanced Features**: See `ENHANCED_FEATURES.md` for detailed feature documentation
- **Cleanup Summary**: See `CLEANUP_SUMMARY.md` for system organization details

## 🚨 Important Notes

- **Court System Use Only**: This project is designed specifically for court environments
- **Data Privacy**: All user data is handled according to court privacy requirements
- **Backup**: Important files are backed up in `backup_20250828_144815/`

## License

This project is for court system use only.
