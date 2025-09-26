# Vercel Deployment Setup

This document explains how to deploy your Court Kiosk application to Vercel with proper email functionality.

## Prerequisites

1. A Vercel account
2. A Resend account for email services
3. Your domain (optional, for custom email addresses)

## Setup Steps

### 1. Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set the build command to: `npm run build`
3. Set the output directory to: `build`
4. Deploy the application

### 2. Configure Environment Variables

In your Vercel project settings, add these environment variables:

#### Required Variables:
- `RESEND_API_KEY` - Your Resend API key for sending emails

#### Optional Variables:
- `REACT_APP_API_URL` - Your Vercel app URL (e.g., `https://your-app.vercel.app`)

### 3. Email Configuration

#### Using Resend (Recommended):
1. Sign up for a Resend account at https://resend.com
2. Get your API key from the dashboard
3. Add it as `RESEND_API_KEY` in Vercel environment variables
4. Update the "from" email address in `/api/email/send-case-summary.js` to use your verified domain

#### Custom Domain Setup:
1. In Resend, add and verify your domain
2. Update the "from" address in the email function to use your domain
3. Example: `'San Mateo Court Kiosk <noreply@yourdomain.com>'`

### 4. API Endpoints

The following API endpoints are now available as Vercel serverless functions:

- `POST /api/email/send-case-summary` - Send case summary emails
- `POST /api/queue/join` - Join the queue
- `GET /api/queue/status` - Get queue status
- `POST /api/sms/send-queue-number` - Send SMS notifications
- `GET /api/health` - Health check

### 5. Testing

1. Deploy your application to Vercel
2. Test the email functionality by completing a case flow
3. Check the Vercel function logs for any errors
4. Verify emails are being sent successfully

## Troubleshooting

### Email Not Sending:
1. Check that `RESEND_API_KEY` is set correctly
2. Verify your domain is verified in Resend
3. Check the Vercel function logs for errors
4. Ensure the "from" email address is valid

### CORS Issues:
- The API functions include proper CORS headers
- If you still have issues, check that your frontend is calling the correct API URL

### Function Timeouts:
- Vercel serverless functions have a 10-second timeout on the hobby plan
- For longer operations, consider upgrading to a paid plan

## Development vs Production

### Development:
- Uses `http://localhost:1904` for API calls
- Falls back to mock data if backend is unavailable

### Production:
- Uses your Vercel app URL for API calls
- All functions run as serverless functions
- Emails are sent via Resend

## Next Steps

1. **Database Integration**: Consider adding a database (like Vercel Postgres) for persistent queue data
2. **SMS Integration**: Integrate with Twilio or similar service for real SMS functionality
3. **Authentication**: Add user authentication if needed
4. **Monitoring**: Set up monitoring and logging for production use

## Support

If you encounter issues:
1. Check the Vercel function logs
2. Verify all environment variables are set
3. Test the API endpoints individually
4. Check the browser console for frontend errors
