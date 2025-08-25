import os
import json
import openai
from typing import List, Dict, Any, Optional
from config import Config

class LLMService:
    def __init__(self, api_key: Optional[str] = None):
        if api_key or Config.OPENAI_API_KEY:
            openai.api_key = api_key or Config.OPENAI_API_KEY
        self.client = openai
        
    def analyze_progress(self, flow_data: Dict, user_progress: List[Dict], case_type: str, language: str = 'en') -> Dict[str, Any]:
        """
        Analyze user progress through the flowchart and provide insights
        """
        # Load the flowchart structure
        nodes = flow_data.get('nodes', {})
        edges = flow_data.get('edges', [])
        
        # Create a map of node connections
        node_connections = {}
        for edge in edges:
            from_node = edge['from']
            to_node = edge['to']
            if from_node not in node_connections:
                node_connections[from_node] = []
            node_connections[from_node].append({
                'to': to_node,
                'condition': edge.get('when')
            })
        
        # Analyze the user's path
        user_path = [step['node_id'] for step in user_progress]
        current_node = user_path[-1] if user_path else None
        
        # Determine next possible steps
        next_steps = []
        if current_node and current_node in node_connections:
            for connection in node_connections[current_node]:
                next_node_id = connection['to']
                next_node = nodes.get(next_node_id, {})
                next_steps.append({
                    'node_id': next_node_id,
                    'text': next_node.get('text', ''),
                    'type': next_node.get('type', ''),
                    'condition': connection.get('condition')
                })
        
        # Generate LLM analysis
        analysis = self._generate_progress_analysis(
            flow_data, user_progress, next_steps, case_type, language
        )
        
        return {
            'current_node': current_node,
            'next_steps': next_steps,
            'analysis': analysis,
            'progress_percentage': self._calculate_progress_percentage(user_path, nodes),
            'estimated_time_remaining': self._estimate_time_remaining(user_path, nodes)
        }
    
    def _generate_progress_analysis(self, flow_data: Dict, user_progress: List[Dict], 
                                  next_steps: List[Dict], case_type: str, language: str) -> Dict[str, Any]:
        """
        Use LLM to analyze user progress and provide insights
        """
        # Prepare context for LLM
        progress_summary = "\n".join([
            f"Step {i+1}: {step['node_text']}" + (f" (Response: {step['user_response']})" if step.get('user_response') else "")
            for i, step in enumerate(user_progress)
        ])
        
        next_options = "\n".join([
            f"- {step['text']}" + (f" (if: {step['condition']})" if step.get('condition') else "")
            for step in next_steps
        ])
        
        prompt = f"""
        You are an expert court facilitator analyzing a client's progress through a {case_type} case.

        FLOWCHART CONTEXT:
        - Case Type: {case_type}
        - Language: {language}
        - Total Steps Completed: {len(user_progress)}

        USER'S PROGRESS:
        {progress_summary}

        NEXT POSSIBLE STEPS:
        {next_options}

        Please provide:
        1. A brief summary of where the client is in the process
        2. What forms or documents they likely need at this stage
        3. Any immediate next steps they should take
        4. Any red flags or urgent concerns
        5. Estimated time to complete remaining steps
        6. Specific guidance for the next step

        Format your response as JSON with these keys:
        - summary: Brief overview of current status
        - forms_needed: List of forms/documents needed
        - next_steps: List of immediate actions needed
        - concerns: List of any red flags or issues
        - time_estimate: Estimated time remaining (in minutes)
        - guidance: Specific guidance for next step
        - priority_level: High/Medium/Low based on urgency
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.3
            )
            
            analysis_text = response.choices[0].message.content
            
            # Try to parse as JSON, fallback to structured text
            try:
                analysis = json.loads(analysis_text)
            except json.JSONDecodeError:
                analysis = {
                    'summary': analysis_text,
                    'forms_needed': [],
                    'next_steps': [],
                    'concerns': [],
                    'time_estimate': 30,
                    'guidance': 'Continue with next step in flowchart',
                    'priority_level': 'Medium'
                }
                
        except Exception as e:
            analysis = {
                'summary': f"Error analyzing progress: {str(e)}",
                'forms_needed': [],
                'next_steps': [],
                'concerns': [],
                'time_estimate': 30,
                'guidance': 'Continue with next step in flowchart',
                'priority_level': 'Medium'
            }
        
        return analysis
    
    def _calculate_progress_percentage(self, user_path: List[str], nodes: Dict) -> float:
        """
        Calculate approximate progress percentage through the flowchart
        """
        if not user_path:
            return 0.0
        
        # Count total nodes (excluding FAQ branches for main progress)
        main_nodes = [node_id for node_id, node in nodes.items() 
                     if node.get('type') in ['start', 'process', 'decision', 'end']]
        
        # Count nodes in user path that are main nodes
        completed_main_nodes = len([node for node in user_path if node in main_nodes])
        
        return min(100.0, (completed_main_nodes / len(main_nodes)) * 100)
    
    def _estimate_time_remaining(self, user_path: List[str], nodes: Dict) -> int:
        """
        Estimate time remaining based on user's progress
        """
        if not user_path:
            return 45  # Default estimate for new cases
        
        # Base time estimates for different node types
        time_estimates = {
            'start': 2,
            'process': 5,
            'decision': 3,
            'end': 1
        }
        
        # Calculate remaining time based on node types
        remaining_time = 0
        for node_id, node in nodes.items():
            if node_id not in user_path:
                node_type = node.get('type', 'process')
                remaining_time += time_estimates.get(node_type, 5)
        
        return max(5, remaining_time)  # Minimum 5 minutes
    
    def generate_facilitator_summary(self, queue_entry: Dict, user_progress: List[Dict], 
                                   case_type: str, language: str = 'en') -> str:
        """
        Generate a comprehensive summary for facilitators
        """
        progress_text = "\n".join([
            f"• {step['node_text']}" + (f" (User said: {step['user_response']})" if step.get('user_response') else "")
            for step in user_progress
        ])
        
        prompt = f"""
        Generate a professional summary for court facilitators about a client's case:

        CASE INFORMATION:
        - Queue Number: {queue_entry.get('queue_number', 'N/A')}
        - Case Type: {case_type}
        - Language: {language}
        - User Name: {queue_entry.get('user_name', 'Not provided')}
        - Wait Time: {queue_entry.get('estimated_wait_time', 0)} minutes

        CLIENT'S PROGRESS:
        {progress_text}

        Please provide a concise summary that includes:
        1. Where the client is in the process
        2. What they've accomplished so far
        3. What forms or documents they likely need
        4. Any immediate next steps
        5. Any concerns or special considerations
        6. Recommended priority level (High/Medium/Low)

        Keep it professional and actionable for court staff.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.2
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating summary: {str(e)}"
    
    def answer_user_question(self, question: str, current_context: Dict, 
                           flow_data: Dict, language: str = 'en') -> str:
        """
        Answer user questions based on their current position in the flowchart
        """
        current_node = current_context.get('current_node', '')
        user_progress = current_context.get('user_progress', [])
        
        # Get relevant context from the flowchart
        nodes = flow_data.get('nodes', {})
        current_node_info = nodes.get(current_node, {})
        
        prompt = f"""
        You are a helpful court assistant. Answer the user's question based on their current position in the court process.

        USER'S QUESTION: {question}

        CURRENT CONTEXT:
        - Current Step: {current_node_info.get('text', 'Unknown')}
        - Case Type: Domestic Violence Restraining Order
        - Language: {language}

        RECENT PROGRESS:
        {chr(10).join([f"• {step['node_text']}" for step in user_progress[-3:]])}

        Please provide a helpful, accurate answer that:
        1. Directly addresses their question
        2. Is relevant to their current position in the process
        3. Provides actionable guidance
        4. Uses clear, simple language
        5. Is appropriate for their language preference ({language})

        Keep your response concise and practical.
        """
        
        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300,
                temperature=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"I'm sorry, I'm having trouble answering your question right now. Please ask a facilitator for assistance."
