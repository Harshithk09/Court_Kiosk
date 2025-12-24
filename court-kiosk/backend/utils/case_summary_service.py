import json
import random
from typing import Dict, List, Optional
from datetime import datetime
from models import db, CaseSummary, QueueTicket
from utils.email_service import EmailService

class CaseSummaryService:
    """Service for managing case summaries and queue integration"""
    
    def __init__(self):
        self.email_service = EmailService()
    
    def extract_required_forms(self, flow_data: Dict, answers: Dict) -> List[str]:
        """Extract required forms from flow data and user answers"""
        forms = set()
        
        # Extract forms from flow nodes
        if 'nodes' in flow_data:
            for node_id, node_data in flow_data['nodes'].items():
                if node_id in answers:
                    # Check if node has forms_add property
                    if hasattr(node_data, 'get') and node_data.get('forms_add'):
                        forms.update(node_data['forms_add'])
        
        # Add forms based on user answers
        if answers.get('children') == 'yes':
            forms.update(['DV-105', 'DV-140'])
        
        if answers.get('support') and answers['support'] != 'none':
            forms.add('FL-150')
        
        if answers.get('abduction_check') == 'yes':
            forms.update(['DV-108', 'DV-145'])
        
        if answers.get('firearms') == 'yes':
            forms.add('DV-800')
        
        # Always add core DVRO forms
        core_forms = ['DV-100', 'CLETS-001', 'DV-109', 'DV-110', 'DV-200']
        forms.update(core_forms)
        
        return list(forms)
    
    def generate_next_steps(self, flow_type: str, answers: Dict) -> List[Dict]:
        """Generate next steps based on case type and user answers"""
        if flow_type == 'DVRO':
            steps = [
                {
                    "action": "Take these forms to the Clerk's Office (Room 101)",
                    "priority": "high",
                    "timeline": "Today or as soon as possible",
                    "details": "Bring your photo ID and this summary"
                },
                {
                    "action": "The clerk will schedule a hearing within 3 days",
                    "priority": "high", 
                    "timeline": "Within 3 business days",
                    "details": "You'll receive notice of your court date"
                },
                {
                    "action": "Serve the other party with your papers",
                    "priority": "high",
                    "timeline": "Before your court hearing",
                    "details": "Use a process server, sheriff, or someone 18+ (not you)"
                },
                {
                    "action": "File proof of service with the court",
                    "priority": "high",
                    "timeline": "After serving papers",
                    "details": "Required for your case to proceed"
                },
                {
                    "action": "Attend your court hearing",
                    "priority": "critical",
                    "timeline": "On the date listed in your papers",
                    "details": "Bring all evidence (photos, texts, emails, witnesses)"
                }
            ]
            
            # Add specific steps based on answers
            if answers.get('children') == 'yes':
                steps.append({
                    "action": "Prepare child custody and visitation information",
                    "priority": "medium",
                    "timeline": "Before your hearing",
                    "details": "Gather school records, medical records, and any relevant documentation"
                })
            
            if answers.get('support') and answers['support'] != 'none':
                steps.append({
                    "action": "Gather income and expense documentation",
                    "priority": "medium", 
                    "timeline": "Before your hearing",
                    "details": "Pay stubs, tax returns, bank statements, bills"
                })
            
            return steps
        
        elif flow_type == 'Civil':
            return [
                {
                    "action": "Complete all required forms",
                    "priority": "high",
                    "timeline": "Before filing",
                    "details": "Make sure all information is accurate and complete"
                },
                {
                    "action": "Make copies of all documents",
                    "priority": "high",
                    "timeline": "Before filing",
                    "details": "Original + 2 copies for court records"
                },
                {
                    "action": "File forms with the court clerk",
                    "priority": "high",
                    "timeline": "As soon as possible",
                    "details": "Pay filing fee or request fee waiver if eligible"
                },
                {
                    "action": "Serve the other party",
                    "priority": "high",
                    "timeline": "After filing",
                    "details": "Use proper service methods as required by law"
                },
                {
                    "action": "Attend your court hearing",
                    "priority": "critical",
                    "timeline": "On scheduled date",
                    "details": "Bring evidence and witnesses"
                }
            ]
        
        else:
            return [
                {
                    "action": "Complete all required forms",
                    "priority": "high",
                    "timeline": "Before filing",
                    "details": "Ensure accuracy and completeness"
                },
                {
                    "action": "File with the court",
                    "priority": "high", 
                    "timeline": "As soon as possible",
                    "details": "Submit to clerk's office with required fees"
                },
                {
                    "action": "Serve the other party",
                    "priority": "high",
                    "timeline": "After filing",
                    "details": "Follow proper service requirements"
                },
                {
                    "action": "Attend your hearing",
                    "priority": "critical",
                    "timeline": "On scheduled date",
                    "details": "Bring all relevant documentation"
                }
            ]
    
    def generate_form_descriptions(self, forms: List[str]) -> List[Dict]:
        """Generate form descriptions with titles"""
        form_descriptions = {
            'DV-100': 'Request for Domestic Violence Restraining Order',
            'DV-105': 'Request for Child Custody and Visitation',
            'DV-109': 'Notice of Court Hearing',
            'DV-110': 'Temporary Restraining Order',
            'DV-200': 'Proof of Service',
            'DV-140': 'Child Custody and Visitation Order',
            'DV-108': 'Request for Child Abduction Prevention',
            'DV-145': 'Child Abduction Prevention Order',
            'DV-800': 'Firearms Restraining Order',
            'FL-150': 'Income and Expense Declaration',
            'CLETS-001': 'CLETS Information Form'
        }
        
        return [
            {
                "form_code": form,
                "title": form_descriptions.get(form, f"{form} Form"),
                "description": f"Required for your case type"
            }
            for form in forms
        ]
    
    def generate_key_answers_summary(self, flow_type: str, answers: Dict) -> List[str]:
        """Generate summary of key answers provided by user"""
        key_points = []
        
        if flow_type == 'DVRO':
            if answers.get('DVCheck1') == 'Yes':
                key_points.append("You requested a domestic violence restraining order")
            
            if answers.get('children') == 'yes':
                key_points.append("You indicated you share a child with the respondent")
            
            if answers.get('support') and answers['support'] != 'none':
                support_type = answers['support'].replace('_', ' ').title()
                key_points.append(f"You requested {support_type} support")
            
            if answers.get('firearms') == 'yes':
                key_points.append("You indicated firearms are involved in your case")
            
            if answers.get('abduction_check') == 'yes':
                key_points.append("You requested child abduction prevention measures")
        
        return key_points
    
    def get_court_resources(self) -> Dict:
        """Get court contact information and resources"""
        return {
            "court_info": {
                "name": "San Mateo County Superior Court",
                "address": "400 County Center, Redwood City, CA 94063",
                "phone": "(650) 261-5100",
                "hours": "Monday-Friday, 8:00 AM - 4:00 PM"
            },
            "self_help_center": {
                "phone": "(650) 261-5100 ext. 2",
                "hours": "Monday-Friday, 8:30 AM - 12:00 PM",
                "location": "Room 101, First Floor"
            },
            "legal_aid": {
                "phone": "(650) 558-0915",
                "name": "Legal Aid Society of San Mateo County"
            },
            "emergency": {
                "phone": "911",
                "text": "For immediate danger, call 911"
            }
        }
    
    def create_case_summary(self, 
                          flow_type: str,
                          answers: Dict,
                          flow_data: Dict,
                          user_email: str = None,
                          user_name: str = None,
                          language: str = 'en') -> CaseSummary:
        """Create a comprehensive case summary with enhanced user-friendly format"""
        
        # Generate session ID for tracking (not a case number)
        session_id = f"K{random.randint(10000, 99999)}"
        
        # Extract required forms
        required_forms = self.extract_required_forms(flow_data, answers)
        
        # Generate enhanced summary components
        form_descriptions = self.generate_form_descriptions(required_forms)
        next_steps = self.generate_next_steps(flow_type, answers)
        key_answers = self.generate_key_answers_summary(flow_type, answers)
        court_resources = self.get_court_resources()
        
        # Create enhanced summary JSON
        summary_json = {
            'header': {
                'case_type': flow_type,
                'date': datetime.utcnow().strftime('%B %d, %Y at %I:%M %p'),
                'location': 'San Mateo County Superior Court Kiosk',
                'session_id': session_id
            },
            'user_information': {
                'name': user_name or 'Not provided',
                'email': user_email or 'Not provided',
                'language': language.upper()
            },
            'forms_completed': form_descriptions,
            'key_answers': key_answers,
            'next_steps': next_steps,
            'resources': court_resources,
            'disclaimer': 'This summary is for informational purposes only and does not constitute legal advice. Please consult with an attorney for legal guidance.',
            'created_at': datetime.utcnow().isoformat(),
            'language': language
        }
        
        # Create case summary record (using session_id as case_number for database compatibility)
        try:
            case_summary = CaseSummary(
                case_number=session_id,  # Using session_id instead of case number
                flow_type=flow_type,
                summary_json=json.dumps(summary_json),
                required_forms=json.dumps(required_forms),
                next_steps=json.dumps(next_steps),
                user_email=user_email,
                user_name=user_name,
                language=language
            )
            
            db.session.add(case_summary)
            db.session.commit()
            
            return case_summary
        except Exception as e:
            db.session.rollback()
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to create case summary: {e}")
            raise
    
    def save_summary_and_maybe_queue(self,
                                   flow_type: str,
                                   answers: Dict,
                                   flow_data: Dict,
                                   user_email: str = None,
                                   user_name: str = None,
                                   language: str = 'en',
                                   join_queue: bool = False) -> Dict:
        """Save case summary and optionally create queue ticket"""
        
        # Create case summary
        case_summary = self.create_case_summary(
            flow_type=flow_type,
            answers=answers,
            flow_data=flow_data,
            user_email=user_email,
            user_name=user_name,
            language=language
        )
        
        result = {
            'summary_id': case_summary.id,
            'case_number': case_summary.case_number,
            'queue_number': None
        }
        
        # Create queue ticket if requested
        if join_queue:
            queue_ticket = self.create_queue_ticket(case_summary.id)
            result['queue_number'] = queue_ticket.position
        
        return result
    
    def create_queue_ticket(self, summary_id: int) -> QueueTicket:
        """Create a queue ticket for a case summary"""
        
        # Get next position number
        last_ticket = QueueTicket.query.order_by(QueueTicket.position.desc()).first()
        next_position = (last_ticket.position + 1) if last_ticket else 1
        
        # Create queue ticket with proper transaction handling
        try:
            queue_ticket = QueueTicket(
                summary_id=summary_id,
                position=next_position,
                status='waiting'
            )
            
            db.session.add(queue_ticket)
            db.session.commit()
            
            return queue_ticket
        except Exception as e:
            db.session.rollback()
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to create queue ticket: {e}")
            raise
    
    def send_summary_email(self, case_summary: CaseSummary) -> Dict:
        """Send detailed summary email with hyperlinked forms"""
        
        if not case_summary.user_email:
            return {
                'success': False,
                'error': 'No email address provided for case summary'
            }
        
        # Generate email payload
        summary_data = case_summary.to_dict()
        payload = self.email_service.generate_case_summary_payload(
            summary_data, 
            case_summary.user_email
        )
        
        # Send email
        return self.email_service.send_summary_email(payload)
    
    def get_queue_with_summaries(self, status: str = 'waiting') -> List[Dict]:
        """Get queue tickets with joined case summaries"""
        
        query = QueueTicket.query.filter_by(status=status)
        
        if status == 'waiting':
            query = query.order_by(QueueTicket.position.asc())
        else:
            query = query.order_by(QueueTicket.updated_at.desc())
        
        tickets = query.all()
        
        return [ticket.to_dict() for ticket in tickets]
    
    def get_case_summary_by_id(self, summary_id: int) -> Optional[Dict]:
        """Get case summary by ID"""
        summary = CaseSummary.query.get(summary_id)
        return summary.to_dict() if summary else None
    
    def update_queue_ticket_status(self, ticket_id: int, status: str, facilitator_id: int = None) -> bool:
        """Update queue ticket status"""
        try:
            ticket = QueueTicket.query.get(ticket_id)
            if not ticket:
                return False
            
            ticket.status = status
            if facilitator_id:
                ticket.facilitator_id = facilitator_id
            ticket.updated_at = datetime.utcnow()
            
            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error updating queue ticket {ticket_id}: {e}")
            return False
