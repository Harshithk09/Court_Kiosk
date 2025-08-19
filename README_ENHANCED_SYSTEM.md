# Enhanced Court Kiosk System

A comprehensive digital kiosk system for family court clinics that provides intelligent guidance, queue management, and bilingual support for court procedures.

## 🚀 Features

### For Users (Public Kiosk)
- **Bilingual Interface**: Full English and Spanish support
- **Priority Queue System**: 4-tier priority system (A-D) with DV cases getting highest priority
- **Intelligent Guidance**: AI-powered assistance based on flowchart progress
- **Interactive Flowchart**: Step-by-step guidance through court procedures
- **Real-time Queue Updates**: Live queue status and estimated wait times
- **Question & Answer**: Ask specific questions and get contextual answers
- **Progress Tracking**: Automatic tracking of user progress through the system

### For Facilitators (Admin Dashboard)
- **Queue Management**: Real-time view of all cases in the system
- **Priority-based Sorting**: Cases automatically sorted by priority level
- **Case Summaries**: AI-generated summaries of user progress and needs
- **LLM Insights**: Intelligent analysis of user progress and next steps
- **Case Assignment**: Assign cases to specific facilitators
- **Export Capabilities**: Print and export case information
- **Auto-refresh**: Automatic updates every 30 seconds

### Technical Features
- **Modern UI/UX**: Beautiful, accessible interface with responsive design
- **LLM Integration**: OpenAI GPT-4 powered analysis and guidance
- **Real-time Updates**: WebSocket-like updates for live queue management
- **Database Integration**: SQLite database with comprehensive case tracking
- **API-First Design**: RESTful API for easy integration and extension
- **Error Handling**: Comprehensive error handling and user feedback

## 📋 Priority System

The system uses a 4-tier priority system similar to medical triage:

- **Priority A (Red)**: Domestic Violence Restraining Orders - Highest priority
- **Priority B (Orange)**: Civil Harassment, Elder Abuse - Medium-high priority  
- **Priority C (Blue)**: Workplace Violence, Other Restraining Orders - Medium priority
- **Priority D (Gray)**: General Legal Assistance, Form Help - Standard priority

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Flask)       │◄──►│   (SQLite)      │
│                 │    │                 │    │                 │
│ • User Kiosk    │    │ • Queue Mgmt    │    │ • Queue Entries │
│ • Admin Panel   │    │ • LLM Service   │    │ • Flow Progress │
│ • Bilingual UI  │    │ • API Endpoints │    │ • Case Types    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Flow     │    │   LLM Analysis  │    │   Data Storage  │
│                 │    │                 │    │                 │
│ 1. Language     │    │ • Progress      │    │ • User Info     │
│ 2. Case Type    │    │   Analysis      │    │ • Progress      │
│ 3. User Info    │    │ • Next Steps    │    │ • Summaries     │
│ 4. Queue Number │    │ • Form Needs    │    │ • Queue Status  │
│ 5. Flow Guidance│    │ • Time Estimates│    │ • Case History  │
│ 6. Summary      │    │ • Concerns      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- OpenAI API key

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd court-kiosk
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key and other settings
   ```

3. **Run the startup script**
   ```bash
   chmod +x start-enhanced-system.sh
   ./start-enhanced-system.sh
   ```

### Manual Installation

1. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python enhanced_app.py
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 📁 Project Structure

```
court-kiosk/
├── backend/
│   ├── enhanced_app.py          # Main Flask application
│   ├── models.py                # Database models
│   ├── queue_manager.py         # Queue management logic
│   ├── utils/
│   │   └── llm_service.py       # LLM integration service
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EnhancedKioskInterface.jsx      # User kiosk
│   │   │   ├── EnhancedAdminDashboard.jsx      # Admin panel
│   │   │   └── EnhancedKioskInterface.css      # Kiosk styles
│   │   ├── contexts/
│   │   │   ├── LanguageContext.js              # Language management
│   │   │   └── LocationContext.js              # Location management
│   │   └── data/
│   │       └── dv_flow_combined.json           # Flowchart data
│   └── package.json             # Node.js dependencies
├── start-enhanced-system.sh     # Startup script
└── README_ENHANCED_SYSTEM.md    # This file
```

## 🔧 Configuration

### Environment Variables (.env)

```bash
# OpenAI Configuration (Required)
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FACILITATOR_EMAIL=facilitator@court.gov

# Database Configuration
DATABASE_URL=sqlite:///court_kiosk.db

