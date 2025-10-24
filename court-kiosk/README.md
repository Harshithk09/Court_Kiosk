# 🏛️ Court Kiosk - San Mateo Family Court

A comprehensive self-service kiosk system for the San Mateo Family Court that guides users through legal processes, provides automated case summaries, and delivers comprehensive next steps via email.

## 🎯 **Project Overview**

The Court Kiosk is a full-stack web application designed to help court visitors navigate complex legal processes independently. It provides:

- **Interactive Legal Guidance**: Step-by-step assistance for domestic violence, divorce, and other family law matters
- **Automated Case Summaries**: AI-powered analysis of user responses with personalized recommendations
- **Form Management**: Integration with 100+ California Judicial Council forms
- **Email Delivery**: Professional email summaries with PDF attachments
- **Queue Management**: Digital queue system with SMS notifications

## 🏗️ **Architecture**

### **Frontend (React.js)**
- **Framework**: React 18+ with modern hooks
- **Styling**: Tailwind CSS for responsive design
- **State Management**: Context API for global state
- **Routing**: React Router for navigation
- **Deployment**: Vercel (https://court-kiosk.vercel.app)

### **Backend (Python Flask)**
- **Framework**: Flask with SQLAlchemy ORM
- **Email Service**: Resend API for email delivery
- **PDF Generation**: ReportLab for document creation
- **AI Integration**: OpenAI API for case analysis
- **Deployment**: Render (https://court-kiosk.onrender.com)

### **Database**
- **Type**: SQLite (development) / PostgreSQL (production)
- **Models**: Users, Sessions, Queue Entries, Audit Logs

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- Python 3.11+
- Git

### **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

### **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### **Environment Variables**
```bash
# Backend (.env)
OPENAI_API_KEY=your_openai_key
RESEND_API_KEY=your_resend_key
SECRET_KEY=your_secret_key
SQLALCHEMY_DATABASE_URI=sqlite:///court_kiosk.db

# Frontend (.env)
REACT_APP_API_URL=https://court-kiosk.onrender.com
```

## 📁 **Project Structure**

```
court-kiosk/
├── backend/                    # Python Flask backend
│   ├── utils/                  # Service modules
│   │   ├── email_service.py    # Unified email service
│   │   ├── llm_service.py      # AI/LLM integration
│   │   ├── auth_service.py     # Authentication
│   │   └── case_summary_service.py
│   ├── email_api.py           # Email API endpoints
│   ├── app.py                 # Main Flask application
│   ├── models.py              # Database models
│   └── run.py                 # Application runner
├── frontend/                   # React.js frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React contexts
│   │   └── utils/             # Utility functions
│   └── public/                # Static assets
├── court_documents/           # PDF forms library
├── tests/                     # Test files
└── docs/                      # Documentation
```

## 🔧 **Key Features**

### **1. Interactive Legal Guidance**
- **Multi-language Support**: English, Spanish, Chinese
- **Dynamic Flow Engine**: Context-aware question routing
- **Progress Tracking**: Visual progress indicators
- **Accessibility**: Screen reader compatible

### **2. AI-Powered Case Analysis**
- **Smart Summarization**: OpenAI GPT analysis of user responses
- **Form Recommendations**: Automatic form selection based on case details
- **Next Steps Generation**: Personalized action plans
- **Risk Assessment**: Priority level assignment

### **3. Comprehensive Email System**
- **Professional Templates**: Court-branded HTML emails
- **PDF Attachments**: Case summaries and official forms
- **Form Integration**: 100+ California court forms with official URLs
- **Multi-language Support**: Localized email content

### **4. Queue Management**
- **Digital Queue**: Real-time queue tracking
- **SMS Notifications**: Queue number delivery
- **Facilitator Dashboard**: Staff management interface
- **Priority Handling**: Emergency case prioritization

## 📧 **Email System**

The email system is built with a clean, modular architecture:

### **Core Components**
- **`EmailService`**: Unified email handling class
- **`email_api.py`**: Clean API endpoints blueprint
- **PDF Generation**: Dynamic case summary and form packages
- **Template Engine**: Professional HTML email templates

### **Available Endpoints**
- `POST /api/email/send-case-summary` - Main email endpoint
- `POST /api/email/send-queue-notification` - Queue notifications
- `POST /api/email/send-facilitator-notification` - Staff notifications
- `GET /api/email/health` - Service health check

### **Email Features**
- **Professional Design**: San Mateo Family Court branding
- **PDF Attachments**: Case summary + official court forms
- **Form Downloads**: Direct links to California Courts website
- **Multi-language**: Localized content and instructions
- **Mobile Responsive**: Optimized for all devices

## 🗃️ **Form Management**

### **Supported Forms**
- **Domestic Violence**: DV-100, DV-109, DV-110, DV-105, etc.
- **Family Law**: FL-100, FL-105, FL-110, FL-115, etc.
- **Civil Harassment**: CH-100, CH-109, CH-110, etc.
- **Fee Waivers**: FW-001, FW-002, FW-003, etc.
- **Other Forms**: CLETS-001, POS-040, SER-001, etc.

### **Form Features**
- **Official URLs**: Direct links to California Courts website
- **Step-by-step Instructions**: Detailed completion guides
- **Critical Warnings**: Important legal notices
- **Pro Tips**: Expert advice for form completion

## 🚀 **Deployment**

### **Frontend (Vercel)**
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### **Backend (Render)**
1. Connect GitHub repository to Render
2. Set environment variables in Render dashboard
3. Configure build command: `pip install -r requirements.txt`
4. Set start command: `python run.py`

### **Domain Configuration**
- **Frontend**: https://court-kiosk.vercel.app
- **Backend**: https://court-kiosk.onrender.com
- **Custom Domain**: Configure in Vercel/Render dashboards

## 🔒 **Security Features**

- **CORS Configuration**: Proper cross-origin resource sharing
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Comprehensive data sanitization
- **SQL Injection Protection**: SQLAlchemy ORM
- **XSS Protection**: Content Security Policy headers

## 📊 **Monitoring & Analytics**

- **Health Checks**: API endpoint monitoring
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Response time monitoring
- **Usage Analytics**: User interaction tracking

## 🧪 **Testing**

### **Frontend Tests**
```bash
cd frontend
npm test
```

### **Backend Tests**
```bash
cd backend
python -m pytest tests/
```

### **Integration Tests**
```bash
node tests/test-email.js
node tests/test-deployment.js
```

## 📚 **Documentation**

- **API Documentation**: Comprehensive endpoint documentation
- **Email Architecture**: Detailed email system guide
- **Deployment Guide**: Step-by-step deployment instructions
- **Form Integration**: California court forms documentation

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

For technical support or questions:
- **Email**: support@sanmateofamilycourtkiosk.org
- **Phone**: (650) 261-5100
- **Location**: Room 101, First Floor, San Mateo County Superior Court

## 🎯 **Future Enhancements**

- **Mobile App**: Native iOS/Android applications
- **Voice Interface**: Voice-guided assistance
- **Video Tutorials**: Interactive form completion guides
- **Multi-language Forms**: Translated form versions
- **Integration**: Court case management system integration

---

**Built with ❤️ for the San Mateo Family Court Community**