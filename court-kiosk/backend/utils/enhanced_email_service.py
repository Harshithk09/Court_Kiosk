"""
Enhanced Email Service - Following Pseudocode Structure
Complete email summary chain with PDF attachments
"""

import os
import json
import base64
import tempfile
import requests
from datetime import datetime
from typing import Dict, List, Optional, Any
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from config import Config
from utils.llm_service import LLMService
from utils.validation import validate_email, validate_phone_number, validate_name

try:
    import resend
    if Config.RESEND_API_KEY:
        resend.api_key = Config.RESEND_API_KEY
except ImportError:
    resend = None


class EnhancedEmailService:
    """
    Enhanced email service following the pseudocode structure
    Complete 8-step email chain with AI-powered summaries
    """
    
    def __init__(self):
        self.from_email = "San Mateo Family Court <onboarding@resend.dev>"
        self.support_email = "onboarding@resend.dev"
        self.llm_service = LLMService(Config.OPENAI_API_KEY) if Config.OPENAI_API_KEY else None
        
        # Check for custom domain
        custom_domain = os.getenv('RESEND_FROM_DOMAIN')
        if custom_domain:
            self.from_email = f"San Mateo Family Court <noreply@{custom_domain}>"
            self.support_email = f"support@{custom_domain}"
        
        # Setup PDF styles
        from utils.pdf_utils import setup_court_pdf_styles
        self.styles = setup_court_pdf_styles()
    
    # ========================================================================
    # STEP 1: GATHER USER DATA & CASE INFORMATION
    # ========================================================================
    
    def prepare_case_summary_data(self, user_session_id: str, case_responses: Dict) -> tuple:
        """
        Collect all necessary data for email summary
        Returns: (user_data, case_data)
        """
        # 1.1: Extract user information
        user_data = {
            'name': case_responses.get('user_name') or case_responses.get('name') or 'Court Kiosk User',
            'email': case_responses.get('user_email') or case_responses.get('email'),
            'phone': case_responses.get('phone_number') or case_responses.get('phone'),
            'language': case_responses.get('language', 'en')
        }
        
        # 1.2: Extract case details
        case_data = {
            'case_type': self._determine_case_type(case_responses),
            'priority': self._assess_priority(case_responses),
            'key_facts': self._extract_key_facts(case_responses),
            'forms_needed': [],  # Will populate in next step
            'next_steps': [],    # Will populate in next step
            'queue_number': case_responses.get('queue_number')
        }
        
        # 1.3: Validate required fields
        if not user_data['email']:
            raise ValueError("Email address is required")
        
        email_result = validate_email(user_data['email'])
        if not email_result['valid']:
            raise ValueError(f"Invalid email address: {email_result['error']}")
        user_data['email'] = email_result['email']  # Use normalized email
        
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
    
    # ========================================================================
    # STEP 2: GENERATE AI-POWERED CASE SUMMARY
    # ========================================================================
    
    def generate_case_summary_with_ai(self, case_data: Dict, case_responses: Dict) -> Dict:
        """
        Use OpenAI to analyze case and generate summary
        Returns structured case summary
        """
        if not self.llm_service:
            # Fallback to rule-based summary if AI not available
            return self._generate_fallback_summary(case_data, case_responses)
        
        try:
            # 2.1: Prepare prompt for AI
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
            
            # 2.2: Call OpenAI API
            response = self.llm_service.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a legal information assistant for California courts. Provide accurate, helpful information about court procedures and forms."},
                    {"role": "user", "content": ai_prompt}
                ],
                temperature=0.3,
                max_tokens=1500
            )
            
            # 2.3: Parse AI response
            ai_response_text = response.choices[0].message.content.strip()
            
            # Try to extract JSON from response
            try:
                # Look for JSON in the response
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
                # Fallback parsing
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
    
    # ========================================================================
    # STEP 3: IDENTIFY AND PREPARE FORMS
    # ========================================================================
    
    def prepare_forms_package(self, forms_needed: List[str], case_type: str) -> List[Dict]:
        """
        Gather all required forms with official links
        """
        forms_package = []
        
        # 3.1: Get forms from database/config
        for form_code in forms_needed:
            form_info = self._get_form_details(form_code)
            
            if form_info:
                forms_package.append({
                    'form_code': form_code,
                    'form_name': form_info['name'],
                    'official_url': form_info['url'],
                    'description': form_info.get('description', f'{form_code} form'),
                    'instructions': form_info.get('instructions', ''),
                    'is_required': form_info.get('required', True)
                })
        
        # 3.2: Add case-type specific essential forms
        essential_forms = self._get_essential_forms_by_case_type(case_type)
        for essential_form_code in essential_forms:
            if not any(f['form_code'] == essential_form_code for f in forms_package):
                form_info = self._get_form_details(essential_form_code)
                if form_info:
                    forms_package.append({
                        'form_code': essential_form_code,
                        'form_name': form_info['name'],
                        'official_url': form_info['url'],
                        'description': form_info.get('description', ''),
                        'instructions': form_info.get('instructions', ''),
                        'is_required': True
                    })
        
        # 3.3: Sort by priority (required first)
        forms_package.sort(key=lambda x: (not x['is_required'], x['form_code']))
        
        return forms_package
    
    def _get_form_details(self, form_code: str) -> Optional[Dict]:
        """Get form details from database or mapping"""
        from utils.form_utils import FormUtils
        return FormUtils.get_form_details(form_code)
    
    def _get_essential_forms_by_case_type(self, case_type: str) -> List[str]:
        """Get essential forms by case type"""
        from utils.form_utils import FormUtils
        return FormUtils.get_essential_forms(case_type)
    
    def _get_form_url(self, form_code: str) -> str:
        """Get official California Courts URL for a form"""
        from utils.form_utils import FormUtils
        return FormUtils.get_form_url(form_code)
    
    # ========================================================================
    # STEP 4: GENERATE PDF CASE SUMMARY
    # ========================================================================
    
    def generate_pdf_summary(self, user_data: Dict, case_summary: Dict, forms_package: List[Dict]) -> bytes:
        """
        Create PDF document with case summary using ReportLab
        Returns PDF as bytes
        """
        # 4.1: Initialize PDF buffer
        pdf_buffer = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        pdf_path = pdf_buffer.name
        pdf_buffer.close()
        
        doc = SimpleDocTemplate(pdf_path, pagesize=letter)
        story = []
        
        # 4.2: Add header
        story.append(Paragraph("San Mateo Family Court", self.styles['CourtTitle']))
        story.append(Paragraph("Case Summary and Action Plan", self.styles['CourtSubtitle']))
        story.append(Spacer(1, 20))
        
        # 4.3: Add user information section
        story.append(Paragraph("Your Information", self.styles['SectionTitle']))
        user_info = [
            ['Name:', user_data.get('name', 'Not provided')],
            ['Case Type:', case_summary.get('case_type', 'N/A')],
            ['Priority:', case_summary.get('priority', 'N/A')],
            ['Date Generated:', datetime.now().strftime('%B %d, %Y at %I:%M %p')]
        ]
        
        if case_summary.get('queue_number'):
            user_info.append(['Queue Number:', case_summary['queue_number']])
        
        if user_data.get('email'):
            user_info.append(['Email:', user_data['email']])
        
        user_table = Table(user_info, colWidths=[2*inch, 4*inch])
        user_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e5e7eb')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('BACKGROUND', (1, 0), (1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d1d5db'))
        ]))
        story.append(user_table)
        story.append(Spacer(1, 20))
        
        # 4.4: Add case summary section
        story.append(Paragraph("Case Summary", self.styles['SectionTitle']))
        narrative = case_summary.get('narrative', 'Case summary not available.')
        story.append(Paragraph(narrative, self.styles['Normal']))
        story.append(Spacer(1, 20))
        
        # 4.5: Add required forms section
        story.append(Paragraph("Required Forms", self.styles['SectionTitle']))
        for form in forms_package:
            form_text = f"<b>{form['form_code']}:</b> {form['form_name']}"
            story.append(Paragraph(form_text, self.styles['Normal']))
            if form.get('description'):
                story.append(Paragraph(f"   {form['description']}", self.styles['Normal']))
            story.append(Spacer(1, 8))
        story.append(Spacer(1, 20))
        
        # 4.6: Add next steps section
        story.append(Paragraph("Your Next Steps", self.styles['SectionTitle']))
        for i, step in enumerate(case_summary.get('next_steps', []), 1):
            action = step.get('action', 'Next step')
            timeline = step.get('timeline', 'To be determined')
            step_text = f"<b>{i}. {action}</b><br/>Timeline: {timeline}"
            story.append(Paragraph(step_text, self.styles['Normal']))
            story.append(Spacer(1, 10))
        story.append(Spacer(1, 20))
        
        # 4.7: Add warnings section
        warnings = case_summary.get('warnings', [])
        if warnings:
            story.append(Paragraph("IMPORTANT WARNINGS", self.styles['SectionTitle']))
            for warning in warnings:
                story.append(Paragraph(f"⚠️ {warning}", self.styles['WarningText']))
                story.append(Spacer(1, 8))
            story.append(Spacer(1, 20))
        
        # 4.8: Add resources section
        story.append(Paragraph("Helpful Resources", self.styles['SectionTitle']))
        resources = case_summary.get('resources', [])
        if resources:
            for resource in resources:
                resource_text = f"<b>{resource.get('name', 'Resource')}:</b> {resource.get('contact', 'N/A')}"
                story.append(Paragraph(resource_text, self.styles['Normal']))
                story.append(Spacer(1, 8))
        else:
            story.append(Paragraph("San Mateo County Superior Court", self.styles['Normal']))
            story.append(Paragraph("Room 101, First Floor | (650) 261-5100", self.styles['Normal']))
            story.append(Paragraph("400 County Center, Redwood City, CA 94063", self.styles['Normal']))
        
        # 4.9: Add footer
        story.append(Spacer(1, 30))
        story.append(Paragraph("San Mateo County Superior Court - Family Court Services", 
                             self.styles['Normal']))
        story.append(Paragraph("Room 101, First Floor | (650) 261-5100", self.styles['Normal']))
        
        # 4.10: Finalize PDF
        doc.build(story)
        
        # Read PDF bytes
        with open(pdf_path, 'rb') as f:
            pdf_bytes = f.read()
        
        # Cleanup
        try:
            os.remove(pdf_path)
        except:
            pass
        
        return pdf_bytes
    
    # ========================================================================
    # STEP 5: COMPOSE HTML EMAIL
    # ========================================================================
    
    def compose_email_html(self, user_data: Dict, case_summary: Dict, forms_package: List[Dict]) -> str:
        """
        Create professional HTML email template
        """
        queue_number_html = ""
        if case_summary.get('queue_number') and case_summary['queue_number'] != 'N/A':
            queue_number_html = f"""
            <div style="background-color: #dbeafe; border: 2px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>Your Queue Number:</strong></p>
                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #1e40af;">{case_summary['queue_number']}</p>
            </div>
            """
        
        # Forms HTML
        forms_html = ""
        for form in forms_package:
            forms_html += f"""
            <div style="margin: 15px 0; padding: 15px; background-color: #f9fafb; border-left: 4px solid #1e3a8a; border-radius: 4px;">
                <strong style="color: #1e3a8a; font-size: 16px;">{form['form_code']}: {form['form_name']}</strong>
                <p style="margin: 5px 0; color: #4b5563;">{form.get('description', '')}</p>
                <a href="{form['official_url']}" 
                   style="display: inline-block; background-color: #1e3a8a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                    Download {form['form_code']}
                </a>
            </div>
            """
        
        # Next steps HTML
        next_steps_html = ""
        for i, step in enumerate(case_summary.get('next_steps', []), 1):
            priority_color = {
                'high': '#dc2626',
                'critical': '#991b1b',
                'medium': '#f59e0b'
            }.get(step.get('priority', 'medium').lower(), '#6b7280')
            
            next_steps_html += f"""
            <li style="margin: 15px 0; padding: 10px; border-left: 4px solid {priority_color};">
                <strong>{step.get('action', 'Next step')}</strong><br/>
                <em style="color: #6b7280;">Timeline: {step.get('timeline', 'To be determined')}</em>
            </li>
            """
        
        # Warnings HTML
        warnings_html = ""
        if case_summary.get('warnings'):
            warnings_list = "".join([f"<li style='margin: 10px 0;'>{warning}</li>" for warning in case_summary['warnings']])
            warnings_html = f"""
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 4px;">
                <h3 style="margin: 0 0 15px 0; color: #dc2626;">⚠️ Important Warnings</h3>
                <ul style="margin: 0; padding-left: 20px; color: #991b1b;">
                    {warnings_list}
                </ul>
            </div>
            """
        
        # Resources HTML
        resources_html = ""
        resources = case_summary.get('resources', [])
        if resources:
            resources_list = "".join([
                f"<li style='margin: 10px 0;'><strong>{r.get('name', 'Resource')}:</strong> {r.get('contact', 'N/A')}</li>"
                for r in resources
            ])
            resources_html = f"""
            <div style="margin: 20px 0;">
                <h2 style="color: #1e3a8a;">Helpful Resources</h2>
                <ul style="margin: 0; padding-left: 20px;">
                    {resources_list}
                </ul>
            </div>
            """
        
        html = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Case Summary - San Mateo Family Court</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            
            <div style="background-color: #1e3a8a; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0;">🏛️ San Mateo Family Court</h1>
                <p style="margin: 10px 0 0 0;">Case Summary and Action Plan</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border: 1px solid #e5e7eb;">
                
                <h2 style="color: #1e3a8a; margin-top: 0;">Hello {user_data.get('name', 'there')},</h2>
                
                <p style="font-size: 16px;">
                    Thank you for using the San Mateo Family Court Self-Service Kiosk. 
                    Below is your complete case summary and action plan.
                </p>
                
                {queue_number_html}
                
                <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #1e3a8a; background-color: #eff6ff;">
                    <h3 style="margin: 0 0 10px 0; color: #1e3a8a;">Your Case Summary</h3>
                    <p style="margin: 5px 0;"><strong>Case Type:</strong> {case_summary.get('case_type', 'N/A')}</p>
                    <p style="margin: 5px 0;"><strong>Priority Level:</strong> {case_summary.get('priority', 'N/A')}</p>
                    <p style="margin: 10px 0 0 0;">{case_summary.get('narrative', 'Case summary not available.')}</p>
                </div>
                
                <div style="margin: 20px 0;">
                    <h2 style="color: #1e3a8a;">Required Forms</h2>
                    <p>You will need to complete the following California Judicial Council forms:</p>
                    {forms_html}
                </div>
                
                <div style="margin: 20px 0;">
                    <h2 style="color: #1e3a8a;">Your Next Steps</h2>
                    <ol style="margin: 0; padding-left: 20px;">
                        {next_steps_html}
                    </ol>
                </div>
                
                {warnings_html}
                
                {resources_html}
                
                <div style="background-color: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>📎 Attached:</strong> A PDF copy of this summary is attached to this email 
                    for your records. Please keep it for reference.</p>
                </div>
                
            </div>
            
            <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px;">
                <p style="margin: 0;"><strong>San Mateo County Superior Court - Family Court Services</strong></p>
                <p style="margin: 5px 0;">Room 101, First Floor | (650) 261-5100</p>
                <p style="margin: 5px 0;">400 County Center, Redwood City, CA 94063</p>
                <p style="margin: 15px 0 0 0; font-size: 12px; color: #9ca3af;">
                    This email contains important information about your case. Please save it for your records.
                </p>
            </div>
            
        </body>
        </html>
        """
        
        return html
    
    def compose_plain_text_email(self, user_data: Dict, case_summary: Dict, forms_package: List[Dict]) -> str:
        """Create plain text version of email"""
        text = f"""
