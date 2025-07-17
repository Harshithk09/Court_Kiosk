# Court Kiosk Backend

This is the backend server for the Court Self-Help Center application, providing email and PDF generation services.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Email Settings
1. Create a `.env` file in the backend directory
2. Add your email configuration:
```
PORT=3001
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Gmail App Password Setup
To use Gmail for sending emails, you need to create an "App Password":

1. Enable 2-factor authentication on your Google account
2. Go to Google Account settings > Security > App passwords
3. Generate a new app password for "Mail"
4. Use that password in the `.env` file instead of your regular Gmail password

### 4. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:3001`

## API Endpoints

### POST /api/send-email
Sends an email with form recommendations and attached PDF.

**Request Body:**
```json
{
  "email": "user@example.com",
  "topic": "divorce",
  "answers": {...},
  "forms": [...],
  "nextSteps": [...],
  "location": {...}
}
```

### POST /api/generate-pdf
Generates and downloads a PDF with form recommendations.

**Request Body:**
```json
{
  "topic": "divorce",
  "answers": {...},
  "forms": [...],
  "nextSteps": [...],
  "location": {...}
}
```

### GET /api/health
Health check endpoint.

## Features

- **Email Service**: Sends personalized form recommendations via email
- **PDF Generation**: Creates downloadable PDFs with form lists and instructions
- **CORS Enabled**: Allows frontend to connect from different ports
- **Error Handling**: Proper error responses and logging

## Notes

- The backend runs on port 3001 by default
- Make sure the frontend is configured to connect to `http://localhost:3001`
- For production, update the email service configuration and CORS settings 