"""
Enhanced Summary Service for Attorney Dashboard
Provides comprehensive case analysis and actionable insights
"""

import json
import openai
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from config import Config

class EnhancedSummaryService:
    def __init__(self):
        self.client = openai
        if Config.OPENAI_API_KEY:
            openai.api_key = Config.OPENAI_API_KEY
    
    def generate_attorney_summary(self, case_data: Dict, user_progress: List[Dict], 
                                case_type: str, language: str = 'en') -> Dict[str, Any]:
        """
        Generate comprehensive summary specifically for attorneys
        """
        # Prepare context for analysis
        progress_text = self._format_progress_text(user_progress)
        case_context = self._extract_case_context(case_data)
        
        prompt = f"""
        You are an expert family law attorney analyzing a client's case for court facilitation.

        CASE CONTEXT:
        - Case Type: {case_type}
        - Language: {language}
        - Client: {case_data.get('user_name', 'Anonymous')}
        - Queue Number: {case_data.get('queue_number', 'N/A')}
        - Wait Time: {case_data.get('wait_time', 'Unknown')}

        CLIENT PROGRESS:
        {progress_text}

        CASE DETAILS:
        {case_context}

        Please provide a comprehensive analysis with these sections:

        1. CASE OVERVIEW (2-3 sentences summarizing the client's situation)
        2. IMMEDIATE CONCERNS (any urgent issues requiring immediate attention)
        3. REQUIRED DOCUMENTS (specific forms and documents needed)
        4. LEGAL GUIDANCE (key legal points and advice for this case type)
        5. NEXT STEPS (prioritized action items for the client)
        6. ATTORNEY ACTIONS (specific steps the attorney should take)
        7. TIMELINE (important deadlines and timeframes)
        8. RED FLAGS (potential issues or complications)
        9. CLIENT SUPPORT (how to best assist this specific client)

        Format as JSON with these keys:
        - case_overview: string
        - immediate_concerns: array of strings
        - required_documents: array of objects with 'form_code', 'description', 'priority'
        - legal_guidance: array of strings
        - next_steps: array of objects with 'action', 'priority', 'estimated_time'
        - attorney_actions: array of strings
        - timeline: array of objects with 'deadline', 'action', 'importance'
        - red_flags: array of strings
        - client_support: array of strings
        - confidence_level: string (High/Medium/Low)
        - estimated_completion_time: string
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1500,
                temperature=0.2
            )
            
            analysis_text = response.choices[0].message.content
            
            # Parse JSON response
            try:
                analysis = json.loads(analysis_text)
            except json.JSONDecodeError:
                # Fallback to structured text parsing
                analysis = self._parse_fallback_analysis(analysis_text, case_type)
                
        except Exception as e:
            analysis = self._generate_error_analysis(str(e), case_type)
        
        # Add metadata
        analysis['generated_at'] = datetime.utcnow().isoformat()
        analysis['case_type'] = case_type
        analysis['language'] = language
        analysis['attorney_ready'] = True
        
        return analysis
    
    def _format_progress_text(self, user_progress: List[Dict]) -> str:
        """Format user progress into readable text"""
        if not user_progress:
            return "No progress recorded yet."
        
        formatted_steps = []
        for i, step in enumerate(user_progress, 1):
            step_text = f"Step {i}: {step.get('node_text', 'Unknown step')}"
            if step.get('user_response'):
                step_text += f" (Client response: {step['user_response']})"
            formatted_steps.append(step_text)
        
        return "\n".join(formatted_steps)
    
    def _extract_case_context(self, case_data: Dict) -> str:
        """Extract relevant case context information"""
        context_parts = []
        
        if case_data.get('user_email'):
            context_parts.append(f"Email: {case_data['user_email']}")
        if case_data.get('phone_number'):
            context_parts.append(f"Phone: {case_data['phone_number']}")
        if case_data.get('language'):
            context_parts.append(f"Language: {case_data['language']}")
        if case_data.get('priority'):
            context_parts.append(f"Priority: {case_data['priority']}")
        if case_data.get('arrived_at'):
            context_parts.append(f"Arrived: {case_data['arrived_at']}")
        
        return "\n".join(context_parts) if context_parts else "No additional context available."
    
    def _parse_fallback_analysis(self, text: str, case_type: str) -> Dict[str, Any]:
        """Parse analysis text when JSON parsing fails"""
        return {
            'case_overview': f"Client is working through {case_type} case process.",
            'immediate_concerns': ["Review client progress and provide guidance"],
            'required_documents': [{"form_code": "TBD", "description": "Forms to be determined", "priority": "Medium"}],
            'legal_guidance': ["Provide case-specific legal guidance based on client needs"],
            'next_steps': [{"action": "Review case details with client", "priority": "High", "estimated_time": "15 minutes"}],
            'attorney_actions': ["Meet with client to discuss case"],
            'timeline': [{"deadline": "ASAP", "action": "Initial consultation", "importance": "High"}],
            'red_flags': [],
            'client_support': ["Provide clear guidance and support"],
            'confidence_level': "Medium",
            'estimated_completion_time': "30-45 minutes",
            'raw_analysis': text
        }
    
    def _generate_error_analysis(self, error: str, case_type: str) -> Dict[str, Any]:
        """Generate analysis when LLM fails"""
        return {
            'case_overview': f"Client needs assistance with {case_type} case.",
            'immediate_concerns': ["System error occurred - manual review needed"],
            'required_documents': [{"form_code": "Manual Review", "description": "Forms need manual determination", "priority": "High"}],
            'legal_guidance': ["Manual legal guidance required due to system error"],
            'next_steps': [{"action": "Manual case review", "priority": "High", "estimated_time": "20 minutes"}],
            'attorney_actions': ["Review case manually and provide guidance"],
            'timeline': [{"deadline": "Immediate", "action": "Manual review", "importance": "High"}],
            'red_flags': [f"System error: {error}"],
            'client_support': ["Provide manual assistance due to system error"],
            'confidence_level': "Low",
            'estimated_completion_time': "30-60 minutes",
            'error': error
        }
    
    def generate_client_guidance(self, case_analysis: Dict, language: str = 'en') -> str:
        """
        Generate client-friendly guidance based on attorney analysis
        """
        guidance_parts = []
        
        # Case overview
        if case_analysis.get('case_overview'):
            guidance_parts.append(f"📋 **Case Overview:** {case_analysis['case_overview']}")
        
        # Next steps
        if case_analysis.get('next_steps'):
            guidance_parts.append("\n🎯 **Your Next Steps:**")
            for i, step in enumerate(case_analysis['next_steps'][:5], 1):  # Limit to top 5
                priority_emoji = "🔴" if step.get('priority') == 'High' else "🟡" if step.get('priority') == 'Medium' else "🟢"
                guidance_parts.append(f"{i}. {priority_emoji} {step.get('action', 'Complete next step')}")
        
        # Required documents
        if case_analysis.get('required_documents'):
            guidance_parts.append("\n📄 **Required Documents:**")
            for doc in case_analysis['required_documents'][:5]:  # Limit to top 5
                priority_emoji = "🔴" if doc.get('priority') == 'High' else "🟡" if doc.get('priority') == 'Medium' else "🟢"
                guidance_parts.append(f"• {priority_emoji} {doc.get('form_code', 'Form')} - {doc.get('description', 'Required form')}")
        
        # Timeline
        if case_analysis.get('timeline'):
            guidance_parts.append("\n⏰ **Important Deadlines:**")
            for item in case_analysis['timeline'][:3]:  # Limit to top 3
                importance_emoji = "🔴" if item.get('importance') == 'High' else "🟡" if item.get('importance') == 'Medium' else "🟢"
                guidance_parts.append(f"• {importance_emoji} {item.get('deadline', 'ASAP')} - {item.get('action', 'Action required')}")
        
        return "\n".join(guidance_parts)
    
    def generate_attorney_quick_actions(self, case_analysis: Dict) -> List[Dict[str, str]]:
        """
        Generate quick action buttons for attorney dashboard
        """
        actions = []
        
        # High priority actions
        if case_analysis.get('immediate_concerns'):
            actions.append({
                'action': 'address_concerns',
                'label': 'Address Immediate Concerns',
                'type': 'warning',
                'description': f"{len(case_analysis['immediate_concerns'])} urgent issues identified"
            })
        
        # Document review
        if case_analysis.get('required_documents'):
            actions.append({
                'action': 'review_documents',
                'label': 'Review Required Documents',
                'type': 'info',
                'description': f"{len(case_analysis['required_documents'])} documents needed"
            })
        
        # Legal guidance
        if case_analysis.get('legal_guidance'):
            actions.append({
                'action': 'provide_guidance',
                'label': 'Provide Legal Guidance',
                'type': 'primary',
                'description': 'Share key legal points with client'
            })
        
        # Timeline review
        if case_analysis.get('timeline'):
            actions.append({
                'action': 'review_timeline',
                'label': 'Review Timeline',
                'type': 'secondary',
                'description': f"{len(case_analysis['timeline'])} deadlines to discuss"
            })
        
        return actions
