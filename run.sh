#!/bin/bash

# Court Kiosk Application Runner
# This script starts both the Flask backend and React frontend

echo "Starting Court Kiosk Application..."

# Function to cleanup background processes
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start Flask backend
echo "Starting Flask backend server..."
cd backend
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start React frontend
echo "Starting React frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "Both servers are starting..."
echo "Backend will be available at: http://localhost:5001"
echo "Frontend will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait 