# Court Kiosk Email System

## Overview

The Court Kiosk Email System provides comprehensive email functionality for the San Mateo Family Court Clinic. It sends detailed case summaries, PDF attachments of required forms, and queue information to users who complete the court kiosk flow.

## Features

### 📧 Comprehensive Email Content
- **Case Summary**: Detailed overview of the user's case and progress
- **Queue Information**: Queue number and priority level (for kiosk mode users)
- **Required Forms**: List of all forms needed with download links
- **Next Steps**: Step-by-step instructions for the user
- **Timeline**: Important deadlines and milestones
- **Contact Information**: Court contact details and hours

### 📎 PDF Attachments
- **Case Summary Report**: Complete PDF overview of the case
- **Form Templates**: PDF templates for all required forms
- **Official Form Links**: Direct links to download official court forms

### 🎨 Professional Design
- **Responsive HTML**: Works on desktop and mobile devices
- **Court Branding**: San Mateo Family Court Clinic branding
- **Priority Color Coding**: Visual indicators for case priority levels
- **Multilingual Support**: English and Spanish support

## System Architecture

### Backend Components

#### 1. Email Service (`utils/email_service.py`)
- Handles email composition and sending via Resend API
- Generates comprehensive HTML email content
- Manages PDF attachments
- Supports queue information integration

#### 2. PDF Service (`utils/pdf_service.py`)
- Generates case summary PDFs
- Creates form template PDFs
- Downloads official court forms
- Manages temporary file cleanup

#### 3. Case Summary Service (`utils/case_summary_service.py`)
- Manages case summary creation and storage
- Handles queue integration
- Extracts required forms from flow data
- Generates next steps based on case type

### Frontend Components

#### 1. Admin Dashboard (`pages/AdminDashboard.jsx`)
- Email sending buttons for each case
- Queue management with email integration
- Case details with email functionality

#### 2. Queue API (`utils/queueAPI.js`)
- API functions for email operations
- Integration with backend email endpoints
- Error handling and fallback logic

## API Endpoints

### POST `/api/send-comprehensive-email`
Send comprehensive email with case summary and PDF attachments.

**Request Body:**
```json
{
  "email": "user@example.com",
  "user_name": "John Doe",
  "case_type": "Domestic Violence Restraining Order",
  "priority": "A",
  "language": "en",
  "queue_number": "A001",
  "forms": ["DV-100", "DV-109", "DV-110"],
  "next_steps": ["Complete forms", "File with court"],
  "summary": "Case summary text",
  "phone_number": "(555) 123-4567",
  "include_queue": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comprehensive case summary and forms sent successfully",
  "email_id": "email_123456",
  "queue_number": "A001"
}
```

### POST `/api/generate-case-summary`
Generate and save case summary, optionally add to queue.

**Request Body:**
```json
{
  "flow_type": "DVRO",
  "answers": {"emergency": "yes", "children": "yes"},
  "flow_data": {...},
  "email": "user@example.com",
  "user_name": "John Doe",
  "language": "en",
  "join_queue": true
}
```

### POST `/api/send-case-summary-email`
Send email for a specific case summary.

**Request Body:**
```json
{
  "summary_id": 123,
  "include_queue": true
}
```

## Configuration

### Environment Variables

```bash
# Email Configuration
RESEND_API_KEY=your_resend_api_key_here

# Optional: SMTP Configuration (fallback)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

### Dependencies

```txt
resend==0.6.0
reportlab==4.0.4
PyPDF2==3.0.1
requests==2.31.0
```

## Usage Examples

### 1. Send Email from Admin Dashboard

```javascript
// In AdminDashboard.jsx
const handleSendEmail = async (caseItem) => {
  const result = await sendComprehensiveEmail({
    email: caseItem.user_email,
    user_name: caseItem.user_name,
    case_type: caseItem.case_type,
    priority: caseItem.priority,
    language: caseItem.language,
    queue_number: caseItem.queue_number,
    forms: caseItem.documents_needed,
    next_steps: caseItem.next_steps,
    summary: caseItem.conversation_summary,
    include_queue: true
  });
  
  if (result.success) {
    alert('Email sent successfully!');
  }
};
```

### 2. Generate Case Summary and Send Email

```javascript
// Generate case summary
const summaryResult = await generateCaseSummary({
  flow_type: 'DVRO',
  answers: userAnswers,
  flow_data: flowData,
  email: userEmail,
  user_name: userName,
  language: 'en',
  join_queue: true
});

