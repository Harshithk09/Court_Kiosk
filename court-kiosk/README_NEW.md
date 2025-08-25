# Court Kiosk - DVRO Flow Application

A modern, clean web application for guiding users through the Domestic Violence Restraining Order (DVRO) process in San Mateo County.

## 🚀 Features

- **Interactive Flow Navigation**: Step-by-step guidance through the DVRO process
- **Modern UI/UX**: Clean, accessible design with responsive layout
- **Progress Tracking**: Visual progress indicator and answer summary
- **Multi-language Support**: Built-in support for English and Spanish
- **Accessibility**: WCAG compliant design with keyboard navigation
- **Mobile Responsive**: Works seamlessly on desktop, tablet, and mobile devices

## 📁 Project Structure

```
court-kiosk/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DVROFlowRunner.jsx      # Main flow logic component
│   │   │   ├── DVROFlowRunner.css      # Flow component styles
│   │   │   ├── Logo.jsx                # Court logo component
│   │   │   └── ...                     # Other components
│   │   ├── pages/
│   │   │   ├── DVROFlowPage.jsx        # Main page wrapper
│   │   │   ├── DVROFlowPage.css        # Page layout styles
│   │   │   └── ...                     # Other pages
│   │   ├── data/
│   │   │   ├── dvro_flow_complete.json # Complete flow data
│   │   │   └── ...                     # Other data files
│   │   ├── contexts/
│   │   │   └── LanguageContext.js      # Language management
│   │   └── App.js                      # Main app router
│   └── public/
├── backend/
│   ├── app.py                          # Main Flask application
│   ├── flask_app.py                    # Additional Flask app
│   ├── config.py                       # Configuration settings
│   └── routes/
└── README_NEW.md                       # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Python 3.8+ (for backend)

### Frontend Setup
```bash
cd court-kiosk/frontend
npm install
npm start
```

### Backend Setup
```bash
cd court-kiosk/backend
pip install -r requirements.txt
python app.py
```

## 🎯 How to Use

### For Users
1. Navigate to the application homepage
2. Click "Start" to begin the DVRO flow
3. Answer questions to determine your eligibility
4. Follow the step-by-step guidance
5. Review your progress and answers
6. Complete the process with clear next steps

### For Developers
1. **Adding New Flow Nodes**: Edit `dvro_flow_complete.json`
2. **Modifying Styles**: Update `DVROFlowRunner.css`
3. **Adding Features**: Extend `DVROFlowRunner.jsx`

## 📊 Flow Structure

The application uses a node-based flow system:

- **Start Nodes**: Entry points with welcome messages
- **Process Nodes**: Information and guidance steps
- **Decision Nodes**: Questions that branch the flow
- **End Nodes**: Completion states with next steps

### Node Types
```javascript
{
  "type": "start|process|decision|end",
  "text": "Display text or question"
}
```

### Edge Structure
```javascript
{
  "from": "sourceNodeId",
  "to": "targetNodeId",
  "when": "condition" // Optional for decision nodes
}
```

## 🎨 Design System

### Colors
- **Primary**: #3b82f6 (Blue)
- **Secondary**: #6b7280 (Gray)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Orange)
- **Error**: #dc2626 (Red)

### Typography
- **Font Family**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Headings**: 700 weight
- **Body**: 400 weight

### Components
- **Buttons**: Rounded corners, hover effects, focus states
- **Cards**: Subtle shadows, rounded corners
- **Progress**: Animated progress bars
- **Navigation**: Clear back/forward controls

## 🔧 Configuration

### Environment Variables
```bash
# Backend
FLASK_ENV=development
DATABASE_URL=sqlite:///court_kiosk.db

# Frontend
REACT_APP_API_URL=http://localhost:5000
```

### Flow Configuration
The flow is configured in `frontend/src/data/dvro_flow_complete.json`:

```json
{
  "id": "dvro-flow",
  "version": "2025-08-13",
  "start": "DVROStart",
  "metadata": {
    "title": "Domestic Violence Restraining Order (DVRO)",
    "jurisdiction": "CA"
  },
  "nodes": { ... },
  "edges": [ ... ]
}
```

## 🚀 Deployment

### Frontend (React)
```bash
cd frontend
npm run build
# Deploy build/ folder to your hosting service
```

### Backend (Flask)
```bash
cd backend
gunicorn app:app
# Deploy to your server
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions:
- Email: court-support@smcgov.org
- Phone: (650) 261-5100
- In-person: San Mateo County Courthouse, 6th Floor Self-Help Office

## 🔄 Version History

- **v2.0.0** (2025-01-13): Complete redesign with modern UI/UX
- **v1.5.0** (2024-12-01): Added multi-language support
- **v1.0.0** (2024-08-01): Initial release

---

**Note**: This tool provides general information only and is not legal advice. For legal assistance, please consult with an attorney or contact the Self-Help Center.
