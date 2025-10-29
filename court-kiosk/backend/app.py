from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import json
import os
import openai
import random
import logging
from email.mime.base import MIMEBase
from email import encoders
from utils.llm_service import LLMService
from utils.email_service import EmailService
from utils.case_summary_service import CaseSummaryService
from utils.auth_service import AuthService
from email_api import email_bp
from config import Config
from models import db, QueueEntry, User, UserSession, AuditLog, CaseSummary
from validation_schemas import (
    validate_request_data, AskQuestionSchema, SubmitSessionSchema, 
    GenerateQueueSchema, DVRORAGSchema, CallNextSchema, CompleteCaseSchema,
    GuidedQuestionsSchema, ProcessAnswersSchema, SendEmailSchema, GenerateCaseSummarySchema
)

app = Flask(__name__)

COURT_DOCUMENTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'court_documents'))

# Configure logging
logging.basicConfig(level=getattr(logging, Config.LOG_LEVEL, 'INFO'))
logger = logging.getLogger(__name__)

# Configure CORS with environment-based origins - Allow all origins for global access
cors_origins = Config.CORS_ORIGINS if hasattr(Config, 'CORS_ORIGINS') else ['*']
CORS(app, origins=cors_origins, 
     allow_headers=['Content-Type', 'Authorization'], 
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     supports_credentials=True)

# Configure rate limiting
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["1000 per hour", "100 per minute"]
)
limiter.init_app(app)

# Add security headers
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return response

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = Config.SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = Config.SQLALCHEMY_TRACK_MODIFICATIONS
db.init_app(app)

# Validate required API keys
Config.validate_required_keys()

# OpenAI client with better error handling and compatibility (for older version 0.28.1)
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

# Initialize services
llm_service = LLMService(Config.OPENAI_API_KEY)
email_service = EmailService()
case_summary_service = CaseSummaryService()

# Register blueprints
app.register_blueprint(email_bp)


# Removed duplicate Config class - using the one from config.py instead

SYSTEM_PROMPTS = {
    'en': """You are a helpful legal information assistant for a court kiosk. \
    Provide accurate, helpful information about court procedures, forms, and legal processes.\
    Always remind users that this is general information and they should consult with court staff or an attorney for specific legal advice.\
    Keep responses clear, concise but informative.""",
    'es': """Eres un asistente útil de información legal para un quiosco de la corte.\
    Proporciona información precisa y útil sobre procedimientos de la corte, formularios y procesos legales.\
    Siempre recuerda a los usuarios que esta es información general y deben consultar con el personal de la corte o un abogado para consejos legales específicos.\
    Mantén las respuestas claras, concisas pero informativas.""",
    'zh': """您是法庭服务台的法律信息助手。\
    提供有关法庭程序、表格和法律程序的准确有用信息。\
    始终提醒用户这是一般信息，他们应该咨询法庭工作人员或律师以获得具体的法律建议。\
    保持回答清晰、简洁但信息丰富。""",
    'vi': """Bạn là trợ lý thông tin pháp lý hữu ích cho quầy thông tin tòa án.\
    Cung cấp thông tin chính xác, hữu ích về thủ tục tòa án, biểu mẫu và quy trình pháp lý.\
    Luôn nhắc nhở người dùng rằng đây là thông tin chung và họ nên tham khảo ý kiến nhân viên tòa án hoặc luật sư để được tư vấn pháp lý cụ thể.\
    Giữ câu trả lời rõ ràng, súc tích nhưng đầy đủ thông tin."""
}

class KioskSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(255), nullable=False)
    case_number = db.Column(db.String(100), nullable=True)
    conversation_summary = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(10), nullable=False, default='en')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    documents_suggested = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_email': self.user_email,
            'case_number': self.case_number,
            'conversation_summary': self.conversation_summary,
            'language': self.language,
            'timestamp': self.timestamp.isoformat(),
            'documents_suggested': json.loads(self.documents_suggested) if self.documents_suggested else []
        }