// Send email
if (summaryResult.success) {
  const emailResult = await sendCaseSummaryEmail(
    summaryResult.summary_id, 
    true // include queue info
  );
}
```

### 3. Backend Email Service Usage

```python
from utils.email_service import EmailService

email_service = EmailService()

case_data = {
    'user_email': 'user@example.com',
    'user_name': 'John Doe',
    'case_type': 'Domestic Violence Restraining Order',
    'priority_level': 'A',
    'queue_number': 'A001',
    'documents_needed': ['DV-100', 'DV-109'],
    'next_steps': ['Complete forms', 'File with court'],
    'conversation_summary': 'User needs emergency protection'
}

result = email_service.send_comprehensive_case_email(case_data, include_queue=True)
```

## Form Management

### Supported Court Forms

The system supports the following California Judicial Council forms:

#### Domestic Violence (DV)
- DV-100: Request for Domestic Violence Restraining Order
- DV-109: Notice of Court Hearing
- DV-110: Temporary Restraining Order
- DV-105: Request for Child Custody and Visitation Orders
- DV-140: Child Custody and Visitation Order
- DV-200: Proof of Personal Service
- DV-120: Response to Request for Domestic Violence Restraining Order

#### Civil Harassment (CH)
- CH-100: Request for Civil Harassment Restraining Order
- CH-109: Notice of Court Hearing (Civil Harassment)
- CH-110: Temporary Restraining Order (Civil Harassment)

#### Elder Abuse (EA)
- EA-100: Request for Elder or Dependent Adult Abuse Restraining Order
- EA-109: Notice of Court Hearing (Elder Abuse)
- EA-110: Temporary Restraining Order (Elder Abuse)

#### Workplace Violence (WV)
- WV-100: Request for Workplace Violence Restraining Order
- WV-109: Notice of Court Hearing (Workplace Violence)
- WV-110: Temporary Restraining Order (Workplace Violence)

#### Other Forms
- CLETS-001: Confidential CLETS Information
- FL-150: Income and Expense Declaration

### Form URL Generation

The system automatically generates URLs for downloading official forms from the California Courts website:

```python
# Example form URL generation
form_url = email_service.get_form_url('DV-100')
# Returns: https://www.courts.ca.gov/documents/dv100.pdf
```

## Testing

### Run Email System Tests

```bash
cd backend
python test_email.py
```

### Test Results

The test script verifies:
- ✅ PDF generation for case summaries
- ✅ PDF generation for form templates
- ✅ Email HTML content generation
- ✅ Form URL generation
- ✅ File cleanup and error handling

## Error Handling

### Common Issues and Solutions

1. **Email Service Not Configured**
   - Ensure `RESEND_API_KEY` is set in environment variables
   - Check Resend API key validity

2. **PDF Generation Failures**
   - Verify `reportlab` and `PyPDF2` are installed
   - Check file permissions for temporary directories

3. **Form Download Failures**
   - Some forms may not be available on the court website
   - System falls back to template generation

4. **Queue Integration Issues**
   - Ensure queue number is properly generated
   - Check database connectivity

## Security Considerations

- Email addresses are validated before sending
- Temporary PDF files are automatically cleaned up
- No sensitive data is logged in email content
- API endpoints require proper authentication

## Performance Optimization

- PDF generation is done asynchronously
- Temporary files are cleaned up immediately after use
- Email sending is non-blocking
- Form downloads are cached when possible

## Future Enhancements

- [ ] SMS integration for queue notifications
- [ ] Multi-language email templates
- [ ] Email templates customization
- [ ] Bulk email sending for facilitators
- [ ] Email delivery tracking
- [ ] Integration with court case management systems

## Support

For technical support or questions about the email system:

1. Check the test script output for common issues
2. Review the API endpoint documentation
3. Verify environment variable configuration
4. Check the application logs for detailed error messages

## License

This email system is part of the Court Kiosk project and follows the same licensing terms.
