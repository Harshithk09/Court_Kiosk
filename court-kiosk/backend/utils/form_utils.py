"""
Shared form utilities - eliminates duplication between email services
Single source of truth for all form mappings
"""

import json
import os
from typing import Dict, Optional, List


class FormUtils:
    """Shared utilities for form management"""
    
    # Comprehensive mapping of California Judicial Council forms
    FORM_URLS = {
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
    
    FORM_TITLES = {
        'DV-100': 'Request for Domestic Violence Restraining Order',
        'DV-105': 'Request for Child Custody and Visitation Orders',
        'DV-108': 'Request for Order to Prevent Child Abduction',
        'DV-109': 'Notice of Court Hearing',
        'DV-110': 'Temporary Restraining Order',
        'DV-140': 'Child Custody and Visitation Order Attachment',
        'DV-145': 'Child Abduction Prevention Order',
        'DV-200': 'Proof of Personal Service',
        'DV-250': 'Proof of Service by Mail (Blank)',
        'DV-120': 'Response to Request for Domestic Violence Restraining Order',
        'DV-800': 'Firearms Restraining Order',
        'CLETS-001': 'Confidential CLETS Information',
        'FL-100': 'Petition — Marriage/Domestic Partnership',
        'FL-105': 'Declaration Under UCCJEA',
        'FL-110': 'Summons',
        'FL-115': 'Proof of Service of Summons',
        'FL-117': 'Notice and Acknowledgment of Receipt',
        'FL-140': 'Declaration of Disclosure',
        'FL-141': 'Declaration Regarding Service of Declaration of Disclosure',
        'FL-142': 'Schedule of Assets and Debts',
        'FL-144': 'Stipulation and Waiver of Final Declaration of Disclosure',
        'FL-150': 'Income and Expense Declaration',
        'CH-100': 'Request for Civil Harassment Restraining Orders',
        'CH-109': 'Notice of Court Hearing',
        'CH-110': 'Temporary Restraining Order',
        'CH-120': 'Response to Request for Civil Harassment Restraining Orders',
        'CH-120-INFO': 'How to Respond to a Civil Harassment Restraining Order',
        'CH-130': 'Civil Harassment Restraining Order After Hearing',
        'CH-200': 'Proof of Personal Service',
        'CM-010': 'Civil Case Cover Sheet',
        'FW-001': 'Request to Waive Court Fees',
        'POS-040': 'Proof of Service',
        'SER-001': 'Proof of Service'
    }
    
    ESSENTIAL_FORMS_BY_CASE_TYPE = {
        'DVRO': ['DV-100', 'CLETS-001', 'DV-109', 'DV-110'],
        'DIVORCE': ['FL-100', 'FL-110', 'FL-115'],
        'CHRO': ['CH-100', 'CLETS-001', 'CH-109', 'CH-110']
    }
    
    @staticmethod
    def get_form_url(form_code: str) -> str:
        """Get official California Courts URL for a form"""
        normalized = str(form_code).strip().upper()
        return FormUtils.FORM_URLS.get(normalized, "https://www.courts.ca.gov/forms.htm")
    
    @staticmethod
    def get_form_title(form_code: str) -> str:
        """Get title for a form code"""
        normalized = str(form_code).strip().upper()
        return FormUtils.FORM_TITLES.get(normalized, f'Court Form {form_code}')
    
    @staticmethod
    def get_essential_forms(case_type: str) -> List[str]:
        """Get essential forms by case type"""
        normalized = str(case_type).strip().upper()
        return FormUtils.ESSENTIAL_FORMS_BY_CASE_TYPE.get(normalized, FormUtils.ESSENTIAL_FORMS_BY_CASE_TYPE['DVRO'])
    
    @staticmethod
    def get_form_details(form_code: str) -> Dict:
        """Get complete form details"""
        normalized = str(form_code).strip().upper()
        return {
            'form_code': normalized,
            'name': FormUtils.get_form_title(normalized),
            'url': FormUtils.get_form_url(normalized),
            'description': f'Required {normalized} form for your case type',
            'instructions': 'Complete all sections accurately',
            'required': True
        }

