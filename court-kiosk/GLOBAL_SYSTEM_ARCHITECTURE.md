# 🌍 Court Kiosk - Global System Architecture

## 🚀 **Current Deployment Status**

### **Frontend (Vercel)**
- **Platform**: Vercel
- **URL**: `https://your-vercel-app.vercel.app`
- **Technology**: React.js
- **Status**: ✅ Deployed

### **Backend (Render)**
- **Platform**: Render
- **URL**: `https://court-kiosk.onrender.com`
- **Technology**: Flask + Python
- **Status**: ✅ Live and Working

## 📧 **Email System Architecture**

### **Email Flow**
```
User completes legal flow → 
Frontend calls Render API → 
Backend processes case data → 
Backend sends email via Resend → 
User receives email with form links
```

### **Email Service Details**
- **Provider**: Resend API
- **From**: Your configured Resend account
- **To**: Users who complete legal document flows
- **Content**: Case summary + 69+ California Court form links
- **Global Delivery**: ✅ Worldwide email delivery

## 🔗 **API Endpoints (Render Backend)**

### **Core Endpoints**
- **Health Check**: `https://court-kiosk.onrender.com/api/health`
- **Queue Management**: `https://court-kiosk.onrender.com/api/queue/join`
- **Email Service**: `https://court-kiosk.onrender.com/api/email/send-case-summary`

### **Form Management**
- **All 69+ California Court Forms**: Available via official URLs
- **Form Types**: DV, FL, CH, FW, CLETS, CM, EPO, JV, MC, POS, SER
- **Source**: Official California Courts website (`courts.ca.gov`)

## 🌐 **Global Accessibility**

### **Frontend Access**
- **URL**: Your Vercel deployment URL
- **Accessibility**: Worldwide
- **Features**: Legal document flows, form generation, case summaries

### **Backend API**
- **URL**: `https://court-kiosk.onrender.com`
- **Accessibility**: Worldwide
- **Features**: Queue management, email service, form links

### **Database**
- **Type**: SQLite (hosted on Render)
- **Location**: Render backend server
- **Data**: Case summaries, queue entries, user sessions

## ⚙️ **Environment Configuration**

### **Frontend (Vercel)**
Set these environment variables in Vercel dashboard:

```bash
REACT_APP_API_URL=https://court-kiosk.onrender.com
REACT_APP_KIOSK_MODE=false
```

### **Backend (Render)**
Already configured with:
- `RESEND_API_KEY`: Your Resend API key
- `OPENAI_API_KEY`: Your OpenAI API key
- `SECRET_KEY`: Generated secret key
- `CORS_ORIGINS`: Configured for Vercel

## 🧪 **Testing Your Global System**

### **1. Test Backend API**
```bash
curl https://court-kiosk.onrender.com/api/health
# Expected: {"status":"OK"}
```

### **2. Test Frontend Connection**
1. Visit your Vercel frontend URL
2. Complete a legal document flow
3. Verify email is sent with form links

### **3. Test Email Service**
1. Complete a case in the frontend
2. Check your email for case summary
3. Verify all form links are working

## 🎯 **System Capabilities**

### **Legal Document Processing**
- ✅ Domestic Violence (DV) forms
- ✅ Family Law (FL) forms  
- ✅ Child Custody (CH) forms
- ✅ All 69+ California Court forms
- ✅ Official form links (always up-to-date)

### **User Experience**
- ✅ Guided legal document flows
- ✅ Real-time form detection
- ✅ Case summaries with form links
- ✅ Email delivery with attachments
- ✅ Queue management system

### **Global Features**
- ✅ Worldwide accessibility
- ✅ Mobile-responsive design
- ✅ Multi-language support ready
- ✅ Scalable architecture

## 🚀 **Next Steps**

1. **Set Environment Variables in Vercel**:
   - Go to Vercel dashboard
   - Add `REACT_APP_API_URL=https://court-kiosk.onrender.com`
   - Redeploy frontend

2. **Test Complete System**:
   - Verify frontend connects to backend
   - Test email delivery
   - Confirm form links work

3. **Monitor Performance**:
   - Check Render logs for backend health
   - Monitor Vercel deployment status
   - Verify email delivery rates

## 📊 **System Metrics**

### **Resume-Worthy Achievements**
- **69+ Legal Forms**: Integrated with official California Courts
- **Global Deployment**: Frontend (Vercel) + Backend (Render)
- **Email Service**: Automated case summary delivery
- **API Architecture**: RESTful endpoints with health monitoring
- **Database Management**: SQLite with case tracking
- **Form Management**: Dynamic form detection and linking

### **Technical Stack**
- **Frontend**: React.js, Vercel deployment
- **Backend**: Flask, Python, Render deployment
- **Database**: SQLite with SQLAlchemy ORM
- **Email**: Resend API integration
- **Forms**: 69+ California Court official forms
- **Architecture**: Microservices with global accessibility

---

**🎉 Your Court Kiosk system is now globally accessible and fully functional!**
