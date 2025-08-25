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
    
    def generate_next_steps(self, flow_type: str, answers: Dict) -> List[str]:
        """Generate next steps based on case type and user answers"""
        if flow_type == 'DVRO':
            steps = [
                "Fill out all required forms completely",
                "Make 3 copies of each form (original + 2 copies)",
                "Serve the other party with your papers",
                "Use a process server, sheriff, or someone 18+ (not you)",
                "File proof of service with the court",
                "Attend your court hearing on the scheduled date",
                "Bring all evidence (photos, texts, emails, witnesses)",
                "Dress appropriately for court"
            ]
            
            # Add specific steps based on answers
            if answers.get('children') == 'yes':
                steps.append("Prepare child custody and visitation information")
            
            if answers.get('support') and answers['support'] != 'none':
                steps.append("Gather income and expense documentation")
            
            return steps
        
        elif flow_type == 'Civil':
            return [
                "Complete all required forms",
                "Make copies of all documents",
                "File forms with the court clerk",
                "Pay filing fee or request fee waiver",
                "Serve the other party",
                "Attend your court hearing",
                "Bring evidence and witnesses"
            ]
        
        else:
            return [
                "Complete all required forms",
                "File with the court",
                "Serve the other party",
                "Attend your hearing"
            ]
    
    def create_case_summary(self, 
                          flow_type: str,
                          answers: Dict,
                          flow_data: Dict,
                          user_email: str = None,
                          user_name: str = None,
                          language: str = 'en') -> CaseSummary:
        """Create a comprehensive case summary"""
        
        # Generate case number
        case_number = f"{flow_type}{random.randint(1000, 9999)}"
        
        # Extract required forms
        required_forms = self.extract_required_forms(flow_data, answers)
        
        # Generate next steps
        next_steps = self.generate_next_steps(flow_type, answers)
        
        # Create summary JSON
        summary_json = {
            'flow_type': flow_type,
            'answers': answers,
            'case_number': case_number,
            'required_forms': required_forms,
            'next_steps': next_steps,
            'created_at': datetime.utcnow().isoformat(),
            'language': language
        }
        
        # Create case summary record
        case_summary = CaseSummary(
            case_number=case_number,
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
        
        # Create queue ticket
        queue_ticket = QueueTicket(
            summary_id=summary_id,
            position=next_position,
            status='waiting'
        )
        
        db.session.add(queue_ticket)
        db.session.commit()
        
        return queue_ticket
    
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
            print(f"Error updating queue ticket: {e}")
            return False
