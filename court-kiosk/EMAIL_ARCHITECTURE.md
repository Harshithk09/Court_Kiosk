# 📧 Email Service Architecture - Court Kiosk

## 🏗️ **Simplified Email Structure**

The email functionality has been consolidated into **2 main files** for better organization and maintainability:

### **1. Core Email Service (`backend/utils/email_service.py`)**
- **Single class**: `EmailService` - handles ALL email operations
- **Main method**: `send_case_email()` - unified email sending
- **Features**:
  - PDF generation (case summary + court forms)
  - HTML email templates
  - Form downloading from California Courts
  - Attachment handling
  - Error handling and fallbacks

### **2. Email API Routes (`backend/email_api.py`)**
- **Blueprint**: `email_bp` - clean API endpoints
- **Endpoints**:
  - `/api/email/send-case-summary` - Main email endpoint
  - `/api/email/send-queue-notification` - Queue notifications
  - `/api/email/send-facilitator-notification` - Staff notifications
  - `/api/email/health` - Service health check

---

## 🔄 **Email Flow**

### **1. Frontend Request**
```javascript
// CompletionPage.jsx
const handleEmailRequest = async () => {
  const emailPayload = {
    email: userEmail,
    case_data: {
      user_email: userEmail,
      user_name: 'Court Kiosk User',
      case_type: 'DVRO',
      forms_completed: ['DV-100', 'DV-109'],
      documents_needed: ['DV-100', 'DV-109'],
      next_steps: ['Step 1', 'Step 2'],
      // ... other case data
    }
  };
  
  const response = await fetch('/api/email/send-case-summary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailPayload)
  });
};
```

### **2. Backend Processing**
```python
# email_api.py
@app.route('/api/email/send-case-summary', methods=['POST'])
def send_case_summary():
    email = request.json.get('email')
    case_data = request.json.get('case_data', {})
    
    # Send email using unified service
    result = email_service.send_case_email(case_data, include_queue=False)
    
    return jsonify({'success': True, 'message': 'Email sent successfully'})
```

### **3. Email Service Processing**
```python
# email_service.py
def send_case_email(self, case_data: dict, include_queue: bool = False) -> dict:
    # 1. Generate case summary PDF
    case_summary_path = self._generate_case_summary_pdf(case_data)
    
    # 2. Download official forms
    form_attachments = self._download_forms(case_data.get('documents_needed', []))
    
    # 3. Generate HTML email content
    html_content = self._generate_email_html(case_data)
    
    # 4. Send email with attachments
    success = self._send_email_with_attachments(user_email, subject, html_content, attachments)
    
    # 5. Cleanup temporary files
    self._cleanup_temp_files(case_summary_path, form_attachments)
```

---

## 📋 **Available Endpoints**

### **Main Email Endpoint**
```
POST /api/email/send-case-summary
```
**Purpose**: Send comprehensive case summary with PDF attachments
**Payload**:
```json
{
  "email": "user@example.com",
  "case_data": {
    "user_email": "user@example.com",
    "user_name": "John Doe",
    "case_type": "DVRO",
    "queue_number": "123",
    "forms_completed": ["DV-100", "DV-109"],
    "documents_needed": ["DV-100", "DV-109"],
    "next_steps": ["Step 1", "Step 2"],
    "summary_json": "{...}",
    "conversation_summary": {...}
  }
}
```

### **Queue Notification**
```
POST /api/email/send-queue-notification
```
**Purpose**: Send queue number and wait time information

### **Facilitator Notification**
```
POST /api/email/send-facilitator-notification
```
**Purpose**: Notify court staff about new cases

### **Health Check**
```
GET /api/email/health
```
**Purpose**: Check email service status

---

## 🎨 **Email Features**

### **HTML Email Template**
- **Professional court branding** (San Mateo Family Court)
- **Personalized greeting** with user's name
- **Forms list** with direct download links
- **Important reminders** about form completion
- **Contact information** for court staff
- **Legal disclaimers** for proper guidance
- **Mobile-responsive design**

### **PDF Attachments**
- **Case Summary PDF**: Complete case information
- **Official Court Forms**: Downloaded from California Courts website
- **100+ Forms Supported**: All California Judicial Council forms
- **Automatic cleanup**: Temporary files removed after sending

### **Form Management**
- **Official URLs**: Direct links to California Courts forms
- **Step-by-step instructions** for each form
- **Critical warnings** and pro tips
- **Automatic download** and attachment

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Required
RESEND_API_KEY=your_resend_api_key

# Optional (for custom domain)
RESEND_FROM_DOMAIN=yourdomain.com
```

### **Email Addresses**
- **Default**: `onboarding@resend.dev` (for testing)
- **Custom Domain**: `noreply@yourdomain.com` (for production)
- **Fallback**: Sends to your email for forwarding if blocked

---

## 🚀 **Benefits of New Structure**

### **✅ Simplified**
- **2 files** instead of scattered code
- **Single service class** for all email operations
- **Clean API endpoints** with proper error handling

### **✅ Maintainable**
- **Centralized email logic** in one place
- **Easy to modify** templates and functionality
- **Clear separation** of concerns

### **✅ Reliable**
- **Comprehensive error handling** and fallbacks
- **Automatic cleanup** of temporary files
- **Health check endpoint** for monitoring

### **✅ Scalable**
- **Blueprint architecture** for easy expansion
- **Modular design** for adding new email types
- **Consistent API** across all endpoints

---

## 📝 **Usage Examples**

### **Frontend Integration**
```javascript
// Send case summary email
const response = await fetch('/api/email/send-case-summary', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    case_data: {
      user_email: 'user@example.com',
      user_name: 'John Doe',
      case_type: 'DVRO',
      forms_completed: ['DV-100', 'DV-109'],
      documents_needed: ['DV-100', 'DV-109'],
      next_steps: ['Complete forms', 'File with court'],
      summary_json: JSON.stringify(summary),
      conversation_summary: summary
    }
  })
});
```

### **Backend Service Usage**
```python
# Direct service usage
from utils.email_service import EmailService

email_service = EmailService()
result = email_service.send_case_email(case_data, include_queue=False)

if result['success']:
    print("Email sent successfully!")
else:
    print(f"Error: {result['error']}")
```

---

## 🎯 **Next Steps**

1. **Test the new endpoints** with your frontend
2. **Update frontend API calls** to use new endpoints
3. **Configure custom domain** for production emails
4. **Monitor email delivery** using health check endpoint
5. **Add new email types** as needed using the blueprint pattern

The email system is now **clean, organized, and ready for production**! 🚀
