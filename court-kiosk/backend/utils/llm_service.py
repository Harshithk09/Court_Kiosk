import json
import logging
import re
from typing import List, Dict, Any, Optional
from openai import OpenAI
from config import Config

logger = logging.getLogger(__name__)

SAFETY_SYSTEM_ADDENDUM = """
CRITICAL SAFETY RULES — you must follow these:
1. You provide GENERAL COURT PROCEDURE INFORMATION ONLY. You are not a lawyer and do not give legal advice.
2. Never tell the user what they "should" do in their personal situation, never predict case outcomes, never draft false or exaggerated declarations.
3. If the user describes immediate danger, tell them to call 911 first. Do not give tactical safety instructions beyond that and contacting local advocates/staff.
4. If asked to represent them, hide assets, ignore a court order, or guarantee a restraining order, refuse and redirect to Self-Help staff or an attorney.
5. End substantive answers with a clear reminder that this is not legal advice.
6. Prefer naming official form codes and procedural steps over opinion.
"""

ATTORNEY_ANALYSIS_SCHEMA_HINT = """
Return ONLY valid JSON with these keys:
- case_overview: string
- immediate_concerns: string[]
- required_documents: [{form_code, description, priority}]  priority in High|Medium|Low
- legal_guidance: string[]   (procedural guidance only, not legal advice)
- next_steps: [{action, priority, estimated_time}]
- attorney_actions: string[]
- timeline: [{deadline, action, importance}]
- red_flags: string[]
- client_support: string[]
- confidence_level: High|Medium|Low
- estimated_completion_time: string
- disclaimer: string
"""


