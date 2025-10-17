from flask import Flask, request, jsonify
import json
import os
import requests
from datetime import datetime

app = Flask(__name__)

def get_form_url(form_code):
    """Get official California Courts form URL"""
    known_forms = {
        # DV Forms
        "DV-100": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv100.pdf",
        "DV-105": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv105.pdf",
        "DV-109": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv109.pdf",
        "DV-110": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv110.pdf",
        "DV-120": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv120.pdf",
        "DV-130": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv130.pdf",
        "DV-140": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv140.pdf",
        "DV-200": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv200.pdf",
        "DV-250": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv250.pdf",
        "DV-300": "https://courts.ca.gov/sites/default/files/courts/default/2024-12/dv300.pdf",
        "DV-305": "https://courts.ca.gov/sites/default/files/courts/default/2024-12/dv305.pdf",
        "DV-310": "https://courts.ca.gov/sites/default/files/courts/default/2024-12/dv310.pdf",
        "DV-330": "https://courts.ca.gov/sites/default/files/courts/default/2024-12/dv330.pdf",
        "DV-700": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv700.pdf",
        "DV-710": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv710.pdf",
        "DV-720": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv720.pdf",
        "DV-730": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv730.pdf",
        "DV-800": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv800.pdf",
        
        # FL Forms
        "FL-100": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl100.pdf",
        "FL-105": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl105.pdf",
        "FL-110": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl110.pdf",
        "FL-115": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl115.pdf",
        "FL-117": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl117.pdf",
        "FL-120": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl120.pdf",
        "FL-130": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl130.pdf",
        "FL-140": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl140.pdf",
        "FL-141": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl141.pdf",
        "FL-142": "https://courts.ca.gov/system/files?file=2025-07/fl142.pdf",
        "FL-144": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl144.pdf",
        "FL-150": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl150.pdf",
        "FL-157": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl157.pdf",
        "FL-160": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl160.pdf",
        "FL-165": "https://courts.ca.gov/system/files?file=2025-07/fl165.pdf",
        "FL-170": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl170.pdf",
        "FL-180": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl180.pdf",
        "FL-190": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl190.pdf",
        "FL-191": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl191.pdf",
        "FL-192": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl192.pdf",
        "FL-195": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl195.pdf",
        "FL-300": "https://courts.ca.gov/system/files?file=2025-07/fl300.pdf",
        "FL-305": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl305.pdf",
        "FL-320": "https://courts.ca.gov/system/files?file=2025-07/fl320.pdf",
        "FL-326": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl326.pdf",
        "FL-330": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl330.pdf",
        "FL-334": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl334.pdf",
        "FL-335": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl335.pdf",
        "FL-341": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl341.pdf",
        "FL-342": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl342.pdf",
        "FL-343": "https://courts.ca.gov/system/files?file=2025-07/fl343.pdf",
        "FL-345": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl345.pdf",
        "FL-435": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl435.pdf",
        "FL-800": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl800.pdf",
        "FL-810": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl810.pdf",
        "FL-825": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl825.pdf",
        "FL-830": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl830.pdf",
        
        # CH Forms
        "CH-100": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch100.pdf",
        "CH-109": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch109.pdf",
        "CH-110": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch110.pdf",
        "CH-120": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch120.pdf",
        "CH-130": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch130.pdf",
        "CH-200": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch200.pdf",
        "CH-250": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch250.pdf",
        "CH-700": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch700.pdf",
        "CH-710": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch710.pdf",
        "CH-720": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch720.pdf",
        "CH-730": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch730.pdf",
        "CH-800": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch800.pdf",
        
        # Other Forms
        "FW-001": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fw001.pdf",
        "FW-003": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fw003.pdf",
        "FW-005": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fw005.pdf",
        "CLETS-001": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/clets001.pdf",
        "SER-001": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ser001.pdf",
        "POS-040": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/pos040.pdf",
        "MC-025": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/mc025.pdf",
        "MC-031": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/mc031.pdf",
        "MC-040": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/mc040.pdf",
        "MC-050": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/mc050.pdf",
        "JV-255": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/jv255.pdf",
        "EPO-001": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/epo001.pdf",
        "CM-010": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/cm010.pdf"
    }
    
    return known_forms.get(form_code.upper(), f"https://courts.ca.gov/forms/{form_code.lower()}")

