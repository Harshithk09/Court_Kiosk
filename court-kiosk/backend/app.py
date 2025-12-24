from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_socketio import SocketIO, emit, join_room, leave_room
from datetime import datetime
import json
import os
import random
import logging
from utils.llm_service import LLMService
from utils.email_service import EmailService
from utils.case_summary_service import CaseSummaryService
from utils.auth_service import AuthService
from utils.validation import validate_email, validate_phone_number, validate_name, validate_queue_request, validate_email_request
from utils.error_handling import ErrorResponse, log_error_detailed, handle_database_error, handle_email_error
from email_api import email_bp
from config import Config
from models import db, QueueEntry, User, UserSession, AuditLog, CaseSummary, CaseType
from validation_schemas import (
    validate_request_data, AskQuestionSchema, SubmitSessionSchema, 
    GenerateQueueSchema, DVRORAGSchema, CallNextSchema, CompleteCaseSchema,
    GuidedQuestionsSchema, ProcessAnswersSchema, SendEmailSchema, GenerateCaseSummarySchema
)

app = Flask(__name__)
# Use eventlet for better async performance (falls back to threading if eventlet not available)
try:
    import eventlet
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')
except ImportError:
    socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

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
# For production: Use Redis or PostgreSQL storage
# For development: Use in-memory storage (SQLite)
import warnings

# Determine storage backend
storage_uri = os.getenv('RATELIMIT_STORAGE_URL')  # Can be Redis: redis://localhost:6379
if not storage_uri:
    # Auto-detect: Use PostgreSQL if available, otherwise memory for SQLite/development
    db_uri = Config.SQLALCHEMY_DATABASE_URI
    if db_uri and 'postgresql' in db_uri.lower():
        storage_uri = db_uri
        logger.info("Using PostgreSQL for rate limiting storage")
    else:
        # SQLite/development - use memory storage
        storage_uri = None
        # Suppress warning in development
        warnings.filterwarnings('ignore', message='.*in-memory storage.*', category=UserWarning)

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["1000 per hour", "100 per minute"],
    storage_uri=storage_uri  # None = memory (dev), URI = database/Redis (prod)
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
    """Generate LLM response using LLMService"""
    if not llm_service or not llm_service.client:
        return "I'm sorry, the AI assistant is currently unavailable. Please consult with court staff for assistance."
    
    if system_prompt:
        system_prompt = SYSTEM_PROMPTS.get(language, SYSTEM_PROMPTS['en']) + "\n" + system_prompt
    else:
        system_prompt = SYSTEM_PROMPTS.get(language, SYSTEM_PROMPTS['en'])
    
    try:
        response = llm_service.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Error generating AI response: {e}")
        return "I'm sorry, I'm unable to process your request at this time. Please consult with court staff for assistance."

