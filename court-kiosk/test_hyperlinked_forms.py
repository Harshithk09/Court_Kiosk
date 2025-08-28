#!/usr/bin/env python3
"""
Test script for hyperlinked forms functionality
This script demonstrates how the system integrates with actual court documents
"""

import requests
import json
import os

# Configuration
BASE_URL = "http://localhost:5001"
COURT_DOCS_PATH = "court_documents"

def test_form_serving():
    """Test that court documents can be served"""
    print("🔍 Testing court document serving...")
    
    # Test a few key forms
    test_forms = [
        "DV-100.pdf",
        "dv120.pdf", 
        "dv200.pdf",
        "clets001.pdf"
    ]
    
    for form_file in test_forms:
        try:
            response = requests.get(f"{BASE_URL}/court_documents/{form_file}")
            if response.status_code == 200:
                print(f"✅ {form_file} - Available")
            else:
                print(f"❌ {form_file} - Not found (Status: {response.status_code})")
        except requests.exceptions.RequestException as e:
            print(f"❌ {form_file} - Connection error: {e}")

def test_forms_api():
    """Test the forms API endpoints"""
    print("\n🔍 Testing forms API...")
    
    # Test getting all forms
    try:
        response = requests.get(f"{BASE_URL}/api/forms")
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                forms = data.get('forms', {})
                print(f"✅ All forms endpoint - {len(forms)} forms available")
                
                # Show some key forms
                key_forms = ['DV-100', 'DV-109', 'DV-110', 'CLETS-001']
                for form_code in key_forms:
                    if form_code in forms:
                        form_info = forms[form_code]
                        print(f"   📄 {form_code}: {form_info['name']}")
                        print(f"      File: {form_info['filename']}")
                        print(f"      Category: {form_info['category']}")
                        print(f"      Required: {form_info['required']}")
            else:
                print(f"❌ All forms endpoint - Error: {data.get('error')}")
        else:
            print(f"❌ All forms endpoint - Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ All forms endpoint - Connection error: {e}")

def test_form_categories():
    """Test form category filtering"""
    print("\n🔍 Testing form categories...")
    
    categories = ['main', 'custody', 'service', 'financial', 'modification']
    
    for category in categories:
        try:
            response = requests.get(f"{BASE_URL}/api/forms/category/{category}")
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    forms = data.get('forms', {})
                    print(f"✅ {category} category - {len(forms)} forms")
                else:
                    print(f"❌ {category} category - Error: {data.get('error')}")
            else:
                print(f"❌ {category} category - Status: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {category} category - Connection error: {e}")

def test_required_forms():
    """Test required forms endpoint"""
    print("\n🔍 Testing required forms...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/forms/required")
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                forms = data.get('forms', {})
                print(f"✅ Required forms - {len(forms)} forms")
                for form_code, form_info in forms.items():
                    print(f"   📋 {form_code}: {form_info['name']}")
            else:
                print(f"❌ Required forms - Error: {data.get('error')}")
        else:
            print(f"❌ Required forms - Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Required forms - Connection error: {e}")

