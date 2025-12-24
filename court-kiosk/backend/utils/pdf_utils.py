"""
Shared PDF utilities - eliminates duplication between email services
"""

from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER


def setup_court_pdf_styles():
    """
    Setup custom paragraph styles for court documents
    Returns: stylesheet with court-specific styles added
    """
    styles = getSampleStyleSheet()
    
    # Court Title Style
    styles.add(ParagraphStyle(
        name='CourtTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.darkblue
    ))
    
    # Court Subtitle Style
    styles.add(ParagraphStyle(
        name='CourtSubtitle',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=20,
        alignment=TA_CENTER,
        textColor=colors.darkblue
    ))
    
    # Form Title Style
    styles.add(ParagraphStyle(
        name='FormTitle',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=15,
        textColor=colors.black
    ))
    
    # Enhanced styles for new service
    styles.add(ParagraphStyle(
        name='SectionTitle',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=12,
        spaceBefore=20,
        textColor=colors.HexColor('#1e3a8a'),
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        name='WarningText',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#dc2626'),
        fontName='Helvetica-Bold'
    ))
    
    return styles

