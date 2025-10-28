# 🏛️ Court Kiosk - Complete Code Reference

## 📋 **Project Overview**

This document contains the complete code for the Court Kiosk system, including the new admin questions feature. The system helps court visitors navigate legal processes with interactive flows, AI-powered case analysis, and comprehensive email delivery.

---

## 🎯 **Key Features Implemented**

### **1. Interactive Legal Flow System**
- **Multi-language Support**: English, Spanish, Chinese
- **Dynamic Question Routing**: Context-aware decision trees
- **Progress Tracking**: Visual step indicators with navigation
- **Form Detection**: Automatic extraction of required forms

### **2. Admin Questions Feature** ⭐ **NEW**
- **Two Key Questions**:
  1. "Have you filled out any forms?" (Yes/No)
  2. "Which forms have you filled out?" (Checklist of all required forms)
- **Smart Form Detection**: Extracts forms from user's flow history
- **Staff Assistance Data**: Helps admin lawyers provide targeted help

### **3. AI-Powered Case Analysis**
- **Smart Summarization**: OpenAI GPT analysis of user responses
- **Form Recommendations**: Automatic form selection based on case details
- **Next Steps Generation**: Personalized action plans

### **4. Comprehensive Email System**
- **Professional Templates**: Court-branded HTML emails
- **PDF Attachments**: Case summaries and official forms
- **Admin Data Integration**: Staff assistance information included

---

## 🏗️ **Core Architecture Files**

### **Frontend Components**

#### **1. SimpleFlowRunner.jsx** - Main Flow Engine
```javascript
// Key Features:
// - Manages flow state and navigation
// - Handles admin questions between flow and summary
// - Extracts forms from user's progress
// - Provides visual progress tracking

const SimpleFlowRunner = ({ flow, onFinish, onBack, onHome }) => {
  const [currentNodeId, setCurrentNodeId] = useState(flow?.start || 'DVROStart');
  const [history, setHistory] = useState([flow?.start || 'DVROStart']);
  const [showSummary, setShowSummary] = useState(false);
  const [showAdminQuestions, setShowAdminQuestions] = useState(false);
  const [adminData, setAdminData] = useState(null);

  // Flow completion triggers admin questions
  const handleComplete = () => {
    setShowAdminQuestions(true);
  };

  // Admin questions completion triggers summary
  const handleAdminQuestionsComplete = (data) => {
    setAdminData(data);
    setShowAdminQuestions(false);
    setShowSummary(true);
  };

  // Extract forms from user's flow history
  const getFormsForSidebar = () => {
    const forms = new Set();
    history.forEach(nodeId => {
      const node = flow?.nodes?.[nodeId];
      if (node?.text) {
        const formMatches = node.text.match(/\b[A-Z]{2,3}-\d{3,4}\b/g);
        if (formMatches) {
          formMatches.forEach(form => forms.add(form));
        }
      }
    });
    return Array.from(forms).sort();
  };
};
```

#### **2. AdminQuestionsPage.jsx** - Admin Questions Interface
```javascript
// Key Features:
// - Two-step question process
// - Form completion tracking
// - Staff assistance data collection
// - User-friendly interface

const AdminQuestionsPage = ({ history, flow, onBack, onComplete, onHome }) => {
  const [hasFilledForms, setHasFilledForms] = useState('');
  const [selectedForms, setSelectedForms] = useState([]);
  const [availableForms, setAvailableForms] = useState([]);

  // Extract all forms from user's flow history
  useEffect(() => {
    const forms = new Set();
    const formDescriptions = {
      'DV-100': 'Request for Domestic Violence Restraining Order',
      'DV-105': 'Request for Child Custody and Visitation Orders',
      // ... 100+ form descriptions
    };

    history.forEach(nodeId => {
      const node = flow?.nodes?.[nodeId];
      if (node?.text) {
        const formMatches = node.text.match(/\b[A-Z]{2,3}-\d{3,4}\b/g);
        if (formMatches) {
          formMatches.forEach(form => forms.add(form));
        }
      }
    });

    const formsArray = Array.from(forms).map(formCode => ({
      code: formCode,
      title: formDescriptions[formCode] || `${formCode} Form`,
      description: 'Required for your case type'
    })).sort((a, b) => a.code.localeCompare(b.code));

    setAvailableForms(formsArray);
  }, [history, flow]);

  // Submit admin data
  const handleSubmit = async () => {
    const adminData = {
      hasFilledForms: hasFilledForms === 'yes',
      filledForms: selectedForms,
      availableForms: availableForms.map(f => f.code),
      timestamp: new Date().toISOString(),
      sessionId: `K${Math.floor(Math.random() * 90000) + 10000}`
    };
    
    onComplete(adminData);
  };
};
```

