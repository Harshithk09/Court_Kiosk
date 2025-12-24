import os
import resend
import json
import tempfile
import base64
import requests
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from typing import List, Dict, Optional
from config import Config

# Initialize Resend
if Config.RESEND_API_KEY:
    resend.api_key = Config.RESEND_API_KEY

class EmailService:
    """Unified email service for Court Kiosk - handles all email functionality"""
    
    def __init__(self):
        # Email configuration
        self.from_email = "Court Kiosk <onboarding@resend.dev>"
        self.support_email = "onboarding@resend.dev"
        
        # Check for custom domain
        custom_domain = os.getenv('RESEND_FROM_DOMAIN')
        if custom_domain:
            self.from_email = f"Court Kiosk <noreply@{custom_domain}>"
            self.support_email = f"support@{custom_domain}"
        
        # Setup PDF styles
        from utils.pdf_utils import setup_court_pdf_styles
        self.styles = setup_court_pdf_styles()
    
    def send_case_email(self, case_data: dict, include_queue: bool = False) -> dict:
        """Main method - sends comprehensive case email with PDFs"""
        try:
            if not Config.RESEND_API_KEY:
                return {"success": False, "error": "Email service not configured"}
            
            user_email = case_data.get('user_email')
            if not user_email:
                return {"success": False, "error": "No email address provided"}
            
            print(f"📧 Preparing email for {user_email}...")
            
            # Generate case summary PDF
            case_summary_path = self._generate_case_summary_pdf(case_data)
            
            # Download official forms
            form_attachments = self._download_forms(case_data.get('documents_needed', []))
            
            # Generate email content
            subject = f"Your Court Case Summary - {case_data.get('queue_number', 'N/A')}"
            html_content = self._generate_email_html(case_data)
            
            # Prepare all attachments
            attachments = []
            
            # Add case summary PDF
            if case_summary_path and os.path.exists(case_summary_path):
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
            
            # Send email
            success = self._send_email_with_attachments(user_email, subject, html_content, attachments)
            
            # Cleanup
            self._cleanup_temp_files(case_summary_path, form_attachments)
            
            if success:
                print(f"✅ Email sent successfully to {user_email}")
                return {"success": True, "id": "email_sent_successfully"}
            else:
                return {"success": False, "error": "Failed to send email"}
                
        except Exception as e:
            print(f"❌ Error sending case email: {e}")
            return {"success": False, "error": str(e)}
    
    def _send_email_with_attachments(self, to_email: str, subject: str, html_content: str, attachments: list = None) -> bool:
        """Send email with attachments using Resend API"""
        try:
            email_data = {
                "from": self.from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }
            
            if attachments:
                email_data["attachments"] = attachments
            
            response = resend.Emails.send(email_data)
            
            if response and response.get('id'):
                return True
            else:
                print(f"❌ Failed to send email: {response}")
                return False
                
        except Exception as e:
            print(f"❌ Error sending email: {e}")
            # Fallback: Send to your email for forwarding
            try:
                fallback_data = {
                    "from": self.from_email,
                    "to": ["karuturiharshith@gmail.com"],
                    "subject": f"FORWARD TO: {to_email} - {subject}",
                    "html": f"""
                    <div style="padding: 20px; border: 2px solid #f59e0b; border-radius: 8px; background-color: #fef3c7;">
                        <h3 style="color: #92400e;">📧 Email Forward Request</h3>
                        <p style="color: #92400e;"><strong>Original Recipient:</strong> {to_email}</p>
                        <p style="color: #92400e;"><strong>Subject:</strong> {subject}</p>
                        <p style="color: #92400e;"><strong>Please forward this email to the original recipient.</strong></p>
                        <hr style="margin: 20px 0; border: 1px solid #f59e0b;">
                        {html_content}
                    </div>
                    """
                }
                resend.Emails.send(fallback_data)
                print(f"✅ Fallback email sent to your address for forwarding to {to_email}")
                return True
            except Exception as fallback_error:
                print(f"❌ Fallback also failed: {fallback_error}")
                return False
    
    def _generate_queue_number_html(self, queue_number: str) -> str:
        """Generate HTML for queue number display"""
        if queue_number and queue_number != 'N/A':
            return f"""
            <div style="background-color: #dbeafe; border: 2px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 0 0 20px 0; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>Your Queue Number:</strong></p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #1e40af;">{queue_number}</p>
            </div>
            """
        return ""
    
    def _generate_email_html(self, case_data: dict) -> str:
        """Generate user-friendly HTML email content"""
        queue_number = case_data.get('queue_number', 'N/A')
        user_name = case_data.get('user_name', '')
        
        # Extract forms data
        forms_data = self._extract_forms_data(case_data)
        
        # Generate forms HTML
        forms_html = self._generate_forms_html(forms_data)
        
        # Generate admin data HTML (for staff reference)
        admin_html = self._generate_admin_data_html(case_data.get('admin_data'))
        
        # Generate greeting
        greeting = f"Hello {user_name}," if user_name else "Hello,"
        
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Family Court Resources</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            
            <div style="background-color: #1f2937; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0;">🏛️ San Mateo Family Court</h1>
                <p style="margin: 10px 0 0 0;">Family Facilitator's Office</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border: 1px solid #e5e7eb;">
                
                <p style="font-size: 16px; margin: 0 0 20px 0;">{greeting}</p>
                
                {self._generate_queue_number_html(queue_number)}
                
                <p style="font-size: 16px; margin: 0 0 20px 0;">
                    <strong>Thank you for visiting the Family Facilitator's Office.</strong>
                </p>
                
                <p style="font-size: 16px; margin: 0 0 20px 0;">
                    Based on your visit today, we've prepared the recommended court forms for your situation. 
                    These forms are attached to this email in PDF format for your convenience.
                </p>
                
                {forms_html}
                
                {admin_html}
                
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #92400e;">⚠️ Important Reminders</h3>
                    <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                        <li>Review each form carefully before filling it out</li>
                        <li>Use black or blue ink only</li>
                        <li>Make copies of everything before filing</li>
                        <li>Bring valid photo ID when filing with the court</li>
                    </ul>
                </div>
                
                <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #166534;">📞 Need Help?</h3>
                    <p style="margin: 5px 0; color: #166534;"><strong>Family Facilitator's Office</strong></p>
                    <p style="margin: 5px 0; color: #166534;">Location: Room 101, First Floor</p>
                    <p style="margin: 5px 0; color: #166534;">Phone: (650) 261-5100</p>
                    <p style="margin: 5px 0; color: #166534;">Hours: Monday-Friday, 8:00 AM - 4:00 PM</p>
                </div>
                
                <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #92400e;">📖 Legal Disclaimer</h3>
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                        This information is for educational purposes only and does not constitute legal advice. 
                        Please consult with an attorney for legal guidance specific to your situation.
                    </p>
                </div>
                
            </div>
            
            <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px;">
                <p style="margin: 0;">San Mateo County Superior Court</p>
                <p style="margin: 5px 0 0 0;">400 County Center, Redwood City, CA 94063</p>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
            
        </body>
        </html>
        """
    
    def _extract_forms_data(self, case_data: dict) -> list:
        """Extract forms data from case data with multiple fallbacks"""
        forms_data = []
        possible_form_keys = ['forms_completed', 'documents_needed', 'forms', 'required_forms']
        
        # Check summary_json first
        summary_json = case_data.get('summary_json', '{}')
        if isinstance(summary_json, str):
            try:
                summary_data = json.loads(summary_json)
            except:
                summary_data = {}
        else:
            summary_data = summary_json
        
        # Try to find forms in summary_data
        for key in possible_form_keys:
            if key in summary_data and summary_data[key]:
                forms_data = summary_data[key]
                break
        
        # If not found, check case_data directly
        if not forms_data:
            for key in possible_form_keys:
                if key in case_data and case_data[key]:
                    forms_data = case_data[key]
                    break
        
        return forms_data
    
    def _generate_forms_html(self, forms_data: list) -> str:
        """Generate HTML for forms list with download links"""
        if not forms_data:
            return """
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #92400e;">📋 Required Forms</h3>
                <p style="margin: 0; color: #92400e;">Forms will be determined based on your specific case. Please visit the court's self-help center or consult with a legal professional to identify the exact forms needed for your situation.</p>
            </div>
            """
        
        forms_html = """
        <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #0c4a6e;">📋 Your Recommended Forms</h3>
            <p style="margin: 0 0 15px 0; color: #0c4a6e;">We've attached these forms as PDFs to this email. You can also download them from the links below:</p>
            <ul style="margin: 0; padding-left: 20px;">
        """
        
        for form in forms_data:
            if isinstance(form, str):
                form_code = form
                form_title = self._get_form_title(form_code)
            elif isinstance(form, dict):
                form_code = form.get('form_code', '')
                form_title = form.get('title', self._get_form_title(form_code))
            else:
                continue
            
            form_url = self._get_form_url(form_code)
            forms_html += f"""
                <li style="margin: 10px 0;">
                    <strong>{form_code}</strong> - {form_title}
                    <br>
                    <a href="{form_url}" target="_blank" style="color: #0ea5e9; text-decoration: none;">📥 Download Official Form</a>
                </li>
            """
        
        forms_html += "</ul></div>"
        return forms_html
    
    def _generate_admin_data_html(self, admin_data: dict) -> str:
        """Generate HTML for admin data (staff reference only)"""
        if not admin_data:
            return ""
        
        has_filled_forms = admin_data.get('hasFilledForms', False)
        filled_forms = admin_data.get('filledForms', [])
        available_forms = admin_data.get('availableForms', [])
        
        if not has_filled_forms:
            return """
            <div style="background-color: #e0f2fe; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #0c4a6e;">📋 Staff Note</h3>
                <p style="margin: 0; color: #0c4a6e;"><strong>Client Status:</strong> Needs assistance with all forms</p>
                <p style="margin: 5px 0 0 0; color: #0c4a6e;">This client requires help with all {total_forms} forms.</p>
            </div>
            """.replace('{total_forms}', str(len(available_forms)))
        
        remaining_forms = [form for form in available_forms if form not in filled_forms]
        
        filled_forms_html = ""
        if filled_forms:
            filled_forms_html = "<ul style='margin: 5px 0 0 0; padding-left: 20px;'>"
            for form in filled_forms:
                filled_forms_html += f"<li style='color: #0c4a6e;'>{form}</li>"
            filled_forms_html += "</ul>"
        
        remaining_forms_html = ""
        if remaining_forms:
            remaining_forms_html = "<ul style='margin: 5px 0 0 0; padding-left: 20px;'>"
            for form in remaining_forms:
                remaining_forms_html += f"<li style='color: #0c4a6e;'>{form}</li>"
            remaining_forms_html += "</ul>"
        
        return f"""
        <div style="background-color: #e0f2fe; border: 2px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 5px solid #0ea5e9;">
            <h3 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 18px;">👨‍💼 Staff Note (For Court Staff Only)</h3>
            <p style="margin: 0; color: #0c4a6e;"><strong>Client Status:</strong> Has completed {len(filled_forms)} of {len(available_forms)} forms</p>
            
            <div style="margin: 10px 0;">
                <p style="margin: 0; color: #0c4a6e; font-weight: bold;">✅ Completed Forms:</p>
                {filled_forms_html if filled_forms_html else "<p style='margin: 5px 0 0 0; color: #0c4a6e;'>None</p>"}
            </div>
            
            <div style="margin: 10px 0;">
                <p style="margin: 0; color: #0c4a6e; font-weight: bold;">❌ Still Need Help With:</p>
                {remaining_forms_html if remaining_forms_html else "<p style='margin: 5px 0 0 0; color: #0c4a6e;'>All forms completed!</p>"}
            </div>
        </div>
        """
    
    def _generate_case_summary_pdf(self, case_data: dict) -> str:
        """Generate case summary PDF"""
        try:
            output_path = tempfile.mktemp(suffix='.pdf')
            doc = SimpleDocTemplate(output_path, pagesize=letter)
            story = []
            
            # Header
            story.append(Paragraph("San Mateo Family Court Clinic", self.styles['CourtTitle']))
            story.append(Paragraph("Case Summary Report", self.styles['CourtSubtitle']))
            story.append(Spacer(1, 20))
            
            # Case Information
            story.append(Paragraph("Case Information", self.styles['FormTitle']))
            case_info = [
                ['Queue Number:', case_data.get('queue_number', 'N/A')],
                ['Case Type:', case_data.get('case_type', 'N/A')],
                ['Priority Level:', case_data.get('priority_level', 'N/A')],
                ['Language:', case_data.get('language', 'en').upper()],
                ['Date Generated:', datetime.now().strftime('%B %d, %Y at %I:%M %p')]
            ]
            
            if case_data.get('user_name'):
                case_info.append(['Client Name:', case_data['user_name']])
            if case_data.get('user_email'):
                case_info.append(['Email:', case_data['user_email']])
            
            case_table = Table(case_info, colWidths=[2*inch, 4*inch])
            case_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('BACKGROUND', (1, 0), (1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(case_table)
            story.append(Spacer(1, 20))
            
            # Required Forms
            forms = case_data.get('documents_needed', [])
            if isinstance(forms, str):
                try:
                    forms = json.loads(forms)
                except:
                    forms = []
            
            if forms:
                story.append(Paragraph("Required Forms", self.styles['FormTitle']))
                for i, form in enumerate(forms, 1):
                    story.append(Paragraph(f"{i}. {form}", self.styles['Normal']))
                story.append(Spacer(1, 20))
            
            # Important Notes
            story.append(Paragraph("Important Reminders", self.styles['FormTitle']))
            important_notes = [
                "Keep copies of all forms with you at all times",
                "Arrive at court 15 minutes before your hearing",
                "Bring all evidence and witnesses to court",
                "Dress appropriately for court",
                "If you have questions, contact court staff",
                "If you are in immediate danger, call 911"
            ]
            
            for note in important_notes:
                story.append(Paragraph(f"• {note}", self.styles['Normal']))
            
            doc.build(story)
            print(f"✅ Generated case summary PDF: {output_path}")
            return output_path
            
        except Exception as e:
            print(f"❌ Error generating case summary PDF: {e}")
            return None
    
    def _download_forms(self, forms: list) -> list:
        """Get forms from local court_documents folder first, fallback to downloading"""
        attachments = []
        
        if not forms:
            return attachments
        
        # Get the court_documents directory path
        court_documents_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'court_documents'))
        
        print(f"📦 Getting {len(forms)} forms from local storage...")
        
        for form_code in forms:
            if isinstance(form_code, dict):
                form_code = form_code.get('form_code', form_code.get('code', ''))
            
            form_code = str(form_code).strip().upper()
            
            try:
                # Convert form code to filename (e.g., "DV-100" -> "dv100.pdf")
                form_filename = form_code.lower().replace('-', '') + '.pdf'
                form_path = os.path.join(court_documents_dir, form_filename)
                
                print(f"🔄 Looking for form: {form_filename}")
                
                if os.path.exists(form_path):
                    attachments.append({
                        'filename': f"{form_code}.pdf",
                        'path': form_path,
                        'type': 'local'
                    })
                    print(f"✅ Found local form: {form_code}")
                else:
                    # Fallback: try downloading from official source
                    print(f"⚠️ Local form not found, downloading: {form_code}")
                    downloaded_path = self._download_single_form(form_code)
                    
                    if downloaded_path and os.path.exists(downloaded_path):
                        attachments.append({
                            'filename': f"{form_code}.pdf",
                            'path': downloaded_path,
                            'type': 'downloaded'
                        })
                        print(f"✅ Downloaded: {form_code}")
                    else:
                        print(f"⚠️ Could not get form: {form_code}")
                    
            except Exception as e:
                print(f"❌ Error getting {form_code}: {e}")
                continue
        
        print(f"✅ Got {len(attachments)} forms successfully")
        return attachments
    
    def _download_single_form(self, form_code: str) -> Optional[str]:
        """Download a single form from California Courts website"""
        try:
            form_url = self._get_form_url(form_code)
            print(f"📥 Downloading from: {form_url}")
            
            response = requests.get(form_url, timeout=30, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            
            if response.status_code == 200:
                output_path = tempfile.mktemp(suffix=f'_{form_code}.pdf')
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                return output_path
            else:
                print(f"❌ HTTP {response.status_code} for {form_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error downloading {form_code}: {e}")
            return None
    
    def _get_form_url(self, form_code: str) -> str:
        """Get official California Courts URL for a form"""
        from utils.form_utils import FormUtils
        return FormUtils.get_form_url(form_code)
    
    def _get_form_title(self, form_code: str) -> str:
        """Get title for a form code"""
        from utils.form_utils import FormUtils
        return FormUtils.get_form_title(form_code)
    
    def _cleanup_temp_files(self, case_summary_path: str, form_attachments: list):
        """Clean up temporary files"""
        try:
            if case_summary_path and os.path.exists(case_summary_path):
                os.remove(case_summary_path)
            for form_attachment in form_attachments:
                if os.path.exists(form_attachment['path']):
                    os.remove(form_attachment['path'])
        except Exception as e:
            print(f"⚠️ Error cleaning up temp files: {e}")
    
    # Legacy methods for backward compatibility
    def send_comprehensive_case_email(self, case_data: dict, include_queue: bool = False) -> dict:
        """Legacy method - redirects to main send_case_email method"""
        return self.send_case_email(case_data, include_queue)
    
    def send_case_summary_email(self, to_email, case_data):
        """Legacy method - redirects to main send_case_email method"""
        case_data['user_email'] = to_email
        return self.send_case_email(case_data)