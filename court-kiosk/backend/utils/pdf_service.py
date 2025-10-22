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
    
    def get_form_url(self, form_code: str) -> str:
        """Get URL for downloading the official form - CORRECTED URLS"""
        normalized = str(form_code).strip().upper()
        
        # Comprehensive mapping with CORRECT California Courts URLs
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
                if isinstance(step, dict):
                    step_text = step.get('action', str(step))
                else:
                    step_text = str(step)
                story.append(Paragraph(f"{i}. {step_text}", self.styles['Normal']))
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
        print(f"✅ Generated case summary PDF: {output_path}")
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
            'DV-101': 'Response to Request for Domestic Violence Restraining Order',
            'DV-105A': 'Child Custody and Visitation Order',
            'DV-108': 'Request for Child Abduction Prevention',
            'DV-112': 'Proof of Service',
            'DV-116': 'Request for Property Restraining Order',
            'DV-120INFO': 'Information Sheet for Property Restraining Order',
            'DV-125': 'Response to Request for Property Restraining Order',
            'DV-130': 'Response to Request for Domestic Violence Restraining Order',
            'DV-145': 'Response to Request for Child Custody and Visitation',
            'DV-200INFO': 'Information Sheet for Response to Request for Domestic Violence Restraining Order',
            'DV-250': 'Request for Civil Harassment Restraining Order',
            'DV-300': 'Request to Renew Restraining Order',
            'DV-305': 'Response to Request to Renew Restraining Order',
            'DV-310': 'Request to Modify Restraining Order',
            'DV-330': 'Response to Request to Modify Restraining Order',
            'DV-700': 'Request for Domestic Violence Restraining Order',
            'DV-710': 'Response to Request for Domestic Violence Restraining Order',
            'DV-720': 'Request for Domestic Violence Restraining Order',
            'DV-730': 'Response to Request for Domestic Violence Restraining Order',
            'DV-800': 'Firearms Surrender Order',
            'FL-100': 'Petition for Dissolution of Marriage',
            'FL-105': 'Response to Petition for Dissolution of Marriage',
            'FL-110': 'Declaration Under Uniform Child Custody Jurisdiction and Enforcement Act',
            'FL-115': 'Declaration of Service',
            'FL-117': 'Declaration of Service',
            'FL-120': 'Summons',
            'FL-130': 'Declaration of Service',
            'FL-140': 'Declaration of Service',
            'FL-141': 'Declaration of Service',
            'FL-142': 'Declaration of Service',
            'FL-144': 'Declaration of Service',
            'FL-150': 'Declaration of Service',
            'FL-157': 'Declaration of Service',
            'FL-160': 'Declaration of Service',
            'FL-165': 'Declaration of Service',
            'FL-170': 'Declaration of Service',
            'FL-180': 'Declaration of Service',
            'FL-190': 'Declaration of Service',
            'FL-191': 'Declaration of Service',
            'FL-192': 'Declaration of Service',
            'FL-195': 'Declaration of Service',
            'FL-300': 'Request for Order',
            'FL-305': 'Response to Request for Order',
            'FL-320': 'Request for Order',
            'FL-326': 'Response to Request for Order',
            'FL-330': 'Request for Order',
            'FL-334': 'Response to Request for Order',
            'FL-335': 'Request for Order',
            'FL-341': 'Response to Request for Order',
            'FL-342': 'Request for Order',
            'FL-343': 'Response to Request for Order',
            'FL-345': 'Request for Order',
            'FL-435': 'Request for Order',
            'FL-800': 'Request for Order',
            'FL-810': 'Response to Request for Order',
            'FL-825': 'Request for Order',
            'FL-830': 'Response to Request for Order',
            'CH-100': 'Request for Civil Harassment Restraining Order',
            'CH-109': 'Notice of Court Hearing (Civil Harassment)',
            'CH-110': 'Temporary Restraining Order (Civil Harassment)',
            'CH-120': 'Request for Civil Harassment Restraining Order',
            'CH-120INFO': 'Information Sheet for Civil Harassment',
            'CH-130': 'Response to Request for Civil Harassment Restraining Order',
            'CH-200': 'Request for Civil Harassment Restraining Order',
            'CH-250': 'Request for Civil Harassment Restraining Order',
            'CH-700': 'Request for Civil Harassment Restraining Order',
            'CH-710': 'Response to Request for Civil Harassment Restraining Order',
            'CH-720': 'Request for Civil Harassment Restraining Order',
            'CH-730': 'Response to Request for Civil Harassment Restraining Order',
            'CH-800': 'Request for Civil Harassment Restraining Order',
            'FW-001': 'Request to Waive Court Fees',
            'FW-002': 'Order on Request to Waive Court Fees',
            'FW-003': 'Request to Waive Court Fees',
            'FW-005': 'Order on Request to Waive Court Fees',
            'CLETS-001': 'CLETS Information Sheet',
            'CM-010': 'Request for Order',
            'EPO-001': 'Emergency Protective Order',
            'JV-255': 'Request for Order',
            'MC-025': 'Request for Order',
            'MC-031': 'Response to Request for Order',
            'MC-040': 'Request for Order',
            'MC-050': 'Response to Request for Order',
            'POS-040': 'Proof of Service',
            'SER-001': 'Proof of Service'
        }
        return form_descriptions.get(form_code, f'Court Form {form_code}')
    
    def download_official_form(self, form_code: str, output_path: str = None) -> Optional[str]:
        """Download the official form PDF from the court website"""
        try:
            form_url = self.get_form_url(form_code)
            print(f"📥 Downloading form {form_code} from {form_url}")
            
            response = requests.get(form_url, timeout=30, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            
            if response.status_code == 200:
                if not output_path:
                    output_path = tempfile.mktemp(suffix=f'_{form_code}.pdf')
                
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                
                print(f"✅ Downloaded form {form_code} successfully")
                return output_path
            else:
                print(f"❌ Failed to download form {form_code}: HTTP {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error downloading form {form_code}: {str(e)}")
            return None
    
    def generate_forms_package(self, forms: List[str], case_data: Dict = None) -> List[Dict]:
        """Generate a package of all required forms by downloading official PDFs"""
        attachments = []
        
        print(f"📦 Generating forms package for {len(forms)} forms...")
        
        for form_code in forms:
            # Extract just the form code if it's a dict
            if isinstance(form_code, dict):
                form_code = form_code.get('form_code', form_code.get('code', ''))
            
            form_code = str(form_code).strip().upper()
            
            try:
                print(f"🔄 Processing form: {form_code}")
                
                # Try to download official form
                official_path = self.download_official_form(form_code)
                
                if official_path and os.path.exists(official_path):
                    # Successfully downloaded official form
                    attachments.append({
                        'filename': f"{form_code}.pdf",
                        'path': official_path,
                        'type': 'official'
                    })
                    print(f"✅ Added official form: {form_code}")
                else:
                    print(f"⚠️ Could not download official form {form_code}, skipping...")
                    
            except Exception as e:
                print(f"❌ Error processing form {form_code}: {str(e)}")
                continue
        
        print(f"✅ Forms package complete: {len(attachments)} forms ready")
        return attachments