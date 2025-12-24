"""
Simplified Email API for Court Kiosk
Consolidates all email functionality into clean, focused endpoints
"""

from flask import Blueprint, request, jsonify
from utils.email_service import EmailService
from utils.enhanced_email_service import EnhancedEmailService
from utils.validation import validate_email, validate_phone_number, validate_name
import logging
import uuid

# Create blueprint for email routes
email_bp = Blueprint('email', __name__, url_prefix='/api/email')

# Initialize email services
email_service = EmailService()
enhanced_email_service = EnhancedEmailService()

@email_bp.route('/send-case-summary', methods=['POST'])
def send_case_summary():
    """
    Main email endpoint - sends comprehensive case summary with PDF attachments
    
    Expected payload:
    {
        "email": "user@example.com",
        "case_data": {
            "user_email": "user@example.com",
            "user_name": "John Doe",
            "case_type": "DVRO",
            "priority_level": "A",
            "language": "en",
            "queue_number": "123",
            "phone_number": "(555) 123-4567",
            "location": "San Mateo County Superior Court Kiosk",
            "session_id": "session_123",
            "forms_completed": ["DV-100", "DV-109"],
            "documents_needed": ["DV-100", "DV-109"],
            "next_steps": ["Step 1", "Step 2"],
            "summary_json": "{...}",
            "conversation_summary": {...}
        }
    }
    """
    try:
        # Validate input
        if not request.json:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        email = request.json.get('email')
        case_data = request.json.get('case_data', {})
        
        if not email:
            return jsonify({'error': 'Email address is required'}), 400
        
        # Validate email format
        email_result = validate_email(email)
        if not email_result['valid']:
            return jsonify({'error': f'Invalid email: {email_result["error"]}'}), 400
        email = email_result['email']  # Use normalized email
        
        if not case_data:
            return jsonify({'error': 'Case data is required'}), 400
        
        # Validate optional fields in case_data
        if 'user_name' in case_data and case_data['user_name']:
            name_result = validate_name(case_data['user_name'])
            if not name_result['valid']:
                return jsonify({'error': f'Invalid name: {name_result["error"]}'}), 400
            case_data['user_name'] = name_result['sanitized']
        
        if 'phone_number' in case_data and case_data['phone_number']:
            phone_result = validate_phone_number(case_data['phone_number'])
            if not phone_result['valid']:
                return jsonify({'error': f'Invalid phone number: {phone_result["error"]}'}), 400
            case_data['phone_number'] = phone_result['formatted']
        
        # Ensure email is in case_data (use validated email)
        case_data['user_email'] = email
        
        # Check if queue information should be included
        include_queue = request.json.get('include_queue', False)
        
        # Send email
        result = email_service.send_case_email(case_data, include_queue)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'message': 'Email sent successfully',
                'id': result.get('id')
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Failed to send email')
            }), 500
            
    except Exception as e:
        logging.error(f"Error in send_case_summary: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@email_bp.route('/send-queue-notification', methods=['POST'])
def send_queue_notification():
    """
    Send queue notification email
    
    Expected payload:
    {
        "email": "user@example.com",
        "queue_number": "123",
        "estimated_wait": 30,
        "case_type": "DVRO"
    }
    """
    try:
        if not request.json:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        email = request.json.get('email')
        queue_number = request.json.get('queue_number', 'N/A')
        estimated_wait = request.json.get('estimated_wait', 30)
        case_type = request.json.get('case_type', 'Unknown')
        
        if not email:
            return jsonify({'error': 'Email address is required'}), 400
        
        # Create case data for queue notification
        case_data = {
            'user_email': email,
            'queue_number': queue_number,
            'case_type': case_type,
            'priority_level': 'A',
            'language': 'en',
            'user_name': 'Court Kiosk User',
            'documents_needed': [],
            'next_steps': [
                f"Your estimated wait time is {estimated_wait} minutes",
                "Please wait in the designated waiting area",
                "Your number will be called when it's your turn",
                "You can use the kiosk while waiting"
            ]
        }
        
        # Send email
        result = email_service.send_case_email(case_data, include_queue=True)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'message': 'Queue notification sent successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Failed to send email')
            }), 500
            
    except Exception as e:
        logging.error(f"Error in send_queue_notification: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@email_bp.route('/send-facilitator-notification', methods=['POST'])
def send_facilitator_notification():
    """
    Send notification to court facilitator about new case
    
    Expected payload:
    {
        "facilitator_email": "facilitator@court.gov",
        "case_data": {
            "queue_number": "123",
            "case_type": "DVRO",
            "priority_level": "A",
            "user_name": "John Doe",
            "language": "en"
        }
    }
    """
    try:
        if not request.json:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        facilitator_email = request.json.get('facilitator_email')
        case_data = request.json.get('case_data', {})
        
        if not facilitator_email:
            return jsonify({'error': 'Facilitator email is required'}), 400
        
        if not case_data:
            return jsonify({'error': 'Case data is required'}), 400
        
        # Set facilitator email
        case_data['user_email'] = facilitator_email
        case_data['user_name'] = 'Court Facilitator'
        
        # Add facilitator-specific content
        case_data['documents_needed'] = []
        case_data['next_steps'] = [
            "New case requires facilitator assistance",
            "Please review case details in the facilitator dashboard",
            "Assist the client when ready"
        ]
        
        # Send email
        result = email_service.send_case_email(case_data)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'message': 'Facilitator notification sent successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Failed to send email')
            }), 500
            
    except Exception as e:
        logging.error(f"Error in send_facilitator_notification: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@email_bp.route('/health', methods=['GET'])
def email_health():
    """Health check for email service"""
    try:
        # Test email service configuration
        if not email_service.from_email:
            return jsonify({
                'status': 'unhealthy',
                'error': 'Email service not configured'
            }), 500
        
        return jsonify({
            'status': 'healthy',
            'service': 'email',
            'from_email': email_service.from_email,
            'support_email': email_service.support_email
        })
        
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@email_bp.route('/send-case-summary-enhanced', methods=['POST'])
def send_case_summary_enhanced():
    """
    Enhanced email endpoint following pseudocode structure
    Complete 8-step email chain with AI-powered summaries
    
    Expected payload:
    {
        "user_session_id": "session_123",
        "case_responses": {
            "user_name": "John Doe",
            "user_email": "john@example.com",
            "phone_number": "(555) 123-4567",
            "case_type": "DVRO",
            "DVCheck1": "Yes",
            "children": "yes",
            ...
        },
        "queue_number": "A001"  // Optional
    }
    """
    try:
        if not request.json:
            return jsonify({'success': False, 'error': 'No JSON data provided'}), 400
        
        # Extract data
        user_session_id = request.json.get('user_session_id') or str(uuid.uuid4())
        case_responses = request.json.get('case_responses', {})
        queue_number = request.json.get('queue_number')
        
        # Validate inputs
        if not case_responses:
            return jsonify({
                'success': False,
                'error': 'Missing case_responses'
            }), 400
        
        # Execute enhanced email chain
        result = enhanced_email_service.send_complete_case_summary_email(
            user_session_id=user_session_id,
            case_responses=case_responses,
            queue_number=queue_number
        )
        
        # Return response
        if result.get('success'):
            return jsonify(result), 200
        else:
            status_code = 400 if result.get('error') == 'validation_error' else 500
            return jsonify(result), status_code
            
    except Exception as e:
        logging.error(f"Error in send_case_summary_enhanced: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'server_error',
            'message': str(e)
        }), 500
