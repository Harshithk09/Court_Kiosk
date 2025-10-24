#!/usr/bin/env python3
"""
Script to clean up old email endpoints from app.py
This script removes the old email-related routes and functions
"""

import re

def clean_app_py():
    """Remove old email endpoints from app.py"""
    
    # Read the current app.py
    with open('app.py', 'r') as f:
        content = f.read()
    
    # Remove old email endpoints (keep only the new blueprint)
    patterns_to_remove = [
        # Remove old send_summary_email function
        r'def send_summary_email\(to_address, subject, body\):.*?return\n',
        
        # Remove old email routes
        r'@app\.route\(\'/api/send-comprehensive-email\'.*?return jsonify.*?\), 500\n',
        r'@app\.route\(\'/api/send-case-summary-email\'.*?return jsonify.*?\), 500\n',
        r'@app\.route\(\'/api/email/send-case-summary\'.*?return jsonify.*?\), 500\n',
        r'@app\.route\(\'/api/send-summary\'.*?return jsonify.*?\), 500\n',
        
        # Remove old email helper functions
        r'def generate_email_body\(.*?return email_body\n',
        r'def send_email_with_attachments\(.*?return True\n',
    ]
    
    # Apply each pattern
    for pattern in patterns_to_remove:
        content = re.sub(pattern, '', content, flags=re.DOTALL)
    
    # Add comment about email endpoints
    email_comment = """
# ===== EMAIL ENDPOINTS =====
# All email functionality has been moved to email_api.py
# The EmailService class handles all email operations
# Available endpoints:
# - /api/email/send-case-summary
# - /api/email/send-queue-notification  
# - /api/email/send-facilitator-notification
# - /api/email/health
"""
    
    # Find where to insert the comment (after the blueprint registration)
    blueprint_pos = content.find('app.register_blueprint(email_bp)')
    if blueprint_pos != -1:
        insert_pos = content.find('\n', blueprint_pos) + 1
        content = content[:insert_pos] + email_comment + content[insert_pos:]
    
    # Write the cleaned content back
    with open('app.py', 'w') as f:
        f.write(content)
    
    print("✅ Cleaned up old email endpoints from app.py")
    print("📧 Email functionality is now handled by email_api.py")

if __name__ == "__main__":
    clean_app_py()