def test_where_am_i_summary():
    """Test the 'Where Am I?' summary generation"""
    print("\n🔍 Testing 'Where Am I?' summary...")
    
    # Sample answers for testing
    test_answers = {
        "current_stage": "Forms completed - ready to file",
        "forms_completed": [
            "DV-100 (Request for Domestic Violence Restraining Order)",
            "CLETS-001 (Confidential CLETS Information)"
        ],
        "children_involved": "Yes",
        "financial_support": "Yes",
        "firearms_involved": "No",
        "service_method": "Sheriff's office"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/where-am-i-summary",
            json={
                "flow_type": "DVRO",
                "answers": test_answers
            },
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                summary = data.get('summary', {})
                print("✅ 'Where Am I?' summary generated successfully")
                print(f"   Current stage: {summary.get('current_stage')}")
                print(f"   Timeline: {summary.get('estimated_timeline')}")
                
                # Show forms involved
                forms_involved = summary.get('forms_involved', {})
                completed = forms_involved.get('completed', [])
                pending = forms_involved.get('pending', [])
                print(f"   Completed forms: {len(completed)}")
                print(f"   Pending forms: {len(pending)}")
                
                # Show next steps
                next_steps = summary.get('what_to_do_next', [])
                print(f"   Next steps: {len(next_steps)}")
                
            else:
                print(f"❌ 'Where Am I?' summary - Error: {data.get('error')}")
        else:
            print(f"❌ 'Where Am I?' summary - Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ 'Where Am I?' summary - Connection error: {e}")

def test_procedural_questions():
    """Test procedural questions endpoint"""
    print("\n🔍 Testing procedural questions...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/procedural-questions/DVRO")
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                questions = data.get('questions', [])
                print(f"✅ Procedural questions - {len(questions)} questions available")
                
                for i, question in enumerate(questions[:3], 1):  # Show first 3 questions
                    print(f"   {i}. {question['question']}")
                    print(f"      Options: {len(question['options'])} choices")
            else:
                print(f"❌ Procedural questions - Error: {data.get('error')}")
        else:
            print(f"❌ Procedural questions - Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Procedural questions - Connection error: {e}")

def test_case_summary():
    """Test case summary generation"""
    print("\n🔍 Testing case summary generation...")
    
    # Sample flow data and user answers
    flow_data = {
        "metadata": {
            "title": "DVRO"
        },
        "nodes": {
            "DV100a": {"type": "process", "text": "Complete DV-100"},
            "CLETSa": {"type": "process", "text": "Complete CLETS-001"},
            "DV109a": {"type": "process", "text": "Complete DV-109"},
            "DV110a": {"type": "process", "text": "Complete DV-110"}
        }
    }
    
    user_answers = {
        "DV100a": "completed",
        "CLETSa": "completed",
        "abuse_type": "physical",
        "children_involved": "yes",
        "income_level": "low"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/case-summary",
            json={
                "flow_data": flow_data,
                "user_answers": user_answers
            },
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                summary = data.get('summary', {})
                print("✅ Case summary generated successfully")
                print(f"   Flow type: {summary.get('flow_type')}")
                print(f"   Urgency: {summary.get('urgency_assessment')}")
                print(f"   Safety: {summary.get('safety_assessment')}")
                print(f"   Complexity: {summary.get('complexity_assessment')}")
                
                # Show forms involved
                forms_involved = summary.get('forms_involved', {})
                completed = forms_involved.get('completed', [])
                pending = forms_involved.get('pending', [])
                print(f"   Completed forms: {len(completed)}")
                print(f"   Pending forms: {len(pending)}")
                
            else:
                print(f"❌ Case summary - Error: {data.get('error')}")
        else:
            print(f"❌ Case summary - Status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Case summary - Connection error: {e}")

def check_court_documents():
    """Check if court documents are available"""
    print("\n🔍 Checking court documents availability...")
    
    if os.path.exists(COURT_DOCS_PATH):
        files = os.listdir(COURT_DOCS_PATH)
        pdf_files = [f for f in files if f.endswith('.pdf')]
        print(f"✅ Court documents folder found - {len(pdf_files)} PDF files")
        
        # Show some key files
        key_files = ['DV-100.pdf', 'dv120.pdf', 'dv200.pdf', 'clets001.pdf']
        for key_file in key_files:
            if key_file in files:
                print(f"   📄 {key_file} - Available")
            else:
                print(f"   ❌ {key_file} - Missing")
    else:
        print(f"❌ Court documents folder not found at {COURT_DOCS_PATH}")

def main():
    """Run all tests"""
    print("🚀 Testing Hyperlinked Forms System")
    print("=" * 50)
    
    # Check if backend is running
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code == 200:
            print("✅ Backend server is running")
        else:
            print("❌ Backend server is not responding properly")
            return
    except requests.exceptions.RequestException:
        print("❌ Backend server is not running. Please start the server first.")
        print("   Run: cd backend && python enhanced_app.py")
        return
    
    # Run tests
    check_court_documents()
    test_form_serving()
    test_forms_api()
    test_form_categories()
    test_required_forms()
    test_procedural_questions()
    test_where_am_i_summary()
    test_case_summary()
    
    print("\n" + "=" * 50)
    print("✅ Testing completed!")
    print("\n📋 Next steps:")
    print("1. Start the frontend: cd frontend && npm start")
    print("2. Open http://localhost:3000 in your browser")
    print("3. Navigate to the 'Where Am I?' section")
    print("4. Test the hyperlinked forms functionality")

if __name__ == "__main__":
    main()
