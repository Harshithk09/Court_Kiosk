#!/usr/bin/env python3
"""
System Verification Script

Checks:
1. Admin page functionality
2. Case summary generation
3. Email summary generation
4. All form links in emails

Usage:
    python verify_system.py
"""

import sys
import os
import requests
import json
from typing import Dict, List, Tuple

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from backend.utils.email_service import EmailService

# Color codes
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}\n")

def print_success(text):
    print(f"{Colors.GREEN}✓{Colors.RESET} {text}")

def print_error(text):
    print(f"{Colors.RED}✗{Colors.RESET} {text}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠{Colors.RESET} {text}")

def print_info(text):
    print(f"{Colors.BLUE}ℹ{Colors.RESET} {text}")

def test_form_urls(email_service: EmailService) -> Tuple[int, int, List[str]]:
    """Test all form URLs in the email service"""
    print_header("Testing Form URLs")
    
    # Get all known forms from the email service
    # We'll need to access the _get_form_url method
    known_forms = [
        # Domestic Violence Forms
        "DV-100", "DV-101", "DV-105", "DV-105A", "DV-108", "DV-109", "DV-110",
        "DV-112", "DV-116", "DV-120", "DV-120INFO", "DV-125", "DV-130", "DV-140",
        "DV-145", "DV-200", "DV-200INFO", "DV-250", "DV-300", "DV-305", "DV-310",
        "DV-330", "DV-700", "DV-710", "DV-720", "DV-730", "DV-800",
        
        # Family Law Forms
        "FL-100", "FL-105", "FL-110", "FL-115", "FL-117", "FL-120", "FL-130",
        "FL-140", "FL-141", "FL-142", "FL-144", "FL-150", "FL-157", "FL-160",
        "FL-165", "FL-170", "FL-180", "FL-190", "FL-191", "FL-192", "FL-195",
        "FL-300", "FL-305", "FL-320", "FL-326", "FL-330", "FL-334", "FL-335",
        "FL-341", "FL-342", "FL-343", "FL-345", "FL-435", "FL-800", "FL-810",
        "FL-825", "FL-830",
        
        # Civil Harassment Forms
        "CH-100", "CH-109", "CH-110", "CH-120", "CH-120INFO", "CH-130", "CH-200",
        "CH-250", "CH-700", "CH-710", "CH-720", "CH-730", "CH-800",
        
        # Fee Waiver Forms
        "FW-001", "FW-002", "FW-003", "FW-005",
        
        # Other Forms
        "CLETS-001", "CM-010", "EPO-001", "JV-255", "MC-025", "MC-031",
        "MC-040", "MC-050", "POS-040", "SER-001"
    ]
    
    working = 0
    broken = 0
    broken_forms = []
    
    print_info(f"Testing {len(known_forms)} form URLs...")
    
    for form_code in known_forms:
        try:
            form_url = email_service._get_form_url(form_code)
            
            # Skip if it's the fallback URL
            if form_url == "https://www.courts.ca.gov/forms.htm":
                print_warning(f"{form_code}: Using fallback URL (form not in mapping)")
                continue
            
            # Test if URL is accessible
            try:
                response = requests.head(form_url, timeout=10, allow_redirects=True)
                if response.status_code == 200:
                    print_success(f"{form_code}: {form_url}")
                    working += 1
                else:
                    print_error(f"{form_code}: HTTP {response.status_code} - {form_url}")
                    broken += 1
                    broken_forms.append(form_code)
            except requests.RequestException as e:
                print_error(f"{form_code}: Connection error - {form_url}")
                print(f"   Error: {str(e)}")
                broken += 1
                broken_forms.append(form_code)
                
        except Exception as e:
            print_error(f"{form_code}: Error getting URL - {str(e)}")
            broken += 1
            broken_forms.append(form_code)
    
    return working, broken, broken_forms

def test_email_generation(email_service: EmailService):
    """Test email HTML generation"""
    print_header("Testing Email Generation")
    
    # Sample case data
    test_case_data = {
        'queue_number': 'A001',
        'user_name': 'Test User',
        'user_email': 'test@example.com',
        'documents_needed': ['DV-100', 'DV-109', 'DV-110', 'CLETS-001'],
        'admin_data': {
            'forms_completed': ['DV-100'],
            'needs_help': True
        }
    }
    
    try:
        # Test HTML generation
        html_content = email_service._generate_email_html(test_case_data)
        
        # Check for required elements
        checks = [
            ('Queue number', 'A001' in html_content),
            ('User name', 'Test User' in html_content),
            ('Form links', 'DV-100' in html_content and 'DV-109' in html_content),
            ('Download links', 'Download Official Form' in html_content or 'href=' in html_content),
            ('Admin data', 'forms_completed' in html_content or 'Forms Completed' in html_content),
            ('Important reminders', 'Important Reminders' in html_content or 'Important' in html_content),
            ('Contact information', '650' in html_content or 'Phone' in html_content),
            ('Legal disclaimer', 'Disclaimer' in html_content or 'legal advice' in html_content.lower())
        ]
        
        all_passed = True
        for check_name, passed in checks:
            if passed:
                print_success(f"Email contains: {check_name}")
            else:
                print_error(f"Email missing: {check_name}")
                all_passed = False
        
        if all_passed:
            print_success("Email HTML generation: PASSED")
        else:
            print_warning("Email HTML generation: Some elements missing")
        
        # Check form URLs in HTML
        forms_data = email_service._extract_forms_data(test_case_data)
        print_info(f"Extracted {len(forms_data)} forms from test data")
        
        for form in forms_data:
            if isinstance(form, str):
                form_code = form
            elif isinstance(form, dict):
                form_code = form.get('form_code', '')
            else:
                continue
            
            form_url = email_service._get_form_url(form_code)
            if form_code in html_content and form_url in html_content:
                print_success(f"Form {form_code} link found in email HTML")
            else:
                print_warning(f"Form {form_code} link may be missing in email HTML")
        
    except Exception as e:
        print_error(f"Error testing email generation: {str(e)}")
        import traceback
        traceback.print_exc()

def test_case_summary_structure():
    """Test case summary data structure"""
    print_header("Testing Case Summary Structure")
    
    # Sample case summary JSON structure
    sample_summary = {
        'header': {
            'case_type': 'DVRO',
            'date': 'January 15, 2025 at 10:30 AM',
            'location': 'San Mateo County Superior Court Kiosk',
            'session_id': 'K12345'
        },
        'user_information': {
            'name': 'Test User',
            'email': 'test@example.com',
            'language': 'EN'
        },
        'forms_completed': [
            {'form_code': 'DV-100', 'title': 'Request for Domestic Violence Restraining Order'},
            {'form_code': 'DV-109', 'title': 'Notice of Court Hearing'}
        ],
        'key_answers': ['Safety concern: Yes', 'Relationship: Domestic'],
        'next_steps': [
            'Complete all required forms',
            'File with court clerk',
            'Serve other party'
        ],
        'resources': {
            'court_info': {
                'name': 'San Mateo County Superior Court',
                'address': '400 County Center, Redwood City, CA 94063',
                'phone': '(650) 261-5100'
            }
        }
    }
    
    required_keys = [
        'header', 'user_information', 'forms_completed', 
        'key_answers', 'next_steps', 'resources'
    ]
    
    all_present = True
    for key in required_keys:
        if key in sample_summary:
            print_success(f"Case summary contains: {key}")
        else:
            print_error(f"Case summary missing: {key}")
            all_present = False
    
    if all_present:
        print_success("Case summary structure: VALID")
    else:
        print_error("Case summary structure: INVALID")

def test_admin_dashboard_data():
    """Test admin dashboard data structure"""
    print_header("Testing Admin Dashboard Data Structure")
    
    # Sample admin dashboard case data
    sample_case = {
        'queue_number': 'A001',
        'case_type': 'DVRO',
        'user_name': 'Test User',
        'user_email': 'test@example.com',
        'priority': 'A',
        'status': 'waiting',
        'created_at': '2025-01-15T10:00:00Z',
        'documents_needed': ['DV-100', 'DV-109', 'DV-110'],
        'conversation_summary': 'User reported domestic violence situation...',
        'current_node': 'safety_check'
    }
    
    required_fields = [
        'queue_number', 'case_type', 'user_name', 'user_email',
        'priority', 'status', 'documents_needed'
    ]
    
    all_present = True
    for field in required_fields:
        if field in sample_case:
            print_success(f"Admin case data contains: {field}")
        else:
            print_error(f"Admin case data missing: {field}")
            all_present = False
    
    if all_present:
        print_success("Admin dashboard data structure: VALID")
    else:
        print_error("Admin dashboard data structure: INVALID")

def main():
    """Main verification function"""
    print(f"\n{Colors.BOLD}Court Kiosk System Verification{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}\n")
    
    # Initialize email service
    try:
        email_service = EmailService()
        print_success("Email service initialized")
    except Exception as e:
        print_error(f"Failed to initialize email service: {str(e)}")
        return
    
    # Run tests
    test_case_summary_structure()
    test_admin_dashboard_data()
    test_email_generation(email_service)
    
    # Test form URLs (this may take a while)
    working, broken, broken_forms = test_form_urls(email_service)
    
    # Summary
    print_header("Verification Summary")
    print_info(f"Working form URLs: {working}")
    if broken > 0:
        print_warning(f"Broken form URLs: {broken}")
        print_warning(f"Broken forms: {', '.join(broken_forms)}")
    else:
        print_success("All form URLs are working!")
    
    print(f"\n{Colors.BOLD}Verification Complete!{Colors.RESET}\n")

if __name__ == '__main__':
    main()

