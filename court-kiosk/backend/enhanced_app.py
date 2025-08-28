from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
from utils.case_summary_service import CaseSummaryService

app = Flask(__name__)
CORS(app)

# Initialize the case summary service
summary_service = CaseSummaryService()

# Serve court documents from the court_documents folder
@app.route('/court_documents/<filename>')
def serve_court_document(filename):
    """Serve court documents from the court_documents folder"""
    court_docs_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'court_documents')
    return send_from_directory(court_docs_path, filename)

@app.route('/api/case-summary', methods=['POST'])
def create_case_summary():
    """Create a comprehensive case summary with form information"""
    try:
        data = request.get_json()
        flow_data = data.get('flow_data', {})
        user_answers = data.get('user_answers', {})
        
        result = summary_service.create_case_summary(flow_data, user_answers)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to create case summary: {str(e)}'
        }), 500

@app.route('/api/where-am-i-summary', methods=['POST'])
def generate_where_am_i_summary():
    """Generate 'Where Am I?' summary with procedural questions and form information"""
    try:
        data = request.get_json()
        flow_type = data.get('flow_type', 'DVRO')
        answers = data.get('answers', {})
        
        result = summary_service.generate_where_am_i_summary(flow_type, answers)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to generate summary: {str(e)}'
        }), 500

@app.route('/api/procedural-questions/<flow_type>', methods=['GET'])
def get_procedural_questions(flow_type):
    """Get procedural questions for the 'Where Am I?' feature"""
    try:
        # Define procedural questions based on flow type
        if flow_type.upper() == 'DVRO':
            questions = [
                {
                    "id": "current_stage",
                    "question": "What stage are you currently in?",
                    "options": [
                        "Just starting - need to fill out forms",
                        "Forms completed - ready to file",
                        "Forms filed - waiting for court response",
                        "Court papers received - need to serve other person",
                        "Service completed - waiting for court hearing",
                        "Court hearing scheduled - preparing for court"
                    ]
                },
                {
                    "id": "forms_completed",
                    "question": "Which forms have you already completed?",
                    "options": [
                        "DV-100 (Request for Domestic Violence Restraining Order)",
                        "CLETS-001 (Confidential CLETS Information)",
                        "DV-109 (Notice of Court Hearing)",
                        "DV-110 (Temporary Restraining Order Request)",
                        "DV-105 (Child Custody and Visitation Orders)",
                        "FL-150 (Income and Expense Declaration)",
                        "None yet"
                    ],
                    "multiple": True
                },
                {
                    "id": "children_involved",
                    "question": "Do you have children with the other person?",
                    "options": ["Yes", "No"]
                },
                {
                    "id": "financial_support",
                    "question": "Do you need child support or spousal support?",
                    "options": ["Yes", "No"]
                },
                {
                    "id": "firearms_involved",
                    "question": "Does the other person have firearms?",
                    "options": ["Yes", "No", "I don't know"]
                },
                {
                    "id": "service_method",
                    "question": "How do you plan to serve the other person?",
                    "options": [
                        "Sheriff's office",
                        "Private server (friend/family member)",
                        "Haven't decided yet"
                    ]
                }
            ]
        else:
            questions = []
        
        return jsonify({
            'success': True,
            'questions': questions
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get procedural questions: {str(e)}'
        }), 500

@app.route('/api/forms', methods=['GET'])
def get_forms():
    """Get all available court forms"""
    try:
        forms = summary_service.court_forms
        return jsonify({
            'success': True,
            'forms': forms
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get forms: {str(e)}'
        }), 500

@app.route('/api/forms/<form_code>', methods=['GET'])
def get_form_info(form_code):
    """Get information about a specific form"""
    try:
        form_info = summary_service.court_forms.get(form_code)
        if form_info:
            return jsonify({
                'success': True,
                'form': form_info
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Form {form_code} not found'
            }), 404
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get form info: {str(e)}'
        }), 500

@app.route('/api/forms/category/<category>', methods=['GET'])
def get_forms_by_category(category):
    """Get forms by category"""
    try:
        category_forms = {}
        for form_code, form_info in summary_service.court_forms.items():
            if form_info.get('category') == category:
                category_forms[form_code] = form_info
        
        return jsonify({
            'success': True,
            'forms': category_forms
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get forms by category: {str(e)}'
        }), 500

@app.route('/api/forms/required', methods=['GET'])
def get_required_forms():
    """Get all required forms"""
    try:
        required_forms = {}
        for form_code, form_info in summary_service.court_forms.items():
            if form_info.get('required', False):
                required_forms[form_code] = form_info
        
        return jsonify({
            'success': True,
            'forms': required_forms
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get required forms: {str(e)}'
        }), 500

@app.route('/api/queue', methods=['GET'])
def get_queue_status():
    """Get queue status (mock endpoint)"""
    return jsonify({
        'success': True,
        'queue_status': {
            'current_wait_time': '15 minutes',
            'people_ahead': 3,
            'estimated_completion': '2:30 PM'
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Court Kiosk Enhanced API',
        'version': '1.0.0'
    })

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5001)
