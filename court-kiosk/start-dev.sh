#!/bin/bash

# Court Kiosk Development Startup Script
echo "🚀 Starting Court Kiosk System..."

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "❌ Backend virtual environment not found. Please run setup first."
    exit 1
fi

# Start backend in background
echo "📡 Starting backend server..."
cd backend
source venv/bin/activate
echo "✅ Virtual environment activated"
echo "🐍 Python path: $(which python)"
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "✅ Both services started!"
echo "📡 Backend: http://localhost:4000"
echo "🎨 Frontend: http://localhost:3000"
echo "👨‍💼 Admin: http://localhost:3000/admin"
echo ""
echo "Press Ctrl+C to stop both services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Services stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for user to stop
wait
