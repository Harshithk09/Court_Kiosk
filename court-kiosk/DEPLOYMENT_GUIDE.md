# Court Kiosk Deployment Guide

## 🚀 Production Deployment Checklist

### **1. Environment Variables Setup**

#### **For Vercel Deployment:**
1. Go to your Vercel dashboard
2. Select your `court-kiosk` project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

```
RESEND_API_KEY=re_8zh6qJo4_JunzEDpb9umxouJpK4ZwcAGk
OPENAI_API_KEY=your_openai_api_key_here
```

#### **For Local Development:**
1. Copy the environment template:
   ```bash
  
   ```
2. Edit `.env` with your actual API keys

### **2. Required API Keys**

| Variable | Required | Purpose |
|----------|----------|---------|
| `RESEND_API_KEY` | ✅ Yes | Email sending in production |
| `OPENAI_API_KEY` | ✅ Yes | LLM features and AI assistance |

### **3. Deployment Status**

#### **✅ Fixed Issues:**
- ✅ Vercel deployment configuration
- ✅ Serverless API endpoint for email sending
- ✅ CORS configuration for production domain
- ✅ Frontend API endpoint configuration
- ✅ PDF attachment functionality
- ✅ Environment variable template

#### **🔧 Current Architecture:**
- **Frontend**: React app deployed on Vercel
- **Backend**: Serverless functions (Vercel Functions)
- **Email Service**: Resend API
- **Database**: SQLite (local development only)

### **4. Testing the Deployment**

#### **Local Testing:**
```bash
# Start local development
cd court-kiosk
./start-enhanced-system.sh
```

#### **Production Testing:**
1. Visit: `https://court-kiosk.vercel.app`
2. Complete a DVRO flow
3. Test email sending functionality
4. Verify PDF attachments are included

### **5. Troubleshooting**

#### **Common Issues:**

**Email Not Sending:**
- Check `RESEND_API_KEY` is set in Vercel
- Verify domain is verified in Resend dashboard
- Check Vercel function logs

**PDF Attachments Missing:**
- Ensure `court_documents` folder is deployed
- Check file permissions
- Verify PDF files exist in the folder

**CORS Errors:**
- Verify `https://court-kiosk.vercel.app` is in CORS origins
- Check API endpoint URLs

### **6. File Structure for Production**

```
court-kiosk/
├── frontend/
│   ├── api/                    # Serverless functions
│   │   └── email/
│   │       └── send-case-summary.js
│   ├── src/                    # React source code
│   └── build/                  # Built React app
├── court_documents/            # PDF files for attachments
├── vercel.json                 # Vercel configuration
└── env.template               # Environment variables template
```

### **7. Next Steps**

1. **Set Environment Variables** in Vercel dashboard
2. **Deploy** the updated code
3. **Test** email functionality
4. **Monitor** Vercel function logs for any issues

### **8. Support**

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables are set
3. Test locally first
4. Check Resend dashboard for email delivery status
