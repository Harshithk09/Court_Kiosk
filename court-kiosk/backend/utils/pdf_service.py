import io
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
import json

class PDFService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles for the PDF"""
        # Title style
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        )
        
        # Section header style
        self.section_style = ParagraphStyle(
            'CustomSection',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            spaceBefore=20,
            textColor=colors.darkblue
        )
        
        # Normal text style
        self.normal_style = ParagraphStyle(
            'CustomNormal',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            leading=14
        )
        
        # Important text style
        self.important_style = ParagraphStyle(
            'CustomImportant',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            leading=14,
            textColor=colors.red
        )
        
        # Queue number style
        self.queue_style = ParagraphStyle(
            'CustomQueue',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=20,
            alignment=TA_CENTER,
            textColor=colors.white,
            backColor=colors.red
        )
    
    def generate_case_summary_pdf(self, case_data):
        """Generate a PDF with detailed case summary"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        
        story = []
        
        # Header
        story.append(Paragraph("San Mateo Family Court Clinic", self.title_style))
        story.append(Paragraph("Case Summary Report", self.title_style))
        story.append(Spacer(1, 20))
        
        # Queue number
        queue_number = case_data.get('queue_number', 'N/A')
        story.append(Paragraph(f"Queue Number: {queue_number}", self.queue_style))
        story.append(Spacer(1, 20))
        
        # Case information
        story.append(Paragraph("Case Information", self.section_style))
        
        case_info_data = [
            ['Field', 'Value'],
            ['Queue Number', queue_number],
            ['Case Type', case_data.get('case_type', 'Unknown')],
            ['Date', datetime.now().strftime('%B %d, %Y')],
            ['Language', case_data.get('language', 'English').upper()],
            ['User Name', case_data.get('user_name', 'Anonymous')],
            ['Priority Level', case_data.get('priority_level', 'C')]
        ]
        
        case_info_table = Table(case_info_data, colWidths=[2*inch, 4*inch])
        case_info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(case_info_table)
        story.append(Spacer(1, 20))
        
        # Summary details
        summary = case_data.get('summary', {})
        
        # Required forms
        forms = summary.get('forms', [])
        if forms:
            story.append(Paragraph("Required Forms", self.section_style))
            for i, form in enumerate(forms, 1):
                story.append(Paragraph(f"{i}. {form}", self.normal_style))
            story.append(Spacer(1, 15))
        
        # Next steps
        steps = summary.get('steps', [])
        if steps:
            story.append(Paragraph("Next Steps", self.section_style))
            for i, step in enumerate(steps, 1):
                story.append(Paragraph(f"{i}. {step}", self.normal_style))
            story.append(Spacer(1, 15))
        
        # Timeline
        timeline = summary.get('timeline', [])
        if timeline:
            story.append(Paragraph("Important Timeline", self.section_style))
            for item in timeline:
                story.append(Paragraph(f"• {item}", self.normal_style))
            story.append(Spacer(1, 15))
        
        # Important notes
        important_notes = summary.get('importantNotes', [])
        if important_notes:
            story.append(Paragraph("Important Notes", self.section_style))
            for note in important_notes:
                story.append(Paragraph(f"• {note}", self.important_style))
            story.append(Spacer(1, 15))
        
        # Conversation summary
        conversation = case_data.get('conversation_summary')
        if conversation:
            story.append(Paragraph("Conversation Summary", self.section_style))
            story.append(Paragraph(conversation, self.normal_style))
            story.append(Spacer(1, 15))
        
        # Documents needed
        documents = case_data.get('documents_needed', [])
        if documents:
            story.append(Paragraph("Documents Needed", self.section_style))
            for doc in documents:
                story.append(Paragraph(f"• {doc}", self.normal_style))
            story.append(Spacer(1, 15))
        
        # Important reminders
        story.append(Paragraph("Important Reminders", self.section_style))
        reminders = [
            "Keep copies of all forms with you at all times",
            "Arrive at court 15 minutes before your hearing",
            "Bring all evidence and witnesses to court",
            "Dress appropriately for court",
            "If you have questions, contact court staff",
            "Keep this summary for your records"
        ]
        for reminder in reminders:
            story.append(Paragraph(f"• {reminder}", self.normal_style))
        
        story.append(Spacer(1, 20))
        
        # Footer
        footer_text = f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')} by San Mateo Family Court Clinic"
        story.append(Paragraph(footer_text, ParagraphStyle(
            'Footer',
            parent=self.styles['Normal'],
            fontSize=9,
            alignment=TA_CENTER,
            textColor=colors.grey
        )))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer
    
    def generate_queue_notification_pdf(self, queue_data):
        """Generate a PDF for queue notification"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        
        story = []
        
        # Header
        story.append(Paragraph("San Mateo Family Court Clinic", self.title_style))
        story.append(Paragraph("Queue Notification", self.title_style))
        story.append(Spacer(1, 20))
        
        # Queue number
        queue_number = queue_data.get('queue_number', 'N/A')
        story.append(Paragraph(f"Queue Number: {queue_number}", self.queue_style))
        story.append(Spacer(1, 20))
        
        # Queue information
        story.append(Paragraph("Queue Information", self.section_style))
        
        queue_info_data = [
            ['Field', 'Value'],
            ['Queue Number', queue_number],
            ['Case Type', queue_data.get('case_type', 'Unknown')],
            ['Estimated Wait Time', f"{queue_data.get('estimated_wait_time', 30)} minutes"],
            ['Status', 'Waiting'],
            ['Date Added', datetime.now().strftime('%B %d, %Y at %I:%M %p')]
        ]
        
        queue_info_table = Table(queue_info_data, colWidths=[2*inch, 4*inch])
        queue_info_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(queue_info_table)
        story.append(Spacer(1, 20))
        
        # What to expect
        story.append(Paragraph("What to Expect", self.section_style))
        expectations = [
            "Your number will be called when it's your turn",
            "Please wait in the designated waiting area",
            "You can use the kiosk while waiting",
            "A facilitator will assist you with your case"
        ]
        for expectation in expectations:
            story.append(Paragraph(f"• {expectation}", self.normal_style))
        
        story.append(Spacer(1, 15))
        
        # Important reminders
        story.append(Paragraph("Important Reminders", self.section_style))
        reminders = [
            "Keep your queue number visible",
            "Stay in the waiting area",
            "Listen for your number to be called",
            "If you need to step away, inform staff"
        ]
        for reminder in reminders:
            story.append(Paragraph(f"• {reminder}", self.normal_style))
        
        story.append(Spacer(1, 20))
        
        # Footer
        footer_text = f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')} by San Mateo Family Court Clinic"
        story.append(Paragraph(footer_text, ParagraphStyle(
            'Footer',
            parent=self.styles['Normal'],
            fontSize=9,
            alignment=TA_CENTER,
            textColor=colors.grey
        )))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer

# Global PDF service instance
pdf_service = PDFService()
