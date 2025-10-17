from flask import Flask, jsonify
import os

app = Flask(__name__)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for Vercel deployment"""
    return jsonify({
        "status": "OK",
        "message": "Court Kiosk API is running",
        "environment": os.getenv('VERCEL_ENV', 'development'),
        "version": "1.0.0"
    })

# Vercel serverless function handler
def handler(request):
    with app.test_request_context(request.url, method=request.method, data=request.get_data()):
        return app.full_dispatch_request()