# Server Configuration
FLASK_ENV=development
FLASK_DEBUG=1
```

### Case Type Configuration

The system supports multiple case types with configurable priorities:

```python
# In backend/models.py
case_types = [
    {'code': 'dvro', 'name': 'Domestic Violence Restraining Order', 'priority': 'A'},
    {'code': 'civil', 'name': 'Civil Harassment Restraining Order', 'priority': 'B'},
    {'code': 'elder', 'name': 'Elder Abuse Restraining Order', 'priority': 'B'},
    {'code': 'workplace', 'name': 'Workplace Violence Restraining Order', 'priority': 'C'},
    {'code': 'other', 'name': 'Other Legal Assistance', 'priority': 'D'}
]
```

## 🎯 Usage

### For Users

1. **Start the System**: Navigate to the kiosk interface
2. **Select Language**: Choose English or Spanish
3. **Choose Case Type**: Select the type of case you need help with
4. **Enter Information**: Provide your name and contact information
5. **Get Queue Number**: Receive your priority queue number
6. **Follow Guidance**: Use the interactive flowchart for step-by-step guidance
7. **Ask Questions**: Use the Q&A feature for specific help
8. **Review Summary**: Get a comprehensive summary of your case

### For Facilitators

1. **Access Admin Panel**: Navigate to the admin dashboard
2. **View Queue**: See all cases organized by priority and status
3. **Call Next Case**: Automatically get the highest priority case
4. **Review Case Details**: View AI-generated summaries and insights
5. **Provide Assistance**: Use the insights to provide targeted help
6. **Complete Cases**: Mark cases as completed when finished

## 🔌 API Endpoints

### Queue Management
- `POST /api/queue/add` - Add new case to queue
- `GET /api/queue/status` - Get current queue status
- `POST /api/queue/next` - Call next case
- `POST /api/queue/complete` - Complete a case
- `GET /api/queue/summary/<queue_number>` - Get case summary

### LLM Services
- `POST /api/llm/analyze` - Analyze user progress
- `POST /api/llm/question` - Answer user questions
- `POST /api/llm/chat` - General chat with LLM

### Case Management
- `GET /api/case-types` - Get available case types
- `GET /api/facilitators` - Get available facilitators

## 🎨 Customization

### Adding New Case Types

1. **Update Database Model**:
   ```python
   # In backend/models.py
   new_case_type = CaseType(
       code='new_type',
       name='New Case Type',
       priority_level='B',
       is_active=True
   )
   ```

2. **Update Frontend**:
   ```javascript
   // In frontend/src/components/EnhancedKioskInterface.jsx
   const caseTypes = {
     // ... existing types
     new_type: "New Case Type"
   };
   ```

### Adding New Languages

1. **Update Translations**:
   ```javascript
   // In frontend components
   const translations = {
     en: { /* English translations */ },
     es: { /* Spanish translations */ },
     fr: { /* French translations */ }  // New language
   };
   ```

2. **Update System Prompts**:
   ```python
   # In backend/enhanced_app.py
   SYSTEM_PROMPTS = {
       'en': 'English prompt...',
       'es': 'Spanish prompt...',
       'fr': 'French prompt...'  # New language
   }
   ```

## 🐛 Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Check your API key in `.env`
   - Verify API key has sufficient credits
   - Check network connectivity

2. **Database Errors**
   - Ensure SQLite is installed
   - Check file permissions for database directory
   - Run database migrations if needed

3. **Frontend Issues**
   - Clear browser cache
   - Check console for JavaScript errors
   - Verify all dependencies are installed

4. **Queue Issues**
   - Restart the backend server
   - Check database connectivity
   - Verify queue manager initialization

### Debug Mode

Enable debug mode by setting:
```bash
FLASK_DEBUG=1
FLASK_ENV=development
```

## 🔒 Security Considerations

- **API Key Protection**: Never commit API keys to version control
- **Input Validation**: All user inputs are validated and sanitized
- **Error Handling**: Sensitive information is not exposed in error messages
- **Access Control**: Admin panel should be protected in production
- **Data Privacy**: User data is handled according to privacy regulations

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**:
   ```bash
   FLASK_ENV=production
   FLASK_DEBUG=0
   ```

2. **Database Setup**:
   ```bash
   # Use PostgreSQL or MySQL for production
   DATABASE_URL=postgresql://user:pass@localhost/court_kiosk
   ```

3. **Web Server**:
   ```bash
   # Use Gunicorn for production
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 enhanced_app:app
   ```

4. **Frontend Build**:
   ```bash
   cd frontend
   npm run build
   # Serve static files with nginx or similar
   ```

## 📊 Monitoring and Analytics

The system includes built-in monitoring capabilities:

- **Queue Analytics**: Track wait times and case processing
- **User Engagement**: Monitor feature usage and completion rates
- **LLM Performance**: Track response quality and user satisfaction
- **System Health**: Monitor API response times and error rates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

---

**Note**: This system is designed for educational and demonstration purposes. For production use in actual court environments, additional security, compliance, and legal review is required.