San Mateo Family Court
Case Summary and Action Plan

Hello {user_data.get('name', 'there')},

Thank you for using the San Mateo Family Court Self-Service Kiosk.

CASE SUMMARY
Case Type: {case_summary.get('case_type', 'N/A')}
Priority: {case_summary.get('priority', 'N/A')}
"""
        
        if case_summary.get('queue_number'):
            text += f"Queue Number: {case_summary['queue_number']}\n"
        
        text += f"\n{case_summary.get('narrative', 'Case summary not available.')}\n\n"
        
        text += "REQUIRED FORMS\n"
        for form in forms_package:
            text += f"\n{form['form_code']}: {form['form_name']}\n{form.get('description', '')}\nDownload: {form['official_url']}\n"
        
        text += "\nYOUR NEXT STEPS\n"
        for i, step in enumerate(case_summary.get('next_steps', []), 1):
            text += f"\n{i}. {step.get('action', 'Next step')}\n   Timeline: {step.get('timeline', 'To be determined')}\n"
        
        if case_summary.get('warnings'):
            text += "\n⚠️ IMPORTANT WARNINGS\n"
            for warning in case_summary['warnings']:
                text += f"- {warning}\n"
        
        text += "\nHELPFUL RESOURCES\n"
        resources = case_summary.get('resources', [])
        if resources:
            for resource in resources:
                text += f"{resource.get('name', 'Resource')}: {resource.get('contact', 'N/A')}\n"
        else:
            text += "San Mateo County Superior Court\nRoom 101, First Floor | (650) 261-5100\n"
        
        text += """
