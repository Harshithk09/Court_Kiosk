import os
import requests
import tempfile
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from typing import List, Dict, Optional
import json

class PDFService:
    """Service for generating PDF documents for court forms and case summaries"""
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
    
    def setup_custom_styles(self):
        """Setup custom paragraph styles for court documents"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CourtTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            name='CourtSubtitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=20,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        ))
        
        # Form title style
        self.styles.add(ParagraphStyle(
            name='FormTitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=15,
            textColor=colors.black
        ))
        
        # Important note style
        self.styles.add(ParagraphStyle(
            name='ImportantNote',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=12,
            textColor=colors.red,
            backColor=colors.lightgrey,
            borderWidth=1,
            borderColor=colors.red,
            borderPadding=8
        ))
    
    def generate_case_summary_pdf(self, case_data: Dict, output_path: str = None) -> str:
        """Generate a comprehensive case summary PDF"""
        if not output_path:
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
            ['Case Number:', case_data.get('case_number', 'N/A')],
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
        if case_data.get('phone_number'):
            case_info.append(['Phone:', case_data['phone_number']])
        
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
        
        # Case Summary
        if case_data.get('conversation_summary'):
            story.append(Paragraph("Case Summary", self.styles['FormTitle']))
            story.append(Paragraph(case_data['conversation_summary'], self.styles['Normal']))
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
            form_data = []
            for i, form in enumerate(forms, 1):
                form_data.append([f"{i}.", form, self.get_form_description(form)])
            
            forms_table = Table(form_data, colWidths=[0.5*inch, 1.5*inch, 4*inch])
            forms_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(forms_table)
            story.append(Spacer(1, 20))
        
        # Next Steps
        next_steps = case_data.get('next_steps', [])
        if isinstance(next_steps, str):
            try:
                next_steps = json.loads(next_steps)
            except:
                next_steps = []
        
        if next_steps:
            story.append(Paragraph("Next Steps", self.styles['FormTitle']))
            for i, step in enumerate(next_steps, 1):
                story.append(Paragraph(f"{i}. {step}", self.styles['Normal']))
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
        
        story.append(Spacer(1, 20))
        
        # Footer
        story.append(Paragraph("This document was generated by the San Mateo Family Court Clinic system.", 
                              self.styles['Normal']))
        story.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", 
                              self.styles['Normal']))
        
        doc.build(story)
        return output_path
    
    def generate_form_pdf(self, form_code: str, form_data: Dict = None, output_path: str = None) -> str:
        """Generate a PDF for a specific court form"""
        if not output_path:
            output_path = tempfile.mktemp(suffix=f'_{form_code}.pdf')
        
        doc = SimpleDocTemplate(output_path, pagesize=letter)
        story = []
        
        # Form Header
        story.append(Paragraph("San Mateo Family Court Clinic", self.styles['CourtTitle']))
        story.append(Paragraph(f"Form: {form_code}", self.styles['CourtSubtitle']))
        story.append(Paragraph(self.get_form_description(form_code), self.styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Form Instructions
        instructions = self.get_form_instructions(form_code)
        if instructions:
            story.append(Paragraph("Instructions:", self.styles['FormTitle']))
            for instruction in instructions:
                story.append(Paragraph(f"• {instruction}", self.styles['Normal']))
            story.append(Spacer(1, 20))
        
        # Form Fields (if data provided)
        if form_data:
            story.append(Paragraph("Form Data:", self.styles['FormTitle']))
            form_table_data = [['Field', 'Value']]
            for key, value in form_data.items():
                form_table_data.append([key.replace('_', ' ').title(), str(value)])
            
            form_table = Table(form_table_data, colWidths=[2*inch, 4*inch])
            form_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(form_table)
        else:
            # Placeholder for form fields
            story.append(Paragraph("Form Fields:", self.styles['FormTitle']))
            story.append(Paragraph("Please complete all required fields on the official form.", 
                                  self.styles['Normal']))
            story.append(Paragraph("Download the official form from: " + self.get_form_url(form_code), 
                                  self.styles['Normal']))
        
        story.append(Spacer(1, 20))
        
        # Important Notes
        story.append(Paragraph("Important Notes:", self.styles['ImportantNote']))
        story.append(Paragraph("• This is a template. Please use the official court form.", 
                              self.styles['Normal']))
        story.append(Paragraph("• Make 3 copies of the completed form (original + 2 copies)", 
                              self.styles['Normal']))
        story.append(Paragraph("• File the original with the court clerk", 
                              self.styles['Normal']))
        story.append(Paragraph("• Keep one copy for your records", 
                              self.styles['Normal']))
        
        doc.build(story)
        return output_path
    
    def get_form_description(self, form_code: str) -> str:
        """Get description for a form code"""
        form_descriptions = {
            'DV-100': 'Request for Domestic Violence Restraining Order',
            'DV-109': 'Notice of Court Hearing',
            'DV-110': 'Temporary Restraining Order',
            'DV-105': 'Request for Child Custody and Visitation Orders',
            'DV-140': 'Child Custody and Visitation Order',
            'DV-200': 'Proof of Personal Service',
            'DV-120': 'Response to Request for Domestic Violence Restraining Order',
            'CLETS-001': 'Confidential CLETS Information',
            'FL-150': 'Income and Expense Declaration',
            'CH-100': 'Request for Civil Harassment Restraining Order',
            'CH-109': 'Notice of Court Hearing (Civil Harassment)',
            'CH-110': 'Temporary Restraining Order (Civil Harassment)',
            'EA-100': 'Request for Elder or Dependent Adult Abuse Restraining Order',
            'EA-109': 'Notice of Court Hearing (Elder Abuse)',
            'EA-110': 'Temporary Restraining Order (Elder Abuse)',
            'WV-100': 'Request for Workplace Violence Restraining Order',
            'WV-109': 'Notice of Court Hearing (Workplace Violence)',
            'WV-110': 'Temporary Restraining Order (Workplace Violence)'
        }
        return form_descriptions.get(form_code, f'Court Form {form_code}')
    
    def get_form_instructions(self, form_code: str) -> List[str]:
        """Get instructions for completing a form"""
        instructions = {
            'DV-100': [
                'Complete all sections accurately',
                'Include specific incidents of domestic violence',
                'List all children if applicable',
                'Sign and date the form'
            ],
            'DV-109': [
                'This form is completed by the court',
                'Contains hearing date and time',
                'Must be served with other papers'
            ],
            'DV-110': [
                'This is a temporary order',
                'Effective until the hearing',
                'Must be served immediately'
            ],
            'CLETS-001': [
                'Complete all personal information',
                'Include all addresses where you lived',
                'List all names you have used',
                'Sign and date the form'
            ]
        }
        return instructions.get(form_code, [
            'Complete all required fields',
            'Sign and date the form',
            'Make copies before filing'
        ])
    
    def get_form_url(self, form_code: str) -> str:
        """Get URL for downloading the official form"""
        base_url = "https://www.courts.ca.gov/documents/"
        form_urls = {
            'DV-100': f"{base_url}dv100.pdf",
            'DV-109': f"{base_url}dv109-info.pdf",
            'DV-110': f"{base_url}dv110.pdf",
            'DV-105': f"{base_url}dv105.pdf",
            'DV-140': f"{base_url}dv140.pdf",
            'DV-200': f"{base_url}dv200.pdf",
            'DV-120': f"{base_url}dv120.pdf",
            'CLETS-001': f"{base_url}clets001.pdf",
            'FL-150': f"{base_url}fl150.pdf",
            'CH-100': f"{base_url}ch100.pdf",
            'CH-109': f"{base_url}ch109.pdf",
            'CH-110': f"{base_url}ch110.pdf",
            'EA-100': f"{base_url}ea100.pdf",
            'EA-109': f"{base_url}ea109.pdf",
            'EA-110': f"{base_url}ea110.pdf",
            'WV-100': f"{base_url}wv100.pdf",
            'WV-109': f"{base_url}wv109.pdf",
            'WV-110': f"{base_url}wv110.pdf"
        }
        return form_urls.get(form_code, f"https://www.courts.ca.gov/forms.htm")
    
    def download_official_form(self, form_code: str, output_path: str = None) -> Optional[str]:
        """Download the official form PDF from the court website"""
        try:
            form_url = self.get_form_url(form_code)
            response = requests.get(form_url, timeout=30)
            
            if response.status_code == 200:
                if not output_path:
                    output_path = tempfile.mktemp(suffix=f'_{form_code}_official.pdf')
                
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                
                return output_path
            else:
                print(f"Failed to download form {form_code}: HTTP {response.status_code}")
                return None
                
        except Exception as e:
            print(f"Error downloading form {form_code}: {str(e)}")
            return None
    
    def generate_forms_package(self, forms: List[str], case_data: Dict = None) -> List[Dict]:
        """Generate a package of all required forms"""
        attachments = []
        
        for form_code in forms:
            try:
                # Try to download official form first
                official_path = self.download_official_form(form_code)
                
                if official_path:
                    # Use official form
                    attachments.append({
                        'filename': f"{form_code}_official.pdf",
                        'path': official_path,
                        'type': 'official'
                    })
                else:
                    # Generate template form
                    template_path = self.generate_form_pdf(form_code, case_data)
                    attachments.append({
                        'filename': f"{form_code}_template.pdf",
                        'path': template_path,
                        'type': 'template'
                    })
                    
            except Exception as e:
                print(f"Error generating form {form_code}: {str(e)}")
                continue
        
        return attachments
