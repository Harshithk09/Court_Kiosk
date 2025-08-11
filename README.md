# Court Kiosk System

A **Kaiser-style kiosk system** for family court clinics that helps manage client queues with priority-based scheduling and guided question flows.

## 🎯 **System Overview**

### **Priority Queue System**
- **A (Red)**: Domestic Violence cases - Immediate attention
- **B (Orange)**: Custody/Support cases - High priority  
- **C (Yellow)**: Divorce cases - Medium priority
- **D (Blue)**: Other cases - Standard priority

### **Two Interfaces**
1. **User Kiosk** (`/`) - Simple touch interface for clients
2. **Admin Dashboard** (`/admin`) - For facilitators to manage queue

## 🚀 **Features**

### **User Kiosk**
- ✅ **Simple Case Selection** - 4 clear categories with priority indicators
- ✅ **Guided Questions** - Structured questions based on case type
- ✅ **Queue Number Generation** - Priority-based numbering (A001, B002, etc.)
- ✅ **Case Summary** - AI-generated summary sent to facilitators
- ✅ **Next Steps** - Personalized guidance for clients
- ✅ **Bilingual Support** - English/Spanish interface
- ✅ **Emergency Information** - Clear emergency contact display

### **Admin Dashboard**
- ✅ **Real-time Queue Management** - Live updates every 5 seconds
- ✅ **Priority-based Display** - Organized by case priority
- ✅ **Call Next Function** - Facilitators can call next person
- ✅ **Case Completion** - Mark cases as completed
- ✅ **Queue Statistics** - Visual count by priority
- ✅ **Bilingual Interface** - English/Spanish support

### **Backend Features**
- ✅ **Priority Queue Logic** - A > B > C > D ordering
- ✅ **AI Integration** - LLM for case summaries and next steps
- ✅ **Database Storage** - SQLite with SQLAlchemy
- ✅ **Email Notifications** - Send summaries to facilitators
- ✅ **Guided Questions** - Structured question flows

## 🛠️ **Installation**

### **Prerequisites**
- Python 3.8+
- Node.js 16+
- npm or yarn

### **Backend Setup**
```bash
cd court-kiosk/backend
pip install -r requirements.txt
```

### **Frontend Setup**
```bash
cd court-kiosk/frontend
npm install
```

### **Environment Variables**
Create `.env` file in `backend/`:
```env
OPENAI_API_KEY=your_openai_api_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FACILITATOR_EMAIL=facilitator@court.gov
```

## 🚀 **Running the Application**

### **Option 1: Using the provided script**
```bash
cd court-kiosk
chmod +x run.sh
./run.sh
```

### **Option 2: Manual start**
```bash
# Terminal 1 - Backend
cd court-kiosk/backend
python app.py

# Terminal 2 - Frontend
cd court-kiosk/frontend
npm start
```

### **Access Points**
- **User Kiosk**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Backend API**: http://localhost:5001

## 📋 **API Endpoints**

### **Queue Management**
- `POST /api/generate-queue` - Generate queue number
- `GET /api/queue` - Get current queue status
- `POST /api/call-next` - Call next person in queue
- `POST /api/complete-case` - Mark case as completed

### **Guided Questions**
- `POST /api/guided-questions` - Get questions for case type
- `POST /api/process-answers` - Process answers and generate summary

### **Legacy Endpoints** (still available)
- `POST /api/ask` - AI chat assistant
- `POST /api/submit-session` - Submit session summary
- `GET /api/forms` - Get court forms
- `GET /api/staff` - Get staff directory

## 🎨 **User Experience Flow**

### **Client Journey**
1. **Select Case Type** - Choose from 4 priority categories
2. **Answer Questions** - Guided questions based on case type
3. **Get Queue Number** - Priority-based number (A001, B002, etc.)
4. **View Summary** - AI-generated case summary
5. **See Next Steps** - Personalized guidance
6. **Wait for Call** - Facilitator will call number

### **Facilitator Workflow**
1. **View Dashboard** - See organized queue by priority
2. **Call Next** - Call next person in priority order
3. **Review Case** - See AI-generated summary and next steps
4. **Complete Case** - Mark case as completed
5. **Monitor Statistics** - Track queue by priority

## 🔧 **Database Schema**

### **QueueEntry**
- `id` - Primary key
- `queue_number` - Unique queue number (A001, B002, etc.)
- `case_type` - Case category (A, B, C, D)
- `priority` - Priority level (A, B, C, D)
- `status` - waiting, called, completed
- `timestamp` - When entry was created
- `language` - en/es
- `summary` - AI-generated case summary
- `next_steps` - AI-generated next steps

### **GuidedQuestion**
- `id` - Primary key
- `case_type` - Case category
- `question_text` - Question content
- `language` - en/es
- `order_num` - Question order

## 🎯 **Priority System**

### **Priority A (Red) - Domestic Violence**
- **Immediate attention required**
- **Emergency cases**
- **Restraining orders**
- **Protection orders**

### **Priority B (Orange) - Custody & Support**
- **Child custody cases**
- **Child support matters**
- **Visitation rights**
- **High priority family matters**

### **Priority C (Yellow) - Divorce & Separation**
- **Divorce proceedings**
- **Legal separation**
- **Property division**
- **Medium priority cases**

### **Priority D (Blue) - Other Family Law**
- **Adoption**
- **Guardianship**
- **Name changes**
- **Other family matters**

## 🔒 **Security & Privacy**

- **No personal data stored** - Only case type and queue numbers
- **Anonymous queue system** - No names or personal identifiers
- **Secure API endpoints** - CORS enabled for local development
- **Email notifications** - Optional facilitator notifications

## 🚀 **Deployment**

### **Production Setup**
1. Set up production database (PostgreSQL recommended)
2. Configure environment variables
3. Set up reverse proxy (nginx)
4. Use PM2 or similar for process management
5. Enable HTTPS

### **Docker Deployment** (Optional)
```bash
docker-compose up -d
```

## 🐛 **Troubleshooting**

### **Common Issues**
1. **Port 5001 in use** - Change port in `app.py`
2. **OpenAI API errors** - Check API key in `.env`
3. **Database errors** - Delete `court_kiosk.db` to reset
4. **CORS errors** - Ensure backend is running on correct port

### **Development Tips**
- Backend auto-reloads with `debug=True`
- Frontend hot-reloads with `npm start`
- Check browser console for frontend errors
- Check terminal for backend errors

## 📞 **Support**

For technical support or feature requests, please contact the development team.

---

**Built for Family Court Clinics** 🏛️
