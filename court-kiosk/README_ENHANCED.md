# Enhanced Court Kiosk System

A comprehensive court kiosk system with priority-based queue management, LLM integration, and dual frontend interfaces for court facilitators and users.

## Features

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

## System Architecture

### Backend (Flask)
```
court-kiosk/backend/
├── enhanced_app.py          # Main Flask application
├── models.py               # Database models
├── queue_manager.py        # Queue management logic
├── requirements.txt        # Python dependencies
└── instance/
    └── court_kiosk.db     # SQLite database
```

### Frontend (React)
```
court-kiosk/frontend/src/
├── components/
│   ├── QueueInterface.jsx      # User queue interface
│   ├── AdminDashboard.jsx      # Facilitator dashboard
│   ├── EnhancedFlowRunner.jsx  # Flowchart runner
│   └── *.css                   # Component styles
├── contexts/
│   └── LanguageContext.js      # Multi-language support
└── data/
    └── dv_flow_combined_backup.json  # DV flowchart data
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- OpenAI API key

### Backend Setup
```bash
cd court-kiosk/backend

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your OpenAI API key and email settings

# Initialize database
python enhanced_app.py
```

### Frontend Setup
```bash
cd court-kiosk/frontend

# Install Node.js dependencies
npm install

# Start development server
npm start
```

### Environment Variables
Create a `.env` file in the backend directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FACILITATOR_EMAIL=facilitator@court.gov
```

## Usage

### For Users
1. **Join Queue**: Select case type and get queue number
2. **Wait**: Monitor queue status and estimated wait time
3. **Process**: Navigate through flowchart or chat with AI
4. **Complete**: Finish process and get next steps

### For Facilitators
1. **Dashboard**: View queue status and assigned cases
2. **Case Management**: Review case summaries and progress
3. **Assignment**: Get next case from queue
4. **Completion**: Mark cases as completed

## API Endpoints

### Queue Management
- `POST /api/queue/join` - Join queue
- `GET /api/queue/status` - Get queue status
- `POST /api/queue/{number}/progress` - Update progress
- `GET /api/queue/{number}/summary` - Get case summary
- `POST /api/queue/{number}/assign` - Assign to facilitator
- `POST /api/queue/{number}/complete` - Complete case

### Facilitator Management
- `GET /api/facilitator/cases` - Get assigned cases
- `GET /api/facilitator/next-case` - Get next case
- `GET /api/facilitators` - List facilitators

### LLM Integration
- `POST /api/llm/chat` - Chat with AI assistant

### Case Types
- `GET /api/case-types` - List available case types

## Database Schema

### Core Tables
- **QueueEntry**: Queue entries with priority and status
- **FlowProgress**: User progress through flowcharts
- **FacilitatorCase**: Case assignments to facilitators
- **Facilitator**: Staff member information
- **CaseType**: Different types of cases with priorities

## Priority System

### Priority A (Red) - Domestic Violence
- Highest priority
- Immediate attention required
- 15-minute base wait time

### Priority B (Orange) - Civil Harassment/Elder Abuse
- High priority
- 30-minute base wait time

### Priority C (Yellow) - Workplace Violence
- Medium priority
- 45-minute base wait time

### Priority D (Green) - General Questions
- Lower priority
- 60-minute base wait time

## Flowchart Integration

The system supports multiple flowchart types:
- **DVRO**: Domestic Violence Restraining Order
- **CHRO**: Civil Harassment Restraining Order
- **EARO**: Elder Abuse Restraining Order
- **WVRO**: Workplace Violence Restraining Order
- **GEN**: General legal questions

Each flowchart is defined in JSON format with nodes, edges, and conditional logic.

## LLM Features

### Context-Aware Responses
- Understands user's position in flowchart
- Provides relevant form suggestions
- Offers next steps based on progress

### Multi-language Support
- English and Spanish prompts
- Culturally appropriate responses
- Legal terminology in both languages

### Safety Features
- Disclaimers about legal advice
- Encourages consultation with court staff
- Professional tone and language

## Security & Privacy

### Data Protection
- No sensitive information stored in plain text
- Secure API endpoints
- Database encryption for sensitive fields

### Access Control
- Facilitator authentication (can be extended)
- Role-based permissions
- Audit trails for case management

## Deployment

### Production Setup
1. **Backend**: Deploy Flask app with WSGI server
2. **Frontend**: Build React app and serve static files
3. **Database**: Use PostgreSQL for production
4. **Email**: Configure SMTP for notifications
5. **SSL**: Enable HTTPS for security

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## Monitoring & Analytics

### Queue Metrics
- Wait times by priority level
- Case completion rates
- Facilitator workload distribution

### User Analytics
- Most common case types
- Flowchart completion rates
- Chat usage patterns

## Future Enhancements

### Planned Features
- **Video Conferencing**: Remote facilitator assistance
- **Document Upload**: Digital form submission
- **SMS Notifications**: Queue updates via text
- **Multi-location Support**: Multiple court locations
- **Advanced Analytics**: Predictive wait times

### Integration Opportunities
- **Court Management Systems**: Case tracking integration
- **Document Management**: Form generation and filing
- **Payment Processing**: Fee collection for certain services
- **Translation Services**: Additional language support

## Support & Maintenance

### Troubleshooting
- Check API connectivity
- Verify database connections
- Monitor OpenAI API usage
- Review error logs

### Updates
- Regular security patches
- Feature enhancements
- Performance optimizations
- User feedback integration

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review and merge

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Contact

For support or questions:
- Email: support@courtkiosk.gov
- Documentation: [Wiki Link]
- Issues: [GitHub Issues]

---

**Note**: This system is designed for court use and should be deployed with appropriate security measures and legal compliance considerations.
