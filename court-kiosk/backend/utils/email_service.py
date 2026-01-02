import os
import json
import tempfile
import base64
import requests
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from typing import List, Dict, Optional, Tuple, Any
from config import Config
from utils.llm_service import LLMService
from utils.validation import validate_email, validate_phone_number, validate_name

# Initialize Resend with proper error handling
try:
    import resend
    if Config.RESEND_API_KEY:
        resend.api_key = Config.RESEND_API_KEY
except ImportError:
    resend = None
    print("Warning: resend package not installed. Email functionality will be limited.")

# Use the shared court_documents directory at the project root
COURT_DOCUMENTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', 'court_documents')
)

class EmailService:
    """Unified email service for Court Kiosk - handles all email functionality"""
    
    def __init__(self):
        # Email configuration - Check for verified domain first
        custom_domain = Config.RESEND_FROM_DOMAIN
        custom_from_email = Config.RESEND_FROM_EMAIL
        
        if custom_from_email:
            # Use explicitly configured from email
            self.from_email = f"Court Kiosk <{custom_from_email}>"
            self.support_email = custom_from_email.replace('noreply', 'support').replace('no-reply', 'support')
        elif custom_domain:
            # Use verified domain
            self.from_email = f"Court Kiosk <noreply@{custom_domain}>"
            self.support_email = f"support@{custom_domain}"
            print(f"✅ Using verified domain: {custom_domain}")
        else:
            # Fallback to testing email (restricted)
            self.from_email = "Court Kiosk <onboarding@resend.dev>"
            self.support_email = "onboarding@resend.dev"
            print("⚠️ WARNING: Using Resend testing email. Emails can only be sent to your own address.")
            print("⚠️ To send to all recipients, verify a domain at https://resend.com/domains")
            print("⚠️ Then set RESEND_FROM_DOMAIN environment variable (e.g., 'yourdomain.com')")
        
        # Setup PDF styles
        self.styles = getSampleStyleSheet()
        self._setup_pdf_styles()

        # Load local PDFs so attachments work even when network is blocked
        self.court_documents_dir = COURT_DOCUMENTS_DIR
        self.form_filename_index = self._build_form_index()
        
        # Initialize LLM service for AI-powered summaries (optional)
        self.llm_service = LLMService(Config.OPENAI_API_KEY) if Config.OPENAI_API_KEY else None

    def _build_form_index(self) -> Dict[str, str]:
        """Create a lowercase index of available local PDF filenames."""
        index: Dict[str, str] = {}

        try:
            if not os.path.isdir(self.court_documents_dir):
                print(f"⚠️ Court documents directory not found: {self.court_documents_dir}")
                return index

            for filename in os.listdir(self.court_documents_dir):
                if filename.lower().endswith('.pdf'):
                    index[filename.lower()] = os.path.join(self.court_documents_dir, filename)

            print(f"✅ Loaded {len(index)} local court form PDFs for attachments")
        except Exception as e:
            print(f"⚠️ Could not index local court forms: {e}")

        return index
    
    def _setup_pdf_styles(self):
        """Setup custom paragraph styles for court documents"""
        self.styles.add(ParagraphStyle(
            name='CourtTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        ))
        
        self.styles.add(ParagraphStyle(
            name='CourtSubtitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=20,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        ))
        
        self.styles.add(ParagraphStyle(
            name='FormTitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=15,
            textColor=colors.black
        ))
    
    def send_case_email(self, case_data: dict, include_queue: bool = False) -> dict:
        """Main method - sends comprehensive case email with PDFs - FIXED VERSION"""
        try:
            if not resend:
                return {"success": False, "error": "Email service (resend) not available"}
            
            if not Config.RESEND_API_KEY:
                return {"success": False, "error": "Email service not configured"}
            
            user_email = case_data.get('user_email')
            if not user_email:
                return {"success": False, "error": "No email address provided"}
            
            print(f"📧 Preparing email for {user_email}...")
            
            # Extract all forms from case data (check multiple locations)
            all_forms = self._extract_forms_data(case_data)
            
            # If no forms found in extracted data, try documents_needed directly
            if not all_forms:
                all_forms = case_data.get('documents_needed', [])
            
            # Normalize forms list - extract form codes from various formats
            form_codes = []
            for form in all_forms:
                if isinstance(form, str):
                    form_codes.append(form)
                elif isinstance(form, dict):
                    form_codes.append(form.get('form_code') or form.get('code') or form.get('name', ''))
            
            # Remove duplicates and empty values
            form_codes = list(set([f.strip().upper() for f in form_codes if f and f.strip()]))
            
            print(f"📋 Forms to attach: {', '.join(form_codes)}")
            
            # Generate case summary PDF (needed for _prepare_attachments)
            case_summary_path = self._generate_case_summary_pdf(case_data)
            
            # Download official forms
            form_attachments = self._download_forms(form_codes)
            
            # Prepare ALL attachments (case summary + forms) using new method
            attachments = self._prepare_attachments(case_data, case_summary_path, form_attachments)
            
            # Generate email content
            subject = f"Your Court Case Summary - {case_data.get('queue_number', 'N/A')}"
            html_content = self._generate_email_html(case_data)
            
            # Send email
            success = self._send_email_with_attachments(user_email, subject, html_content, attachments)
            
            # Cleanup temp files
            self._cleanup_temp_files(case_summary_path, form_attachments)
            
            if success:
                print(f"✅ Email sent successfully to {user_email}")
                return {"success": True, "id": "email_sent_successfully", "attachments_count": len(attachments)}
            else:
                return {"success": False, "error": "Failed to send email", "attachments_prepared": len(attachments)}
                
        except Exception as e:
            print(f"❌ Error in send_case_email: {e}")
            import traceback
            print(f"❌ Full traceback:\n{traceback.format_exc()}")
            return {"success": False, "error": str(e)}
    
    def _prepare_attachments(self, case_data: dict, case_summary_path: str, form_attachments: list) -> list:
        """Prepare and validate all attachments - FIXED VERSION"""
        attachments = []
        
        # 1. Add case summary PDF
        if case_summary_path and os.path.exists(case_summary_path):
            try:
                file_size = os.path.getsize(case_summary_path)
                
                if file_size == 0:
                    print("⚠️ Warning: Case summary PDF is empty, skipping")
                else:
                    print(f"📄 Case summary PDF: {file_size} bytes")
                    with open(case_summary_path, 'rb') as f:
                        content = f.read()
                        encoded = base64.b64encode(content).decode('utf-8')
                        
                        attachments.append({
                            'filename': f"Case_Summary_{case_data.get('queue_number', 'N/A')}.pdf",
                            'content': encoded
                            # NO 'type' field - Resend infers it from filename/content
                        })
                        print(f"✅ Prepared case summary ({len(encoded)} chars base64)")
            except Exception as e:
                print(f"⚠️ Error preparing case summary: {e}")
                import traceback
                print(f"⚠️ Traceback: {traceback.format_exc()}")
        else:
            print("⚠️ Case summary PDF not found or not generated")
        
        # 2. Add form PDFs
        attached_count = 0
        for form_attachment in form_attachments:
            form_path = form_attachment.get('path')
            form_filename = form_attachment.get('filename')
            
            if not form_path or not os.path.exists(form_path):
                print(f"⚠️ Form file not found: {form_filename}")
                continue
            
            try:
                file_size = os.path.getsize(form_path)
                
                if file_size == 0:
                    print(f"⚠️ Warning: {form_filename} is empty (0 bytes), skipping")
                    continue
                
                print(f"📄 {form_filename}: {file_size} bytes")
                
                with open(form_path, 'rb') as f:
                    content = f.read()
                    
                    # Verify content was read
                    if len(content) == 0:
                        print(f"⚠️ Warning: Read 0 bytes from {form_filename}, skipping")
                        continue
                    
                    encoded = base64.b64encode(content).decode('utf-8')
                    
                    attachments.append({
                        'filename': form_filename,
                        'content': encoded
                        # NO 'type' field
                    })
                    
                    attached_count += 1
                    print(f"✅ Attached: {form_filename} ({len(encoded)} chars base64)")
                    
            except Exception as e:
                print(f"⚠️ Error attaching {form_filename}: {e}")
                import traceback
                print(f"⚠️ Traceback: {traceback.format_exc()}")
                continue
        
        print(f"📎 Total attachments prepared: {len(attachments)}")
        return attachments
    
    def _send_email_with_attachments(self, to_email: str, subject: str, html_content: str, attachments: list = None) -> bool:
        """Send email with attachments using Resend API - FIXED VERSION"""
        if not resend:
            print("❌ Resend package not available. Cannot send email.")
            return False
            
        if not Config.RESEND_API_KEY:
            print("❌ RESEND_API_KEY not configured. Cannot send email.")
            return False
            
        try:
            # Validate attachments before sending
            if attachments:
                total_size = 0
                validated_attachments = []
                
                for att in attachments:
                    try:
                        # Decode to check size (base64 is ~33% larger than original)
                        decoded_size = len(base64.b64decode(att['content']))
                        total_size += decoded_size
                        
                        print(f"📎 Attachment: {att['filename']} ({decoded_size} bytes)")
                        validated_attachments.append(att)
                    except Exception as e:
                        print(f"⚠️ Invalid attachment {att.get('filename', 'unknown')}: {e}")
                        continue
                
                # Check 25MB limit (Resend's typical limit)
                max_size = 25 * 1024 * 1024
                if total_size > max_size:
                    print(f"❌ Total attachment size ({total_size} bytes) exceeds {max_size} bytes limit")
                    return False
                
                print(f"✅ Total attachment size: {total_size} bytes ({len(validated_attachments)} files)")
                attachments = validated_attachments
            
            # Build email payload - CRITICAL: Resend expects specific format
            email_data = {
                "from": self.from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }
            
            # Add attachments if present (without 'type' field - Resend infers from content)
            if attachments:
                email_data["attachments"] = attachments
            
            print(f"📤 Sending email to {to_email} with {len(attachments) if attachments else 0} attachments...")
            
            # Send via Resend API
            response = resend.Emails.send(email_data)
            
            # Enhanced response checking
            print(f"📬 Resend API Response: {response}")
            print(f"📬 Response type: {type(response)}")
            
            if isinstance(response, dict):
                print(f"📬 Response keys: {list(response.keys())}")
                
                # Check for success
                if response.get('id'):
                    print(f"✅ Email sent successfully! Resend ID: {response.get('id')}")
                    return True
                
                # Check for errors
                if 'error' in response or 'message' in response:
                    error_msg = response.get('error') or response.get('message')
                    print(f"❌ Resend API Error: {error_msg}")
                    
                    # Detect testing mode restriction
                    if 'testing emails' in str(error_msg).lower() or 'only send' in str(error_msg).lower():
                        print("\n" + "="*70)
                        print("⚠️  TESTING MODE DETECTED - Domain Verification Required")
                        print("="*70)
                        print("To send emails to all recipients, you need to:")
                        print("1. Verify a domain at https://resend.com/domains")
                        print("2. Set RESEND_FROM_DOMAIN environment variable")
                        print("3. See RESEND_DOMAIN_SETUP.md for detailed instructions")
                        print("="*70 + "\n")
                    
                    return False
            
            # If we got here, response format is unexpected
            print(f"⚠️ Unexpected response format from Resend API")
            return False
                
        except Exception as e:
            print(f"❌ Exception sending email: {e}")
            print(f"❌ Exception type: {type(e).__name__}")
            
            # Enhanced error details
            if hasattr(e, '__dict__'):
                print(f"❌ Exception attributes: {e.__dict__}")
            if hasattr(e, 'response'):
                print(f"❌ API Response object: {e.response}")
                if hasattr(e.response, 'text'):
                    print(f"❌ API Response text: {e.response.text}")
            if hasattr(e, 'status_code'):
                print(f"❌ HTTP Status Code: {e.status_code}")
            
            import traceback
            print(f"❌ Full traceback:\n{traceback.format_exc()}")
            
            # Fallback: Send to configured fallback email for forwarding
            # This works in testing mode when domain is not verified
            try:
                fallback_email = Config.FALLBACK_EMAIL
                if not fallback_email:
                    print("❌ FALLBACK_EMAIL not configured. Cannot send fallback email.")
                    print("💡 TIP: Set FALLBACK_EMAIL in environment variables for email forwarding")
                    return False
                    
                # Enhanced forwarding email with better formatting
                fallback_data = {
                    "from": self.from_email,
                    "to": [fallback_email],
                    "subject": f"FORWARD TO: {to_email} - {subject}",
                    "html": f"""
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <style>
                            body {{ font-family: Arial, sans-serif; line-height: 1.6; }}
                            .forward-box {{ 
                                background-color: #fef3c7; 
                                border: 2px solid #f59e0b; 
                                border-radius: 8px; 
                                padding: 20px; 
                                margin-bottom: 20px;
                            }}
                            .forward-button {{
                                display: inline-block;
                                background-color: #f59e0b;
                                color: white;
                                padding: 10px 20px;
                                text-decoration: none;
                                border-radius: 5px;
                                margin-top: 10px;
                            }}
                        </style>
                    </head>
                    <body>
                        <div class="forward-box">
                            <h3 style="color: #92400e; margin-top: 0;">📧 Email Forward Request</h3>
                            <p style="color: #92400e;"><strong>Original Recipient:</strong> {to_email}</p>
                            <p style="color: #92400e;"><strong>Subject:</strong> {subject}</p>
                            <p style="color: #92400e;"><strong>Action Required:</strong> Please forward this email to the recipient above.</p>
                            <p style="color: #92400e; font-size: 12px; margin-top: 15px;">
                                <strong>Quick Forward:</strong> Click "Forward" in your email client and send to: <strong>{to_email}</strong>
                            </p>
                            <p style="color: #92400e; font-size: 11px; margin-top: 10px;">
                                <em>Note: This is a temporary solution. To send directly to all recipients, verify a domain at resend.com/domains</em>
                            </p>
                        </div>
                        <hr style="margin: 20px 0; border: 1px solid #f59e0b;">
                        <div style="background-color: white; padding: 20px;">
                            {html_content}
                        </div>
                    </body>
                    </html>
                    """
                }
                resend.Emails.send(fallback_data)
                print(f"✅ Fallback email sent to {fallback_email} for forwarding to {to_email}")
                print(f"💡 TIP: Set up Gmail auto-forward filter to automate forwarding")
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
        possible_form_keys = ['forms_completed', 'documents_needed', 'forms', 'required_forms', 'forms_list']
        
        # Check summary_json first (most comprehensive source)
        summary_json = case_data.get('summary_json', '{}')
        if isinstance(summary_json, str):
            try:
                summary_data = json.loads(summary_json)
            except:
                summary_data = {}
        else:
            summary_data = summary_json
        
        # Try to find forms in summary_data (check nested structures)
        for key in possible_form_keys:
            if key in summary_data and summary_data[key]:
                forms_data = summary_data[key]
                print(f"📋 Found forms in summary_json.{key}: {len(forms_data) if isinstance(forms_data, list) else 'N/A'}")
                break
        
        # Also check if summary_data has a nested structure (e.g., summary.forms)
        if not forms_data and isinstance(summary_data, dict):
            # Check nested structures like summary.forms
            if 'summary' in summary_data and isinstance(summary_data['summary'], dict):
                for key in possible_form_keys:
                    if key in summary_data['summary'] and summary_data['summary'][key]:
                        forms_data = summary_data['summary'][key]
                        print(f"📋 Found forms in summary_json.summary.{key}: {len(forms_data) if isinstance(forms_data, list) else 'N/A'}")
                        break
        
        # If not found, check case_data directly
        if not forms_data:
            for key in possible_form_keys:
                if key in case_data and case_data[key]:
                    forms_data = case_data[key]
                    print(f"📋 Found forms in case_data.{key}: {len(forms_data) if isinstance(forms_data, list) else 'N/A'}")
                    break
        
        # Ensure we return a list
        if not isinstance(forms_data, list):
            if forms_data:
                forms_data = [forms_data]
            else:
                forms_data = []
        
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
        """Download official forms from California Courts website"""
        attachments = []

        if not forms:
            print("⚠️ No forms provided to download")
            return attachments

        print(f"📦 Processing {len(forms)} forms for download/attachment...")

        for form_code in forms:
            if isinstance(form_code, dict):
                form_code = form_code.get('form_code', form_code.get('code', ''))

            form_code = str(form_code).strip().upper()
            
            # Skip empty form codes
            if not form_code:
                continue

            try:
                # Prefer packaged PDFs so attachments never fail in offline or blocked environments
                local_form_path = self._get_local_form_path(form_code)

                if local_form_path and os.path.exists(local_form_path):
                    form_path = local_form_path
                    print(f"📎 Using local copy of {form_code}")
                else:
                    print(f"🔄 Downloading form: {form_code}")
                    form_path = self._download_single_form(form_code)

                if form_path and os.path.exists(form_path):
                    attachments.append({
                        'filename': f"{form_code}.pdf",
                        'path': form_path,
                        'type': 'official'
                    })
                    print(f"✅ Prepared form for attachment: {form_code}")
                else:
                    print(f"⚠️ Could not find or download: {form_code} - form will not be attached")
                    
            except Exception as e:
                print(f"❌ Error processing {form_code}: {e}")
                continue

        print(f"✅ Successfully prepared {len(attachments)} out of {len(forms)} forms for attachment")
        return attachments

    def _get_local_form_path(self, form_code: str) -> Optional[str]:
        """Return path to bundled PDF if available."""
        if not form_code:
            return None

        # Normalize form code and generate several filename variants
        base = str(form_code).strip()
        base_upper = base.upper()
        base_lower = base_upper.lower()

        candidates = [
            f"{base_upper}.pdf",
            f"{base_lower}.pdf",
            f"{base_upper.replace('-', '')}.pdf",
            f"{base_lower.replace('-', '')}.pdf",
            f"{base_upper.replace('-', '_')}.pdf",
            f"{base_lower.replace('-', '_')}.pdf",
        ]

        for candidate in candidates:
            path = self.form_filename_index.get(candidate.lower())
            if path and os.path.exists(path):
                return path

        # Fallback: try loose match ignoring separators
        target_key = base_lower.replace('-', '').replace('_', '')
        for filename, path in self.form_filename_index.items():
            compare_key = filename.replace('.pdf', '').replace('-', '').replace('_', '')
            if compare_key == target_key and os.path.exists(path):
                return path

        return None
    
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
        normalized = str(form_code).strip().upper()
        
        # Comprehensive mapping of California Judicial Council forms
        known_forms = {
            # Domestic Violence Forms
            "DV-100": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv100.pdf",
            "DV-101": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv101.pdf",
            "DV-105": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv105.pdf",
            "DV-105A": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv105a.pdf",
            "DV-108": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv108.pdf",
            "DV-109": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv109.pdf",
            "DV-110": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv110.pdf",
            "DV-112": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv112.pdf",
            "DV-116": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv116.pdf",
            "DV-120": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv120.pdf",
            "DV-120INFO": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv120info.pdf",
            "DV-125": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv125.pdf",
            "DV-130": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv130.pdf",
            "DV-140": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv140.pdf",
            "DV-145": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv145.pdf",
            "DV-200": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv200.pdf",
            "DV-200INFO": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv200info.pdf",
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
            
            # Family Law Forms
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
            
            # Civil Harassment Forms
            "CH-100": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch100.pdf",
            "CH-109": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch109.pdf",
            "CH-110": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch110.pdf",
            "CH-120": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch120.pdf",
            "CH-120INFO": "https://courts.ca.gov/system/files?file=2025-07/ch120info.pdf",
            "CH-130": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch130.pdf",
            "CH-200": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch200.pdf",
            "CH-250": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch250.pdf",
            "CH-700": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch700.pdf",
            "CH-710": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch710.pdf",
            "CH-720": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch720.pdf",
            "CH-730": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch730.pdf",
            "CH-800": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch800.pdf",
            
            # Fee Waiver Forms
            "FW-001": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fw001.pdf",
            "FW-002": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fw002.pdf",
            "FW-003": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fw003.pdf",
            "FW-005": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fw005.pdf",
            
            # Other Forms
            "CLETS-001": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/clets001.pdf",
            "CM-010": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/cm010.pdf",
            "EPO-001": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/epo001.pdf",
            "JV-255": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/jv255.pdf",
            "MC-025": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/mc025.pdf",
            "MC-031": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/mc031.pdf",
            "MC-040": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/mc040.pdf",
            "MC-050": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/mc050.pdf",
            "POS-040": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/pos040.pdf",
            "SER-001": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ser001.pdf",
        }
        
        return known_forms.get(normalized, "https://www.courts.ca.gov/forms.htm")
    
    def _get_form_title(self, form_code: str) -> str:
        """Get title for a form code"""
        form_titles = {
            'DV-100': 'Request for Domestic Violence Restraining Order',
            'DV-109': 'Notice of Court Hearing',
            'DV-110': 'Temporary Restraining Order',
            'DV-105': 'Request for Child Custody and Visitation Orders',
            'DV-140': 'Child Custody and Visitation Order',
            'DV-200': 'Proof of Personal Service',
            'DV-120': 'Response to Request for Domestic Violence Restraining Order',
            'FL-100': 'Petition for Dissolution of Marriage',
            'FL-105': 'Response to Petition for Dissolution of Marriage',
            'FL-110': 'Declaration Under Uniform Child Custody Jurisdiction and Enforcement Act',
            'FL-115': 'Declaration of Service',
            'FL-120': 'Summons',
            'FL-150': 'Declaration of Service',
            'CH-100': 'Request for Civil Harassment Restraining Order',
            'CH-109': 'Notice of Court Hearing (Civil Harassment)',
            'CH-110': 'Temporary Restraining Order (Civil Harassment)',
            'FW-001': 'Request to Waive Court Fees',
            'CLETS-001': 'CLETS Information Sheet',
            'POS-040': 'Proof of Service',
            'SER-001': 'Proof of Service'
        }
        return form_titles.get(form_code, f'Court Form {form_code}')
    
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
    
    # ========================================================================
    # AI-POWERED CASE SUMMARY METHODS (from EnhancedEmailService)
    # ========================================================================
    
    def prepare_case_summary_data(self, user_session_id: str, case_responses: Dict) -> Tuple[Dict, Dict]:
        """
        Collect all necessary data for email summary
        Returns: (user_data, case_data)
        """
        # Extract user information
        user_data = {
            'name': case_responses.get('user_name') or case_responses.get('name') or 'Court Kiosk User',
            'email': case_responses.get('user_email') or case_responses.get('email'),
            'phone': case_responses.get('phone_number') or case_responses.get('phone'),
            'language': case_responses.get('language', 'en')
        }
        
        # Extract case details
        case_data = {
            'case_type': self._determine_case_type(case_responses),
            'priority': self._assess_priority(case_responses),
            'key_facts': self._extract_key_facts(case_responses),
            'forms_needed': [],
            'next_steps': [],
            'queue_number': case_responses.get('queue_number')
        }
        
        # Validate required fields
        if not user_data['email']:
            raise ValueError("Email address is required")
        
        email_result = validate_email(user_data['email'])
        if not email_result['valid']:
            raise ValueError(f"Invalid email address: {email_result['error']}")
        user_data['email'] = email_result['email']
        
        # Validate phone if provided
        if user_data['phone']:
            phone_result = validate_phone_number(user_data['phone'])
            if phone_result['valid']:
                user_data['phone'] = phone_result['formatted']
        
        # Validate name if provided
        if user_data['name']:
            name_result = validate_name(user_data['name'])
            if name_result['valid']:
                user_data['name'] = name_result['sanitized']
        
        return user_data, case_data
    
    def _determine_case_type(self, responses: Dict) -> str:
        """Determine case type from responses"""
        if responses.get('case_type'):
            return str(responses['case_type']).upper()
        
        # Check for DVRO indicators
        if any(key in responses for key in ['DVCheck1', 'domestic_violence', 'dvro']):
            return 'DVRO'
        
        # Check for Divorce indicators
        if any(key in responses for key in ['divorce', 'dissolution', 'marriage']):
            return 'DIVORCE'
        
        # Check for CHRO indicators
        if any(key in responses for key in ['civil_harassment', 'chro', 'harassment']):
            return 'CHRO'
        
        return 'DVRO'  # Default
    
    def _assess_priority(self, responses: Dict) -> str:
        """Assess priority level (A=High, B=Medium, C=Standard)"""
        # High priority indicators
        if responses.get('DVCheck1') == 'Yes' or responses.get('emergency') == 'yes':
            return 'A'
        
        # Medium priority
        if responses.get('children') == 'yes' or responses.get('firearms') == 'yes':
            return 'B'
        
        return 'C'  # Standard
    
    def _extract_key_facts(self, responses: Dict) -> List[str]:
        """Extract key facts from user responses"""
        facts = []
        
        if responses.get('DVCheck1') == 'Yes':
            facts.append("Requested domestic violence restraining order")
        
        if responses.get('children') == 'yes':
            facts.append("Has children involved in the case")
        
        if responses.get('support') and responses['support'] != 'none':
            support_type = str(responses['support']).replace('_', ' ').title()
            facts.append(f"Requested {support_type} support")
        
        if responses.get('firearms') == 'yes':
            facts.append("Firearms are involved in the case")
        
        if responses.get('abduction_check') == 'yes':
            facts.append("Requested child abduction prevention measures")
        
        return facts
    
    def generate_case_summary_with_ai(self, case_data: Dict, case_responses: Dict) -> Dict:
        """
        Use OpenAI to analyze case and generate summary
        Returns structured case summary
        """
        if not self.llm_service:
            # Fallback to rule-based summary if AI not available
            return self._generate_fallback_summary(case_data, case_responses)
        
        try:
            # Prepare prompt for AI
            ai_prompt = f"""
Analyze this {case_data['case_type']} case and provide a comprehensive summary.

CASE DETAILS:
- Case Type: {case_data['case_type']}
- Priority Level: {case_data['priority']}
- Key Facts: {', '.join(case_data['key_facts']) if case_data['key_facts'] else 'Standard case'}

USER RESPONSES:
{json.dumps(case_responses, indent=2)}

Please provide a JSON response with the following structure:
{{
    "summary_text": "2-3 paragraph narrative summary of the case",
    "forms_list": ["DV-100", "DV-109", "DV-110", ...],
    "action_items": [
        {{"action": "Complete form DV-100", "timeline": "Today", "priority": "high"}},
        ...
    ],
    "critical_warnings": ["Warning 1", "Warning 2", ...],
    "helpful_resources": [
        {{"name": "Court Clerk", "contact": "(650) 261-5100"}},
        ...
    ],
    "expected_timeline": "Timeline description"
}}

Be specific about California Judicial Council form codes and provide actionable next steps.
"""
            
            # Call OpenAI API
            response = self.llm_service.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a legal information assistant for California courts. Provide accurate, helpful information about court procedures and forms."},
                    {"role": "user", "content": ai_prompt}
                ],
                temperature=0.3,
                max_tokens=1500
            )
            
            # Parse AI response
            ai_response_text = response.choices[0].message.content.strip()
            
            # Try to extract JSON from response
            try:
                if '```json' in ai_response_text:
                    json_start = ai_response_text.find('```json') + 7
                    json_end = ai_response_text.find('```', json_start)
                    ai_response_text = ai_response_text[json_start:json_end].strip()
                elif '```' in ai_response_text:
                    json_start = ai_response_text.find('```') + 3
                    json_end = ai_response_text.find('```', json_start)
                    ai_response_text = ai_response_text[json_start:json_end].strip()
                
                parsed_summary = json.loads(ai_response_text)
            except (json.JSONDecodeError, ValueError):
                parsed_summary = self._parse_ai_response_fallback(ai_response_text, case_data)
            
            # Structure the summary
            case_summary = {
                'narrative': parsed_summary.get('summary_text', 'Case summary not available.'),
                'forms_needed': parsed_summary.get('forms_list', []),
                'next_steps': parsed_summary.get('action_items', []),
                'warnings': parsed_summary.get('critical_warnings', []),
                'resources': parsed_summary.get('helpful_resources', []),
                'timeline': parsed_summary.get('expected_timeline', 'Timeline will be determined by the court.'),
                'case_type': case_data['case_type'],
                'priority': case_data['priority']
            }
            
            return case_summary
            
        except Exception as e:
            print(f"⚠️ AI summary generation failed: {e}, using fallback")
            return self._generate_fallback_summary(case_data, case_responses)
    
    def _generate_fallback_summary(self, case_data: Dict, case_responses: Dict) -> Dict:
        """Generate summary without AI (fallback)"""
        case_type = case_data['case_type']
        
        # Default forms by case type
        default_forms = {
            'DVRO': ['DV-100', 'CLETS-001', 'DV-109', 'DV-110', 'DV-200'],
            'DIVORCE': ['FL-100', 'FL-110', 'FL-115', 'FL-140', 'FL-150'],
            'CHRO': ['CH-100', 'CLETS-001', 'CH-109', 'CH-110', 'CH-200']
        }
        
        # Default next steps
        default_steps = [
            {"action": "Complete all required forms", "timeline": "Today", "priority": "high"},
            {"action": "File forms with the court clerk", "timeline": "As soon as possible", "priority": "high"},
            {"action": "Serve the other party", "timeline": "After filing", "priority": "high"},
            {"action": "Attend your court hearing", "timeline": "On scheduled date", "priority": "critical"}
        ]
        
        return {
            'narrative': f"This is a {case_type} case. Please complete the required forms and follow the next steps outlined below.",
            'forms_needed': default_forms.get(case_type, default_forms['DVRO']),
            'next_steps': default_steps,
            'warnings': ["Keep copies of all forms", "Bring photo ID when filing", "If in immediate danger, call 911"],
            'resources': [
                {"name": "Court Clerk", "contact": "(650) 261-5100"},
                {"name": "Self-Help Center", "contact": "Room 101, First Floor"}
            ],
            'timeline': 'Timeline will be determined by the court after filing.',
            'case_type': case_type,
            'priority': case_data['priority']
        }
    
    def _parse_ai_response_fallback(self, text: str, case_data: Dict) -> Dict:
        """Fallback parser for AI response"""
        return {
            'summary_text': text[:500] if text else 'Case summary generated.',
            'forms_list': ['DV-100', 'DV-109', 'DV-110'],
            'action_items': [
                {"action": "Complete required forms", "timeline": "Today", "priority": "high"}
            ],
            'critical_warnings': [],
            'helpful_resources': [],
            'expected_timeline': 'To be determined'
        }
    
    def prepare_forms_package(self, forms_needed: List[str], case_type: str) -> List[Dict]:
        """
        Gather all required forms with official links
        """
        forms_package = []
        
        # Get forms from database/config
        for form_code in forms_needed:
            form_info = self._get_form_details_for_package(form_code)
            
            if form_info:
                forms_package.append({
                    'form_code': form_code,
                    'form_name': form_info.get('name', form_code),
                    'official_url': form_info.get('url', self._get_form_url(form_code)),
                    'description': form_info.get('description', f'{form_code} form'),
                    'instructions': form_info.get('instructions', ''),
                    'is_required': form_info.get('required', True)
                })
            else:
                # Fallback if form details not found
                forms_package.append({
                    'form_code': form_code,
                    'form_name': self._get_form_title(form_code),
                    'official_url': self._get_form_url(form_code),
                    'description': f'{form_code} form',
                    'instructions': '',
                    'is_required': True
                })
        
        # Add case-type specific essential forms
        essential_forms = self._get_essential_forms_by_case_type(case_type)
        for essential_form_code in essential_forms:
            if not any(f['form_code'] == essential_form_code for f in forms_package):
                form_info = self._get_form_details_for_package(essential_form_code)
                if form_info:
                    forms_package.append({
                        'form_code': essential_form_code,
                        'form_name': form_info.get('name', essential_form_code),
                        'official_url': form_info.get('url', self._get_form_url(essential_form_code)),
                        'description': form_info.get('description', ''),
                        'instructions': form_info.get('instructions', ''),
                        'is_required': True
                    })
        
        # Sort by priority (required first)
        forms_package.sort(key=lambda x: (not x['is_required'], x['form_code']))
        
        return forms_package
    
    def _get_form_details_for_package(self, form_code: str) -> Optional[Dict]:
        """Get form details from database or mapping"""
        try:
            from utils.form_utils import FormUtils
            return FormUtils.get_form_details(form_code)
        except:
            return None
    
    def _get_essential_forms_by_case_type(self, case_type: str) -> List[str]:
        """Get essential forms by case type"""
        try:
            from utils.form_utils import FormUtils
            return FormUtils.get_essential_forms(case_type)
        except:
            # Fallback defaults
            defaults = {
                'DVRO': ['CLETS-001'],
                'DIVORCE': [],
                'CHRO': ['CLETS-001']
            }
            return defaults.get(case_type, [])
    
    def send_complete_case_summary_email(self, user_session_id: str, case_responses: Dict, 
                                        queue_number: Optional[str] = None) -> Dict:
        """
        Main function to orchestrate entire email summary chain with AI-powered summaries
        Follows the enhanced email process
        """
        try:
            # Prepare data
            print("Step 1: Gathering user and case data...")
            user_data, case_data = self.prepare_case_summary_data(user_session_id, case_responses)
            
            # Generate AI summary
            print("Step 2: Generating AI-powered case summary...")
            case_summary = self.generate_case_summary_with_ai(case_data, case_responses)
            
            # Add queue number if provided
            if queue_number:
                case_summary['queue_number'] = queue_number
            
            # Prepare forms package
            print("Step 3: Preparing forms package...")
            forms_package = self.prepare_forms_package(
                case_summary['forms_needed'], 
                case_data['case_type']
            )
            
            # Convert to case_data format for existing send_case_email method
            case_data_for_email = {
                'user_email': user_data['email'],
                'user_name': user_data.get('name', 'Court Kiosk User'),
                'case_type': case_summary.get('case_type', 'DVRO'),
                'priority_level': case_summary.get('priority', 'C'),
                'language': user_data.get('language', 'en'),
                'queue_number': case_summary.get('queue_number', 'N/A'),
                'phone_number': user_data.get('phone', ''),
                'documents_needed': case_summary.get('forms_needed', []),
                'summary_json': json.dumps({
                    'narrative': case_summary.get('narrative', ''),
                    'next_steps': case_summary.get('next_steps', []),
                    'warnings': case_summary.get('warnings', []),
                    'resources': case_summary.get('resources', []),
                    'timeline': case_summary.get('timeline', '')
                })
            }
            
            # Send email using existing method
            print("Step 4: Sending email with PDF attachments...")
            result = self.send_case_email(case_data_for_email, include_queue=(queue_number is not None))
            
            if result.get('success'):
                return {
                    'success': True,
                    'message': 'Case summary email sent successfully',
                    'email': user_data['email'],
                    'id': result.get('id'),
                    'forms_count': len(forms_package)
                }
            else:
                return result
                
        except ValueError as e:
            print(f"✗ Validation error: {e}")
            return {'success': False, 'error': 'validation_error', 'message': str(e)}
            
        except Exception as e:
            print(f"✗ Unexpected error: {e}")
            import traceback
            traceback.print_exc()
            return {'success': False, 'error': 'unknown_error', 'message': str(e)}
    
    # Legacy methods for backward compatibility
    def send_comprehensive_case_email(self, case_data: dict, include_queue: bool = False) -> dict:
        """Legacy method - redirects to main send_case_email method"""
        return self.send_case_email(case_data, include_queue)
    
    def send_case_summary_email(self, to_email, case_data):
        """Legacy method - redirects to main send_case_email method"""
        case_data['user_email'] = to_email
        return self.send_case_email(case_data)
