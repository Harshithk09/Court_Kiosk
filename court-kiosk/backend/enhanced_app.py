from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import os
import json
import openai
from models import db, QueueEntry, FlowProgress, FacilitatorCase, Facilitator, CaseType, CaseSummary, QueueTicket
from queue_manager import QueueManager
from utils.llm_service import LLMService
from utils.case_summary_service import CaseSummaryService
from utils.email_service import EmailService
from config import Config

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = Config.SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = Config.SQLALCHEMY_TRACK_MODIFICATIONS
db.init_app(app)

# Validate required API keys
Config.validate_required_keys()

# Initialize OpenAI client (for older version 0.28.1)
if not Config.OPENAI_API_KEY:
    print("Warning: OPENAI_API_KEY environment variable is not set. Some features may not work.")
    client = None
else:
    try:
        openai.api_key = Config.OPENAI_API_KEY
        client = openai
    except Exception as e:
        print(f"Warning: Could not initialize OpenAI client: {e}")
        client = None

# Initialize queue manager
queue_manager = QueueManager(client)

# Initialize LLM service
llm_service = LLMService(Config.OPENAI_API_KEY)

# Initialize case summary service
case_summary_service = CaseSummaryService()

# Initialize email service
email_service = EmailService()

# System prompts for different languages
SYSTEM_PROMPTS = {
    'en': """You are a helpful legal information assistant for a court kiosk. 
    You help users navigate through court procedures and forms. 
    Based on the flowchart data provided, guide users through the appropriate steps.
    Always remind users that this is general information and they should consult with court staff or an attorney for specific legal advice.
    Keep responses clear, concise but informative.""",
    'es': """Eres un asistente útil de información legal para un quiosco de la corte.
    Ayudas a los usuarios a navegar por los procedimientos y formularios de la corte.
    Basándote en los datos del diagrama de flujo proporcionados, guía a los usuarios a través de los pasos apropiados.
    Siempre recuerda a los usuarios que esta es información general y deben consultar con el personal de la corte o un abogado para consejos legales específicos.
    Mantén las respuestas claras, concisas pero informativas."""
}

def send_email_notification(subject, body, to_email):
    """Send email notification to facilitators"""
    if not all([Config.EMAIL_USER, Config.EMAIL_PASS, to_email]):
        print(f"Email configuration incomplete. Would send: {subject}")
        return False
    
    try:
        msg = MIMEMultipart()
        msg['From'] = Config.EMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(Config.EMAIL_HOST, Config.EMAIL_PORT)
        server.starttls()
        server.login(Config.EMAIL_USER, Config.EMAIL_PASS)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