def send_summary_email(to_address, subject, body):
    """Legacy email function - use EmailService instead"""
    # Use the modern email service instead of SMTP
    try:
        case_data = {
            'user_email': to_address,
            'user_name': 'Court Kiosk User',
            'case_type': 'DVRO',
            'priority_level': 'A',
            'language': 'en',
            'documents_needed': [],
            'next_steps': [],
            'conversation_summary': body
        }
        result = email_service.send_case_email(case_data)
        return result.get('success', False)
    except Exception as e:
        logger.error(f"Failed to send email to {to_address}: {e}")
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
        
        # Save to DB with proper transaction handling
        try:
            session = KioskSession(
                user_email=user_email,
                case_number=case_number,
                conversation_summary=summary,
                language=language,
                documents_suggested=json.dumps(documents)
            )
            db.session.add(session)
            db.session.commit()
            
            # Email user and facilitator AFTER successful commit
            # These are non-transactional operations, so failures don't affect DB
            try:
                subject = f"Court Kiosk Summary (Case: {case_number or 'N/A'})"
                doc_list = '\n'.join(documents)
                body = f"Summary of your session:\n\n{summary}\n\nRecommended documents:\n{doc_list}"
                
                send_summary_email(user_email, subject, body)
                if Config.FACILITATOR_EMAIL:
                    send_summary_email(Config.FACILITATOR_EMAIL, subject, body)
            except Exception as email_error:
                # Email failed but session is saved - log it
                logger.error(
                    f"Email failed for session {session.id}: {str(email_error)}",
                    exc_info=True,
                    extra={
                        'session_id': session.id,
                        'user_email': user_email,
                        'error_type': type(email_error).__name__
                    }
                )
                # Session is still created successfully
        
            return jsonify({'status': 'success'})
        except Exception as db_error:
            db.session.rollback()
            logger.error(
                f"Database error in /api/submit-session: {str(db_error)}",
                exc_info=True,
                extra={
                    'endpoint': '/api/submit-session',
                    'user_email': user_email,
                    'error_type': type(db_error).__name__
                }
            )
            raise  # Re-raise to be caught by outer except
    
    except Exception as e:
        log_error_detailed(
            error=e,
            context="Error in /api/submit-session",
            extra_data={
                'endpoint': '/api/submit-session',
                'user_email': user_email if 'user_email' in locals() else None
            }
        )
        return ErrorResponse.internal_error("An error occurred processing your session")

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

        # Additional validation for optional fields
        if user_email:
            email_result = validate_email(user_email)
            if not email_result['valid']:
                return jsonify({'error': f'Invalid email: {email_result["error"]}'}), 400
            user_email = email_result['email']  # Use normalized email
        
        if phone_number:
            phone_result = validate_phone_number(phone_number)
            if not phone_result['valid']:
                return jsonify({'error': f'Invalid phone number: {phone_result["error"]}'}), 400
            phone_number = phone_result['formatted']  # Use formatted phone
        
        if user_name:
            name_result = validate_name(user_name)
            if not name_result['valid']:
                return jsonify({'error': f'Invalid name: {name_result["error"]}'}), 400
            user_name = name_result['sanitized']  # Use sanitized name

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
        try:
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
            
            # Non-transactional operations AFTER commit
            # Send SMS if phone number provided
            if phone_number:
                try:
                    # SMS sending would go here
                    logger.info(f"Queue number {queue_number} would be sent to {phone_number}")
                except Exception as sms_error:
                    logger.error(
                        f"SMS failed for queue {queue_number}: {str(sms_error)}",
                        exc_info=True,
                        extra={
                            'queue_number': queue_number,
                            'phone_number': phone_number,
                            'error_type': type(sms_error).__name__
                        }
                    )
                    # Queue entry still exists
            
            return jsonify({'queue_number': queue_number})
        except Exception as db_error:
            db.session.rollback()
            logger.error(f"Database error in /api/generate-queue: {str(db_error)}")
            raise  # Re-raise to be caught by outer except
    
    except Exception as e:
        log_error_detailed(
            error=e,
            context="Error in /api/generate-queue",
            extra_data={
                'endpoint': '/api/generate-queue',
                'case_type': case_type if 'case_type' in locals() else None,
                'priority': priority if 'priority' in locals() else None
            }
        )
        return ErrorResponse.internal_error("Failed to generate queue number. Please try again.")

@app.route('/api/queue', methods=['GET'])
def get_queue():
    try:
        # Get all waiting entries, ordered by priority and timestamp
        queue = QueueEntry.query.filter_by(status='waiting').order_by(
            QueueEntry.priority_level.asc(),
            QueueEntry.created_at.asc()
        ).all()
        
        # Get currently called number (in_progress status)
        current = QueueEntry.query.filter_by(status='in_progress').order_by(QueueEntry.created_at.desc()).first()
        
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
        log_error_detailed(
            error=e,
            context="Error in /api/queue",
            extra_data={'endpoint': '/api/queue'}
        )
        return ErrorResponse.internal_error("Failed to retrieve queue. Please try again.")

@app.route('/api/call-next', methods=['POST'])
def call_next():
    try:
        # Get next person in queue
        next_entry = QueueEntry.query.filter_by(status='waiting').order_by(
            QueueEntry.priority_level.asc(),
            QueueEntry.created_at.asc()
        ).first()
        
        if not next_entry:
            return jsonify({'error': 'No one waiting in queue'}), 404
        
        # Mark as called with proper transaction handling
        try:
            next_entry.status = 'called'
            db.session.commit()
            
            # Broadcast update AFTER successful commit
            try:
                broadcast_queue_update()
            except Exception as broadcast_error:
                logger.error(f"WebSocket broadcast failed: {broadcast_error}")
                # Status update still succeeded
            
            return jsonify({'success': True, 'queue_number': next_entry.queue_number})
        except Exception as db_error:
            db.session.rollback()
            logger.error(
                f"Database error in /api/call-next: {str(db_error)}",
                exc_info=True,
                extra={
                    'endpoint': '/api/call-next',
                    'error_type': type(db_error).__name__
                }
            )
            return ErrorResponse.internal_error("Failed to update queue status")
    except Exception as e:
        log_error_detailed(
            error=e,
            context="Error in /api/call-next",
            extra_data={'endpoint': '/api/call-next'}
        )
        return ErrorResponse.internal_error("An error occurred calling the next case")

