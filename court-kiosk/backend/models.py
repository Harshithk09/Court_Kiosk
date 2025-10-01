from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json
import hashlib
import secrets

db = SQLAlchemy()

class CaseSummary(db.Model):
    """One row per finished flow - stores comprehensive case information"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(255), nullable=True)  # Optional user identifier
    case_number = db.Column(db.String(50), nullable=True)  # Optional until known
    flow_type = db.Column(db.String(50), nullable=False)  # e.g. 'DVRO', 'Civil', etc.
    summary_json = db.Column(db.Text, nullable=False)  # JSON string with all case details
    required_forms = db.Column(db.Text, nullable=True)  # JSON array of form codes
    next_steps = db.Column(db.Text, nullable=True)  # JSON array of next steps
    user_email = db.Column(db.String(255), nullable=True)
    user_name = db.Column(db.String(255), nullable=True)
    language = db.Column(db.String(10), default='en')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'case_number': self.case_number,
            'flow_type': self.flow_type,
            'summary_json': json.loads(self.summary_json) if self.summary_json else {},
            'required_forms': json.loads(self.required_forms) if self.required_forms else [],
            'next_steps': json.loads(self.next_steps) if self.next_steps else [],
            'user_email': self.user_email,
            'user_name': self.user_name,
            'language': self.language,
            'created_at': self.created_at.isoformat()
        }

class User(db.Model):
    """Admin users for the court kiosk system"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='admin')  # admin, facilitator, viewer
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    def set_password(self, password):
        """Hash and set password"""
        salt = secrets.token_hex(16)
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        self.password_hash = f"{salt}:{password_hash.hex()}"
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        if not self.password_hash or ':' not in self.password_hash:
            return False
        salt, stored_hash = self.password_hash.split(':')
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return password_hash.hex() == stored_hash
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class UserSession(db.Model):
    """Active user sessions for authentication"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    session_token = db.Column(db.String(255), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    
    def is_expired(self):
        return datetime.utcnow() > self.expires_at
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_token': self.session_token,
            'expires_at': self.expires_at.isoformat(),
            'created_at': self.created_at.isoformat(),
            'ip_address': self.ip_address
        }

class AuditLog(db.Model):
    """Audit log for tracking admin actions"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False)  # login, logout, complete_case, send_email, etc.
    resource_type = db.Column(db.String(50), nullable=True)  # case, queue, user, etc.
    resource_id = db.Column(db.String(50), nullable=True)  # ID of the affected resource
    details = db.Column(db.Text, nullable=True)  # JSON string with additional details
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'details': json.loads(self.details) if self.details else None,
            'ip_address': self.ip_address,
            'timestamp': self.timestamp.isoformat()
        }

class QueueTicket(db.Model):
    """One row per person waiting for help - references case summary"""
    id = db.Column(db.Integer, primary_key=True)
    summary_id = db.Column(db.Integer, db.ForeignKey('case_summary.id'), nullable=False)
    status = db.Column(db.String(50), default='waiting')  # waiting, serving, done, no_show
    position = db.Column(db.Integer, nullable=False)  # Simple visible queue number
    priority_level = db.Column(db.String(10), default='C')  # A, B, C, D
    facilitator_id = db.Column(db.Integer, nullable=True)  # Removed FK constraint for now
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to case summary
    case_summary = db.relationship('CaseSummary', backref='queue_tickets')
    
    def to_dict(self):
        return {
            'id': self.id,
            'summary_id': self.summary_id,
            'status': self.status,
            'position': self.position,
            'priority_level': self.priority_level,
            'facilitator_id': self.facilitator_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'case_summary': self.case_summary.to_dict() if self.case_summary else None
        }

