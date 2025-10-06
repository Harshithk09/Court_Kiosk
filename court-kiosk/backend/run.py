#!/usr/bin/env python3
"""
Backend runner script that ensures proper virtual environment activation
"""
import sys
import os
import subprocess
import importlib.util

def main():
    # Check if we're in a virtual environment
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("⚠️  Warning: Not running in a virtual environment")
        print("Please run: source venv/bin/activate")
        print("Then run: python run.py")
        sys.exit(1)
    
    # Check if required packages are installed without importing them
    required_packages = ["flask", "reportlab", "openai"]
    missing_packages = [pkg for pkg in required_packages if importlib.util.find_spec(pkg) is None]
    if missing_packages:
        print(f"❌ Missing package(s): {', '.join(missing_packages)}")
        print("Please run: pip install -r requirements.txt")
        sys.exit(1)
    else:
        print("✅ All required packages are available")
    
    # Import and run the app
    try:
        from app import app
        print("🚀 Starting Court Kiosk Backend Server...")
        print("📡 Backend will be available at: http://localhost:4000")
        print("🔗 API Health Check: http://localhost:4000/api/health")
        print("Press Ctrl+C to stop the server")
        print("-" * 50)
        
        app.run(host='0.0.0.0', port=4000, debug=False)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
