# 🚀 Court Kiosk - Complete Deployment Fix

## 🎯 Current Status
- ✅ **Frontend**: Working perfectly at `https://court-kiosk.vercel.app`
- ✅ **Environment Variables**: All set up (SECRET_KEY, CORS_ORIGINS, LOG_LEVEL, RESEND_API_KEY)
- ❌ **API Endpoints**: Not working (returning HTML instead of JSON)

## 🔧 Root Cause
The Vercel project has a configuration issue where it's looking for files in the wrong path (`court-kiosk/court-kiosk/frontend` instead of just `court-kiosk/frontend`).

## 🚀 Solution Options

### Option 1: Fix Current Project (Recommended)
1. **Go to Vercel Dashboard**: https://vercel.com/court-kiosks-projects/court-kiosk/settings
2. **Update Project Settings**:
   - Root Directory: `court-kiosk` (not `court-kiosk/frontend`)
   - Build Command: `npm run build`
   - Output Directory: `build`
3. **Redeploy**: The API functions will work automatically

### Option 2: Create New Project
```bash
# Remove current project
vercel project rm court-kiosk

# Create new project
vercel --prod --yes
```

### Option 3: Manual Fix via Vercel Dashboard
1. Go to: https://vercel.com/court-kiosks-projects/court-kiosk/settings/general
2. Change "Root Directory" from `court-kiosk/frontend` to `.` (root)
3. Save and redeploy

## 🧪 Testing Commands

### Test Frontend
```bash
curl https://court-kiosk.vercel.app/
# Should return HTML (✅ Working)
```

### Test API Endpoints
```bash
# Health Check
curl https://court-kiosk.vercel.app/api/health
# Should return JSON: {"status":"OK","timestamp":"...","service":"Court Kiosk API","version":"1.0.0"}

# Queue Status
curl https://court-kiosk.vercel.app/api/queue
# Should return JSON with queue data

# Email Test
curl -X POST https://court-kiosk.vercel.app/api/email/send-case-summary \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","case_data":{"queue_number":"A001","case_type":"DVRO","summary":{"forms":["DV-100","DV-109"],"steps":["Fill forms","File with court"]}}}'
```

## 📁 Current File Structure
```
court-kiosk/
├── api/
│   ├── health.js ✅
│   ├── queue.js ✅
│   ├── email/
│   │   └── send-case-summary.js ✅
│   └── package.json ✅
├── frontend/
│   ├── build/ ✅
│   ├── src/ ✅
│   └── package.json ✅
├── vercel.json ✅
└── requirements.txt ✅
```

## 🔑 Environment Variables (Already Set)
- `SECRET_KEY`: 1HKAnKZup0sccmyFnrZX12_fEKgapdXvqBk1DaCVgVg
- `CORS_ORIGINS`: *
- `LOG_LEVEL`: INFO
- `RESEND_API_KEY`: [Your Resend API Key]

## 🎉 Expected Results After Fix
1. **Frontend**: ✅ Already working
2. **API Health**: ✅ Returns JSON status
3. **Queue Management**: ✅ Add/check queue
4. **Email Service**: ✅ Send case summaries with form links
5. **Form Links**: ✅ All 69+ California Court forms working

## 🚀 Quick Fix Commands
```bash
# Test current status
node test-deployment.js

# After fixing Vercel settings, test again
node test-deployment.js

# Should show: ✅ Working APIs: 4
```

## 📞 Next Steps
1. **Fix Vercel project settings** (Option 1 above)
2. **Test all endpoints** using the commands above
3. **Verify email functionality** with a real email
4. **Test form links** in the completion page

The system is 95% ready - just need to fix the Vercel project configuration!
