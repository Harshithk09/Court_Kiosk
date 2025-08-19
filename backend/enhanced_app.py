from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import json
import os
from dotenv import load_dotenv
from openai import OpenAI
from models import db, QueueEntry, FlowProgress, FacilitatorCase, Facilitator, CaseType
from queue_manager import QueueManager
from utils.llm_service import LLMService

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///court_kiosk.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Initialize OpenAI client
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    print("Warning: OPENAI_API_KEY environment variable is not set. Some features may not work.")
    client = None
else:
    client = OpenAI(api_key=api_key)

# Initialize queue manager
queue_manager = QueueManager(client)

# Initialize LLM service
llm_service = LLMService(api_key)

# Email configuration
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USER = os.getenv('EMAIL_USER')
EMAIL_PASS = os.getenv('EMAIL_PASS')
FACILITATOR_EMAIL = os.getenv('FACILITATOR_EMAIL')

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
    if not all([EMAIL_USER, EMAIL_PASS, to_email]):
        print(f"Email configuration incomplete. Would send: {subject}")
        return False
    
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)
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
        data = request.get_json()
        case_type = data.get('case_type', 'DVRO')
        user_name = data.get('user_name')
        user_email = data.get('user_email')
        phone_number = data.get('phone_number')
        language = data.get('language', 'en')
        
        # Add to queue
        queue_entry = queue_manager.add_to_queue(
            case_type=case_type,
            user_name=user_name,
            user_email=user_email,
            phone_number=phone_number,
            language=language
        )
        
        # Notify facilitators
        if FACILITATOR_EMAIL:
            subject = f"New {case_type} case in queue: {queue_entry.queue_number}"
            body = f"""
            New case added to queue:
            Queue Number: {queue_entry.queue_number}
            Case Type: {case_type}
            Priority: {queue_entry.priority_level}
            Language: {language}
            Estimated Wait: {queue_entry.estimated_wait_time} minutes
            """
            send_email_notification(subject, body, FACILITATOR_EMAIL)
        
        return jsonify({
            'success': True,
            'queue_number': queue_entry.queue_number,
            'estimated_wait_time': queue_entry.estimated_wait_time,
            'priority_level': queue_entry.priority_level
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/queue/status', methods=['GET'])
def get_queue_status():
    """Get current queue status"""
    try:
        status = queue_manager.get_queue_status()
        return jsonify(status)
    except Exception as e:
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
@app.before_first_request
def create_tables():
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

@app.route('/api/queue/status', methods=['GET'])
def get_queue_status():
    """Get current queue status."""
    try:
        status = queue_manager.get_queue_status()
        return jsonify(status)
        
    except Exception as e:
        print(f"Error in get_queue_status endpoint: {str(e)}")
        return jsonify({'error': 'An error occurred while getting queue status'}), 500

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

@app.route('/api/queue/complete', methods=['POST'])
def complete_case_api():
    """Mark a case as completed."""
    try:
        data = request.get_json()
        queue_number = data.get('queue_number')
        
        if not queue_number:
            return jsonify({'error': 'No queue number provided'}), 400
        
        queue_entry = queue_manager.complete_case(queue_number)
        
        if queue_entry:
            return jsonify({
                'success': True,
                'message': 'Case completed successfully'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Case not found'
            })
        
    except Exception as e:
        print(f"Error in complete_case_api endpoint: {str(e)}")
        return jsonify({'error': 'An error occurred while completing case'}), 500

@app.route('/api/queue/summary/<queue_number>', methods=['GET'])
def get_case_summary(queue_number):
    """Get case summary for a specific queue number."""
    try:
        summary = queue_manager.generate_summary(queue_number)
        
        return jsonify({
            'summary': summary,
            'queue_number': queue_number
        })
        
    except Exception as e:
        print(f"Error in get_case_summary endpoint: {str(e)}")
        return jsonify({'error': 'An error occurred while getting case summary'}), 500
        
        # Initialize default case types if they don't exist
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
    app.run(debug=True, host='0.0.0.0', port=5000)