@app.route('/api/complete-case', methods=['POST'])
def complete_case():
    try:
        data = request.json
        queue_number = data.get('queue_number')
        
        if not queue_number:
            return jsonify({'error': 'Missing queue number'}), 400
        
        entry = QueueEntry.query.filter_by(queue_number=queue_number).first()
        if not entry:
            return jsonify({'error': 'Queue entry not found'}), 404        
        try:
            entry.status = 'completed'
            db.session.commit()
            
            # Broadcast update AFTER successful commit
            try:
                broadcast_queue_update()
            except Exception as broadcast_error:
                logger.error(
                    f"WebSocket broadcast failed: {str(broadcast_error)}",
                    exc_info=True,
                    extra={
                        'queue_number': queue_number,
                        'error_type': type(broadcast_error).__name__
                    }
                )
                # Status update still succeeded
            
            return jsonify({'success': True})
        except Exception as db_error:
            db.session.rollback()
            logger.error(
                f"Database error in /api/complete-case: {str(db_error)}",
                exc_info=True,
                extra={
                    'endpoint': '/api/complete-case',
                    'queue_number': queue_number,
                    'error_type': type(db_error).__name__
                }
            )
            return ErrorResponse.internal_error("Failed to complete case")
    except Exception as e:
        log_error_detailed(
            error=e,
            context="Error in /api/complete-case",
            extra_data={
                'endpoint': '/api/complete-case',
                'queue_number': queue_number if 'queue_number' in locals() else None
            }
        )
        return ErrorResponse.internal_error("An error occurred completing the case")

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
    
    # Update entry with proper transaction handling
    try:
        entry.summary = enhanced_summary
        entry.next_steps = enhanced_next_steps
        db.session.commit()
        
        return jsonify({
            'summary': enhanced_summary,
            'next_steps': enhanced_next_steps
        })
    except Exception as db_error:
        db.session.rollback()
        logger.error(
            f"Database error in /api/process-answers: {str(db_error)}",
            exc_info=True,
            extra={
                'endpoint': '/api/process-answers',
                'queue_number': queue_number if 'queue_number' in locals() else None,
                'error_type': type(db_error).__name__
            }
        )
        return ErrorResponse.internal_error("Failed to update case information")

def generate_enhanced_summary(case_type, current_step, progress, existing_summary, language):
    """Generate enhanced summary using LLMService"""
    if not llm_service:
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
        # Use LLMService instead of direct client access
        response = llm_service.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a court facilitator assistant. Provide clear, comprehensive summaries of client situations."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Error generating enhanced summary: {e}")
        return existing_summary

def generate_enhanced_next_steps(case_type, current_step, existing_steps, language):
    """Generate enhanced next steps using LLMService"""
    if not llm_service:
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
        # Use LLMService instead of direct client access
        response = llm_service.client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a court facilitator assistant. Provide clear, actionable next steps for clients."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Error generating enhanced next steps: {e}")
        return existing_steps_text

# ===== EMAIL ENDPOINTS =====
# Primary email functionality is in email_api.py (blueprint)
# The EmailService class handles all email operations
# 
# PRIMARY ENDPOINTS (use these):
# - /api/email/send-case-summary (email_api.py) - Main endpoint for sending case summaries
# - /api/email/send-queue-notification (email_api.py) - Queue notifications
# - /api/email/send-facilitator-notification (email_api.py) - Facilitator notifications
# - /api/email/health (email_api.py) - Health check
#
# LEGACY/ALTERNATIVE ENDPOINTS (kept for compatibility):
# - /api/send-comprehensive-email - More flexible email endpoint (used by queueAPI.js)
# - /api/send-case-summary-email - DEPRECATED: Sends email by summary_id (not actively used)

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
        
        # Validate email format
        email_result = validate_email(user_email)
        if not email_result['valid']:
            return jsonify({'error': f'Invalid email: {email_result["error"]}'}), 400
        user_email = email_result['email']  # Use normalized email
        
        # Validate user name if provided
        if user_name:
            name_result = validate_name(user_name)
            if not name_result['valid']:
                return jsonify({'error': f'Invalid name: {name_result["error"]}'}), 400
            user_name = name_result['sanitized']
        
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
        log_error_detailed(
            error=e,
            context="Error generating case summary",
            extra_data={
                'endpoint': '/api/generate-case-summary',
                'flow_type': flow_type if 'flow_type' in locals() else None
            }
        )
        return ErrorResponse.internal_error("Failed to generate case summary")

@app.route('/api/send-case-summary-email', methods=['POST'])
def send_case_summary_email():
    """
    DEPRECATED: Send email for a specific case summary by summary_id
    This endpoint is kept for backward compatibility but is not actively used.
    New code should use /api/email/send-case-summary instead.
    """
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
        log_error_detailed(
            error=e,
            context="Error sending case summary email",
            extra_data={
                'endpoint': '/api/send-case-summary-email',
                'summary_id': summary_id if 'summary_id' in locals() else None
            }
        )
        return ErrorResponse.internal_error("Failed to send case summary email")