def send_email_via_resend(email, subject, html_content):
    """Send email using Resend API"""
    resend_api_key = os.getenv('RESEND_API_KEY')
    if not resend_api_key:
        return {"success": False, "error": "Resend API key not configured"}
    
    headers = {
        "Authorization": f"Bearer {resend_api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "from": "San Mateo Court Kiosk <noreply@courtsanmateo.org>",
        "to": [email],
        "subject": subject,
        "html": html_content
    }
    
    try:
        response = requests.post("https://api.resend.com/emails", headers=headers, json=data)
        if response.status_code == 200:
            return {"success": True, "message_id": response.json().get("id")}
        else:
            return {"success": False, "error": f"Resend API error: {response.text}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.route('/api/email/send-case-summary', methods=['POST'])
def send_case_summary():
    """Send case summary email with form links"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400
        
        email = data.get('email')
        case_data = data.get('case_data', {})
        
        if not email:
            return jsonify({"success": False, "error": "Email address required"}), 400
        
        # Extract form details
        summary = case_data.get('summary', {})
        forms = summary.get('formDetails', [])
        
        # Generate HTML email content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Your Court Case Summary</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .header {{ background-color: #1e40af; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .form-list {{ margin: 20px 0; }}
                .form-item {{ background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; margin: 10px 0; border-radius: 5px; }}
                .form-link {{ color: #1e40af; text-decoration: none; font-weight: bold; }}
                .footer {{ background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>⚖️ San Mateo Family Court</h1>
                <h2>Your Case Summary</h2>
            </div>
            
            <div class="content">
                <p>Dear Court User,</p>
                
                <p>Thank you for using the San Mateo Family Court Self-Service Kiosk. Below is your personalized case summary with all the forms you need to complete your legal process.</p>
                
                <h3>Required Forms ({len(forms)} forms)</h3>
                <div class="form-list">
        """
        
        for form in forms:
            form_url = get_form_url(form.get('code', ''))
            html_content += f"""
                    <div class="form-item">
                        <h4>{form.get('name', form.get('code', ''))}</h4>
                        <p>{form.get('description', 'Court form')}</p>
                        <a href="{form_url}" class="form-link" target="_blank">📄 Download {form.get('code', '')}</a>
                    </div>
            """
        
        html_content += """
                </div>
                
                <h3>Important Instructions</h3>
                <ul>
                    <li>Make 3 copies of each form (original + 2 copies) before filing</li>
                    <li>Fill out all forms completely and accurately</li>
                    <li>File your forms with the court clerk</li>
                    <li>Keep copies of all filed documents for your records</li>
                </ul>
                
                <p>If you have any questions, please visit the court clerk's office or contact the court directly.</p>
                
                <p>Best regards,<br>
                San Mateo Family Court<br>
                Self-Service Kiosk System</p>
            </div>
            
            <div class="footer">
                <p>This is an automated message from the San Mateo Family Court Self-Service Kiosk.</p>
                <p>Please do not reply to this email.</p>
            </div>
        </body>
        </html>
        """
        
        # Send email
        result = send_email_via_resend(
            email=email,
            subject="Your Court Case Summary - San Mateo Family Court",
            html_content=html_content
        )
        
        if result["success"]:
            return jsonify({
                "success": True,
                "message": "Case summary email sent successfully",
                "message_id": result.get("message_id")
            })
        else:
            return jsonify({
                "success": False,
                "error": result["error"]
            }), 500
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Vercel serverless function handler
def handler(request):
    with app.test_request_context(request.url, method=request.method, data=request.get_data()):
        return app.full_dispatch_request()
