#!/bin/bash

# New Features Startup Script
# This script sets up and starts the enhanced court kiosk system with new features

echo "🚀 Starting Enhanced Court Kiosk System with New Features..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server
echo "🔧 Starting enhanced backend server..."
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Creating template..."
    cat > .env << EOF
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FACILITATOR_EMAIL=facilitator@court.gov

# Resend Email Service (for detailed case summary emails)
RESEND_API_KEY=your_resend_api_key_here

# Database Configuration
DATABASE_URL=sqlite:///court_kiosk.db

# Server Configuration
PORT=5000
FLASK_DEBUG=False
SECRET_KEY=your-secret-key-here
EOF
    echo "📝 Please edit .env file with your actual credentials before starting the system."
    echo "   Required: OPENAI_API_KEY and RESEND_API_KEY for full functionality"
fi

# Start enhanced backend server in background
echo "🚀 Starting enhanced Flask backend on http://localhost:5000"
python enhanced_app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start. Check the logs above for errors."
    exit 1
fi

echo "✅ Backend is running on http://localhost:5000"

# Start frontend server
echo "🎨 Starting frontend server..."
cd ../frontend

# Install Node.js dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start frontend server in background
echo "🚀 Starting React frontend on http://localhost:3000"
npm start &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Frontend failed to start. Check the logs above for errors."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Frontend is running on http://localhost:3000"
echo ""
echo "🎉 Enhanced Court Kiosk System is now running!"
echo ""
echo "📋 New Features Available:"
echo "   • Enhanced queue system with case summaries"
echo "   • Detailed email service with hyperlinked forms"
echo "   • Form hyperlinking throughout the system"
echo ""
echo "🌐 Access the application at:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:5000"
echo "   • Admin Dashboard: http://localhost:3000/admin"
echo ""
echo "📚 Documentation: README_NEW_FEATURES.md"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop the servers
wait