class County(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    contact_email = db.Column(db.String(255))
    phone = db.Column(db.String(50))

class QnA(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    county_id = db.Column(db.Integer, db.ForeignKey('county.id'), nullable=False)
    language = db.Column(db.String(10), default='en')
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    topic = db.Column(db.String(100))
    county = db.relationship('County', backref=db.backref('qnas', lazy=True))

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    county_id = db.Column(db.Integer, db.ForeignKey('county.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, default=0)

class Content(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    county_id = db.Column(db.Integer, db.ForeignKey('county.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(10), default='en')
    active = db.Column(db.Boolean, default=True)

class StaffContact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    county_id = db.Column(db.Integer, db.ForeignKey('county.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100))
    phone = db.Column(db.String(50))
    email = db.Column(db.String(255))
    office_hours = db.Column(db.String(255))

class Form(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    county_id = db.Column(db.Integer, db.ForeignKey('county.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    url_link = db.Column(db.String(255))
    required_for = db.Column(db.String(255))

DOCUMENT_SUGGESTIONS = {
    'en': {
        'divorce': [
            'Petition for Dissolution of Marriage',
            'Financial Declaration Form',
            'Parenting Plan (if children involved)'
        ],
        'restraining order': [
            'Request for Domestic Violence Restraining Order',
            'Temporary Restraining Order Form',
            'Proof of Service Form'
        ],
        'small claims': [
            'Small Claims Plaintiff Claim Form',
            'Proof of Service Form',
            'Small Claims Case Questionnaire'
        ],
        'child custody': [
            'Petition for Child Custody',
            'Parenting Plan Form',
            'Child Custody Mediation Agreement'
        ],
        'eviction': [
            'Unlawful Detainer Form',
            'Notice to Quit',
            'Proof of Service Form'
        ]
    },
    'es': {
        'divorcio': [
            'Petición de Disolución de Matrimonio',
            'Formulario de Declaración Financiera',
            'Plan de Crianza (si hay niños involucrados)'
        ],
        'orden de restricción': [
            'Solicitud de Orden de Restricción por Violencia Doméstica',
            'Formulario de Orden de Restricción Temporal',
            'Formulario de Prueba de Notificación'
        ],
        'reclamos menores': [
            'Formulario de Reclamo del Demandante de Reclamos Menores',
            'Formulario de Prueba de Notificación',
            'Cuestionario de Caso de Reclamos Menores'
        ],
        'custodia': [
            'Petición de Custodia de Menores',
            'Formulario de Plan de Crianza',
            'Acuerdo de Mediación de Custodia'
        ],
        'desalojo': [
            'Formulario de Retención Ilegal',
            'Aviso de Desalojo',
            'Formulario de Prueba de Notificación'
        ]
    }
}

class GuidedQuestion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    case_type = db.Column(db.String(10), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(10), default='en')
    order_num = db.Column(db.Integer, default=0)

def get_document_suggestions(message_content, language='en'):
    message_lower = message_content.lower()
    suggested_docs = []
    docs_for_lang = DOCUMENT_SUGGESTIONS.get(language, DOCUMENT_SUGGESTIONS['en'])
    for topic, docs in docs_for_lang.items():
        if topic in message_lower:
            suggested_docs.extend(docs)
    return list(set(suggested_docs))

def generate_llm_response(user_message, conversation_history, language='en', system_prompt=None):
    if client is None:
        return "I'm sorry, the AI assistant is currently unavailable. Please consult with court staff for assistance."
    
    if system_prompt:
        system_prompt = SYSTEM_PROMPTS.get(language, SYSTEM_PROMPTS['en']) + "\n" + system_prompt
    else:
        system_prompt = SYSTEM_PROMPTS.get(language, SYSTEM_PROMPTS['en'])
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating AI response: {e}")
        return "I'm sorry, I'm unable to process your request at this time. Please consult with court staff for assistance."

def send_summary_email(to_address, subject, body):
    if not all([Config.EMAIL_HOST, Config.EMAIL_PORT, Config.EMAIL_USER, Config.EMAIL_PASS]):
        print("Email configuration is missing. Skipping email.")
        return False
    
    msg = MIMEMultipart()
    msg['From'] = Config.EMAIL_USER
    msg['To'] = to_address
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))
    
    try:
        with smtplib.SMTP(Config.EMAIL_HOST, Config.EMAIL_PORT) as server:
            server.starttls()
            server.login(Config.EMAIL_USER, Config.EMAIL_PASS)
            server.send_message(msg)
            print(f"Email sent successfully to {to_address}")
            return True
    except Exception as e:
        print(f"Failed to send email to {to_address}: {e}")
        return False

@app.route('/api/ask', methods=['POST'])
@limiter.limit("10 per minute")
def api_ask():
    try:
        # Validate request data
        validated_data, errors = validate_request_data(AskQuestionSchema, request.json)
        if errors:
            logger.warning(f"Validation error in /api/ask: {errors}")
            return jsonify({'error': 'Invalid request data', 'details': errors}), 400
        
        user_message = validated_data['question']
        language = validated_data.get('language', 'en')
        case_number = validated_data.get('case_number', '')
        conversation_history = validated_data.get('history', '')
        
        logger.info(f"API request received: /api/ask, language: {language}, case: {case_number}")
        
        answer = generate_llm_response(user_message, conversation_history, language)
        docs = get_document_suggestions(user_message, language)
        
        return jsonify({'answer': answer, 'documents': docs})
    
    except Exception as e:
        logger.error(f"Error in /api/ask: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/submit-session', methods=['POST'])
@limiter.limit("5 per minute")
def api_submit_session():
    try:
        # Validate request data
        validated_data, errors = validate_request_data(SubmitSessionSchema, request.json)
        if errors:
            logger.warning(f"Validation error in /api/submit-session: {errors}")
            return jsonify({'error': 'Invalid request data', 'details': errors}), 400
        
        user_email = validated_data['email']
        case_number = validated_data.get('case_number')
        summary = validated_data['summary']
        language = validated_data.get('language', 'en')
        documents = validated_data.get('documents', [])
        
        logger.info(f"Session submission: {user_email}, case: {case_number}")
        
        # Save to DB
        session = KioskSession(
            user_email=user_email,
            case_number=case_number,
            conversation_summary=summary,
            language=language,
            documents_suggested=json.dumps(documents)
        )
        db.session.add(session)
        db.session.commit()
        
        # Email user and facilitator
        subject = f"Court Kiosk Summary (Case: {case_number or 'N/A'})"
        doc_list = '\n'.join(documents)
        body = f"Summary of your session:\n\n{summary}\n\nRecommended documents:\n{doc_list}"
        
        send_summary_email(user_email, subject, body)
        if Config.FACILITATOR_EMAIL:
            send_summary_email(Config.FACILITATOR_EMAIL, subject, body)
        
        return jsonify({'status': 'success'})
    
    except Exception as e:
        logger.error(f"Error in /api/submit-session: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/qna', methods=['POST'])
def api_qna():
    data = request.json
    question = data.get('question')
    county_name = data.get('county', 'San Mateo')
    language = data.get('language', 'en')
    county = County.query.filter_by(name=county_name).first()
    if not county:
        return jsonify({'answer': f'No data for county {county_name}.'}), 404
    qna = QnA.query.filter_by(county_id=county.id, language=language, question=question).first()
    if qna:
        return jsonify({'answer': qna.answer})
    else:
        return jsonify({'answer': 'No answer found for this question in the selected county/language.'}), 404

@app.route('/api/categories', methods=['GET'])
def get_categories():
    county_name = request.args.get('county', 'San Mateo')
    county = County.query.filter_by(name=county_name).first()
    if not county:
        return jsonify([]), 404
    categories = Category.query.filter_by(county_id=county.id).order_by(Category.display_order).all()
    return jsonify([{'id': c.id, 'name': c.name, 'display_order': c.display_order} for c in categories])

@app.route('/api/content', methods=['GET'])
def get_content():
    county_name = request.args.get('county', 'San Mateo')
    category_id = request.args.get('category_id')
    language = request.args.get('language', 'en')
    county = County.query.filter_by(name=county_name).first()
    if not county or not category_id:
        return jsonify([]), 404
    content = Content.query.filter_by(county_id=county.id, category_id=category_id, language=language, active=True).all()
    return jsonify([{'id': c.id, 'title': c.title, 'body': c.body, 'language': c.language} for c in content])

@app.route('/api/staff', methods=['GET'])
def get_staff():
    county_name = request.args.get('county', 'San Mateo')
    county = County.query.filter_by(name=county_name).first()
    if not county:
        return jsonify([]), 404
    staff = StaffContact.query.filter_by(county_id=county.id).all()
    return jsonify([{'id': s.id, 'name': s.name, 'role': s.role, 'phone': s.phone, 'email': s.email, 'office_hours': s.office_hours} for s in staff])

@app.route('/api/forms', methods=['GET'])
def get_forms():
    county_name = request.args.get('county', 'San Mateo')
    county = County.query.filter_by(name=county_name).first()
    if not county:
        return jsonify([]), 404
    forms = Form.query.filter_by(county_id=county.id).all()
    return jsonify([{'id': f.id, 'title': f.title, 'description': f.description, 'url_link': f.url_link, 'required_for': f.required_for} for f in forms])

@app.route('/api/dvro_rag', methods=['POST'])
def dvro_rag():
    data = request.json
    user_question = data.get('question', '')
    language = data.get('language', 'en')

    # Load flowchart data with error handling
    try:
        flowchart_path = os.path.join(app.root_path, 'flowchart.json')
        with open(flowchart_path, 'r') as f:
            flowchart = json.load(f)
    except (OSError, json.JSONDecodeError) as e:
        return jsonify({'error': f'Error loading flowchart data: {str(e)}'}), 500

    # Validate basic JSON structure before proceeding
    if not isinstance(flowchart, dict) or not isinstance(flowchart.get('flowchart'), dict):
        return jsonify({'error': 'Invalid flowchart structure'}), 500

    # Simple retrieval: collect all steps and documents for DVRO
    steps = []
    documents = set()
    for node_id, node in flowchart.get('flowchart', {}).items():
        # Check title and description for DVRO content
        title = node.get('title', {}).get(language, '') if isinstance(node.get('title'), dict) else node.get('title', '')
        description = node.get('description', {}).get(language, '') if isinstance(node.get('description'), dict) else node.get('description', '')
        
        if 'restraining order' in title.lower() or 'dvro' in title.lower() or 'domestic violence' in title.lower():
            steps.append(title)
            if description:
                steps.append(description)
            
            # Check forms in the node
            for form in node.get('forms', []):
                form_name = form.get('name', {}).get(language, '') if isinstance(form.get('name'), dict) else form.get('name', '')
                if form_name:
                    documents.add(form_name)
            
            # Check next_steps
            next_steps = node.get('next_steps', {}).get(language, []) if isinstance(node.get('next_steps'), dict) else node.get('next_steps', [])
            if next_steps:
                steps.extend(next_steps)

    # Compose context for LLM
    context = (
        "Here are the main steps for a Domestic Violence Restraining Order (DVRO):\n"
        + "\n".join(f"- {step}" for step in steps)
        + "\n\nRequired documents:\n"
        + "\n".join(f"- {doc}" for doc in documents)
    )

    # Call LLM with context
    system_prompt = (
        "You are a legal information assistant. Use the following DVRO process and document list to answer the user's question.\n"
        + context
    )
    # If generate_llm_response does not support system_prompt, fall back to SYSTEM_PROMPTS
    try:
        answer = generate_llm_response(user_question, '', language=language, system_prompt=system_prompt)
    except TypeError:
        # Fallback for old signature
        answer = generate_llm_response(user_question + "\n" + context, '', language=language)
    return jsonify({'answer': answer, 'steps': steps, 'documents': list(documents)})

@app.route('/api/flowchart', methods=['GET'])
def api_flowchart():
    try:
        flowchart_path = os.path.join(os.getcwd(), 'flowchart.json')
        if not os.path.exists(flowchart_path):
            raise FileNotFoundError
        return send_file(flowchart_path, mimetype='application/json')
    except FileNotFoundError:
        return jsonify({'error': 'Flowchart data not found'}), 404
    except Exception as e:
        return jsonify({'error': f'Error serving flowchart data: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'OK'})


@app.route('/api/documents/<path:filename>', methods=['GET'])
def get_court_document(filename):
    """Serve static court documents bundled with the deployment."""
    if not filename:
        return jsonify({'error': 'Document name is required'}), 400

    safe_path = os.path.normpath(filename)
    if safe_path.startswith('..') or os.path.isabs(safe_path):
        return jsonify({'error': 'Invalid document path'}), 400

    document_path = os.path.join(COURT_DOCUMENTS_DIR, safe_path)

    if not os.path.isfile(document_path):
        return jsonify({'error': 'Document not found'}), 404

    try:
        return send_file(document_path, mimetype='application/pdf')
    except Exception as exc:
        logger.error(f"Error serving document {filename}: {exc}")
        return jsonify({'error': 'Unable to serve document'}), 500

@app.route('/api/generate-queue', methods=['POST'])
@limiter.limit("20 per minute")
def generate_queue():
    try:
        # Validate request data
        validated_data, errors = validate_request_data(GenerateQueueSchema, request.json)
        if errors:
            logger.warning(f"Validation error in /api/generate-queue: {errors}")
            return jsonify({'error': 'Invalid request data', 'details': errors}), 400
        
        case_type = validated_data['case_type']
        priority = validated_data['priority']
        language = validated_data.get('language', 'en')
        user_name = validated_data.get('user_name')
        user_email = validated_data.get('user_email')
        phone_number = validated_data.get('phone_number')

        logger.info(f"Queue generation request: {case_type}, priority: {priority}, user: {user_email}")

        # Generate queue number based on priority level (format: A001, B001, C001, etc.)
        last_entry = QueueEntry.query.filter_by(priority_level=priority).order_by(QueueEntry.id.desc()).first()
        if last_entry:
            try:
                last_num = int(last_entry.queue_number[1:])  # Extract number after priority letter
                new_num = last_num + 1
            except (ValueError, TypeError):
                new_num = 1
        else:
            new_num = 1
        
        queue_number = f"{priority}{new_num:03d}"
        
        # Create queue entry using the correct field names
        entry = QueueEntry(
            queue_number=queue_number,
            case_type=case_type,
            priority_level=priority,
            priority_number=new_num,
            language=language,
            status='waiting',
            user_name=user_name,
            user_email=user_email,
            phone_number=phone_number
        )
        db.session.add(entry)
        db.session.commit()
        
        logger.info(f"Queue number generated: {queue_number}")
        return jsonify({'queue_number': queue_number})
    
    except Exception as e:
        logger.error(f"Error in /api/generate-queue: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/queue', methods=['GET'])
def get_queue():
    try:
        # Get all waiting entries, ordered by priority and timestamp
        queue = QueueEntry.query.filter_by(status='waiting').order_by(
            QueueEntry.priority_level.asc(),
            QueueEntry.created_at.asc()
        ).all()
        
        # Get currently called number
        current = QueueEntry.query.filter_by(status='called').order_by(QueueEntry.created_at.desc()).first()
        
        return jsonify({
            'queue': [{
                'queue_number': item.queue_number,
                'case_type': item.case_type,
                'priority': item.priority_level,
                'timestamp': item.created_at.isoformat(),
                'language': item.language,
                'user_name': item.user_name,
                'user_email': item.user_email,
                'phone_number': item.phone_number
            } for item in queue],
            'current_number': {
                'queue_number': current.queue_number,
                'case_type': current.case_type,
                'priority': current.priority_level,
                'timestamp': current.created_at.isoformat(),
                'user_name': current.user_name,
                'user_email': current.user_email,
                'phone_number': current.phone_number
            } if current else None
        })
    except Exception as e:
        logger.error(f"Error in /api/queue: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/call-next', methods=['POST'])
def call_next():
    # Get next person in queue
    next_entry = QueueEntry.query.filter_by(status='waiting').order_by(
        QueueEntry.priority_level.asc(),
        QueueEntry.timestamp.asc()
    ).first()
    
    if not next_entry:
        return jsonify({'error': 'No one waiting in queue'}), 404
    
    # Mark as called
    next_entry.status = 'called'
    db.session.commit()
    
    return jsonify({'success': True, 'queue_number': next_entry.queue_number})

@app.route('/api/complete-case', methods=['POST'])
def complete_case():
    data = request.json
    queue_number = data.get('queue_number')
    
    if not queue_number:
        return jsonify({'error': 'Missing queue number'}), 400
    
    entry = QueueEntry.query.filter_by(queue_number=queue_number).first()
    if not entry:
        return jsonify({'error': 'Queue entry not found'}), 404
    
    entry.status = 'completed'
    db.session.commit()
    
    return jsonify({'success': True})

@app.route('/api/guided-questions', methods=['POST'])
def guided_questions():
    data = request.json
    case_type = data.get('case_type')
    language = data.get('language', 'en')
    
    if not case_type:
        return jsonify({'error': 'Missing case type'}), 400
    
    # Get guided questions for this case type
    questions = GuidedQuestion.query.filter_by(
        case_type=case_type,
        language=language
    ).order_by(GuidedQuestion.order_num).all()
    
    return jsonify({
        'questions': [{
            'id': q.id,
            'question_text': q.question_text,
            'order_num': q.order_num
        } for q in questions]
    })

@app.route('/api/process-answers', methods=['POST'])
def process_answers():
    data = request.json
    queue_number = data.get('queue_number')
    answers = data.get('answers', {})
    language = data.get('language', 'en')
    
    if not queue_number:
        return jsonify({'error': 'Missing queue number'}), 400
    
    entry = QueueEntry.query.filter_by(queue_number=queue_number).first()
    if not entry:
        return jsonify({'error': 'Queue entry not found'}), 404
    
    # Extract information from the new answers structure
    case_type = answers.get('case_type', '')
    current_step = answers.get('current_step', '')
    progress = answers.get('progress', [])
    summary = answers.get('summary', '')
    next_steps = answers.get('next_steps', [])
    
    # Generate enhanced summary and next steps using LLM
    enhanced_summary = generate_enhanced_summary(case_type, current_step, progress, summary, language)
    enhanced_next_steps = generate_enhanced_next_steps(case_type, current_step, next_steps, language)
    
    # Update entry
    entry.summary = enhanced_summary
    entry.next_steps = enhanced_next_steps
    db.session.commit()
    
    return jsonify({
        'summary': enhanced_summary,
        'next_steps': enhanced_next_steps
    })

def generate_enhanced_summary(case_type, current_step, progress, existing_summary, language):
    if client is None:
        return existing_summary
    
    progress_text = ""
    if progress:
        progress_text = "\n".join([f"- {item.get('option', '')}" for item in progress])
    
    prompt = f"""
    Case Type: {case_type}
    Current Step: {current_step}
    Progress: {progress_text}
    Existing Summary: {existing_summary}
    Language: {language}
    
    Generate a comprehensive summary of the client's situation including:
    1. Their case type and priority level
    2. Where they are in the legal process
    3. What they have already done
    4. What they need to do next
    5. Any urgent matters or deadlines
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a court facilitator assistant. Provide clear, comprehensive summaries of client situations."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating enhanced summary: {e}")
        return existing_summary

def generate_enhanced_next_steps(case_type, current_step, existing_steps, language):
    if client is None:
        return "\n".join(existing_steps) if isinstance(existing_steps, list) else existing_steps
    
    existing_steps_text = "\n".join(existing_steps) if isinstance(existing_steps, list) else existing_steps
    
    prompt = f"""
    Case Type: {case_type}
    Current Step: {current_step}
    Existing Next Steps: {existing_steps_text}
    Language: {language}
    
    Provide detailed, actionable next steps for the client including:
    1. Specific forms they need to fill out
    2. Deadlines they need to meet
    3. Documents they need to gather
    4. Court procedures they need to follow
    5. Contact information for additional help
    6. Timeline expectations
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a court facilitator assistant. Provide clear, actionable next steps for clients."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating enhanced next steps: {e}")
        return existing_steps_text

# ===== EMAIL ENDPOINTS =====
# All email functionality has been moved to email_api.py
# The EmailService class handles all email operations
# Available endpoints:
# - /api/email/send-case-summary
# - /api/email/send-queue-notification  
# - /api/email/send-facilitator-notification
# - /api/email/health

@app.route('/api/generate-case-summary', methods=['POST'])
def generate_case_summary():
    """Generate and save case summary, optionally add to queue"""
    try:
        data = request.get_json()
        
        flow_type = data.get('flow_type', 'DVRO')
        answers = data.get('answers', {})
        flow_data = data.get('flow_data', {})
        user_email = data.get('email')
        user_name = data.get('user_name')
        language = data.get('language', 'en')
        join_queue = data.get('join_queue', False)
        
        if not user_email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Create case summary and optionally add to queue
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
            'queue_number': result.get('queue_number')
        })
        
    except Exception as e:
        app.logger.error(f"Error generating case summary: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/send-case-summary-email', methods=['POST'])
def send_case_summary_email():
    """Send email for a specific case summary"""
    try:
        data = request.get_json()
        summary_id = data.get('summary_id')
        include_queue = data.get('include_queue', False)
        
        if not summary_id:
            return jsonify({'error': 'Summary ID is required'}), 400
        
        # Get case summary
        case_summary = case_summary_service.get_case_summary_by_id(summary_id)
        if not case_summary:
            return jsonify({'error': 'Case summary not found'}), 404
        
        # Convert to case data format
        case_data = {
            'user_email': case_summary.get('user_email'),
            'user_name': case_summary.get('user_name'),
            'case_type': case_summary.get('flow_type', 'Unknown'),
            'priority_level': 'A',  # Default priority
            'language': case_summary.get('language', 'en'),
            'queue_number': case_summary.get('queue_number'),
            'documents_needed': case_summary.get('required_forms', []),
            'next_steps': case_summary.get('next_steps', []),
            'conversation_summary': case_summary.get('summary_json', ''),
            'case_number': case_summary.get('case_number')
        }
        
        # Send comprehensive email
        result = email_service.send_comprehensive_case_email(case_data, include_queue)
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Case summary email sent successfully',
                'email_id': result.get('id')
            })
        else:
            return jsonify({'error': result.get('error', 'Failed to send email')}), 500
            
    except Exception as e:
        app.logger.error(f"Error sending case summary email: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/email/send-case-summary', methods=['POST'])
def send_case_summary_email_endpoint():
    """Send case summary email - endpoint called by frontend"""
    try:
        logger.info("Received email request")
        data = request.get_json()
        
        if not data:
            logger.error("No JSON data received")
            return jsonify({'error': 'No data received'}), 400
            
        email = data.get('email')
        case_data = data.get('case_data', {})
        
        logger.info(f"Processing email request for: {email}")
        
        if not email:
            logger.error("No email provided")
            return jsonify({'error': 'Email is required'}), 400
        
        # Generate case number
        case_number = f"DVRO{random.randint(1000, 9999)}"
        
        # Prepare comprehensive case data for email
        summary_data = case_data.get('summary', '')
        
        # Handle both string and object summaries
        if isinstance(summary_data, dict):
            # If it's a complex object, convert to JSON string for processing
            conversation_summary = json.dumps(summary_data)
            summary_json = summary_data
        else:
            # If it's a string, use as is
            conversation_summary = str(summary_data)
            summary_json = {}
        
        comprehensive_case_data = {
            'user_email': email,
            'user_name': case_data.get('user_name', 'Court Kiosk User'),
            'case_type': case_data.get('case_type', 'Domestic Violence Restraining Order'),
            'priority_level': 'A',
            'language': 'en',
            'queue_number': case_data.get('queue_number', 'N/A'),
            'documents_needed': case_data.get('forms', []),
            'next_steps': case_data.get('next_steps', []),
            'conversation_summary': conversation_summary,
            'summary_json': summary_json,
            'phone_number': case_data.get('phone_number')
        }
        
        logger.info(f"Sending email with case data: {comprehensive_case_data}")
        
        # Send comprehensive email using the email service
        result = email_service.send_comprehensive_case_email(comprehensive_case_data, include_queue=False)
        
        logger.info(f"Email service result: {result}")
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Case summary email sent successfully',
                'case_number': case_number,
                'email_id': result.get('id')
            })
        else:
            logger.error(f"Email service failed: {result}")
            return jsonify({'error': result.get('error', 'Failed to send email')}), 500
            
    except Exception as e:
        logger.error(f"Error sending case summary email: {str(e)}", exc_info=True)
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/send-summary', methods=['POST'])
def send_summary_email():
    """Send summary email with form attachments"""
    try:
        data = request.get_json()
        email = data.get('email')
        answers = data.get('answers', {})
        forms = data.get('forms', [])
        summary = data.get('summary', '')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Generate case number
        case_number = f"DVRO{random.randint(1000, 9999)}"
        
        # Create email content
        subject = f"DVRO Case Summary - {case_number}"
        
        # Generate detailed email body
        email_body = generate_email_body(case_number, answers, forms, summary)
        
        # Generate PDF attachments for forms
        attachments = generate_form_pdfs(forms)
        
        # Send email with attachments
        success = send_email_with_attachments(email, subject, email_body, attachments)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Summary and forms sent successfully',
                'case_number': case_number
            })
        else:
            return jsonify({'error': 'Failed to send email'}), 500
            
    except Exception as e:
        app.logger.error(f"Error sending summary email: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

def generate_email_body(case_number, answers, forms, summary):
    """Generate detailed email body with case information"""
    
    # Basic case info
    body = f"""
Dear User,

Thank you for using the Family Court Clinic system. Here is your case summary and next steps.

CASE NUMBER: {case_number}
CASE TYPE: Domestic Violence Restraining Order
PRIORITY: A (High Priority)

CASE SUMMARY:
{summary}

REQUIRED FORMS ({len(forms)} total):
"""
    
    # Add form details
    form_catalog = {
        'DV-100': 'Request for Domestic Violence Restraining Order',
        'CLETS-001': 'Confidential CLETS Information',
        'DV-109': 'Notice of Court Hearing',
        'DV-110': 'Temporary Restraining Order',
        'DV-105': 'Request for Child Custody and Visitation Orders',
        'DV-140': 'Child Custody and Visitation Order',
        'DV-200': 'Proof of Personal Service',
        'FL-150': 'Income and Expense Declaration',
        'DV-120': 'Response to Request for Domestic Violence Restraining Order',
        'CH-100': 'Request for Civil Harassment Restraining Order',
        'CH-110': 'Temporary Restraining Order (Civil Harassment)'
    }
    
    for i, form in enumerate(forms, 1):
        form_name = form_catalog.get(form, form)
        body += f"{i}. {form} - {form_name}\n"
    
    # Add next steps
    body += """

IMMEDIATE NEXT STEPS:

1. Complete all required forms (attached as PDFs)
2. Make 3 copies of each form
3. File forms with the court clerk
4. Arrange for service of the other party
5. Attend your court hearing

IMPORTANT REMINDERS:
- If you are in immediate danger, call 911
- Keep copies of all forms with you at all times
- Service must be completed at least 5 days before hearing
- Bring all evidence and witnesses to court
- Dress appropriately for court

HEARING PREPARATION:
- Arrive 15 minutes early
- Bring all original forms and copies
- Bring evidence (photos, documents, witnesses)
- Be prepared to testify
- Dress professionally

If you have questions, please contact the Family Court Clinic.

Best regards,
Family Court Clinic System
"""
    
    return body

def generate_form_pdfs(forms):
    """Generate PDF files for required forms"""
    attachments = []
    
    # This would typically generate actual PDF forms
    # For now, we'll create placeholder PDFs
    for form in forms:
        try:
            # Create a simple PDF with form information
            pdf_content = f"""
            {form} - Form Template
            
            This is a placeholder for the {form} form.
            In a real implementation, this would contain the actual form.
            
            Generated by Family Court Clinic System
            """
            
            # Save PDF to temporary file
            pdf_path = f"/tmp/{form}_template.pdf"
            with open(pdf_path, 'w') as f:
                f.write(pdf_content)
            
            attachments.append({
                'filename': f"{form}_form.pdf",
                'path': pdf_path
            })
            
        except Exception as e:
            app.logger.error(f"Error generating PDF for {form}: {str(e)}")
    
    return attachments

def send_email_with_attachments(to_email, subject, body, attachments):
    """Send email with PDF attachments"""
    try:
        # Configure email settings (you'll need to set these in environment)
        smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        smtp_port = int(os.getenv('SMTP_PORT', '587'))
        smtp_username = os.getenv('SMTP_USERNAME')
        smtp_password = os.getenv('SMTP_PASSWORD')
        
        if not all([smtp_username, smtp_password]):
            app.logger.warning("SMTP credentials not configured, skipping email send")
            return True  # Return True for development
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add body
        msg.attach(MIMEText(body, 'plain'))
        
        # Add attachments
        for attachment in attachments:
            try:
                with open(attachment['path'], 'rb') as f:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(f.read())
                
                encoders.encode_base64(part)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename= {attachment["filename"]}'
                )
                msg.attach(part)
                
            except Exception as e:
                app.logger.error(f"Error attaching {attachment['filename']}: {str(e)}")
        
        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(msg)
        server.quit()
        
        # Clean up temporary files
        for attachment in attachments:
            try:
                os.remove(attachment['path'])
            except:
                pass
        
        return True
        
    except Exception as e:
        app.logger.error(f"Error sending email: {str(e)}")
        return False

# --- Simple SMS endpoints (mock/dev) ---
@app.route('/api/sms/send-queue-number', methods=['POST'])
def send_queue_number_sms():
    """Mock endpoint to send queue number via SMS.
    In development, we just log and return success so the frontend can proceed.
    """
    try:
        data = request.get_json() or {}
        queue_number = data.get('queue_number')
        phone_number = data.get('phone_number')
        if not queue_number or not phone_number:
            return jsonify({'success': False, 'error': 'Missing queue_number or phone_number'}), 400
        app.logger.info(f"[SMS] Would send queue number {queue_number} to {phone_number}")
        return jsonify({'success': True})
    except Exception as e:
        app.logger.error(f"Error in send_queue_number_sms: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

# =============================================================================
# AUTHENTICATION ENDPOINTS
# =============================================================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login endpoint for admin users"""
    try:
        data = request.get_json()
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'success': False, 'error': 'Username and password required'}), 400
        
        result = AuthService.authenticate_user(data['username'], data['password'])
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 401
            
    except Exception as e:
        app.logger.error(f"Login error: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/auth/logout', methods=['POST'])
@AuthService.require_auth
def logout():
    """Logout endpoint"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        result = AuthService.logout_user(session_token)
        return jsonify(result), 200
    except Exception as e:
        app.logger.error(f"Logout error: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/auth/me', methods=['GET'])
@AuthService.require_auth
def get_current_user():
    """Get current user information"""
    try:
        user = request.current_user
        return jsonify({'success': True, 'user': user.to_dict()}), 200
    except Exception as e:
        app.logger.error(f"Get current user error: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/auth/users', methods=['GET'])
@AuthService.require_auth
@AuthService.require_role('admin')
def get_users():
    """Get all users (admin only)"""
    try:
        users = User.query.filter_by(is_active=True).all()
        return jsonify({
            'success': True, 
            'users': [user.to_dict() for user in users]
        }), 200
    except Exception as e:
        app.logger.error(f"Get users error: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/auth/users', methods=['POST'])
@AuthService.require_auth
@AuthService.require_role('admin')
def create_user():
    """Create new user (admin only)"""
    try:
        data = request.get_json()
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'success': False, 'error': 'Username, email, and password required'}), 400
        
        result = AuthService.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            role=data.get('role', 'admin')
        )
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
            
    except Exception as e:
        app.logger.error(f"Create user error: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/auth/audit-logs', methods=['GET'])
@AuthService.require_auth
@AuthService.require_role('admin')
def get_audit_logs():
    """Get audit logs (admin only)"""
    try:
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        user_id = request.args.get('user_id')
        action = request.args.get('action')
        
        logs = AuthService.get_audit_logs(
            limit=limit,
            offset=offset,
            user_id=int(user_id) if user_id else None,
            action=action
        )
        
        return jsonify({'success': True, 'logs': logs}), 200
    except Exception as e:
        app.logger.error(f"Get audit logs error: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

# =============================================================================
# PROTECTED ADMIN ENDPOINTS (require authentication)
# =============================================================================

@app.route('/api/admin/queue', methods=['GET'])
@AuthService.require_auth
def get_admin_queue():
    """Get queue data for admin dashboard (protected)"""
    try:
        # Log the action
        AuthService.log_action(
            user_id=request.current_user.id,
            action='view_queue',
            resource_type='queue'
        )
        
        # Use existing queue logic but with authentication
        queue_entries = QueueEntry.query.filter_by(status='waiting').order_by(QueueEntry.priority_level, QueueEntry.created_at).all()
        current_entry = QueueEntry.query.filter_by(status='in_progress').first()
        
        queue_data = []
        for entry in queue_entries:
            queue_data.append({
                'queue_number': entry.queue_number,
                'priority': entry.priority_level,
                'case_type': entry.case_type,
                'user_name': entry.user_name,
                'user_email': entry.user_email,
                'phone_number': entry.phone_number,
                'language': entry.language,
                'status': entry.status,
                'created_at': entry.created_at.isoformat(),
                'arrived_at': entry.created_at.isoformat(),
                'conversation_summary': entry.conversation_summary,
                'documents_needed': entry.documents_needed,
                'next_steps': entry.next_steps
            })
        
        current_number = None
        if current_entry:
            current_number = {
                'queue_number': current_entry.queue_number,
                'priority': current_entry.priority_level,
                'case_type': current_entry.case_type,
                'user_name': current_entry.user_name,
                'created_at': current_entry.created_at.isoformat()
            }
        
        return jsonify({
            'success': True,
            'queue': queue_data,
            'current_number': current_number
        }), 200
        
    except Exception as e:
        app.logger.error(f"Get admin queue error: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/admin/call-next', methods=['POST'])
@AuthService.require_auth
def admin_call_next():
    """Call next case (protected)"""
    try:
        # Log the action
        AuthService.log_action(
            user_id=request.current_user.id,
            action='call_next',
            resource_type='queue'
        )
        
        # Use existing call next logic
        next_entry = QueueEntry.query.filter_by(status='waiting').order_by(QueueEntry.priority_level, QueueEntry.created_at).first()
        
        if not next_entry:
            return jsonify({'success': False, 'error': 'No cases in queue'}), 400
        
        # Update status
        next_entry.status = 'in_progress'
        db.session.commit()
        
        return jsonify({
            'success': True,
            'queue_entry': {
                'queue_number': next_entry.queue_number,
                'priority': next_entry.priority_level,
                'case_type': next_entry.case_type,
                'user_name': next_entry.user_name
            }
        }), 200
        
    except Exception as e:
        app.logger.error(f"Admin call next error: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.route('/api/admin/complete-case', methods=['POST'])
@AuthService.require_auth
def admin_complete_case():
    """Complete case (protected)"""
    try:
        data = request.get_json()
        queue_number = data.get('queue_number')
        
        if not queue_number:
            return jsonify({'success': False, 'error': 'Queue number required'}), 400
        
        # Log the action
        AuthService.log_action(
            user_id=request.current_user.id,
            action='complete_case',
            resource_type='case',
            resource_id=queue_number
        )
        
        # Use existing complete case logic
        entry = QueueEntry.query.filter_by(queue_number=queue_number).first()
        if not entry:
            return jsonify({'success': False, 'error': 'Case not found'}), 404
        
        entry.status = 'completed'
        db.session.commit()
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        app.logger.error(f"Admin complete case error: {str(e)}")
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Create default admin user if none exists
        if not User.query.filter_by(username='admin').first():
            admin_user = User(
                username='admin',
                email='admin@court.gov',
                role='admin'
            )
            admin_user.set_password('admin123')  # Change this in production!
            db.session.add(admin_user)
            db.session.commit()
            print("Created default admin user: admin/admin123")

@app.route('/api/case-summary/<int:summary_id>', methods=['GET'])
def get_case_summary(summary_id):
    """Get case summary by ID with enhanced details"""
    try:
        summary = CaseSummary.query.get(summary_id)
        if not summary:
            return jsonify({'error': 'Case summary not found'}), 404
        
        # Get enhanced summary data
        summary_data = summary.to_dict()
        
        # Add additional case details if available
        if summary.summary_json:
            try:
                enhanced_data = json.loads(summary.summary_json)
                summary_data.update(enhanced_data)
            except:
                pass
        
        return jsonify(summary_data)
    except Exception as e:
        logger.error(f"Error fetching case summary: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/case-details/<int:queue_number>', methods=['GET'])
def get_case_details(queue_number):
    """Get comprehensive case details by queue number"""
    try:
        # Find case by queue number
        queue_entry = QueueEntry.query.filter_by(queue_number=queue_number).first()
        if not queue_entry:
            return jsonify({'error': 'Case not found'}), 404
        
        # Get case summary if available
        case_summary = None
        if hasattr(queue_entry, 'summary_id') and queue_entry.summary_id:
            case_summary = CaseSummary.query.get(queue_entry.summary_id)
        
        # Build comprehensive case details
        case_details = {
            'queue_number': queue_entry.queue_number,
            'case_type': queue_entry.case_type,
            'priority': queue_entry.priority,
            'status': queue_entry.status,
            'language': queue_entry.language,
            'user_name': queue_entry.user_name,
            'user_email': queue_entry.user_email,
            'phone_number': queue_entry.phone_number,
            'arrived_at': queue_entry.arrived_at.isoformat() if queue_entry.arrived_at else None,
            'created_at': queue_entry.created_at.isoformat() if queue_entry.created_at else None,
            'updated_at': queue_entry.updated_at.isoformat() if queue_entry.updated_at else None,
            'conversation_summary': queue_entry.conversation_summary,
            'documents_needed': queue_entry.documents_needed,
            'next_steps': queue_entry.next_steps,
            'summary_id': queue_entry.summary_id
        }
        
        # Add enhanced summary data if available
        if case_summary and case_summary.summary_json:
            try:
                enhanced_data = json.loads(case_summary.summary_json)
                case_details['enhanced_summary'] = enhanced_data
            except:
                pass
        
        return jsonify(case_details)
    except Exception as e:
        logger.error(f"Error fetching case details: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    
    app.run(debug=False, port=5001)