@app.route('/api/send-comprehensive-email', methods=['POST'])
def send_comprehensive_email():
    """Send comprehensive email with case summary and PDF attachments - main endpoint"""
    try:
        logger.info("Received comprehensive email request")
        data = request.get_json()
        
        if not data:
            logger.error("No JSON data received")
            return jsonify({'success': False, 'error': 'No data received'}), 400
        
        # Extract email from data (can be in email field or case_data)
        email = data.get('email') or data.get('user_email')
        case_data = data.get('case_data', {})
        
        # If case_data is provided, merge it with top-level data
        if case_data:
            email = email or case_data.get('email') or case_data.get('user_email')
            # Merge case_data into main data
            for key, value in case_data.items():
                if key not in data:
                    data[key] = value
        
        logger.info(f"Processing comprehensive email request for: {email}")
        
        if not email:
            logger.error("No email provided")
            return jsonify({'success': False, 'error': 'Email is required'}), 400
        
        # Validate email format
        email_result = validate_email(email)
        if not email_result['valid']:
            logger.error(f"Invalid email format: {email_result['error']}")
            return jsonify({'success': False, 'error': f'Invalid email: {email_result["error"]}'}), 400
        email = email_result['email']  # Use normalized email
        
        # Validate phone number if provided
        phone_number = data.get('phone_number', case_data.get('phone_number'))
        if phone_number:
            phone_result = validate_phone_number(phone_number)
            if not phone_result['valid']:
                logger.warning(f"Invalid phone number format: {phone_result['error']}")
                # Don't fail on invalid phone, just log it
            else:
                phone_number = phone_result['formatted']
        
        # Validate user name if provided
        user_name = data.get('user_name', case_data.get('user_name'))
        if user_name:
            name_result = validate_name(user_name)
            if not name_result['valid']:
                logger.warning(f"Invalid name format: {name_result['error']}")
                # Don't fail on invalid name, just sanitize it
            else:
                user_name = name_result['sanitized']
        
        # Prepare comprehensive case data for email (using validated values)
        comprehensive_case_data = {
            'user_email': email,  # Already validated and normalized
            'user_name': user_name or case_data.get('user_name', 'Court Kiosk User'),
            'case_type': data.get('case_type', case_data.get('case_type', 'Domestic Violence Restraining Order')),
            'priority_level': data.get('priority') or data.get('priority_level', case_data.get('priority') or case_data.get('priority_level', 'A')),
            'language': data.get('language', case_data.get('language', 'en')),
            'queue_number': data.get('queue_number', case_data.get('queue_number', 'N/A')),
            'documents_needed': data.get('forms', []) or data.get('documents_needed', []) or case_data.get('forms', []) or case_data.get('documents_needed', []),
            'next_steps': data.get('next_steps', []) or case_data.get('next_steps', []),
            'conversation_summary': data.get('summary', '') or case_data.get('summary', '') or case_data.get('conversation_summary', ''),
            'phone_number': phone_number or data.get('phone_number', case_data.get('phone_number'))
        }
        
        # Handle summary_json if provided
        if data.get('summary_json') or case_data.get('summary_json'):
            comprehensive_case_data['summary_json'] = data.get('summary_json') or case_data.get('summary_json')
        
        # Check if queue information should be included
        include_queue = data.get('include_queue', False)
        
        logger.info(f"Sending comprehensive email with case data: {comprehensive_case_data}")
        
        # Send comprehensive email using the email service
        result = email_service.send_case_email(comprehensive_case_data, include_queue)
        
        logger.info(f"Email service result: {result}")
        
        if result['success']:
            return jsonify({
                'success': True,
                'message': 'Case summary email sent successfully',
                'queue_number': comprehensive_case_data.get('queue_number', 'N/A'),
                'email_id': result.get('id')
            })
        else:
            logger.error(f"Email service failed: {result}")
            return jsonify({'success': False, 'error': result.get('error', 'Failed to send email')}), 500
            
    except Exception as e:
        logger.error(f"Error sending comprehensive email: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': f'Internal server error: {str(e)}'}), 500

@app.route('/api/send-summary', methods=['POST'])
def send_summary_email_endpoint():
    """
    DEPRECATED: Legacy endpoint - use /api/email/send-case-summary instead
    Kept for backward compatibility
    """
    try:
        data = request.get_json()
        email = data.get('email')
        answers = data.get('answers', {})
        forms = data.get('forms', [])
        summary = data.get('summary', '')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Use modern email service
        case_data = {
            'user_email': email,
            'user_name': answers.get('user_name', 'Court Kiosk User'),
            'case_type': 'DVRO',
            'priority_level': 'A',
            'language': 'en',
            'documents_needed': forms,
            'next_steps': [
                'Complete all required forms',
                'Make 3 copies of each form',
                'File forms with the court clerk',
                'Arrange for service of the other party',
                'Attend your court hearing'
            ],
            'conversation_summary': summary
        }
        
        result = email_service.send_case_email(case_data)
        
        if result.get('success'):
            return jsonify({
                'success': True,
                'message': 'Summary and forms sent successfully'
            })
        else:
            return jsonify({'error': result.get('error', 'Failed to send email')}), 500
            
    except Exception as e:
        log_error_detailed(
            error=e,
            context="Error sending summary email",
            extra_data={
                'endpoint': '/api/send-summary',
                'email': email if 'email' in locals() else None
            }
        )
        return ErrorResponse.internal_error("Failed to send summary email")

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
        log_error_detailed(
            error=e,
            context="Error in send_queue_number_sms",
            extra_data={
                'endpoint': '/api/sms/send-queue-number',
                'queue_number': queue_number if 'queue_number' in locals() else None
            }
        )
        return ErrorResponse.internal_error("Failed to send SMS")

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
        log_error_detailed(
            error=e,
            context="Error in login",
            extra_data={'endpoint': '/api/auth/login'}
        )
        return ErrorResponse.internal_error("Login failed. Please try again.")

@app.route('/api/auth/logout', methods=['POST'])
@AuthService.require_auth
def logout():
    """Logout endpoint"""
    try:
        session_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        result = AuthService.logout_user(session_token)
        return jsonify(result), 200
    except Exception as e:
        log_error_detailed(
            error=e,
            context="Error in logout",
            extra_data={'endpoint': '/api/auth/logout'}
        )
        return ErrorResponse.internal_error("Logout failed")

@app.route('/api/auth/me', methods=['GET'])
@AuthService.require_auth
def get_current_user():
    """Get current user information"""
    try:
        user = request.current_user
        return jsonify({'success': True, 'user': user.to_dict()}), 200
    except Exception as e:
        log_error_detailed(
            error=e,
            context="Error getting current user",
            extra_data={'endpoint': '/api/auth/me'}
        )
        return ErrorResponse.internal_error("Failed to retrieve user information")

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
        log_error_detailed(
            error=e,
            context="Error getting users",
            extra_data={'endpoint': '/api/auth/users'}
        )
        return ErrorResponse.internal_error("Failed to retrieve users")

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
        log_error_detailed(
            error=e,
            context="Error creating user",
            extra_data={'endpoint': '/api/auth/users'}
        )
        return ErrorResponse.internal_error("Failed to create user")

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
        log_error_detailed(
            error=e,
            context="Error getting audit logs",
            extra_data={'endpoint': '/api/auth/audit-logs'}
        )
        return ErrorResponse.internal_error("Failed to retrieve audit logs")

# =============================================================================
# PROTECTED ADMIN ENDPOINTS (require authentication)
# =============================================================================

@app.route('/api/admin/queue', methods=['GET'])
@AuthService.require_auth
@AuthService.require_admin_whitelist()  # Restrict to whitelisted admins only
def get_admin_queue():
    """Get queue data for admin dashboard (protected, whitelist only)"""
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
            # Parse documents_needed if it's a JSON string
            documents_needed = []
            if entry.documents_needed:
                try:
                    if isinstance(entry.documents_needed, str):
                        documents_needed = json.loads(entry.documents_needed)
                    else:
                        documents_needed = entry.documents_needed
                except:
                    documents_needed = []
            
            queue_data.append({
                'queue_number': entry.queue_number,
                'priority': entry.priority_level,
                'priority_level': entry.priority_level,  # Alias for compatibility
                'case_type': entry.case_type,
                'user_name': entry.user_name,
                'user_email': entry.user_email,
                'phone_number': entry.phone_number,
                'language': entry.language,
                'status': entry.status,
                'created_at': entry.created_at.isoformat() if entry.created_at else None,
                'arrived_at': entry.created_at.isoformat() if entry.created_at else None,
                'timestamp': entry.created_at.isoformat() if entry.created_at else None,
                'conversation_summary': entry.conversation_summary,
                'documents_needed': documents_needed,
                'current_node': entry.current_node,
                'estimated_wait_time': entry.estimated_wait_time
            })
        
        current_number = None
        if current_entry:
            # Parse documents_needed for current entry
            documents_needed = []
            if current_entry.documents_needed:
                try:
                    if isinstance(current_entry.documents_needed, str):
                        documents_needed = json.loads(current_entry.documents_needed)
                    else:
                        documents_needed = current_entry.documents_needed
                except:
                    documents_needed = []
            
            current_number = {
                'queue_number': current_entry.queue_number,
                'priority': current_entry.priority_level,
                'priority_level': current_entry.priority_level,
                'case_type': current_entry.case_type,
                'user_name': current_entry.user_name,
                'user_email': current_entry.user_email,
                'phone_number': current_entry.phone_number,
                'language': current_entry.language,
                'conversation_summary': current_entry.conversation_summary,
                'documents_needed': documents_needed,
                'current_node': current_entry.current_node,
                'created_at': current_entry.created_at.isoformat() if current_entry.created_at else None,
                'arrived_at': current_entry.created_at.isoformat() if current_entry.created_at else None,
                'timestamp': current_entry.created_at.isoformat() if current_entry.created_at else None
            }
        
        return jsonify({
            'success': True,
            'queue': queue_data,
            'current_number': current_number
        }), 200
        
    except Exception as e:
        log_error_detailed(
            error=e,
            context="Error in get_admin_queue",
            extra_data={'endpoint': '/api/admin/queue'}
        )
        return ErrorResponse.internal_error("Failed to retrieve queue data")

@app.route('/api/admin/call-next', methods=['POST'])
@AuthService.require_auth
@AuthService.require_admin_whitelist()  # Restrict to whitelisted admins only
def admin_call_next():
    """Call next case (protected) - returns comprehensive case information"""
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
        
        # Update status with proper transaction handling
        try:
            next_entry.status = 'in_progress'
            db.session.commit()
            
            # Broadcast queue update via WebSocket AFTER successful commit
            try:
                broadcast_queue_update()
            except Exception as broadcast_error:
                app.logger.error(
                    f"WebSocket broadcast failed: {str(broadcast_error)}",
                    exc_info=True,
                    extra={
                        'queue_number': next_entry.queue_number if 'next_entry' in locals() else None,
                        'error_type': type(broadcast_error).__name__
                    }
                )
                # Status update still succeeded
        except Exception as db_error:
            db.session.rollback()
            app.logger.error(
                f"Database error in admin_call_next: {str(db_error)}",
                exc_info=True,
                extra={
                    'endpoint': '/api/admin/call-next',
                    'error_type': type(db_error).__name__
                }
            )
            return ErrorResponse.internal_error("Failed to update queue status")
        
        # Parse documents_needed if it's a JSON string
        documents_needed = []
        if next_entry.documents_needed:
            try:
                if isinstance(next_entry.documents_needed, str):
                    documents_needed = json.loads(next_entry.documents_needed)
                else:
                    documents_needed = next_entry.documents_needed
            except:
                documents_needed = []
        
        # Get case type information
        case_type_info = None
        if next_entry.case_type:
            case_type_obj = CaseType.query.filter_by(code=next_entry.case_type, is_active=True).first()
            if case_type_obj:
                case_type_info = {
                    'name': case_type_obj.name,
                    'code': case_type_obj.code,
                    'description': case_type_obj.description,
                    'estimated_duration': case_type_obj.estimated_duration,
                    'required_forms': json.loads(case_type_obj.required_forms) if case_type_obj.required_forms else []
                }
        
        # Calculate wait time
        wait_time_minutes = 0
        if next_entry.created_at:
            from datetime import datetime
            wait_time = datetime.utcnow() - next_entry.created_at
            wait_time_minutes = int(wait_time.total_seconds() / 60)
        
        # Return comprehensive case information
        return jsonify({
            'success': True,
            'queue_entry': {
                'queue_number': next_entry.queue_number,
                'priority': next_entry.priority_level,
                'priority_level': next_entry.priority_level,  # Alias for compatibility
                'case_type': next_entry.case_type,
                'case_type_info': case_type_info,
                'user_name': next_entry.user_name,
                'user_email': next_entry.user_email,
                'phone_number': next_entry.phone_number,
                'language': next_entry.language,
                'status': next_entry.status,
                'conversation_summary': next_entry.conversation_summary,
                'documents_needed': documents_needed,
                'current_node': next_entry.current_node,
                'estimated_wait_time': next_entry.estimated_wait_time,
                'wait_time_minutes': wait_time_minutes,
                'created_at': next_entry.created_at.isoformat() if next_entry.created_at else None,
                'arrived_at': next_entry.created_at.isoformat() if next_entry.created_at else None,
                'timestamp': next_entry.created_at.isoformat() if next_entry.created_at else None
            }
        }), 200
        
    except Exception as e:
        log_error_detailed(
            error=e,
            context="Error in admin_call_next",
            extra_data={'endpoint': '/api/admin/call-next'}
        )
        return ErrorResponse.internal_error("An error occurred calling the next case")

@app.route('/api/admin/complete-case', methods=['POST'])
@AuthService.require_auth
@AuthService.require_admin_whitelist()  # Restrict to whitelisted admins only
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
        
        # Update status with proper transaction handling
        try:
            entry.status = 'completed'
            db.session.commit()
            
            # Broadcast queue update via WebSocket AFTER successful commit
            try:
                broadcast_queue_update()
            except Exception as broadcast_error:
                app.logger.error(
                    f"WebSocket broadcast failed: {str(broadcast_error)}",
                    exc_info=True,
                    extra={
                        'queue_number': queue_number,
                        'error_type': type(broadcast_error).__name__
                    }
                )
                # Status update still succeeded
            
            return jsonify({'success': True}), 200
        except Exception as db_error:
            db.session.rollback()
            app.logger.error(
                f"Database error in admin_complete_case: {str(db_error)}",
                exc_info=True,
                extra={
                    'endpoint': '/api/admin/complete-case',
                    'queue_number': queue_number,
                    'error_type': type(db_error).__name__
                }
            )
            return ErrorResponse.internal_error("Failed to complete case")
        
    except Exception as e:
        log_error_detailed(
            error=e,
            context="Error in admin_complete_case",
            extra_data={
                'endpoint': '/api/admin/complete-case',
                'queue_number': queue_number if 'queue_number' in locals() else None
            }
        )
        return ErrorResponse.internal_error("An error occurred completing the case")

# =============================================================================
# WEBSOCKET HANDLERS FOR REAL-TIME UPDATES
# =============================================================================

def broadcast_queue_update():
    """Broadcast queue updates to all connected WebSocket clients"""
    try:
        # Get current queue state
        queue_entries = QueueEntry.query.filter_by(status='waiting').order_by(QueueEntry.priority_level, QueueEntry.created_at).all()
        current_entry = QueueEntry.query.filter_by(status='in_progress').first()
        
        queue_data = []
        for entry in queue_entries:
            documents_needed = []
            if entry.documents_needed:
                try:
                    if isinstance(entry.documents_needed, str):
                        documents_needed = json.loads(entry.documents_needed)
                    else:
                        documents_needed = entry.documents_needed
                except:
                    documents_needed = []
            
            queue_data.append({
                'queue_number': entry.queue_number,
                'priority': entry.priority_level,
                'priority_level': entry.priority_level,
                'case_type': entry.case_type,
                'user_name': entry.user_name,
                'user_email': entry.user_email,
                'phone_number': entry.phone_number,
                'language': entry.language,
                'status': entry.status,
                'created_at': entry.created_at.isoformat() if entry.created_at else None,
                'arrived_at': entry.created_at.isoformat() if entry.created_at else None,
                'timestamp': entry.created_at.isoformat() if entry.created_at else None,
                'conversation_summary': entry.conversation_summary,
                'documents_needed': documents_needed,
                'current_node': entry.current_node,
            })
        
        current_number = None
        if current_entry:
            documents_needed = []
            if current_entry.documents_needed:
                try:
                    if isinstance(current_entry.documents_needed, str):
                        documents_needed = json.loads(current_entry.documents_needed)
                    else:
                        documents_needed = current_entry.documents_needed
                except:
                    documents_needed = []
            
            current_number = {
                'queue_number': current_entry.queue_number,
                'priority': current_entry.priority_level,
                'priority_level': current_entry.priority_level,
                'case_type': current_entry.case_type,
                'user_name': current_entry.user_name,
                'user_email': current_entry.user_email,
                'phone_number': current_entry.phone_number,
                'language': current_entry.language,
                'conversation_summary': current_entry.conversation_summary,
                'documents_needed': documents_needed,
                'current_node': current_entry.current_node,
                'created_at': current_entry.created_at.isoformat() if current_entry.created_at else None,
                'arrived_at': current_entry.created_at.isoformat() if current_entry.created_at else None,
                'timestamp': current_entry.created_at.isoformat() if current_entry.created_at else None
            }
        
        # Broadcast to all clients in the 'queue' room
        socketio.emit('queue_update', {
            'type': 'queue_update',
            'queue': queue_data,
            'current_number': current_number
        }, room='queue', namespace='/api/ws/queue')
    except Exception as e:
        app.logger.error(
            f"Error broadcasting queue update: {str(e)}",
            exc_info=True,
            extra={'error_type': type(e).__name__}
        )

@socketio.on('connect', namespace='/api/ws/queue')
def handle_connect():
    """Handle WebSocket connection"""
    try:
        join_room('queue')
        app.logger.info(f"Client connected to WebSocket: {request.sid}")
        # Send initial queue state
        broadcast_queue_update()
    except Exception as e:
        app.logger.error(
            f"WebSocket connect error: {str(e)}",
            exc_info=True,
            extra={'error_type': type(e).__name__}
        )

@socketio.on('disconnect', namespace='/api/ws/queue')
def handle_disconnect():
    """Handle WebSocket disconnection"""
    try:
        leave_room('queue')
        app.logger.info(f"Client disconnected from WebSocket: {request.sid}")
    except Exception as e:
        app.logger.error(
            f"WebSocket disconnect error: {str(e)}",
            exc_info=True,
            extra={'error_type': type(e).__name__}
        )

@socketio.on('request_update', namespace='/api/ws/queue')
def handle_request_update():
    """Handle client request for queue update"""
    try:
        broadcast_queue_update()
    except Exception as e:
        app.logger.error(
            f"WebSocket request update error: {str(e)}",
            exc_info=True,
            extra={'error_type': type(e).__name__}
        )

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Create default admin user if none exists
        if not User.query.filter_by(username='admin').first():
            try:
                admin_user = User(
                    username='admin',
                    email='admin@court.gov',
                    role='admin'
                )
                admin_user.set_password('admin123')  # Change this in production!
                db.session.add(admin_user)
                db.session.commit()
                print("Created default admin user: admin/admin123")
            except Exception as e:
                db.session.rollback()
                app.logger.error(
                    f"Failed to create default admin user: {str(e)}",
                    exc_info=True,
                    extra={'error_type': type(e).__name__}
                )

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
        log_error_detailed(
            error=e,
            context="Error fetching case summary",
            extra_data={'summary_id': summary_id}
        )
        return ErrorResponse.internal_error("Failed to retrieve case summary")

@app.route('/api/case-details/<int:queue_number>', methods=['GET'])
def get_case_details(queue_number):
    """Get comprehensive case details by queue number"""
    try:
        # Find case by queue number
        queue_entry = QueueEntry.query.filter_by(queue_number=queue_number).first()
        if not queue_entry:
            return jsonify({'error': 'Case not found'}), 404
        
        # Get case summary if available (QueueEntry doesn't have summary_id, but we can search by queue_number)
        case_summary = None
        # Try to find case summary by queue number or other identifiers
        if queue_entry.user_email:
            case_summary = CaseSummary.query.filter_by(
                user_email=queue_entry.user_email
            ).order_by(CaseSummary.created_at.desc()).first()
        
        # Parse documents_needed if it's a JSON string
        documents_needed = []
        if queue_entry.documents_needed:
            try:
                if isinstance(queue_entry.documents_needed, str):
                    documents_needed = json.loads(queue_entry.documents_needed)
                else:
                    documents_needed = queue_entry.documents_needed
            except:
                documents_needed = []
        
        # Build comprehensive case details
        case_details = {
            'queue_number': queue_entry.queue_number,
            'case_type': queue_entry.case_type,
            'priority': queue_entry.priority_level,
            'priority_level': queue_entry.priority_level,
            'status': queue_entry.status,
            'language': queue_entry.language,
            'user_name': queue_entry.user_name,
            'user_email': queue_entry.user_email,
            'phone_number': queue_entry.phone_number,
            'created_at': queue_entry.created_at.isoformat() if queue_entry.created_at else None,
            'updated_at': queue_entry.updated_at.isoformat() if queue_entry.updated_at else None,
            'conversation_summary': queue_entry.conversation_summary,
            'documents_needed': documents_needed,
            'current_node': queue_entry.current_node,
            'estimated_wait_time': queue_entry.estimated_wait_time
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
        log_error_detailed(
            error=e,
            context="Error fetching case details",
            extra_data={'queue_number': queue_number}
        )
        return ErrorResponse.internal_error("Failed to retrieve case details")

# =============================================================================
# GLOBAL ERROR HANDLERS
# =============================================================================

@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors"""
    logger.warning(f"404 Not Found: {request.path}")
    return ErrorResponse.not_found(f"The requested URL was not found: {request.path}")

@app.errorhandler(405)
def method_not_allowed_error(error):
    """Handle 405 errors"""
    logger.warning(
        f"405 Method Not Allowed: {request.method} {request.path}",
        extra={
            'method': request.method,
            'path': request.path
        }
    )
    return jsonify({
        'success': False,
        'error': f"Method {request.method} not allowed for this endpoint",
        'code': 'METHOD_NOT_ALLOWED'
    }), 405

@app.errorhandler(500)
def internal_error_handler(error):
    """Handle 500 errors"""
    logger.error(
        f"500 Internal Server Error: {str(error)}",
        exc_info=True,
        extra={
            'endpoint': request.endpoint,
            'path': request.path
        }
    )
    return ErrorResponse.internal_error()

@app.errorhandler(Exception)
def handle_unexpected_error(error):
    """Catch-all for unexpected errors"""
    log_error_detailed(
        error=error,
        context="Unhandled exception",
        extra_data={
            'endpoint': request.endpoint if request else None,
            'method': request.method if request else None,
            'path': request.path if request else None
        }
    )
    return ErrorResponse.internal_error()

# Run with SocketIO support
if __name__ == '__main__':
    socketio.run(app, debug=False, port=5001, host='0.0.0.0')