@app.route('/api/queue/join', methods=['POST'])
def join_queue():
    """Add a new case to the queue"""
    try:
        print("Join queue request received")
        data = request.get_json()
        print(f"Join queue data: {data}")
        
        case_type = data.get('case_type', 'DVRO')
        user_name = data.get('user_name')
        user_email = data.get('user_email')
        phone_number = data.get('phone_number')
        language = data.get('language', 'en')
        answers = data.get('answers')
        history = data.get('history')
        summary = data.get('summary')
        
        # Add to queue
        queue_entry = queue_manager.add_to_queue(
            case_type=case_type,
            user_name=user_name,
            user_email=user_email,
            phone_number=phone_number,
            language=language,
            answers=answers,
            history=history,
            summary=summary
        )
        
        print(f"Queue entry created: {queue_entry.queue_number}")
        
        # Send queue notification email to user if email provided
        if user_email:
            queue_data = {
                'queue_number': queue_entry.queue_number,
                'case_type': case_type,
                'estimated_wait_time': queue_entry.estimated_wait_time,
                'priority_level': queue_entry.priority_level
            }
            email_result = email_service.send_queue_notification_email(user_email, queue_data)
            print(f"Queue notification email result: {email_result}")
        
        # Send facilitator notification if configured
        if Config.FACILITATOR_EMAIL:
            case_data = {
                'queue_number': queue_entry.queue_number,
                'case_type': case_type,
                'priority_level': queue_entry.priority_level,
                'language': language,
                'user_name': user_name
            }
            facilitator_result = email_service.send_facilitator_notification(Config.FACILITATOR_EMAIL, case_data)
            print(f"Facilitator notification email result: {facilitator_result}")
        
        return jsonify({
            'success': True,
            'queue_number': queue_entry.queue_number,
            'estimated_wait_time': queue_entry.estimated_wait_time,
            'priority_level': queue_entry.priority_level
        })
    
    except Exception as e:
        print(f"Error in join_queue: {e}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/queue/status', methods=['GET'])
def get_queue_status():
    """Get current queue status"""
    try:
        print("Queue status requested")
        status = queue_manager.get_queue_status()
        print(f"Queue status: {status}")
        return jsonify(status)
    except Exception as e:
        print(f"Error getting queue status: {e}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/queue/<queue_number>/progress', methods=['POST'])
def update_progress(queue_number):
    """Update user progress through flowchart"""
    try:
        data = request.get_json()
        node_id = data.get('node_id')
        node_text = data.get('node_text')
        user_response = data.get('user_response')
        
        queue_entry = queue_manager.update_progress(
            queue_number=queue_number,
            node_id=node_id,
            node_text=node_text,
            user_response=user_response
        )
        
        return jsonify({
            'success': True,
            'current_node': queue_entry.current_node,
            'status': queue_entry.status
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/queue/<queue_number>/summary', methods=['GET'])
def get_case_summary(queue_number):
    """Generate and get case summary for facilitators"""
    try:
        summary = queue_manager.generate_summary(queue_number)
        return jsonify({
            'success': True,
            'summary': summary,
            'queue_number': queue_number
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/queue/<queue_number>/assign', methods=['POST'])
def assign_case(queue_number):
    """Assign case to a facilitator"""
    try:
        data = request.get_json()
        facilitator_id = data.get('facilitator_id')
        
        facilitator_case = queue_manager.assign_to_facilitator(
            queue_number=queue_number,
            facilitator_id=facilitator_id
        )
        
        return jsonify({
            'success': True,
            'facilitator_case_id': facilitator_case.id,
            'status': facilitator_case.status
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/facilitator/cases', methods=['GET'])
def get_facilitator_cases():
    """Get cases assigned to a specific facilitator"""
    try:
        facilitator_id = request.args.get('facilitator_id', type=int)
        
        if facilitator_id:
            cases = FacilitatorCase.query.filter_by(facilitator_id=facilitator_id).all()
        else:
            cases = FacilitatorCase.query.filter_by(status='pending').all()
        
        case_data = []
        for case in cases:
            queue_entry = QueueEntry.query.get(case.queue_entry_id)
            if queue_entry:
                case_info = case.to_dict()
                case_info['queue_entry'] = queue_entry.to_dict()
                case_data.append(case_info)
        
        return jsonify(case_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/facilitator/next-case', methods=['GET'])
def get_next_case():
    """Get the next case in queue for a facilitator"""
    try:
        facilitator_id = request.args.get('facilitator_id', type=int)
        next_case = queue_manager.get_next_case(facilitator_id)
        
        if next_case:
            return jsonify({
                'success': True,
                'case': next_case.to_dict()
            })
        else:
            return jsonify({
                'success': True,
                'case': None,
                'message': 'No cases waiting in queue'
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/queue/<queue_number>/complete', methods=['POST'])
def complete_case(queue_number):
    """Mark a case as completed"""
    try:
        queue_entry = queue_manager.complete_case(queue_number)
        return jsonify({
            'success': True,
            'status': 'completed'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/llm/chat', methods=['POST'])
def chat_with_llm():
    """Chat with LLM based on flowchart context"""
    try:
        data = request.get_json()
        user_message = data.get('message')
        queue_number = data.get('queue_number')
        language = data.get('language', 'en')
        flowchart_data = data.get('flowchart_data')
        current_node = data.get('current_node')
        
        if not client:
            return jsonify({'error': 'LLM service not available'}), 503
        
        # Get user's progress if queue number provided
        progress_context = ""
        if queue_number:
            progress_entries = FlowProgress.query.join(QueueEntry).filter(
                QueueEntry.queue_number == queue_number
            ).order_by(FlowProgress.timestamp).all()
            
            if progress_entries:
                progress_context = "\n".join([
                    f"Previous step: {entry.node_text}" + (f" (Response: {entry.user_response})" if entry.user_response else "")
                    for entry in progress_entries[-5:]  # Last 5 steps
                ])
        
        # Build system prompt
        system_prompt = SYSTEM_PROMPTS.get(language, SYSTEM_PROMPTS['en'])
        
        # Add flowchart context
        if flowchart_data and current_node:
            system_prompt += f"\n\nCurrent flowchart node: {current_node}"
            if progress_context:
                system_prompt += f"\nUser's recent progress:\n{progress_context}"
        
        # Create chat completion
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=500
        )
        
        llm_response = response.choices[0].message.content
        
        # Update progress if queue number provided
        if queue_number:
            queue_manager.update_progress(
                queue_number=queue_number,
                node_id=current_node or 'chat',
                node_text=f"User asked: {user_message}",
                user_response=llm_response
            )
        
        return jsonify({
            'success': True,
            'response': llm_response
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/case-types', methods=['GET'])
def get_case_types():
    """Get available case types"""
    try:
        case_types = CaseType.query.filter_by(is_active=True).all()
        return jsonify([case_type.to_dict() for case_type in case_types])
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/facilitators', methods=['GET'])
def get_facilitators():
    """Get available facilitators"""
    try:
        facilitators = Facilitator.query.filter_by(is_active=True).all()
        return jsonify([facilitator.to_dict() for facilitator in facilitators])
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Initialize database tables
def create_tables():
    with app.app_context():
        db.create_all()

# Create tables when the app starts
with app.app_context():
    db.create_all()

@app.route('/api/llm/analyze', methods=['POST'])
def analyze_progress():
    """Analyze user progress through the flowchart using LLM."""
    try:
        data = request.get_json()
        queue_number = data.get('queue_number')
        current_node = data.get('current_node')
        progress = data.get('progress', [])
        language = data.get('language', 'en')
        
        # Load flow data
        flow_data_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'data', 'dv_flow_combined.json')
        with open(flow_data_path, 'r') as f:
            flow_data = json.load(f)
        
        # Analyze progress using LLM service
        analysis = llm_service.analyze_progress(flow_data, progress, 'dvro', language)
        
        return jsonify(analysis)
        
    except Exception as e:
        print(f"Error in analyze_progress endpoint: {str(e)}")
        return jsonify({'error': 'An error occurred while analyzing progress'}), 500

@app.route('/api/llm/question', methods=['POST'])
def answer_question():
    """Answer user questions based on their current position in the flowchart."""
    try:
        data = request.get_json()
        question = data.get('question')
        queue_number = data.get('queue_number')
        current_node = data.get('current_node')
        progress = data.get('progress', [])
        language = data.get('language', 'en')
        
        if not question:
            return jsonify({'error': 'No question provided'}), 400
        
        # Load flow data
        flow_data_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'data', 'dv_flow_combined.json')
        with open(flow_data_path, 'r') as f:
            flow_data = json.load(f)
        
        # Create current context
        current_context = {
            'current_node': current_node,
            'user_progress': progress
        }
        
        # Get answer using LLM service
        answer = llm_service.answer_user_question(question, current_context, flow_data, language)
        
        return jsonify({'answer': answer})
        
    except Exception as e:
        print(f"Error in answer_question endpoint: {str(e)}")
        return jsonify({'error': 'An error occurred while answering the question'}), 500

@app.route('/api/queue/add', methods=['POST'])
def add_to_queue():
    """Add a new case to the queue."""
    try:
        data = request.get_json()
        case_type = data.get('caseType', 'dvro')
        user_name = data.get('name', '')
        user_email = data.get('email', '')
        phone_number = data.get('phone', '')
        language = data.get('language', 'en')
        
        # Add to queue
        queue_entry = queue_manager.add_to_queue(
            case_type=case_type,
            user_name=user_name,
            user_email=user_email,
            phone_number=phone_number,
            language=language
        )
        
        return jsonify({
            'success': True,
            'queue_number': queue_entry.queue_number,
            'estimated_wait_time': queue_entry.estimated_wait_time
        })
        
    except Exception as e:
        print(f"Error in add_to_queue endpoint: {str(e)}")
        return jsonify({'error': 'An error occurred while adding to queue'}), 500

# Duplicate route removed - this functionality is already handled above

@app.route('/api/queue/next', methods=['POST'])
def call_next_case():
    """Call the next case in the queue."""
    try:
        data = request.get_json()
        facilitator_id = data.get('facilitator_id')
        
        next_case = queue_manager.get_next_case(facilitator_id)
        
        if next_case:
            return jsonify({
                'success': True,
                'queue_entry': next_case.to_dict()
            })
        else:
            return jsonify({
                'success': False,
                'message': 'No cases in queue'
            })
        
    except Exception as e:
        print(f"Error in call_next_case endpoint: {str(e)}")
        return jsonify({'error': 'An error occurred while calling next case'}), 500

# This route is already handled by the route above at line 234

# Initialize default case types if they don't exist
if __name__ == '__main__':
    with app.app_context():
        if not CaseType.query.first():
            default_cases = [
                CaseType(
                    name="Domestic Violence Restraining Order",
                    code="DVRO",
                    priority_level="A",
                    description="Domestic violence cases - highest priority",
                    estimated_duration=30,
                    required_forms='["DV-100", "DV-109", "DV-110", "CLETS-001"]',
                    flowchart_file="dv_flow_combined_backup.json"
                ),
                CaseType(
                    name="Civil Harassment Restraining Order",
                    code="CHRO",
                    priority_level="B",
                    description="Civil harassment cases",
                    estimated_duration=25,
                    required_forms='["CH-100", "CH-109", "CH-110"]',
                    flowchart_file="ch_flow.json"
                ),
                CaseType(
                    name="Elder Abuse Restraining Order",
                    code="EARO",
                    priority_level="B",
                    description="Elder abuse cases",
                    estimated_duration=25,
                    required_forms='["EA-100", "EA-109", "EA-110"]',
                    flowchart_file="ea_flow.json"
                ),
                CaseType(
                    name="Workplace Violence Restraining Order",
                    code="WVRO",
                    priority_level="C",
                    description="Workplace violence cases",
                    estimated_duration=20,
                    required_forms='["WV-100", "WV-109", "WV-110"]',
                    flowchart_file="wv_flow.json"
                ),
                CaseType(
                    name="General Legal Questions",
                    code="GEN",
                    priority_level="D",
                    description="General legal questions and form assistance",
                    estimated_duration=15,
                    required_forms='[]',
                    flowchart_file="general_flow.json"
                )
            ]
            
            for case_type in default_cases:
                db.session.add(case_type)
            
            db.session.commit()

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=1904)

@app.route('/api/case-summary/save', methods=['POST'])
def save_case_summary():
    """Save case summary and optionally create queue ticket"""
    try:
        data = request.get_json()
        
        flow_type = data.get('flow_type', 'DVRO')
        answers = data.get('answers', {})
        flow_data = data.get('flow_data', {})
        user_email = data.get('user_email')
        user_name = data.get('user_name')
        language = data.get('language', 'en')
        join_queue = data.get('join_queue', False)
        
        if not answers:
            return jsonify({'error': 'Answers are required'}), 400
        
        # Save summary and optionally create queue ticket
        result = case_summary_service.save_summary_and_maybe_queue(
            flow_type=flow_type,
            answers=answers,
            flow_data=flow_data,
            user_email=user_email,
            user_name=user_name,
            language=language,
            join_queue=join_queue
        )
        
        return jsonify({
            'success': True,
            'summary_id': result['summary_id'],
            'case_number': result['case_number'],
            'queue_number': result['queue_number']
        })
        
    except Exception as e:
        print(f"Error saving case summary: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/case-summary/<int:summary_id>', methods=['GET'])
def get_case_summary_by_id(summary_id):
    """Get case summary by ID"""
    try:
        summary = case_summary_service.get_case_summary_by_id(summary_id)
        if not summary:
            return jsonify({'error': 'Case summary not found'}), 404
        
        return jsonify({
            'success': True,
            'summary': summary
        })
        
    except Exception as e:
        print(f"Error getting case summary: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/case-summary/<int:summary_id>/send-email', methods=['POST'])
def send_case_summary_email(summary_id):
    """Send case summary email"""
    try:
        summary = CaseSummary.query.get(summary_id)
        if not summary:
            return jsonify({'error': 'Case summary not found'}), 404
        
        # Send email
        result = case_summary_service.send_summary_email(summary)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Email sent successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 400
        
    except Exception as e:
        print(f"Error sending case summary email: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/queue/enhanced/status', methods=['GET'])
def get_enhanced_queue_status():
    """Get enhanced queue status with case summaries"""
    try:
        status = request.args.get('status', 'waiting')
        
        # Get queue tickets with summaries
        tickets = case_summary_service.get_queue_with_summaries(status)
        
        # Group by status
        queue_data = {
            'waiting': [],
            'in_progress': [],
            'completed': []
        }
        
        for ticket in tickets:
            if ticket['status'] in queue_data:
                queue_data[ticket['status']].append(ticket)
        
        return jsonify({
            'success': True,
            'queue_data': queue_data,
            'total_waiting': len(queue_data['waiting']),
            'total_in_progress': len(queue_data['in_progress']),
            'total_completed': len(queue_data['completed'])
        })
        
    except Exception as e:
        print(f"Error getting enhanced queue status: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/queue/enhanced/ticket/<int:ticket_id>/status', methods=['PUT'])
def update_queue_ticket_status(ticket_id):
    """Update queue ticket status"""
    try:
        data = request.get_json()
        status = data.get('status')
        facilitator_id = data.get('facilitator_id')
        
        if not status:
            return jsonify({'error': 'Status is required'}), 400
        
        success = case_summary_service.update_queue_ticket_status(
            ticket_id, status, facilitator_id
        )
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Queue ticket status updated'
            })
        else:
            return jsonify({'error': 'Queue ticket not found'}), 404
        
    except Exception as e:
        print(f"Error updating queue ticket status: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/forms/hyperlink/<form_code>', methods=['GET'])
def get_form_hyperlink(form_code):
    """Get hyperlink for a specific form"""
    try:
        url = case_summary_service.email_service.get_form_url(form_code)
        return jsonify({
            'success': True,
            'form_code': form_code,
            'url': url
        })
        
    except Exception as e:
        print(f"Error getting form hyperlink: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/email/send-summary', methods=['POST'])
def send_summary_email():
    """Send detailed summary email with hyperlinked forms"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['to', 'flow_type', 'required_forms', 'next_steps']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Send email
        result = case_summary_service.email_service.send_summary_email(data)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Email sent successfully',
                'email_id': result.get('id')
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 400
        
    except Exception as e:
        print(f"Error sending summary email: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sms/send-queue-number', methods=['POST'])
def send_queue_number_sms():
    """Send queue number via SMS"""
    try:
        data = request.get_json()
        queue_number = data.get('queue_number')
        phone_number = data.get('phone_number')
        
        if not queue_number or not phone_number:
            return jsonify({'error': 'Queue number and phone number are required'}), 400
        
        # For now, we'll use a mock SMS service
        # In production, you would integrate with Twilio, AWS SNS, or similar
        message = f"Your queue number is {queue_number}. Please wait in the waiting area. You'll be called when it's your turn."
        
        # Log the SMS for debugging
        print(f"SMS would be sent to {phone_number}: {message}")
        
        # TODO: Integrate with actual SMS service
        # Example with Twilio:
        # from twilio.rest import Client
        # client = Client(account_sid, auth_token)
        # message = client.messages.create(
        #     body=message,
        #     from_=twilio_phone_number,
        #     to=phone_number
        # )
        
        return jsonify({
            'success': True,
            'message': 'SMS sent successfully',
            'queue_number': queue_number,
            'phone_number': phone_number
        })
        
    except Exception as e:
        print(f"Error sending SMS: {e}")
        return jsonify({'error': str(e)}), 500
