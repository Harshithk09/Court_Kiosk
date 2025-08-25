from datetime import datetime, timedelta
import json
from models import db, QueueEntry, FlowProgress, FacilitatorCase, CaseType
from openai import OpenAI
import os

class QueueManager:
    def __init__(self, openai_client=None):
        self.client = openai_client or OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
    def generate_queue_number(self, priority_level, case_type):
        """Generate a queue number in format: A001, B002, etc."""
        # Get the next number for this priority level
        last_entry = QueueEntry.query.filter_by(priority_level=priority_level).order_by(QueueEntry.priority_number.desc()).first()
        next_number = 1 if not last_entry else last_entry.priority_number + 1
        
        return f"{priority_level}{next_number:03d}"
    
    def add_to_queue(self, case_type, user_name=None, user_email=None, phone_number=None, language='en'):
        """Add a new case to the queue with appropriate priority"""
        # Get case type info
        case_info = CaseType.query.filter_by(code=case_type, is_active=True).first()
        if not case_info:
            raise ValueError(f"Unknown case type: {case_type}")
        
        priority_level = case_info.priority_level
        queue_number = self.generate_queue_number(priority_level, case_type)
        
        # Calculate estimated wait time based on queue position
        wait_time = self.calculate_wait_time(priority_level)
        
        # Create queue entry
        queue_entry = QueueEntry(
            queue_number=queue_number,
            priority_level=priority_level,
            priority_number=self.get_next_priority_number(priority_level),
            case_type=case_type,
            user_name=user_name,
            user_email=user_email,
            phone_number=phone_number,
            language=language,
            estimated_wait_time=wait_time
        )
        
        db.session.add(queue_entry)
        db.session.commit()
        
        return queue_entry
    
    def get_next_priority_number(self, priority_level):
        """Get the next sequential number for a priority level"""
        last_entry = QueueEntry.query.filter_by(priority_level=priority_level).order_by(QueueEntry.priority_number.desc()).first()
        return 1 if not last_entry else last_entry.priority_number + 1
    
    def calculate_wait_time(self, priority_level):
        """Calculate estimated wait time based on priority and current queue"""
        # Base times per priority level (in minutes)
        base_times = {
            'A': 15,  # DV cases - highest priority
            'B': 30,  # Civil harassment, elder abuse
            'C': 45,  # Workplace violence, other restraining orders
            'D': 60   # General questions, form assistance
        }
        
        # Count people ahead in same or higher priority
        ahead_count = QueueEntry.query.filter(
            QueueEntry.status == 'waiting',
            QueueEntry.priority_level <= priority_level
        ).count()
        
        base_time = base_times.get(priority_level, 30)
        return base_time + (ahead_count * 5)  # 5 minutes per person ahead
    
    def get_queue_status(self):
        """Get current queue status for display"""
        waiting = QueueEntry.query.filter_by(status='waiting').order_by(
            QueueEntry.priority_level,
            QueueEntry.priority_number
        ).all()
        
        in_progress = QueueEntry.query.filter_by(status='in_progress').all()
        
        return {
            'waiting': [entry.to_dict() for entry in waiting],
            'in_progress': [entry.to_dict() for entry in in_progress],
            'total_waiting': len(waiting),
            'total_in_progress': len(in_progress)
        }
    
    def update_progress(self, queue_number, node_id, node_text, user_response=None):
        """Update user progress through the flowchart"""
        queue_entry = QueueEntry.query.filter_by(queue_number=queue_number).first()
        if not queue_entry:
            raise ValueError(f"Queue entry not found: {queue_number}")
        
        # Update current node
        queue_entry.current_node = node_id
        queue_entry.status = 'in_progress'
        queue_entry.updated_at = datetime.utcnow()
        
        # Record progress
        progress = FlowProgress(
            queue_entry_id=queue_entry.id,
            node_id=node_id,
            node_text=node_text,
            user_response=user_response
        )
        
        db.session.add(progress)
        db.session.commit()
        
        return queue_entry
    
    def generate_summary(self, queue_number):
        """Generate a summary of the user's progress for facilitators"""
        queue_entry = QueueEntry.query.filter_by(queue_number=queue_number).first()
        if not queue_entry:
            raise ValueError(f"Queue entry not found: {queue_number}")
        
        # Get all progress entries
        progress_entries = FlowProgress.query.filter_by(queue_entry_id=queue_entry.id).order_by(FlowProgress.timestamp).all()
        
        if not progress_entries:
            return "No progress recorded yet."
        
        # Create a summary using LLM
        progress_text = "\n".join([
            f"Step: {entry.node_text}" + (f" (Response: {entry.user_response})" if entry.user_response else "")
            for entry in progress_entries
        ])
        
        prompt = f"""
        Based on the following user progress through a court case flowchart, provide a concise summary for court staff:
        
        Case Type: {queue_entry.case_type}
        Language: {queue_entry.language}
        Progress:
        {progress_text}
        
        Please provide:
        1. A brief summary of where the user is in the process
        2. What forms or documents they likely need
        3. Any immediate next steps they should take
        4. Any red flags or urgent concerns
        
        Keep the summary professional and actionable for court staff.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300
            )
            summary = response.choices[0].message.content
        except Exception as e:
            summary = f"Error generating summary: {str(e)}"
        
        # Update queue entry with summary
        queue_entry.conversation_summary = summary
        db.session.commit()
        
        return summary
    
    def assign_to_facilitator(self, queue_number, facilitator_id=None):
        """Assign a case to a facilitator for review"""
        queue_entry = QueueEntry.query.filter_by(queue_number=queue_number).first()
        if not queue_entry:
            raise ValueError(f"Queue entry not found: {queue_number}")
        
        # Generate summary if not already done
        if not queue_entry.conversation_summary:
            self.generate_summary(queue_number)
        
        # Create or update facilitator case
        facilitator_case = FacilitatorCase.query.filter_by(queue_entry_id=queue_entry.id).first()
        if not facilitator_case:
            facilitator_case = FacilitatorCase(queue_entry_id=queue_entry.id)
            db.session.add(facilitator_case)
        
        if facilitator_id:
            facilitator_case.facilitator_id = facilitator_id
            facilitator_case.status = 'assigned'
        else:
            facilitator_case.status = 'pending'
        
        db.session.commit()
        
        return facilitator_case
    
    def get_next_case(self, facilitator_id=None):
        """Get the next case in the queue for a facilitator"""
        # Priority order: A -> B -> C -> D, then by creation time
        next_case = QueueEntry.query.filter_by(status='waiting').order_by(
            QueueEntry.priority_level,
            QueueEntry.priority_number
        ).first()
        
        if next_case:
            next_case.status = 'in_progress'
            db.session.commit()
            
            # Assign to facilitator if specified
            if facilitator_id:
                self.assign_to_facilitator(next_case.queue_number, facilitator_id)
        
        return next_case
    
    def complete_case(self, queue_number):
        """Mark a case as completed"""
        queue_entry = QueueEntry.query.filter_by(queue_number=queue_number).first()
        if queue_entry:
            queue_entry.status = 'completed'
            queue_entry.updated_at = datetime.utcnow()
            db.session.commit()
        
        return queue_entry
