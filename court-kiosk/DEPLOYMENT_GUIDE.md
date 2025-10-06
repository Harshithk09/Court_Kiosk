# Court Kiosk Global Deployment Guide

This guide ensures the admin page and API work globally on Vercel.

## Environment Variables Setup

### Frontend (Vercel Dashboard)
Set these environment variables in your Vercel project dashboard:

```
REACT_APP_API_URL=https://court-kiosk-backend.vercel.app
NODE_ENV=production
GENERATE_SOURCEMAP=false
```

### Backend (Vercel Dashboard)
Set these environment variables for the backend:

```
CORS_ORIGINS=*
OPENAI_API_KEY=your_openai_api_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FACILITATOR_EMAIL=facilitator@court.gov
RESEND_API_KEY=your_resend_api_key
SECRET_KEY=your_secret_key
LOG_LEVEL=INFO
```

## Deployment Steps

### 1. Frontend Deployment
1. Connect your GitHub repository to Vercel
2. Set the build command: `npm run build`
3. Set the output directory: `build`
4. Set the root directory: `court-kiosk/frontend`
5. Add the environment variables listed above

### 2. Backend Deployment
1. Create a separate Vercel project for the backend
2. Set the root directory: `court-kiosk/backend`
3. Add the backend environment variables
4. Ensure the backend URL is accessible globally

### 3. API Configuration
The frontend now uses centralized API configuration in `src/utils/apiConfig.js`:
- Automatically detects production vs development environment
- Uses environment variables for API base URL
- Provides fallback for development

## CORS Configuration

The backend is configured to allow global access:
- CORS origins set to `*` for production
- Proper headers configured in `vercel.json`
- Security headers added to prevent common attacks

## Testing Global Access

1. Deploy both frontend and backend to Vercel
2. Test admin page functionality:
   - Queue management
   - Case completion
   - Email sending
   - SMS notifications
3. Verify API endpoints are accessible from different locations

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Ensure CORS_ORIGINS is set to `*` in backend
2. **API Connection**: Verify REACT_APP_API_URL points to correct backend URL
3. **Environment Variables**: Check all required variables are set in Vercel dashboard

### Debug Mode:
- Check browser console for API errors
- Verify network requests in browser dev tools
- Check Vercel function logs for backend errors

## Security Considerations

- API keys are stored securely in Vercel environment variables
- CORS is configured for global access but can be restricted if needed
- Rate limiting is enabled on the backend
- Security headers are added to prevent common attacks
