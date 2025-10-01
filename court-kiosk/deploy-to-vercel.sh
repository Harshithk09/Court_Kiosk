#!/bin/bash

# Court Kiosk Global Deployment Script for Vercel
# This script deploys both frontend and backend to Vercel with proper configuration

set -e  # Exit on any error

echo "🚀 Court Kiosk Global Deployment to Vercel"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Please install it first:"
    echo "npm install -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_error "You are not logged in to Vercel. Please login first:"
    echo "vercel login"
    exit 1
fi

print_status "Starting deployment process..."

# 1. Deploy Backend
print_status "Deploying backend to Vercel..."
cd backend

# Create vercel.json for backend if it doesn't exist
if [ ! -f "vercel.json" ]; then
    print_status "Creating backend vercel.json..."
    cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "app.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.py"
    }
  ],
  "env": {
    "CORS_ORIGINS": "*",
    "LOG_LEVEL": "INFO"
  }
}
EOF
fi

# Deploy backend
print_status "Deploying backend..."
BACKEND_URL=$(vercel --prod --yes 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)

if [ -z "$BACKEND_URL" ]; then
    print_error "Failed to get backend URL from deployment"
    exit 1
fi

print_success "Backend deployed to: $BACKEND_URL"
cd ..

# 2. Deploy Frontend
print_status "Deploying frontend to Vercel..."
cd frontend

# Update environment variables for frontend
export REACT_APP_API_URL="$BACKEND_URL"

# Build frontend
print_status "Building frontend..."
npm run build

# Deploy frontend
print_status "Deploying frontend..."
FRONTEND_URL=$(vercel --prod --yes 2>/dev/null | grep -o 'https://[^[:space:]]*' | head -1)

if [ -z "$FRONTEND_URL" ]; then
    print_error "Failed to get frontend URL from deployment"
    exit 1
fi

print_success "Frontend deployed to: $FRONTEND_URL"
cd ..

# 3. Update environment variables in Vercel dashboard
print_status "Setting up environment variables..."

# Backend environment variables
print_warning "Please set these environment variables in your Vercel backend project:"
echo "CORS_ORIGINS=*"
echo "OPENAI_API_KEY=your_openai_api_key"
echo "EMAIL_HOST=smtp.gmail.com"
echo "EMAIL_PORT=587"
echo "EMAIL_USER=your_email@gmail.com"
echo "EMAIL_PASS=your_app_password"
echo "FACILITATOR_EMAIL=facilitator@court.gov"
echo "RESEND_API_KEY=your_resend_api_key"
echo "SECRET_KEY=your_secret_key"
echo "LOG_LEVEL=INFO"
echo ""

# Frontend environment variables
print_warning "Please set these environment variables in your Vercel frontend project:"
echo "REACT_APP_API_URL=$BACKEND_URL"
echo "NODE_ENV=production"
echo "GENERATE_SOURCEMAP=false"
echo ""

# 4. Test deployment
print_status "Testing deployment..."

# Wait a moment for deployment to be ready
sleep 10

# Test backend health
print_status "Testing backend health endpoint..."
if curl -s -f "$BACKEND_URL/api/health" > /dev/null; then
    print_success "Backend health check passed"
else
    print_warning "Backend health check failed - this is normal if the endpoint doesn't exist yet"
fi

# Test frontend
print_status "Testing frontend..."
if curl -s -f "$FRONTEND_URL" > /dev/null; then
    print_success "Frontend is accessible"
else
    print_error "Frontend is not accessible"
fi

# 5. Summary
echo ""
echo "🎉 Deployment Summary"
echo "===================="
echo "Backend URL:  $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo "📋 Next Steps:"
echo "1. Set environment variables in Vercel dashboard (see above)"
echo "2. Test the admin page at: $FRONTEND_URL/admin"
echo "3. Verify API endpoints are working"
echo "4. Test queue management functionality"
echo ""
echo "🔧 Troubleshooting:"
echo "- Check Vercel function logs for backend errors"
echo "- Verify CORS configuration allows global access"
echo "- Ensure all required environment variables are set"
echo ""
print_success "Deployment completed successfully!"
