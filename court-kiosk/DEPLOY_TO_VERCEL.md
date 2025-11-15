# Deploy to Vercel - Quick Fix Guide

## Issue
The Vercel project has an incorrect Root Directory configuration. The error shows it's looking for `~/Potential_Project/court-kiosk/court-kiosk` which doesn't exist.

## Solution Options

### Option 1: Fix Root Directory in Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/court-kiosks-projects/court-kiosk/settings
2. Navigate to **General** → **Root Directory**
3. Change the Root Directory from `court-kiosk` to `.` (dot) or leave it empty
4. Save the changes
5. Then run: `vercel --prod --yes` from the project root

### Option 2: Deploy via Git Push (If connected to GitHub)

If your repository is connected to Vercel via GitHub:

1. Commit your changes:
   ```bash
   git add -A
   git commit -m "Deploy admin dashboard improvements and fixes"
   git push
   ```

2. Vercel will automatically deploy from the push

### Option 3: Create New Vercel Project

If the above doesn't work:

1. Remove the existing link:
   ```bash
   rm -rf .vercel
   ```

2. Create a new project:
   ```bash
   vercel --prod
   ```

3. Follow the prompts to create a new project

## Current Configuration

- **Project Name**: court-kiosk
- **Frontend**: React app in `frontend/` directory
- **Backend**: Python Flask app in `backend/` directory
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/build`

## Environment Variables Needed

Make sure these are set in Vercel dashboard:

### Required:
- `RESEND_API_KEY` - For email functionality
- `OPENAI_API_KEY` - For LLM features
- `SECRET_KEY` - For Flask sessions

### Optional:
- `ADMIN_WHITELIST` - Comma-separated admin usernames
- `ADMIN_WHITELIST_EMAILS` - Comma-separated admin emails
- `CORS_ORIGINS` - CORS allowed origins (default: "*")
- `LOG_LEVEL` - Logging level (default: "INFO")

## After Fixing Root Directory

Once the Root Directory is fixed, deploy with:

```bash
cd /Users/hk04/Potential_Project/court-kiosk
vercel --prod --yes
```

## Verify Deployment

After deployment, check:
- Frontend: `https://court-kiosk.vercel.app` (or your custom domain)
- Backend API: `https://court-kiosk.vercel.app/api/health`
- Admin Dashboard: `https://court-kiosk.vercel.app/admin`