#### **3. CompletionPage.jsx** - Case Summary & Email
```javascript
// Key Features:
// - Generates comprehensive case summary
// - Handles email sending with admin data
// - Queue management integration
// - PDF attachment support

const CompletionPage = ({ answers, history, flow, adminData, onBack, onHome }) => {
  // Generate enhanced user-friendly summary
  const generateSummary = () => {
    const summary = {
      header: {
        case_type: 'DVRO',
        date: new Date().toLocaleDateString(),
        location: 'San Mateo County Superior Court Kiosk',
        session_id: `K${Math.floor(Math.random() * 90000) + 10000}`
      },
      forms: [],
      keyAnswers: [],
      nextSteps: [],
      resources: {
        court_info: { /* court contact info */ },
        self_help_center: { /* self-help info */ },
        legal_aid: { /* legal aid info */ },
        emergency: { /* emergency contacts */ }
      }
    };

    // Extract forms from visited nodes
    history.forEach(nodeId => {
      const node = flow?.nodes?.[nodeId];
      if (node?.text) {
        const formMatches = node.text.match(/\b[A-Z]{2,3}-\d{3,4}\b/g);
        if (formMatches) {
          formMatches.forEach(form => {
            if (!summary.forms.find(f => f.form_code === form)) {
              summary.forms.push({
                form_code: form,
                title: formDescriptions[form] || `${form} Form`,
                description: 'Required for your case type'
              });
            }
          });
        }
      }
    });

    return summary;
  };

  // Send email with admin data
  const handleEmailRequest = async () => {
    const emailPayload = {
      email: email,
      case_data: {
        user_email: email,
        user_name: 'Court Kiosk User',
        case_type: 'DVRO',
        priority_level: 'A',
        language: 'en',
        queue_number: queueNumber || 'N/A',
        phone_number: phoneNumber || null,
        location: 'San Mateo County Superior Court Kiosk',
        session_id: summary.header.session_id,
        
        // Forms and next steps data
        forms_completed: summary.forms || [],
        documents_needed: summary.forms || [],
        next_steps: summary.nextSteps || [],
        nextSteps: summary.nextSteps || [],
        
        // Admin data for staff assistance
        admin_data: adminData || null,
        
        // Full summary
        summary_json: JSON.stringify(summary),
        conversation_summary: summary
      }
    };
  };
};
```

### **Backend Services**

