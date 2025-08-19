#!/bin/bash

# Court Kiosk Development Setup Script
echo "🚀 Setting up Court Kiosk Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed successfully"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Install backend dependencies
echo "🐍 Installing backend dependencies..."
cd ../backend
pip3 install -r requirements.txt
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed successfully"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
cd ..
mkdir -p frontend/src/data
mkdir -p frontend/build

echo "✅ Development environment setup complete!"
echo ""
echo "🎯 To start development:"
echo "   Frontend: cd frontend && npm start"
echo "   Backend:  cd backend && python3 app.py"
echo ""
echo "🌐 The application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📚 For more information, see README_NEW.md"
