import os
import resend
import json
import tempfile
import base64
from datetime import datetime
from config import Config
from .pdf_service import PDFService

# Initialize Resend
if Config.RESEND_API_KEY:
    resend.api_key = Config.RESEND_API_KEY

class EmailService:
    def __init__(self):
        self.from_email = "Court Kiosk <noreply@courtkiosk.com>"
        self.support_email = "support@courtkiosk.com"
        self.pdf_service = PDFService()
    
    def get_form_url(self, form_code: str) -> str:
        """Return a public hyperlink for a given Judicial Council form code.

        Falls back to a generic search page if the form isn't in the map.
        """
        if not form_code:
            return "https://www.courts.ca.gov/forms.htm"

        normalized = str(form_code).strip().upper()
        # Minimal curated mapping; expand as needed
        known_forms = {
            # DVRO
            "DV-100": "https://www.courts.ca.gov/documents/dv100.pdf",
            "DV-109": "https://www.courts.ca.gov/documents/dv109-info.pdf",
            "DV-110": "https://www.courts.ca.gov/documents/dv110.pdf",
            "DV-120": "https://www.courts.ca.gov/documents/dv120.pdf",
            "CLETS-001": "https://www.courts.ca.gov/documents/clets001.pdf",
            # CHRO
            "CH-100": "https://www.courts.ca.gov/documents/ch100.pdf",
            "CH-109": "https://www.courts.ca.gov/documents/ch109.pdf",
            "CH-110": "https://www.courts.ca.gov/documents/ch110.pdf",
            # EA
            "EA-100": "https://www.courts.ca.gov/documents/ea100.pdf",
            "EA-109": "https://www.courts.ca.gov/documents/ea109.pdf",
            "EA-110": "https://www.courts.ca.gov/documents/ea110.pdf",
            # WVRO
            "WV-100": "https://www.courts.ca.gov/documents/wv100.pdf",
            "WV-109": "https://www.courts.ca.gov/documents/wv109.pdf",
            "WV-110": "https://www.courts.ca.gov/documents/wv110.pdf",
        }

        if normalized in known_forms:
            return known_forms[normalized]

        # Generic search link for unknown codes
        return f"https://www.google.com/search?q=site:courts.ca.gov+{normalized}"

    def send_summary_email(self, payload: dict) -> dict:
        """Send a detailed summary email using a generic payload.

        Expected payload keys:
          - to: recipient email
          - flow_type: e.g., 'DVRO'
          - required_forms: list[str] (form codes)
          - next_steps: list[str]
          - queue_number (optional)
          - case_type (optional)
        """
        try:
            if not Config.RESEND_API_KEY:
                print("Resend API key not configured, skipping email send")
                return {"success": False, "error": "Email service not configured"}

            to_addr = payload.get('to')
            if not to_addr:
                return {"success": False, "error": "Missing 'to' address"}

            queue_number = payload.get('queue_number', 'N/A')
            subject = f"Your Court Case Summary - {queue_number}"

            # Build HTML with hyperlinked forms
            forms = payload.get('required_forms', []) or []
            linked_forms = []
            for code in forms:
                url = self.get_form_url(code)
                linked_forms.append(f"<li><a href=\"{url}\" target=\"_blank\" rel=\"noopener noreferrer\">{code}</a></li>")

            forms_html = ""
            if linked_forms:
                forms_html = "<h3>Required Forms:</h3><ul>" + "".join(linked_forms) + "</ul>"

            steps = payload.get('next_steps', []) or []
            steps_html = ""
            if steps:
                steps_html = "<h3>Next Steps:</h3><ol>" + "".join([f"<li>{s}</li>" for s in steps]) + "</ol>"

            html = f"""
            <!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Case Summary</title></head>
            <body style="font-family: Arial, sans-serif; color: #111827;">
              <h1 style="margin-bottom: 0.25rem;">San Mateo Family Court Clinic</h1>
              <div style="margin: 0 0 1rem 0; color: #6b7280;">Your Case Summary</div>
              <div style="display:inline-block;background:#dc2626;color:#fff;padding:8px 12px;border-radius:6px;font-weight:700;">Queue Number: {queue_number}</div>
              <div style="margin-top:16px; padding:16px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;">
                {forms_html}
                {steps_html}
                <p style="margin-top:16px;color:#374151;">Only complete the forms listed above first. Do not fill out additional forms unless instructed by court staff.</p>
              </div>
              <div style="margin-top:16px;color:#6b7280; font-size:12px;">This is an automated message. Please do not reply.</div>
            </body>
            </html>
            """

            response = resend.Emails.send({
                "from": self.from_email,
                "to": to_addr,
                "subject": subject,
                "html": html,
            })
            return {"success": True, "id": response.get('id')}

        except Exception as e:
            print(f"Error sending summary email: {e}")
            return {"success": False, "error": str(e)}

    def send_case_summary_email(self, to_email, case_data):
        """Send case summary email to user"""
        try:
            if not Config.RESEND_API_KEY:
                print("Resend API key not configured, skipping email send")
                return {"success": False, "error": "Email service not configured"}
            
            subject = f"Your Court Case Summary - {case_data.get('queue_number', 'N/A')}"
            
            html_content = self._generate_case_summary_html(case_data)
            
            response = resend.Emails.send({
                "from": self.from_email,
                "to": to_email,
                "subject": subject,
                "html": html_content,
            })
            
            print(f"Email sent successfully to {to_email}")
            return {"success": True, "id": response.get('id')}
            
        except Exception as e:
            print(f"Error sending email: {e}")
            return {"success": False, "error": str(e)}
    
    def send_queue_notification_email(self, to_email, queue_data):
        """Send queue notification email to user"""
        try:
            if not Config.RESEND_API_KEY:
                print("Resend API key not configured, skipping email send")
                return {"success": False, "error": "Email service not configured"}
            
            subject = f"Your Queue Number - {queue_data.get('queue_number', 'N/A')}"
            
            html_content = self._generate_queue_notification_html(queue_data)
            
            response = resend.Emails.send({
                "from": self.from_email,
                "to": to_email,
                "subject": subject,
                "html": html_content,
            })
            
            print(f"Queue notification email sent successfully to {to_email}")
            return {"success": True, "id": response.get('id')}
            
        except Exception as e:
            print(f"Error sending queue notification email: {e}")
            return {"success": False, "error": str(e)}
    
    def send_facilitator_notification(self, facilitator_email, case_data):
        """Send notification to facilitator about new case"""
        try:
            if not Config.RESEND_API_KEY:
                print("Resend API key not configured, skipping email send")
                return {"success": False, "error": "Email service not configured"}
            
            subject = f"New Case in Queue - {case_data.get('queue_number', 'N/A')}"
            
            html_content = self._generate_facilitator_notification_html(case_data)
            
            response = resend.Emails.send({
                "from": self.from_email,
                "to": facilitator_email,
                "subject": subject,
                "html": html_content,
            })
            
            print(f"Facilitator notification sent successfully to {facilitator_email}")
            return {"success": True, "id": response.get('id')}
            
        except Exception as e:
            print(f"Error sending facilitator notification: {e}")
            return {"success": False, "error": str(e)}
    
    def send_comprehensive_case_email(self, case_data: dict, include_queue: bool = False) -> dict:
        """Send comprehensive email with case summary, PDF attachments, and optional queue info"""
        try:
            if not Config.RESEND_API_KEY:
                print("Resend API key not configured, skipping email send")
                return {"success": False, "error": "Email service not configured"}
            
            user_email = case_data.get('user_email')
            if not user_email:
                return {"success": False, "error": "No email address provided"}
            
            # Generate case summary PDF
            case_summary_path = self.pdf_service.generate_case_summary_pdf(case_data)
            
            # Generate form PDFs
            forms = case_data.get('documents_needed', [])
            if isinstance(forms, str):
                try:
                    forms = json.loads(forms)
                except:
                    forms = []
            
            form_attachments = self.pdf_service.generate_forms_package(forms, case_data)
            
            # Prepare email content
            subject = f"Your Court Case Summary - {case_data.get('queue_number', 'N/A')}"
            html_content = self._generate_comprehensive_email_html(case_data, include_queue)
            
            # Prepare attachments
            attachments = []
            
            # Add case summary PDF
            if os.path.exists(case_summary_path):
                with open(case_summary_path, 'rb') as f:
                    attachments.append({
                        'filename': f"Case_Summary_{case_data.get('queue_number', 'N/A')}.pdf",
                        'content': base64.b64encode(f.read()).decode('utf-8'),
                        'type': 'application/pdf'
                    })
            
            # Add form PDFs
            for form_attachment in form_attachments:
                if os.path.exists(form_attachment['path']):
                    with open(form_attachment['path'], 'rb') as f:
                        attachments.append({
                            'filename': form_attachment['filename'],
                            'content': base64.b64encode(f.read()).decode('utf-8'),
                            'type': 'application/pdf'
                        })
            
            # Send email with attachments
            email_data = {
                "from": self.from_email,
                "to": user_email,
                "subject": subject,
                "html": html_content
            }
            
            # Add attachments if any
            if attachments:
                email_data["attachments"] = attachments
            
            response = resend.Emails.send(email_data)
            
            # Clean up temporary files
            try:
                os.remove(case_summary_path)
                for form_attachment in form_attachments:
                    if os.path.exists(form_attachment['path']):
                        os.remove(form_attachment['path'])
            except:
                pass
            
            print(f"Comprehensive case email sent successfully to {user_email}")
            response_id = response.get('id')
            # Ensure response_id is serializable
            if isinstance(response_id, bytes):
                response_id = response_id.decode('utf-8')
            return {"success": True, "id": str(response_id) if response_id else None}
            
        except Exception as e:
            print(f"Error sending comprehensive case email: {e}")
            return {"success": False, "error": str(e)}
    
    def _generate_comprehensive_email_html(self, case_data: dict, include_queue: bool = False) -> str:
        """Generate comprehensive HTML email content"""
        queue_number = case_data.get('queue_number', 'N/A')
        case_type = case_data.get('case_type', 'Unknown')
        priority = case_data.get('priority_level', 'C')
        language = case_data.get('language', 'en')
        user_name = case_data.get('user_name', '')
        
        # Get forms and steps
        forms = case_data.get('documents_needed', [])
        if isinstance(forms, str):
            try:
                forms = json.loads(forms)
            except:
                forms = []
        
        next_steps = case_data.get('next_steps', [])
        if isinstance(next_steps, str):
            try:
                next_steps = json.loads(next_steps)
            except:
                next_steps = []
        
        # Priority color mapping
        priority_colors = {
            'A': '#dc2626',  # Red - DV cases
            'B': '#ea580c',  # Orange - Civil harassment, elder abuse
            'C': '#ca8a04',  # Yellow - Workplace violence
            'D': '#16a34a'   # Green - General questions
        }
        priority_color = priority_colors.get(priority, '#6b7280')
        
        # Generate forms HTML
        forms_html = ""
        if forms:
            forms_html = "<h3>📋 Required Forms (Attached as PDFs):</h3><ul>"
            for form in forms:
                form_url = self.get_form_url(form)
                forms_html += f'<li><strong>{form}</strong> - <a href="{form_url}" target="_blank">Download Official Form</a></li>'
            forms_html += "</ul>"
        
        # Generate next steps HTML
        steps_html = ""
        if next_steps:
            steps_html = "<h3>📝 Next Steps:</h3><ol>"
            for step in next_steps:
                steps_html += f"<li>{step}</li>"
            steps_html += "</ol>"
        
        # Queue information HTML
        queue_html = ""
        if include_queue and queue_number != 'N/A':
            queue_html = f"""
            <div style="background-color: {priority_color}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h2 style="margin: 0; font-size: 24px;">Your Queue Number</h2>
                <div style="font-size: 48px; font-weight: bold; margin: 10px 0;">{queue_number}</div>
                <p style="margin: 0;">Please keep this number visible while waiting for assistance</p>
            </div>
            """
        
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Court Case Summary</title>
            <style>
                body {{ 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px; 
                    background-color: #f9fafb;
                }}
                .header {{ 
                    background-color: #1f2937; 
                    color: white; 
                    padding: 30px; 
                    text-align: center; 
                    border-radius: 8px 8px 0 0; 
                }}
                .content {{ 
                    background-color: white; 
                    padding: 30px; 
                    border: 1px solid #e5e7eb; 
                }}
                .case-info {{ 
                    background-color: #f3f4f6; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 20px 0; 
                    border-left: 4px solid {priority_color};
                }}
                .section {{ 
                    margin: 25px 0; 
                    padding: 20px; 
                    background-color: #f9fafb; 
                    border-radius: 8px; 
                    border: 1px solid #e5e7eb;
                }}
                .footer {{ 
                    background-color: #1f2937; 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                    border-radius: 0 0 8px 8px; 
                    font-size: 14px; 
                }}
                .priority-badge {{
                    background-color: {priority_color};
                    color: white;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    display: inline-block;
                }}
                h1 {{ color: white; margin: 0; }}
                h2 {{ color: #1f2937; margin-top: 0; }}
                h3 {{ color: #374151; }}
                ul, ol {{ padding-left: 20px; }}
                li {{ margin: 8px 0; }}
                .important {{ 
                    background-color: #fef2f2; 
                    border: 1px solid #fecaca; 
                    color: #dc2626; 
                    padding: 15px; 
                    border-radius: 8px; 
                    margin: 20px 0;
                }}
                .attachment-note {{
                    background-color: #ecfdf5;
                    border: 1px solid #bbf7d0;
                    color: #166534;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏛️ San Mateo Family Court Clinic</h1>
                <p>Your Case Summary & Next Steps</p>
            </div>
            
            <div class="content">
                {queue_html}
                
                <div class="case-info">
                    <h2>📋 Case Information</h2>
                    <p><strong>Case Type:</strong> {case_type}</p>
                    <p><strong>Priority Level:</strong> <span class="priority-badge">{priority}</span></p>
                    <p><strong>Language:</strong> {language.upper()}</p>
                    <p><strong>Date Generated:</strong> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                    {f'<p><strong>Client Name:</strong> {user_name}</p>' if user_name else ''}
                </div>
                
                {forms_html}
                
                <div class="attachment-note">
                    <h3>📎 PDF Attachments</h3>
                    <p>This email includes the following PDF attachments:</p>
                    <ul>
                        <li><strong>Case Summary Report</strong> - Complete overview of your case</li>
                        {''.join([f'<li><strong>{form} Form</strong> - Template and instructions</li>' for form in forms])}
                    </ul>
                </div>
                
                {steps_html}
                
                <div class="section">
                    <h3>⏰ Important Timeline</h3>
                    <ul>
                        <li><strong>Immediate:</strong> Complete all required forms</li>
                        <li><strong>Within 24 hours:</strong> Make 3 copies of each form</li>
                        <li><strong>Before hearing:</strong> Serve the other party (at least 5 days before)</li>
                        <li><strong>Court hearing:</strong> Arrive 15 minutes early with all documents</li>
                    </ul>
                </div>
                
                <div class="important">
                    <h3>🚨 Important Reminders</h3>
                    <ul>
                        <li>If you are in immediate danger, call <strong>911</strong></li>
                        <li>Keep copies of all forms with you at all times</li>
                        <li>Service must be completed at least 5 days before hearing</li>
                        <li>Bring all evidence and witnesses to court</li>
                        <li>Dress appropriately for court (business attire)</li>
                        <li>If you have questions, contact court staff</li>
                    </ul>
                </div>
                
                <div class="section">
                    <h3>📞 Contact Information</h3>
                    <p><strong>San Mateo Family Court Clinic</strong></p>
                    <p>Phone: (650) 261-5100</p>
                    <p>Hours: Monday - Friday, 8:00 AM - 5:00 PM</p>
                    <p>Email: familycourt@sanmateocourt.org</p>
                </div>
            </div>
            
            <div class="footer">
                <p>San Mateo Family Court Clinic<br>
                This is an automated message. Please do not reply to this email.</p>
                <p>Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
            </div>
        </body>
        </html>
        """
    
    def _generate_case_summary_html(self, case_data):
        """Generate HTML for case summary email"""
        queue_number = case_data.get('queue_number', 'N/A')
        case_type = case_data.get('case_type', 'Unknown')
        summary = case_data.get('summary', {})
        forms = summary.get('forms', [])
        steps = summary.get('steps', [])
        timeline = summary.get('timeline', [])
        important_notes = summary.get('importantNotes', [])
        
        forms_html = ""
        if forms:
            forms_html = "<h3>Required Forms:</h3><ul>"
            for form in forms:
                forms_html += f"<li>{form}</li>"
            forms_html += "</ul>"
        
        steps_html = ""
        if steps:
            steps_html = "<h3>Next Steps:</h3><ol>"
            for step in steps:
                steps_html += f"<li>{step}</li>"
            steps_html += "</ol>"
        
        timeline_html = ""
        if timeline:
            timeline_html = "<h3>Important Timeline:</h3><ul>"
            for item in timeline:
                timeline_html += f"<li>{item}</li>"
            timeline_html += "</ul>"
        
        notes_html = ""
        if important_notes:
            notes_html = "<h3>Important Notes:</h3><ul>"
            for note in important_notes:
                notes_html += f"<li style='color: #dc2626;'>{note}</li>"
            notes_html += "</ul>"
        
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Court Case Summary</title>
            <style>
                body {{ 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px; 
                }}
                .header {{ 
                    background-color: #1f2937; 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                    border-radius: 8px 8px 0 0; 
                }}
                .content {{ 
                    background-color: #f9fafb; 
                    padding: 20px; 
                    border: 1px solid #e5e7eb; 
                }}
                .queue-number {{ 
                    background-color: #dc2626; 
                    color: white; 
                    padding: 10px 20px; 
                    border-radius: 4px; 
                    font-size: 18px; 
                    font-weight: bold; 
                    display: inline-block; 
                    margin: 10px 0; 
                }}
                .section {{ 
                    margin: 20px 0; 
                    padding: 15px; 
                    background-color: white; 
                    border-radius: 4px; 
                    border-left: 4px solid #3b82f6; 
                }}
                .footer {{ 
                    background-color: #1f2937; 
                    color: white; 
                    padding: 15px; 
                    text-align: center; 
                    border-radius: 0 0 8px 8px; 
                    font-size: 14px; 
                }}
                h2 {{ color: #1f2937; margin-top: 0; }}
                h3 {{ color: #374151; }}
                ul, ol {{ padding-left: 20px; }}
                li {{ margin: 5px 0; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>San Mateo Family Court Clinic</h1>
                <p>Your Case Summary</p>
                <div class="queue-number">Queue Number: {queue_number}</div>
            </div>
            
            <div class="content">
                <div class="section">
                    <h2>Case Information</h2>
                    <p><strong>Case Type:</strong> {case_type}</p>
                    <p><strong>Date:</strong> {datetime.now().strftime('%B %d, %Y')}</p>
                </div>
                
                {forms_html}
                {steps_html}
                {timeline_html}
                {notes_html}
                
                <div class="section">
                    <h2>Important Reminders</h2>
                    <ul>
                        <li>Keep copies of all forms with you at all times</li>
                        <li>Arrive at court 15 minutes before your hearing</li>
                        <li>Bring all evidence and witnesses to court</li>
                        <li>Dress appropriately for court</li>
                        <li>If you have questions, contact court staff</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>San Mateo Family Court Clinic<br>
                This is an automated message. Please do not reply to this email.</p>
            </div>
        </body>
        </html>
        """
    
    def _generate_queue_notification_html(self, queue_data):
        """Generate HTML for queue notification email"""
        queue_number = queue_data.get('queue_number', 'N/A')
        estimated_wait = queue_data.get('estimated_wait_time', 30)
        case_type = queue_data.get('case_type', 'Unknown')
        
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Queue Notification</title>
            <style>
                body {{ 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px; 
                }}
                .header {{ 
                    background-color: #059669; 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                    border-radius: 8px 8px 0 0; 
                }}
                .content {{ 
                    background-color: #f9fafb; 
                    padding: 20px; 
                    border: 1px solid #e5e7eb; 
                }}
                .queue-number {{ 
                    background-color: #dc2626; 
                    color: white; 
                    padding: 15px 25px; 
                    border-radius: 4px; 
                    font-size: 24px; 
                    font-weight: bold; 
                    display: inline-block; 
                    margin: 15px 0; 
                }}
                .info-box {{ 
                    background-color: white; 
                    padding: 15px; 
                    border-radius: 4px; 
                    border-left: 4px solid #059669; 
                    margin: 15px 0; 
                }}
                .footer {{ 
                    background-color: #1f2937; 
                    color: white; 
                    padding: 15px; 
                    text-align: center; 
                    border-radius: 0 0 8px 8px; 
                    font-size: 14px; 
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>San Mateo Family Court Clinic</h1>
                <p>You've Been Added to the Queue</p>
            </div>
            
            <div class="content">
                <div style="text-align: center;">
                    <div class="queue-number">{queue_number}</div>
                    <p>Please keep this number visible while you wait.</p>
                </div>
                
                <div class="info-box">
                    <h3>Queue Information</h3>
                    <p><strong>Case Type:</strong> {case_type}</p>
                    <p><strong>Estimated Wait Time:</strong> {estimated_wait} minutes</p>
                    <p><strong>Status:</strong> Waiting</p>
                </div>
                
                <div class="info-box">
                    <h3>What to Expect</h3>
                    <ul>
                        <li>Your number will be called when it's your turn</li>
                        <li>Please wait in the designated waiting area</li>
                        <li>You can use the kiosk while waiting</li>
                        <li>A facilitator will assist you with your case</li>
                    </ul>
                </div>
                
                <div class="info-box">
                    <h3>Important Reminders</h3>
                    <ul>
                        <li>Keep your queue number visible</li>
                        <li>Stay in the waiting area</li>
                        <li>Listen for your number to be called</li>
                        <li>If you need to step away, inform staff</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>San Mateo Family Court Clinic<br>
                This is an automated message. Please do not reply to this email.</p>
            </div>
        </body>
        </html>
        """
    
    def _generate_facilitator_notification_html(self, case_data):
        """Generate HTML for facilitator notification email"""
        queue_number = case_data.get('queue_number', 'N/A')
        case_type = case_data.get('case_type', 'Unknown')
        priority = case_data.get('priority_level', 'C')
        language = case_data.get('language', 'en')
        user_name = case_data.get('user_name', 'Anonymous')
        
        priority_color = {
            'A': '#dc2626',
            'B': '#ea580c', 
            'C': '#ca8a04',
            'D': '#16a34a'
        }.get(priority, '#6b7280')
        
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Case in Queue</title>
            <style>
                body {{ 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px; 
                }}
                .header {{ 
                    background-color: #1f2937; 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                    border-radius: 8px 8px 0 0; 
                }}
                .content {{ 
                    background-color: #f9fafb; 
                    padding: 20px; 
                    border: 1px solid #e5e7eb; 
                }}
                .queue-number {{ 
                    background-color: {priority_color}; 
                    color: white; 
                    padding: 15px 25px; 
                    border-radius: 4px; 
                    font-size: 24px; 
                    font-weight: bold; 
                    display: inline-block; 
                    margin: 15px 0; 
                }}
                .info-box {{ 
                    background-color: white; 
                    padding: 15px; 
                    border-radius: 4px; 
                    border-left: 4px solid #3b82f6; 
                    margin: 15px 0; 
                }}
                .footer {{ 
                    background-color: #1f2937; 
                    color: white; 
                    padding: 15px; 
                    text-align: center; 
                    border-radius: 0 0 8px 8px; 
                    font-size: 14px; 
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>New Case in Queue</h1>
                <p>Facilitator Notification</p>
            </div>
            
            <div class="content">
                <div style="text-align: center;">
                    <div class="queue-number">{queue_number}</div>
                    <p>New case requires facilitator assistance</p>
                </div>
                
                <div class="info-box">
                    <h3>Case Details</h3>
                    <p><strong>Queue Number:</strong> {queue_number}</p>
                    <p><strong>Case Type:</strong> {case_type}</p>
                    <p><strong>Priority Level:</strong> {priority}</p>
                    <p><strong>Language:</strong> {language.upper()}</p>
                    <p><strong>User Name:</strong> {user_name}</p>
                    <p><strong>Time Added:</strong> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                </div>
                
                <div class="info-box">
                    <h3>Action Required</h3>
                    <p>Please review this case in the facilitator dashboard and assist the client when ready.</p>
                </div>
            </div>
            
            <div class="footer">
                <p>San Mateo Family Court Clinic<br>
                This is an automated notification for facilitators.</p>
            </div>
        </body>
        </html>
        """