#### **4. EmailService Class** - Unified Email System
```python
class EmailService:
    """Unified email service for Court Kiosk - handles all email functionality"""
    
    def __init__(self):
        # Email configuration
        self.from_email = "Court Kiosk <onboarding@resend.dev>"
        self.support_email = "onboarding@resend.dev"
        
        # Check for custom domain
        custom_domain = os.getenv('RESEND_FROM_DOMAIN')
        if custom_domain:
            self.from_email = f"Court Kiosk <noreply@{custom_domain}>"
            self.support_email = f"support@{custom_domain}"
    
    def send_case_email(self, case_data: dict, include_queue: bool = False) -> dict:
        """Main method - sends comprehensive case email with PDFs"""
        try:
            # Generate case summary PDF
            case_summary_path = self._generate_case_summary_pdf(case_data)
            
            # Download official forms
            form_attachments = self._download_forms(case_data.get('documents_needed', []))
            
            # Generate email content
            subject = f"Your Court Case Summary - {case_data.get('queue_number', 'N/A')}"
            html_content = self._generate_email_html(case_data)
            
            # Send email with attachments
            return self._send_email_with_attachments(
                to_email=case_data.get('user_email'),
                subject=subject,
                html_content=html_content,
                attachments=attachments
            )
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _generate_admin_data_html(self, admin_data: dict) -> str:
        """Generate HTML for admin data (staff reference only)"""
        if not admin_data:
            return ""
        
        has_filled_forms = admin_data.get('hasFilledForms', False)
        filled_forms = admin_data.get('filledForms', [])
        available_forms = admin_data.get('availableForms', [])
        
        if not has_filled_forms:
            return f"""
            <div style="background-color: #e0f2fe; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #0c4a6e;">📋 Staff Note</h3>
                <p style="margin: 0; color: #0c4a6e;"><strong>Client Status:</strong> Needs assistance with all forms</p>
                <p style="margin: 5px 0 0 0; color: #0c4a6e;">This client requires help with all {len(available_forms)} forms.</p>
            </div>
            """
        
        remaining_forms = [form for form in available_forms if form not in filled_forms]
        
        return f"""
        <div style="background-color: #e0f2fe; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #0c4a6e;">📋 Staff Note</h3>
            <p style="margin: 0; color: #0c4a6e;"><strong>Client Status:</strong> Has completed {len(filled_forms)} of {len(available_forms)} forms</p>
            
            <div style="margin: 10px 0;">
                <p style="margin: 0; color: #0c4a6e; font-weight: bold;">✅ Completed Forms:</p>
                <ul style="margin: 5px 0 0 0; padding-left: 20px;">
                    {''.join([f'<li style="color: #0c4a6e;">{form}</li>' for form in filled_forms])}
                </ul>
            </div>
            
            <div style="margin: 10px 0;">
                <p style="margin: 0; color: #0c4a6e; font-weight: bold;">❌ Still Need Help With:</p>
                <ul style="margin: 5px 0 0 0; padding-left: 20px;">
                    {''.join([f'<li style="color: #0c4a6e;">{form}</li>' for form in remaining_forms])}
                </ul>
            </div>
        </div>
        """
```

### **Flow Data Structure**

#### **5. DVRO Flow JSON** - Decision Tree Structure
```json
{
  "id": "dvro-flow",
  "version": "2025-01-15",
  "start": "DVROStart",
  "metadata": {
    "title": "Domestic Violence Restraining Order (DVRO)",
    "jurisdiction": "CA",
    "source": "San Mateo County Court",
    "flow_family": "DVRO"
  },
  "nodes": {
    "DVROStart": { "type": "start", "text": "Domestic Violence Restraining Order" },
    "DV0": { "type": "decision", "text": "What do you need help with?" },
    "DV1": { "type": "process", "text": "Ask for a new restraining order" },
    "DVCheck1": { "type": "decision", "text": "Do you want protection from someone who has abused you or your children?" },
    "DVStart": { "type": "process", "text": "You may qualify for a Domestic Violence Restraining Order" },
    "DVForms": { "type": "process", "text": "To start a Domestic Violence Restraining Order (DVRO), fill out required forms" },
    "DV100a": { "type": "process", "text": "Step 1: Fill out DV-100 (Request for Domestic Violence Restraining Order)" },
    "CLETSa": { "type": "process", "text": "Step 2: Fill out CLETS-001 (Confidential CLETS Information)" },
    "DV109a": { "type": "process", "text": "Step 3: Fill out DV-109 (Notice of Court Hearing)" },
    "DV110a": { "type": "process", "text": "Step 4: Fill out DV-110 (Temporary Restraining Order Request)" }
  },
  "edges": [
    { "from": "DVROStart", "to": "DV0" },
    { "from": "DV0", "to": "DV1", "when": "Ask for a new restraining order" },
    { "from": "DV1", "to": "DVCheck1" },
    { "from": "DVCheck1", "to": "DVStart", "when": "Yes" },
    { "from": "DVStart", "to": "DVTiming" },
    { "from": "DVTiming", "to": "DVForms" },
    { "from": "DVForms", "to": "DV100a" },
    { "from": "DV100a", "to": "CLETSa" },
    { "from": "CLETSa", "to": "DV109a" },
    { "from": "DV109a", "to": "DV110a" }
  ]
}
```

