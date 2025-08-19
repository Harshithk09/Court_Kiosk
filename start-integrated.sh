#!/bin/bash

# Integrated Court Kiosk System Startup Script
# This script starts the backend on port 5001 to match the existing frontend

echo "🚀 Starting Integrated Court Kiosk System..."

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

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
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
echo "🔧 Starting backend server..."
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

# Database Configuration
SQLALCHEMY_DATABASE_URI=sqlite:///court_kiosk.db
EOF
    echo "📝 Please edit .env file with your actual credentials before starting the system."
fi

# Start backend server in background on port 5001
echo "🚀 Starting Flask backend on http://localhost:5001"
python app.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start. Check the logs above for errors."
    exit 1
fi

echo "✅ Backend server started successfully!"

# Start frontend server
echo "🔧 Starting frontend server..."
cd ../frontend

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

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

echo "✅ Frontend server started successfully!"

echo ""
echo "🎉 Integrated Court Kiosk System is now running!"
echo ""
echo "📱 User Interface: http://localhost:3000"
echo "👨‍💼 Admin Dashboard: http://localhost:3000/admin"
echo "🔧 Backend API: http://localhost:5001"
echo ""
echo "🔄 System Features:"
echo "• Enhanced Queue System (Priority A, B, C, D)"
echo "• LLM Integration with Flowchart Context"
echo "• Dual Frontend Interfaces (User + Admin)"
echo "• Spanish Language Support"
echo "• Real-time Progress Tracking"
echo "• AI-powered Case Summaries"
echo ""
echo "🛑 Press Ctrl+C to stop all servers"
echo ""

# Wait for user to stop the servers
wait