---
San Mateo County Superior Court - Family Court Services
Room 101, First Floor | (650) 261-5100
400 County Center, Redwood City, CA 94063
"""
        
        return text
    
    # ========================================================================
    # STEP 6: SEND EMAIL WITH ATTACHMENTS
    # ========================================================================
    
    def send_email_with_attachments(self, user_data: Dict, case_summary: Dict, forms_package: List[Dict]) -> Dict:
        """
        Send email using Resend API with PDF attachment
        """
        if not Config.RESEND_API_KEY:
            return {"success": False, "error": "Email service not configured"}
        
        try:
            # 6.1: Generate PDF summary
            print("📄 Generating PDF summary...")
            pdf_content = self.generate_pdf_summary(user_data, case_summary, forms_package)
            
            # 6.2: Compose HTML email
            print("📧 Composing HTML email...")
            html_content = self.compose_email_html(user_data, case_summary, forms_package)
            
            # 6.3: Compose plain text version (fallback)
            text_content = self.compose_plain_text_email(user_data, case_summary, forms_package)
            
            # 6.4: Prepare attachments
            attachments = [{
                'filename': f'case_summary_{user_data.get("name", "user").replace(" ", "_")}.pdf',
                'content': base64.b64encode(pdf_content).decode('utf-8'),
                'type': 'application/pdf'
            }]
            
            # 6.5: Prepare email payload
            email_payload = {
                'from': self.from_email,
                'to': [user_data['email']],
                'subject': f'Your Case Summary - {case_summary.get("case_type", "Court Case")}',
                'html': html_content,
                'text': text_content,
                'attachments': attachments
            }
            
            # 6.6: Send via Resend API
            print(f"📤 Sending email to {user_data['email']}...")
            response = resend.Emails.send(email_payload)
            
            # 6.7: Log successful send
            if response and response.get('id'):
                print(f"✅ Email sent successfully! Message ID: {response['id']}")
                return {
                    'success': True,
                    'message_id': response['id'],
                    'recipient': user_data['email']
                }
            else:
                print(f"❌ Failed to send email: {response}")
                return {"success": False, "error": "Failed to send email"}
                
        except Exception as e:
            print(f"❌ Error sending email: {e}")
            return {"success": False, "error": str(e)}
    
    # ========================================================================
    # STEP 7: MAIN ORCHESTRATION FUNCTION
    # ========================================================================
    
    def send_complete_case_summary_email(self, user_session_id: str, case_responses: Dict, 
                                        queue_number: Optional[str] = None) -> Dict:
        """
        Main function to orchestrate entire email summary chain
        Follows the 8-step pseudocode process
        """
        try:
            # 7.1: Prepare data
            print("Step 1: Gathering user and case data...")
            user_data, case_data = self.prepare_case_summary_data(user_session_id, case_responses)
            
            # 7.2: Generate AI summary
            print("Step 2: Generating AI-powered case summary...")
            case_summary = self.generate_case_summary_with_ai(case_data, case_responses)
            
            # 7.3: Add queue number if provided
            if queue_number:
                case_summary['queue_number'] = queue_number
            
            # 7.4: Prepare forms package
            print("Step 3: Preparing forms package...")
            forms_package = self.prepare_forms_package(
                case_summary['forms_needed'], 
                case_data['case_type']
            )
            
            # 7.5: Send email
            print("Step 4: Sending email with PDF attachment...")
            email_result = self.send_email_with_attachments(
                user_data, 
                case_summary, 
                forms_package
            )
            
            if not email_result.get('success'):
                return email_result
            
            # 7.6: Save to database (if needed)
            print("Step 5: Email summary chain completed successfully!")
            
            # 7.7: Return success
            return {
                'success': True,
                'message': 'Case summary email sent successfully',
                'email': user_data['email'],
                'message_id': email_result.get('message_id'),
                'forms_count': len(forms_package)
            }
            
        except ValueError as e:
            print(f"✗ Validation error: {e}")
            return {'success': False, 'error': 'validation_error', 'message': str(e)}
            
        except Exception as e:
            print(f"✗ Unexpected error: {e}")
            import traceback
            traceback.print_exc()
            return {'success': False, 'error': 'unknown_error', 'message': str(e)}

