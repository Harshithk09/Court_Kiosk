# New Features Implementation Guide

This document outlines the three major features that have been implemented to enhance the Court Kiosk system:

## 1. Enhanced Queue System with Case Summaries

### Overview
The queue system now shows both case numbers and comprehensive case summaries to facilitators, providing them with complete context about each user's situation.

### Database Changes
- **New Table: `case_summaries`** - Stores comprehensive case information
- **New Table: `queue_tickets`** - Links queue entries to case summaries
- **Enhanced Relationships** - Queue tickets reference case summaries

### Key Features
- **Case Summary Storage**: All user answers and flow data are stored in a structured format
- **Queue Integration**: Queue tickets automatically link to case summaries
- **Facilitator View**: Admin dashboard shows complete case context including:
  - Required forms
  - User answers and situation
  - Next steps
  - Priority level
  - Case type

### API Endpoints
- `POST /api/case-summary/save` - Save case summary and optionally create queue ticket
- `GET /api/case-summary/{id}` - Get case summary by ID
- `GET /api/queue/enhanced/status` - Get queue with case summaries
- `PUT /api/queue/enhanced/ticket/{id}/status` - Update queue ticket status

### Usage
```javascript
// Save case summary and join queue
const response = await fetch('/api/case-summary/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    flow_type: 'DVRO',
    answers: userAnswers,
    flow_data: flowData,
    user_email: 'user@example.com',
    user_name: 'John Doe',
    language: 'en',
    join_queue: true
  })
});
```

## 2. Detailed Email Service with Form Hyperlinking

### Overview
Users now receive detailed, professional emails with hyperlinked forms and comprehensive next steps after completing the process.

### Email Features
- **Professional HTML Templates**: Beautiful, branded email design
- **Hyperlinked Forms**: All required forms are clickable links to PDFs
- **Detailed Next Steps**: Step-by-step instructions based on case type
- **Important Notes**: Timeline and critical reminders
- **No Verification Required**: Direct email sending without verification

### Form Hyperlinking
- **Judicial Council Forms**: Direct links to `https://www.courts.ca.gov/documents/{formcode}.pdf`
- **County Forms**: Google search fallback for local forms
- **Supported Patterns**: DV-*, CH-*, FL-*, CLETS-001, SER-001, etc.

### Email Content
- Case summary with user's situation
- Complete list of required forms with hyperlinks
- Detailed next steps (8+ steps for DVRO cases)
- Important timeline reminders
- Contact information for additional help

### API Endpoints
- `POST /api/email/send-summary` - Send detailed summary email
- `POST /api/case-summary/{id}/send-email` - Send email for specific case
- `GET /api/forms/hyperlink/{form_code}` - Get form hyperlink

### Configuration
Add to your `.env` file:
```bash
RESEND_API_KEY=your_resend_api_key_here
```

### Usage
```javascript
// Send detailed summary email
const response = await fetch('/api/email/send-summary', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'user@example.com',
    flow_type: 'DVRO',
    case_number: 'DVRO1234',
    required_forms: ['DV-100', 'CLETS-001', 'DV-109', 'DV-110'],
    next_steps: ['Fill out all forms...', 'Make copies...'],
    extra_notes: ['Serve papers before court date...']
  })
});
```

## 3. Form Hyperlinking Throughout the System

### Overview
All court forms are now hyperlinked throughout the system, making it easy for users to access the forms they need.

### Implementation
- **Frontend Utility**: `utils/formUtils.js` provides form hyperlinking functions
- **Backend Service**: Email service includes form hyperlinking
- **Consistent URLs**: Standardized form URL generation
- **Fallback Support**: Google search for non-standard forms

### Supported Forms
- **Domestic Violence**: DV-100, DV-109, DV-110, DV-105, DV-140, etc.
- **Civil Harassment**: CH-100, CH-110, CH-120, CH-130, etc.
- **Family Law**: FL-150, FL-300, etc.
- **Special Forms**: CLETS-001, SER-001, MC-025, etc.

### Frontend Usage
```javascript
import { getFormUrl, renderFormLink, renderFormLinks } from '../utils/formUtils';

// Get form URL
const url = getFormUrl('DV-100'); // Returns: https://www.courts.ca.gov/documents/dv-100.pdf

// Render single form link
const link = renderFormLink('DV-100', { showExplanation: true });

// Render multiple form links
const links = renderFormLinks(['DV-100', 'CLETS-001', 'DV-109']);
```

### Backend Usage
```python
from utils.email_service import EmailService

email_service = EmailService()
url = email_service.get_form_url('DV-100')
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
# Copy template
cp env.template .env

# Edit .env with your credentials
nano .env
```

Required environment variables:
- `OPENAI_API_KEY` - For AI features
- `RESEND_API_KEY` - For email service
- `EMAIL_USER` & `EMAIL_PASS` - For facilitator notifications

### 3. Initialize Database
```bash
cd backend
python enhanced_app.py
```

The database will be automatically created with the new tables.

### 4. Start the System
```bash
# Backend
cd backend
python enhanced_app.py

# Frontend (in another terminal)
cd frontend
npm start
```

## API Reference

### Case Summary Endpoints

#### Save Case Summary
```http
POST /api/case-summary/save
Content-Type: application/json

{
  "flow_type": "DVRO",
  "answers": {...},
  "flow_data": {...},
  "user_email": "user@example.com",
  "user_name": "John Doe",
  "language": "en",
  "join_queue": true
}
```

#### Get Case Summary
```http
GET /api/case-summary/{summary_id}
```

### Email Endpoints

#### Send Summary Email
```http
POST /api/email/send-summary
Content-Type: application/json

{
  "to": "user@example.com",
  "flow_type": "DVRO",
  "case_number": "DVRO1234",
  "required_forms": ["DV-100", "CLETS-001"],
  "next_steps": ["Step 1", "Step 2"],
  "extra_notes": ["Note 1", "Note 2"]
}
```

### Queue Endpoints

#### Get Enhanced Queue Status
```http
GET /api/queue/enhanced/status?status=waiting
```

#### Update Queue Ticket Status
```http
PUT /api/queue/enhanced/ticket/{ticket_id}/status
Content-Type: application/json

{
  "status": "in_progress",
  "facilitator_id": 123
}
```

## Testing

### Test Email Service
```bash
curl -X POST http://localhost:5000/api/email/send-summary \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "flow_type": "DVRO",
    "required_forms": ["DV-100", "CLETS-001"],
    "next_steps": ["Fill out forms", "Make copies"],
    "extra_notes": ["Important timeline"]
  }'
```

### Test Case Summary
```bash
curl -X POST http://localhost:5000/api/case-summary/save \
  -H "Content-Type: application/json" \
  -d '{
    "flow_type": "DVRO",
    "answers": {"relationship": "spouse"},
    "flow_data": {},
    "user_email": "test@example.com",
    "join_queue": true
  }'
```

## Troubleshooting

### Email Not Sending
1. Check `RESEND_API_KEY` is set correctly
2. Verify email address format
3. Check Resend dashboard for delivery status

### Queue Not Showing
1. Ensure database tables are created
2. Check API endpoints are responding
3. Verify frontend is calling correct endpoints

### Forms Not Linking
1. Check form code format (e.g., "DV-100" not "dv100")
2. Verify internet connection for PDF downloads
3. Check browser console for errors

## Future Enhancements

- **Email Templates**: Customizable email templates per court
- **Form Validation**: Real-time form availability checking
- **Queue Analytics**: Detailed queue performance metrics
- **Multi-language Support**: Email templates in multiple languages
- **SMS Notifications**: Text message queue updates
