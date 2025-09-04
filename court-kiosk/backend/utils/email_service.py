import os
import base64
import resend
from datetime import datetime
from config import Config

# Initialize Resend
if Config.RESEND_API_KEY:
    resend.api_key = Config.RESEND_API_KEY

class EmailService:
    def __init__(self):
        self.from_email = "Family Court Clinic <onboarding@resend.dev>"
        self.support_email = "support@resend.dev"
        self.court_documents_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'court_documents')
    
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
    
    def _prepare_pdf_attachments(self, form_codes: list) -> list:
        """Prepare PDF attachments for the given form codes.
        
        Args:
            form_codes: List of form codes (e.g., ['DV-100', 'DV-109'])
            
        Returns:
            List of attachment dictionaries for Resend API
        """
        attachments = []
        
        for form_code in form_codes:
            if not form_code:
                continue
                
            # Normalize form code
            normalized = str(form_code).strip().upper()
            pdf_filename = f"{normalized}.pdf"
            pdf_path = os.path.join(self.court_documents_path, pdf_filename)
            
            # Check if PDF exists
            if os.path.exists(pdf_path):
                try:
                    with open(pdf_path, 'rb') as pdf_file:
                        pdf_content = pdf_file.read()
                        pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')
                        
                        attachments.append({
                            "filename": pdf_filename,
                            "content": pdf_base64,
                            "type": "application/pdf"
                        })
                        
                        print(f"Prepared attachment: {pdf_filename}")
                        
                except Exception as e:
                    print(f"Error reading PDF {pdf_filename}: {e}")
            else:
                print(f"PDF not found: {pdf_filename}")
        
        return attachments

    def send_summary_email(self, payload: dict) -> dict:
        """Send a detailed summary email using a generic payload.

        Expected payload keys:
          - to: recipient email
          - flow_type: e.g., 'DVRO'
          - required_forms: list[str] (form codes)
          - next_steps: list[str]
          - timeline: list[str] (optional)
          - important_notes: list[str] (optional)
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
                linked_forms.append(f"<li><a href=\"{url}\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color: #2563eb; text-decoration: underline;\">{code}</a> - <a href=\"{url}\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color: #059669; text-decoration: none;\">View PDF</a></li>")

            forms_html = ""
            if linked_forms:
                forms_html = "<h3 style=\"color: #1f2937; margin-top: 24px;\">📋 Required Forms:</h3><ul style=\"padding-left: 20px;\">" + "".join(linked_forms) + "</ul>"
                # Add note about attachments
                forms_html += "<p style='color: #059669; font-weight: bold; margin-top: 10px; background: #f0fdf4; padding: 8px; border-radius: 4px; border-left: 4px solid #059669;'>📎 All required forms are attached to this email as PDF files.</p>"

            steps = payload.get('next_steps', []) or []
            steps_html = ""
            if steps:
                steps_html = "<h3 style=\"color: #1f2937; margin-top: 24px;\">📝 Next Steps:</h3><ol style=\"padding-left: 20px;\">" + "".join([f"<li style=\"margin: 8px 0;\">{s}</li>" for s in steps]) + "</ol>"

            timeline = payload.get('timeline', []) or []
            timeline_html = ""
            if timeline:
                timeline_html = "<h3 style=\"color: #1f2937; margin-top: 24px;\">⏰ Important Timeline:</h3><ul style=\"padding-left: 20px;\">" + "".join([f"<li style=\"margin: 8px 0; color: #d97706;\">{item}</li>" for item in timeline]) + "</ul>"

            important_notes = payload.get('important_notes', []) or []
            notes_html = ""
            if important_notes:
                notes_html = "<h3 style=\"color: #1f2937; margin-top: 24px;\">⚠️ Important Notes:</h3><ul style=\"padding-left: 20px;\">" + "".join([f"<li style=\"margin: 8px 0; color: #dc2626; font-weight: 500;\">{note}</li>" for note in important_notes]) + "</ul>"

            html = f"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Case Summary</title>
            </head>
            <body style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0 0 8px 0; font-size: 24px;">San Mateo Family Court Clinic</h1>
                    <p style="margin: 0; color: #d1d5db;">Your Case Summary</p>
                </div>
                
                <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="display:inline-block;background:#dc2626;color:#fff;padding:12px 20px;border-radius:6px;font-weight:700;font-size:18px;">Queue Number: {queue_number}</div>
                    </div>
                    
                    {forms_html}
                    {steps_html}
                    {timeline_html}
                    {notes_html}
                    
                    <div style="margin-top: 24px; padding: 16px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;">
                        <p style="margin: 0; color: #1e40af; font-weight: 500;">💡 Remember: Only complete the forms listed above first. Do not fill out additional forms unless instructed by court staff.</p>
                    </div>
                </div>
                
                <div style="margin-top: 16px; text-align: center; color: #6b7280; font-size: 12px;">
                    <p>This is an automated message from Family Court Clinic. Please do not reply to this email.</p>
                    <p>If you have questions, please contact court staff or visit the court in person.</p>
                </div>
            </body>
            </html>
            """

            # Prepare PDF attachments
            attachments = self._prepare_pdf_attachments(forms)
            
            # Build email data
            email_data = {
                "from": self.from_email,
                "to": to_addr,
                "subject": subject,
                "html": html,
            }
            
            # Add attachments if any
            if attachments:
                email_data["attachments"] = attachments
                print(f"Sending email with {len(attachments)} PDF attachments")
            else:
                print("No PDF attachments found")
            
            response = resend.Emails.send(email_data)
            print(f"Resend response: {response}")
            return {"success": True, "id": response.get('id'), "attachments_count": len(attachments)}

        except Exception as e:
            print(f"Error sending summary email: {e}")
            print(f"Error type: {type(e)}")
            return {"success": False, "error": str(e)}

    def send_case_summary_email(self, to_email, case_data):
        """Send case summary email to user"""
        try:
            if not Config.RESEND_API_KEY:
                print("Resend API key not configured, skipping email send")
                return {"success": False, "error": "Email service not configured"}
            
            subject = f"Your Court Case Summary - {case_data.get('queue_number', 'N/A')}"
            
            html_content = self._generate_case_summary_html(case_data)
            
            # Extract form codes from case data
            forms = []
            summary = case_data.get('summary', {})
            if 'forms' in summary:
                forms = summary['forms']
            elif 'required_forms' in case_data:
                forms = case_data['required_forms']
            
            # Prepare PDF attachments
            attachments = self._prepare_pdf_attachments(forms)
            
            # Build email data
            email_data = {
                "from": self.from_email,
                "to": to_email,
                "subject": subject,
                "html": html_content,
            }
            
            # Add attachments if any
            if attachments:
                email_data["attachments"] = attachments
                print(f"Sending case summary email with {len(attachments)} PDF attachments")
            else:
                print("No PDF attachments found for case summary")
            
            response = resend.Emails.send(email_data)
            
            print(f"Email sent successfully to {to_email}")
            return {"success": True, "id": response.get('id'), "attachments_count": len(attachments)}
            
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
            # Add note about attachments
            forms_html += "<p style='color: #059669; font-weight: bold; margin-top: 10px;'>📎 All required forms are attached to this email as PDF files.</p>"
        
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