class QueueEntry(db.Model):
    """Queue entry for court cases with priority-based ordering"""
    id = db.Column(db.Integer, primary_key=True)
    queue_number = db.Column(db.String(20), unique=True, nullable=False)
    priority_level = db.Column(db.String(10), nullable=False)  # A, B, C, D
    priority_number = db.Column(db.Integer, nullable=False)  # Sequential number within priority
    case_type = db.Column(db.String(100), nullable=False)  # DVRO, Civil, etc.
    user_name = db.Column(db.String(255), nullable=True)
    user_email = db.Column(db.String(255), nullable=True)
    phone_number = db.Column(db.String(50), nullable=True)
    language = db.Column(db.String(10), default='en')
    status = db.Column(db.String(50), default='waiting')  # waiting, in_progress, completed, cancelled
    current_node = db.Column(db.String(100), nullable=True)
    conversation_summary = db.Column(db.Text, nullable=True)
    documents_needed = db.Column(db.Text, nullable=True)
    estimated_wait_time = db.Column(db.Integer, nullable=True)  # in minutes
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)  # Renamed from created_at for consistency
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    facilitator_notes = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'queue_number': self.queue_number,
            'priority_level': self.priority_level,
            'priority_number': self.priority_number,
            'case_type': self.case_type,
            'user_name': self.user_name,
            'user_email': self.user_email,
            'phone_number': self.phone_number,
            'language': self.language,
            'status': self.status,
            'current_node': self.current_node,
            'conversation_summary': self.conversation_summary,
            'documents_needed': json.loads(self.documents_needed) if self.documents_needed else [],
            'estimated_wait_time': self.estimated_wait_time,
            'timestamp': self.timestamp.isoformat(),  # Updated to use timestamp
            'updated_at': self.updated_at.isoformat(),
            'facilitator_notes': self.facilitator_notes
        }

class FlowProgress(db.Model):
    """Track user progress through flowchart nodes"""
    id = db.Column(db.Integer, primary_key=True)
    queue_entry_id = db.Column(db.Integer, db.ForeignKey('queue_entry.id'), nullable=False)
    node_id = db.Column(db.String(100), nullable=False)
    node_text = db.Column(db.Text, nullable=False)
    user_response = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'queue_entry_id': self.queue_entry_id,
            'node_id': self.node_id,
            'node_text': self.node_text,
            'user_response': self.user_response,
            'timestamp': self.timestamp.isoformat()
        }

class FacilitatorCase(db.Model):
    """Cases assigned to facilitators for review"""
    id = db.Column(db.Integer, primary_key=True)
    queue_entry_id = db.Column(db.Integer, db.ForeignKey('queue_entry.id'), nullable=False)
    facilitator_id = db.Column(db.Integer, db.ForeignKey('facilitator.id'), nullable=True)
    status = db.Column(db.String(50), default='pending')  # pending, assigned, reviewed, completed
    priority_notes = db.Column(db.Text, nullable=True)
    recommended_forms = db.Column(db.Text, nullable=True)
    next_steps = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'queue_entry_id': self.queue_entry_id,
            'facilitator_id': self.facilitator_id,
            'status': self.status,
            'priority_notes': self.priority_notes,
            'recommended_forms': json.loads(self.recommended_forms) if self.recommended_forms else [],
            'next_steps': self.next_steps,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Facilitator(db.Model):
    """Facilitator staff members"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone = db.Column(db.String(50), nullable=True)
    languages = db.Column(db.Text, nullable=True)  # JSON array of languages
    specialties = db.Column(db.Text, nullable=True)  # JSON array of case types
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'languages': json.loads(self.languages) if self.languages else [],
            'specialties': json.loads(self.specialties) if self.specialties else [],
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }

class CaseType(db.Model):
    """Different types of cases with priority levels"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), unique=True, nullable=False)
    priority_level = db.Column(db.String(10), nullable=False)  # A, B, C, D
    description = db.Column(db.Text, nullable=True)
    estimated_duration = db.Column(db.Integer, nullable=True)  # in minutes
    required_forms = db.Column(db.Text, nullable=True)  # JSON array
    flowchart_file = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'code': self.code,
            'priority_level': self.priority_level,
            'description': self.description,
            'estimated_duration': self.estimated_duration,
            'required_forms': json.loads(self.required_forms) if self.required_forms else [],
            'flowchart_file': self.flowchart_file,
            'is_active': self.is_active
        }
