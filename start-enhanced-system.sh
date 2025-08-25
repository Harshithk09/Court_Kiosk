#!/bin/bash

# Enhanced Court Kiosk System Startup Script
echo "Starting Enhanced Court Kiosk System..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the court-kiosk directory"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Creating a template..."
    cat > .env << EOF
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FACILITATOR_EMAIL=facilitator@court.gov

# Database Configuration
DATABASE_URL=sqlite:///court_kiosk.db

# Server Configuration
FLASK_ENV=development
FLASK_DEBUG=1
EOF
    echo "Please edit .env file with your actual configuration values"
    echo "Then run this script again."
    exit 1
fi

# Install Python dependencies
echo "Installing Python dependencies..."
cd backend
pip install -r requirements.txt

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
cd ../frontend
npm install

# Start the backend server
echo "Starting backend server..."
cd ../backend
python enhanced_app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start the frontend development server
echo "Starting frontend development server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Function to cleanup on exit
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo "Enhanced Court Kiosk System is running!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo "Admin Dashboard: http://localhost:3000/admin"
echo ""
echo "Press Ctrl+C to stop the servers"

# Wait for processes
wait