---

## 🔄 **Complete User Flow**

### **1. Flow Navigation**
1. **User starts flow** → `SimpleFlowRunner` loads flow data
2. **Progress through questions** → State managed in `currentNodeId` and `history`
3. **Form detection** → Forms extracted from node text using regex
4. **Flow completion** → Triggers admin questions

### **2. Admin Questions Process**
1. **Admin questions appear** → `AdminQuestionsPage` component
2. **Question 1**: "Have you filled out any forms?" (Yes/No)
3. **Question 2**: "Which forms have you filled out?" (Checklist)
4. **Data collection** → Admin data stored and passed to summary

### **3. Case Summary & Email**
1. **Summary generation** → `CompletionPage` creates comprehensive summary
2. **Email preparation** → Admin data included in email payload
3. **PDF generation** → Case summary and forms downloaded
4. **Email delivery** → Professional email sent with attachments

---

## 🎯 **Key Technical Features**

### **Form Detection System**
```javascript
// Regex patterns for form detection
const formMatches = node.text.match(/\b[A-Z]{2,3}-\d{3,4}\b/g);
const specificForms = node.text.match(/\b(DV-\d+|CLETS-001|SER-001|POS-040|CH-\d+|FL-\d+|FW-\d+|CM-\d+|EPO-\d+|JV-\d+|MC-\d+)\b/g);
```

### **Admin Data Structure**
```javascript
const adminData = {
  hasFilledForms: boolean,        // Whether user has filled any forms
  filledForms: string[],          // Array of completed form codes
  availableForms: string[],       // Array of all required form codes
  timestamp: string,              // When data was collected
  sessionId: string              // Unique session identifier
};
```

### **Email Integration**
```javascript
// Email payload includes admin data
const emailPayload = {
  email: userEmail,
  case_data: {
    // ... case information
    admin_data: adminData,        // Staff assistance data
    forms_completed: forms,       // Form information
    next_steps: steps            // Next steps
  }
};
```

---

## 🚀 **Deployment Status**

### **Frontend (Vercel)**
- **URL**: https://court-kiosk.vercel.app
- **Status**: ✅ Deployed and accessible
- **Build**: Clean build with no linting errors

### **Backend (Render)**
- **URL**: https://court-kiosk.onrender.com
- **Status**: ✅ Deployed and accessible
- **API**: All endpoints functional

---

## 📊 **System Benefits**

### **For Users**
- **Guided Process**: Step-by-step legal guidance
- **Form Assistance**: Automatic form detection and download
- **Email Delivery**: Comprehensive case summary with attachments
- **Multi-language**: Support for English, Spanish, Chinese

### **For Admin Staff**
- **Targeted Assistance**: Know exactly which forms user needs help with
- **Efficient Service**: Focus on remaining forms only
- **Better Support**: Personalized help based on user's progress
- **Time Saving**: No need to ask users what they've completed

---

## 🔧 **Technical Stack**

### **Frontend**
- **React 18+** with modern hooks
- **Tailwind CSS** for styling
- **Context API** for state management
- **React Router** for navigation

### **Backend**
- **Python Flask** with SQLAlchemy ORM
- **Resend API** for email delivery
- **ReportLab** for PDF generation
- **OpenAI API** for AI analysis

### **Deployment**
- **Vercel** for frontend hosting
- **Render** for backend hosting
- **GitHub** for version control

---

**The Court Kiosk system is now complete with enhanced admin assistance capabilities, providing a comprehensive solution for court visitors and staff alike.** 🏛️✨
