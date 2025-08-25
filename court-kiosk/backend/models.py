from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

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

class QueueTicket(db.Model):
    """One row per person waiting for help - references case summary"""
    id = db.Column(db.Integer, primary_key=True)
    summary_id = db.Column(db.Integer, db.ForeignKey('case_summary.id'), nullable=False)
    status = db.Column(db.String(50), default='waiting')  # waiting, serving, done, no_show
    position = db.Column(db.Integer, nullable=False)  # Simple visible queue number
    priority_level = db.Column(db.String(10), default='C')  # A, B, C, D
    facilitator_id = db.Column(db.Integer, db.ForeignKey('facilitator.id'), nullable=True)
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
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
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
            'created_at': self.created_at.isoformat(),
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
