from flask import Flask, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

# In-memory queue storage (for demo - use database in production)
queue_data = {
    "queue": [],
    "current_number": 0,
    "last_updated": datetime.now().isoformat()
}

@app.route('/api/queue', methods=['GET'])
def get_queue():
    """Get current queue status"""
    return jsonify({
        "success": True,
        "queue": queue_data["queue"],
        "current_number": queue_data["current_number"],
        "total_in_queue": len(queue_data["queue"]),
        "last_updated": queue_data["last_updated"]
    })

@app.route('/api/queue/join', methods=['POST'])
def join_queue():
    """Add user to queue"""
    try:
        data = request.get_json() or {}
        
        # Generate queue number
        queue_data["current_number"] += 1
        queue_number = queue_data["current_number"]
        
        # Add to queue
        queue_entry = {
            "queue_number": queue_number,
            "case_type": data.get("case_type", "General"),
            "user_name": data.get("user_name", "Anonymous"),
            "user_email": data.get("user_email"),
            "phone_number": data.get("phone_number"),
            "language": data.get("language", "en"),
            "timestamp": datetime.now().isoformat(),
            "status": "waiting"
        }
        
        queue_data["queue"].append(queue_entry)
        queue_data["last_updated"] = datetime.now().isoformat()
        
        return jsonify({
            "success": True,
            "queue_number": queue_number,
            "message": f"Added to queue as #{queue_number}",
            "estimated_wait": len(queue_data["queue"]) * 15  # 15 minutes per person
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/queue/status', methods=['GET'])
def queue_status():
    """Get queue status"""
    return jsonify({
        "success": True,
        "total_in_queue": len(queue_data["queue"]),
        "current_serving": queue_data["current_number"] - len(queue_data["queue"]),
        "estimated_wait_minutes": len(queue_data["queue"]) * 15
    })

# Vercel serverless function handler
def handler(request):
    with app.test_request_context(request.url, method=request.method, data=request.get_data()):
        return app.full_dispatch_request()