class LLMService:
    def __init__(self, api_key: Optional[str] = None):
        key = api_key or Config.OPENAI_API_KEY
        self.client = OpenAI(api_key=key) if key else None

    @staticmethod
    def classify_question_risk(question: str) -> Dict[str, bool]:
        q = (question or "").lower()
        return {
            "is_emergency": bool(re.search(
                r"(right now|outside (my|the) door|threatening me|in immediate danger|he is here|she is here)",
                q
            )),
            "is_legal_advice_request": bool(re.search(
                r"(should i|what should i do|guarantee|will the judge|tell me what to do legally)",
                q
            )),
            "is_concealment": bool(re.search(r"(hide assets|falsify|exaggerate|lie on (the )?form)", q)),
            "is_representation": "represent me" in q,
            "is_tro_violation": "ignore" in q and "restraining order" in q,
        }

    @staticmethod
    def safe_refusal_text(risk: Dict[str, bool], language: str = "en") -> Optional[str]:
        if language == "es":
            if risk.get("is_emergency"):
                return (
                    "Si está en peligro inmediato, llame al 911 ahora. "
                    "Este quiosco no puede ayudar en emergencias. "
                    "Cuando esté a salvo, pida ayuda al personal de la corte o a un defensor. "
                    "Esto es información general, no asesoramiento legal."
                )
            if risk.get("is_concealment"):
                return (
                    "No puedo ayudar a ocultar información ni a falsear hechos. "
                    "Hable con el personal de Autoayuda o con un abogado. "
                    "Esto no es asesoramiento legal."
                )
            if risk.get("is_representation"):
                return (
                    "No soy un abogado y no puedo representarlo en la corte. "
                    "Pida ayuda en el Centro de Autoayuda o contacte ayuda legal. "
                    "Esto es información general, no asesoramiento legal."
                )
            if risk.get("is_tro_violation"):
                return (
                    "No puedo aconsejarle que ignore una orden judicial. "
                    "Hable con un abogado o con el personal de Autoayuda. "
                    "Esto es información general, no asesoramiento legal."
                )
            if risk.get("is_legal_advice_request"):
                return (
                    "Puedo explicar procedimientos y formularios, pero no puedo decirle qué debe hacer "
                    "en su situación ni predecir lo que hará un juez. Consulte al personal de Autoayuda o a un abogado. "
                    "Si está en peligro, llame al 911. Esto es información general, no asesoramiento legal."
                )
            return None

        if risk.get("is_emergency"):
            return (
                "If you are in immediate danger, call 911 now. "
                "This kiosk cannot help with emergencies. "
                "After you are safe, ask court staff or a domestic violence advocate for next steps. "
                "This is general information, not legal advice."
            )
        if risk.get("is_concealment"):
            return (
                "I cannot help with hiding information or misrepresenting facts. "
                "Please speak with a facilitator or attorney about lawful disclosure requirements. "
                "This is not legal advice."
            )
        if risk.get("is_representation"):
            return (
                "I am an information tool, not a lawyer, and I cannot represent you in court. "
                "Please ask Self-Help Center staff or contact legal aid for representation options. "
                "This is general information, not legal advice."
            )
        if risk.get("is_tro_violation"):
            return (
                "I cannot advise you to ignore a court order. Violating a restraining order can have serious consequences. "
                "Speak with an attorney or Self-Help staff about your options. "
                "This is general information, not legal advice."
            )
        if risk.get("is_legal_advice_request"):
            return (
                "I can explain court procedures and forms, but I cannot tell you what you should do in your situation "
                "or predict what a judge will do. Please talk with Self-Help Center staff or an attorney. "
                "If you are in danger, call 911. This is general information, not legal advice."
            )
        return None

    def answer_user_question_safe(self, question: str, language: str = "en",
                                  current_context: Optional[Dict] = None,
                                  flow_data: Optional[Dict] = None) -> Dict[str, Any]:
        """Answer with deterministic safety refusals before any model call."""
        risk = self.classify_question_risk(question)
        refusal = self.safe_refusal_text(risk, language=language)
        if refusal:
            return {
                "answer": refusal,
                "refused": True,
                "risk": risk,
                "disclaimer": "General information only — not legal advice.",
            }

        if flow_data is not None and current_context is not None:
            answer = self.answer_user_question(question, current_context, flow_data, language)
        else:
            answer = self._answer_standalone(question, language)

        if answer and "not legal advice" not in answer.lower() and "no constituye" not in answer.lower():
            if language == "es":
                answer = answer.rstrip() + "\n\nEsto es información general, no asesoramiento legal."
            else:
                answer = answer.rstrip() + "\n\nThis is general information, not legal advice."

        return {
            "answer": answer,
            "refused": False,
            "risk": risk,
            "disclaimer": "General information only — not legal advice.",
        }

    def _answer_standalone(self, question: str, language: str = "en") -> str:
        if not self.client:
            return "I'm sorry, the AI assistant is currently unavailable. Please ask a facilitator for assistance."

        system = (
            "You are a court kiosk assistant that explains procedures and forms only. "
            + SAFETY_SYSTEM_ADDENDUM
        )
        if language == "es":
            system += "\nRespond in Spanish."

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": question},
                ],
                max_tokens=400,
                temperature=0.2,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Safe standalone Q&A failed: {e}")
            return "I'm sorry, I'm having trouble answering right now. Please ask a facilitator for assistance."

    def generate_attorney_case_analysis(self, case_item: Dict[str, Any]) -> Dict[str, Any]:
        """Staff-facing assistive brief. Grounded in queue intake; not legal advice."""
        case_type = case_item.get("case_type") or "Unknown"
        priority = case_item.get("priority") or case_item.get("priority_level") or "C"
        summary = case_item.get("conversation_summary") or "No intake summary provided."
        docs = case_item.get("documents_needed") or []
        language = case_item.get("language") or "en"
        current_node = case_item.get("current_node") or ""

        fallback = self._attorney_analysis_fallback(case_item)

        if not self.client:
            return fallback

        prompt = f"""
You are assisting a court facilitator/attorney with a quick intake brief.
This is NOT legal advice to the client — procedural handoff notes only.

CASE:
- Type: {case_type}
- Priority: {priority}
- Language: {language}
- Current node: {current_node}
- Documents already flagged: {json.dumps(docs)}
- Intake summary: {summary}

Rules:
- Only recommend forms consistent with the case type and documents flagged. Do not invent unrelated form codes.
- If priority is A or summary mentions danger/safety, put safety concerns in immediate_concerns and red_flags.
- Be concise and actionable for a 5–10 minute staff huddle.
- Include a disclaimer that this is an assistive draft for staff, not legal advice.

{ATTORNEY_ANALYSIS_SCHEMA_HINT}
"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You output only valid JSON for court staff handoff notes." + SAFETY_SYSTEM_ADDENDUM},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=1000,
                temperature=0.2,
                response_format={"type": "json_object"},
            )
            raw = response.choices[0].message.content
            analysis = json.loads(raw)
            return self._normalize_attorney_analysis(analysis, case_item, fallback)
        except Exception as e:
            logger.error(f"Attorney case analysis failed: {e}")
            fallback["case_overview"] = (
                fallback.get("case_overview", "")
                + f" (AI analysis unavailable: using intake-only brief.)"
            )
            fallback["confidence_level"] = "Low"
            return fallback

    def _attorney_analysis_fallback(self, case_item: Dict[str, Any]) -> Dict[str, Any]:
        case_type = case_item.get("case_type") or "Unknown"
        priority = case_item.get("priority") or case_item.get("priority_level") or "C"
        docs = case_item.get("documents_needed") or []
        summary = case_item.get("conversation_summary") or "No intake summary provided."

        required_documents = []
        for doc in docs:
            if isinstance(doc, dict):
                required_documents.append({
                    "form_code": doc.get("form_code") or doc.get("code") or "Form",
                    "description": doc.get("description") or doc.get("title") or "",
                    "priority": doc.get("priority") or "Medium",
                })
            else:
                required_documents.append({
                    "form_code": str(doc),
                    "description": "Flagged during intake",
                    "priority": "High" if priority == "A" else "Medium",
                })

        if not required_documents and "DV" in case_type.upper():
            required_documents = [
                {"form_code": "DV-100", "description": "Request for Domestic Violence Restraining Order", "priority": "High"},
                {"form_code": "CLETS-001", "description": "Confidential CLETS Information", "priority": "High"},
            ]

        immediate = []
        red_flags = []
        if priority == "A":
            immediate.append("High priority case — address safety and urgent protection needs first")
            red_flags.append("Priority A intake")
        if any(w in summary.lower() for w in ("danger", "threat", "911", "safety", "weapon")):
            immediate.append("Safety language present in intake — confirm emergency status with client")
            red_flags.append("Safety language in summary")

        return {
            "case_overview": f"{case_type} intake. {summary[:400]}",
            "immediate_concerns": immediate,
            "required_documents": required_documents,
            "legal_guidance": [
                "Review intake pathway and confirm correct case type with the client",
                "Verify form packet matches the pathway (do not add unrelated forms)",
                "Explain that staff guidance is not a substitute for independent legal advice when needed",
            ],
            "next_steps": [
                {"action": "Review flagged forms with client", "priority": "High", "estimated_time": "15 minutes"},
                {"action": "Confirm filing/service next actions", "priority": "High", "estimated_time": "10 minutes"},
                {"action": "Offer Self-Help or legal aid referrals as appropriate", "priority": "Medium", "estimated_time": "5 minutes"},
            ],
            "attorney_actions": [
                "Validate case type and urgency",
                "Check form completeness against intake",
                "Document referrals and safety resources offered",
            ],
            "timeline": [
                {"deadline": "Today", "action": "Complete and review required forms", "importance": "High"},
                {"deadline": "Before hearing", "action": "Arrange proper service if applicable", "importance": "High"},
            ],
            "red_flags": red_flags,
            "client_support": [
                "Use plain language",
                "Allow time for questions",
                "Provide written next steps when possible",
            ],
            "confidence_level": "Medium",
            "estimated_completion_time": "30-45 minutes",
            "disclaimer": "Assistive staff brief only — not legal advice to the client.",
            "generated_at": None,
            "source": "fallback",
        }

    def _normalize_attorney_analysis(self, analysis: Dict[str, Any], case_item: Dict[str, Any],
                                     fallback: Dict[str, Any]) -> Dict[str, Any]:
        from datetime import datetime

        out = dict(fallback)
        out.update({k: analysis[k] for k in analysis if analysis[k] is not None})
        out.setdefault("required_documents", fallback["required_documents"])
        out.setdefault("immediate_concerns", [])
        out.setdefault("next_steps", fallback["next_steps"])
        out.setdefault("attorney_actions", fallback["attorney_actions"])
        out.setdefault("timeline", fallback["timeline"])
        out.setdefault("client_support", fallback["client_support"])
        out.setdefault("red_flags", fallback.get("red_flags", []))
        out["disclaimer"] = analysis.get("disclaimer") or fallback["disclaimer"]
        out["generated_at"] = datetime.utcnow().isoformat() + "Z"
        out["source"] = "llm"
        # Prefer intake documents when model returns empty docs
        if not out.get("required_documents"):
            out["required_documents"] = fallback["required_documents"]
        return out
        
    def analyze_progress(self, flow_data: Dict, user_progress: List[Dict], case_type: str, language: str = 'en') -> Dict[str, Any]:
        """
        Analyze user progress through the flowchart and provide insights
        """
        nodes = flow_data.get('nodes', {})
        edges = flow_data.get('edges', [])
        
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
        
        user_path = [step['node_id'] for step in user_progress]
        current_node = user_path[-1] if user_path else None
        
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
        
        if not self.client:
            return {
                'summary': 'AI assistant unavailable',
                'forms_needed': [],
                'next_steps': [],
                'concerns': [],
                'time_estimate': 30,
                'guidance': 'Continue with next step in flowchart',
                'priority_level': 'Medium'
            }

        try:
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=800,
                temperature=0.3
            )
            
            analysis_text = response.choices[0].message.content
            
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
            logger.error(f"LLM progress analysis failed: {e}")
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
        if not user_path:
            return 0.0
        
        main_nodes = [node_id for node_id, node in nodes.items() 
                     if node.get('type') in ['start', 'process', 'decision', 'end']]
        
        if not main_nodes:
            return 0.0

        completed_main_nodes = len([node for node in user_path if node in main_nodes])
        return min(100.0, (completed_main_nodes / len(main_nodes)) * 100)
    
    def _estimate_time_remaining(self, user_path: List[str], nodes: Dict) -> int:
        if not user_path:
            return 45
        
        time_estimates = {
            'start': 2,
            'process': 5,
            'decision': 3,
            'end': 1
        }
        
        remaining_time = 0
        for node_id, node in nodes.items():
            if node_id not in user_path:
                node_type = node.get('type', 'process')
                remaining_time += time_estimates.get(node_type, 5)
        
        return max(5, remaining_time)
    
    def generate_facilitator_summary(self, queue_entry: Dict, user_progress: List[Dict], 
                                   case_type: str, language: str = 'en') -> str:
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
        
        if not self.client:
            return "AI assistant unavailable. Please review the case manually."

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
        current_node = current_context.get('current_node', '')
        user_progress = current_context.get('user_progress', [])
        
        nodes = flow_data.get('nodes', {})
        current_node_info = nodes.get(current_node, {})
        
        prompt = f"""
        You are a helpful court assistant. Answer the user's question based on their current position in the court process.
        Provide procedure/form information only — not legal advice.

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
        3. Provides actionable procedural guidance (not personal legal advice)
        4. Uses clear, simple language
        5. Is appropriate for their language preference ({language})
        6. Reminds them this is not legal advice

        Keep your response concise and practical.
        """
        
        if not self.client:
            return "I'm sorry, the AI assistant is currently unavailable. Please ask a facilitator for assistance."

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": SAFETY_SYSTEM_ADDENDUM},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=300,
                temperature=0.3
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"LLM question answering failed: {e}")
            return "I'm sorry, I'm having trouble answering your question right now. Please ask a facilitator for assistance."
