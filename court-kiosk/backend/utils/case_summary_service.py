import json
import re
from datetime import datetime
from typing import Dict, List, Any, Optional

class CaseSummaryService:
    def __init__(self):
        # Form mapping based on court_documents folder
        self.court_forms = {
            # Main DVRO Forms
            'DV-100': {
                'name': 'Request for Domestic Violence Restraining Order',
                'filename': 'DV-100.pdf',
                'description': 'Main application form for domestic violence restraining order',
                'category': 'main',
                'required': True
            },
            'DV-109': {
                'name': 'Notice of Court Hearing',
                'filename': 'DV-109.pdf',
                'description': 'Notice of court hearing for restraining order',
                'category': 'main',
                'required': True
            },
            'DV-110': {
                'name': 'Temporary Restraining Order',
                'filename': 'DV-110.pdf',
                'description': 'Temporary restraining order form',
                'category': 'main',
                'required': True
            },
            'DV-120': {
                'name': 'Response to Request for Domestic Violence Restraining Order',
                'filename': 'dv120.pdf',
                'description': 'Response form for the person against whom the restraining order is requested',
                'category': 'response',
                'required': False
            },
            'DV-125': {
                'name': 'Response to Request for Child Custody & Visitation Orders',
                'filename': 'dv125.pdf',
                'description': 'Response form for child custody and visitation orders',
                'category': 'custody',
                'required': False
            },
            'DV-200': {
                'name': 'Proof of Service',
                'filename': 'dv200.pdf',
                'description': 'Proof that the other person was served with papers',
                'category': 'service',
                'required': True
            },
            'DV-250': {
                'name': 'Proof of Service by Mail',
                'filename': 'dv250.pdf',
                'description': 'Proof of service when papers are mailed',
                'category': 'service',
                'required': False
            },
            'DV-300': {
                'name': 'Request to Change or End Restraining Order',
                'filename': 'dv300.pdf',
                'description': 'Form to request changes to an existing restraining order',
                'category': 'modification',
                'required': False
            },
            'DV-305': {
                'name': 'Request to Change Child Custody and Visitation Orders',
                'filename': 'dv305.pdf',
                'description': 'Form to request changes to child custody and visitation orders',
                'category': 'custody',
                'required': False
            },
            'DV-310': {
                'name': 'Notice of Court Hearing and Temporary Order to Change or End Restraining Order',
                'filename': 'dv310.pdf',
                'description': 'Notice of hearing for restraining order modification',
                'category': 'modification',
                'required': False
            },
            'DV-330': {
                'name': 'Order to Change or End Restraining Order',
                'filename': 'dv330.pdf',
                'description': 'Court order changing or ending a restraining order',
                'category': 'modification',
                'required': False
            },
            'DV-700': {
                'name': 'Request to Renew Restraining Order',
                'filename': 'dv700.pdf',
                'description': 'Form to request renewal of an expiring restraining order',
                'category': 'renewal',
                'required': False
            },
            'DV-710': {
                'name': 'Notice of Hearing to Renew Restraining Order',
                'filename': 'dv710.pdf',
                'description': 'Notice of hearing for restraining order renewal',
                'category': 'renewal',
                'required': False
            },
            'DV-720': {
                'name': 'Proof of Service for Renewal',
                'filename': 'dv720.pdf',
                'description': 'Proof of service for renewal papers',
                'category': 'renewal',
                'required': False
            },
            'DV-730': {
                'name': 'Order to Renew Restraining Order',
                'filename': 'dv730.pdf',
                'description': 'Court order renewing a restraining order',
                'category': 'renewal',
                'required': False
            },
            'DV-800': {
                'name': 'Receipt for Firearms, Firearm Parts, and Ammunition',
                'filename': 'dv800.pdf',
                'description': 'Receipt for surrendered firearms and ammunition',
                'category': 'firearms',
                'required': False
            },
            'DV-105': {
                'name': 'Request for Child Custody and Visitation Orders',
                'filename': 'dv105.pdf',
                'description': 'Form to request child custody and visitation orders',
                'category': 'custody',
                'required': False
            },
            'DV-105a': {
                'name': 'Request for Child Custody and Visitation Orders (Alternative)',
                'filename': 'dv105a.pdf',
                'description': 'Alternative form for child custody and visitation orders',
                'category': 'custody',
                'required': False
            },
            'DV-108': {
                'name': 'Request for Orders to Prevent Child Abduction',
                'filename': 'dv108.pdf',
                'description': 'Form to request orders preventing child abduction',
                'category': 'custody',
                'required': False
            },
            'DV-140': {
                'name': 'Child Custody and Visitation Order Attachment',
                'filename': 'dv140.pdf',
                'description': 'Attachment for child custody and visitation order',
                'category': 'custody',
                'required': False
            },
            'DV-145': {
                'name': 'Order to Prevent Child Abduction',
                'filename': 'DV-145.pdf',
                'description': 'Court order to prevent child abduction',
                'category': 'custody',
                'required': False
            },
            
            # Financial Forms
            'FL-150': {
                'name': 'Income and Expense Declaration',
                'filename': 'fl150.pdf',
                'description': 'Income and expense declaration for child support and spousal support',
                'category': 'financial',
                'required': False
            },
            
            # Service Forms
            'SER-001': {
                'name': 'Request for Sheriff to Serve Court Papers',
                'filename': 'ser001.pdf',
                'description': 'Request for sheriff to serve court papers',
                'category': 'service',
                'required': False
            },
            
            # CLETS Forms
            'CLETS-001': {
                'name': 'Confidential CLETS Information',
                'filename': 'clets001.pdf',
                'description': 'Confidential CLETS information form',
                'category': 'clets',
                'required': True
            },
            
            # Miscellaneous Forms
            'MC-025': {
                'name': 'Attachment Form',
                'filename': 'mc025.pdf',
                'description': 'Attachment form for additional information',
                'category': 'misc',
                'required': False
            },
            'FW-001': {
                'name': 'Fee Waiver Request',
                'filename': 'fw001.pdf',
                'description': 'Request for fee waiver',
                'category': 'financial',
                'required': False
            },
            'FW-003': {
                'name': 'Order on Court Fee Waiver',
                'filename': 'fw003.pdf',
                'description': 'Court order on fee waiver request',
                'category': 'financial',
                'required': False
            }
        }

    def create_case_summary(self, flow_data: Dict[str, Any], user_answers: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a comprehensive case summary with form information
        """
        try:
            # Extract situation details
            situation_details = self._analyze_situation_details(flow_data, user_answers)
            
            # Generate facilitator guidance
            facilitator_guidance = self._generate_facilitator_guidance(situation_details)
            
            # Identify forms involved
            forms_involved = self._identify_forms_involved(flow_data, user_answers)
            
            # Create summary
            summary = {
                "timestamp": datetime.now().isoformat(),
                "flow_type": flow_data.get("metadata", {}).get("title", "DVRO"),
                "situation_details": situation_details,
                "facilitator_guidance": facilitator_guidance,
                "forms_involved": forms_involved,
                "urgency_assessment": self._assess_urgency(situation_details),
                "safety_assessment": self._assess_safety(situation_details),
                "complexity_assessment": self._assess_complexity(situation_details),
                "progress_tracking": self._track_progress(flow_data, user_answers)
            }
            
            return {
                "success": True,
                "summary": summary
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to create case summary: {str(e)}"
            }

    def generate_where_am_i_summary(self, flow_type: str, answers: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate "Where Am I?" summary with procedural questions and form information
        """
        try:
            # Analyze current position in the flow
            current_position = self._analyze_current_position(answers)
            
            # Identify forms based on answers
            forms_involved = self._identify_forms_from_answers(answers)
            
            # Generate next steps
            next_steps = self._generate_next_steps(current_position, forms_involved)
            
            # Create personalized checklist
            checklist = self._create_personalized_checklist(current_position, forms_involved)
            
            # Generate glossary
            glossary = self._generate_glossary(forms_involved)
            
            summary = {
                "you_are_here": current_position["description"],
                "what_to_do_next": next_steps,
                "forms_involved": forms_involved,
                "personalized_checklist": checklist,
                "glossary": glossary,
                "current_stage": current_position["stage"],
                "estimated_timeline": current_position["timeline"]
            }
            
            return {
                "success": True,
                "summary": summary
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to generate 'Where Am I?' summary: {str(e)}"
            }

    def _analyze_situation_details(self, flow_data: Dict[str, Any], user_answers: Dict[str, Any]) -> Dict[str, Any]:
        """Extract detailed situation information from user answers"""
        details = {
            "user_situation": {},
            "case_specifics": {},
            "form_progress": {},
            "legal_history": {},
            "safety_concerns": {},
            "financial_situation": {},
            "children_involved": {},
            "relationship_details": {}
        }
        
        # Extract information from answers
        for question_id, answer in user_answers.items():
            if "abuse" in question_id.lower():
                details["safety_concerns"]["abuse_type"] = answer
            elif "children" in question_id.lower():
                details["children_involved"]["has_children"] = answer
            elif "income" in question_id.lower():
                details["financial_situation"]["income_level"] = answer
            elif "relationship" in question_id.lower():
                details["relationship_details"]["relationship_type"] = answer
            elif "legal" in question_id.lower():
                details["legal_history"]["previous_orders"] = answer
        
        return details

    def _identify_forms_involved(self, flow_data: Dict[str, Any], user_answers: Dict[str, Any]) -> Dict[str, List[str]]:
        """Identify which forms are involved based on user answers"""
        completed_forms = []
        pending_forms = []
        
        # Basic forms that are always required
        required_forms = ['DV-100', 'DV-109', 'DV-110', 'CLETS-001']
        
        # Check if user has children
        has_children = any("children" in key.lower() and "yes" in str(value).lower() 
                          for key, value in user_answers.items())
        
        # Check if user needs financial support
        needs_support = any("support" in key.lower() and "yes" in str(value).lower() 
                           for key, value in user_answers.items())
        
        # Check if user has firearms
        has_firearms = any("firearm" in key.lower() and "yes" in str(value).lower() 
                          for key, value in user_answers.items())
        
        # Add forms based on situation
        if has_children:
            pending_forms.extend(['DV-105', 'DV-140'])
            if any("abduction" in key.lower() and "yes" in str(value).lower() 
                   for key, value in user_answers.items()):
                pending_forms.extend(['DV-108', 'DV-145'])
        
        if needs_support:
            pending_forms.append('FL-150')
        
        if has_firearms:
            pending_forms.append('DV-800')
        
        # Service forms
        pending_forms.extend(['DV-200', 'SER-001'])
        
        return {
            "completed": completed_forms,
            "pending": pending_forms,
            "required": required_forms
        }

    def _identify_forms_from_answers(self, answers: Dict[str, Any]) -> Dict[str, List[str]]:
        """Identify forms based on specific answers"""
        completed_forms = []
        pending_forms = []
        
        # Map answers to forms
        form_mapping = {
            "DV100a": "DV-100",
            "CLETSa": "CLETS-001", 
            "DV109a": "DV-109",
            "DV110a": "DV-110",
            "SERStart": "SER-001",
            "AltDV200": "DV-200",
            "DVCustodyInfo": "DV-105",
            "DVChildSupportInfo": "FL-150",
            "DVSpousalSupportForms": "FL-150",
            "GunFormPrep": "DV-800",
            "DV120Start": "DV-120",
            "FL150Fill": "FL-150",
            "DV125Fill": "DV-125",
            "DV300Start": "DV-300",
            "DV310Start": "DV-310",
            "DV305": "DV-305",
            "DV700Start": "DV-700",
            "DVR710Start": "DV-710",
            "DVRCLETS": "CLETS-001"
        }
        
        # Check which steps have been completed
        for step_id, form_code in form_mapping.items():
            if step_id in answers:
                completed_forms.append(form_code)
            else:
                pending_forms.append(form_code)
        
        # Remove duplicates
        completed_forms = list(set(completed_forms))
        pending_forms = list(set(pending_forms))
        
        return {
            "completed": completed_forms,
            "pending": pending_forms
        }

    def _analyze_current_position(self, answers: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze where the user currently is in the process"""
        position = {
            "stage": "initial",
            "description": [],
            "timeline": "1-2 weeks"
        }
        
        # Determine current stage based on answers
        if "DV100a" in answers:
            position["stage"] = "forms_completed"
            position["description"].append("You have completed the main application forms (DV-100, CLETS-001, DV-109, DV-110)")
        
        if "DVReview" in answers:
            position["stage"] = "filed_with_court"
            position["description"].append("You have filed your forms with the court")
            position["timeline"] = "3-5 business days"
        
        if "DVServePrep" in answers:
            position["stage"] = "service_required"
            position["description"].append("You need to serve the other person with your court papers")
            position["timeline"] = "1-2 weeks"
        
        if "Attendhearing" in answers:
            position["stage"] = "hearing_scheduled"
            position["description"].append("Your court hearing is scheduled")
            position["timeline"] = "Court date"
        
        if not position["description"]:
            position["description"].append("You are at the beginning of the DVRO process")
        
        return position

    def _generate_next_steps(self, current_position: Dict[str, Any], forms_involved: Dict[str, List[str]]) -> List[str]:
        """Generate next steps based on current position"""
        next_steps = []
        
        if current_position["stage"] == "initial":
            next_steps.extend([
                "Complete DV-100 (Request for Domestic Violence Restraining Order)",
                "Complete CLETS-001 (Confidential CLETS Information)",
                "Complete DV-109 (Notice of Court Hearing)",
                "Complete DV-110 (Temporary Restraining Order Request)"
            ])
        
        elif current_position["stage"] == "forms_completed":
            next_steps.extend([
                "File your completed forms with the court clerk",
                "Ask for a Temporary Restraining Order (TRO)",
                "Get your court date and hearing information"
            ])
        
        elif current_position["stage"] == "filed_with_court":
            next_steps.extend([
                "Review your returned forms (DV-109 and DV-110)",
                "Check if a Temporary Restraining Order was granted",
                "Prepare to serve the other person with your papers"
            ])
        
        elif current_position["stage"] == "service_required":
            next_steps.extend([
                "Choose how to serve the other person (sheriff or private server)",
                "Complete service forms (SER-001 or DV-200)",
                "Ensure service is completed before your court date"
            ])
        
        elif current_position["stage"] == "hearing_scheduled":
            next_steps.extend([
                "Prepare for your court hearing",
                "Gather evidence (photos, texts, emails)",
                "Bring copies of all forms and proof of service",
                "Attend your court hearing on the scheduled date"
            ])
        
        # Add form-specific next steps
        for form_code in forms_involved.get("pending", []):
            form_info = self.court_forms.get(form_code)
            if form_info:
                next_steps.append(f"Complete {form_code} ({form_info['name']})")
        
        return next_steps

    def _create_personalized_checklist(self, current_position: Dict[str, Any], forms_involved: Dict[str, List[str]]) -> List[str]:
        """Create a personalized checklist for the user"""
        checklist = []
        
        # Add stage-specific items
        if current_position["stage"] == "initial":
            checklist.extend([
                "□ Gather information about the abuse incidents",
                "□ Collect any evidence (photos, texts, emails)",
                "□ Make copies of important documents",
                "□ Find a safe place to complete forms"
            ])
        
        elif current_position["stage"] == "forms_completed":
            checklist.extend([
                "□ Make 3 copies of all completed forms",
                "□ Bring original and copies to court clerk",
                "□ Ask about filing fees or fee waiver",
                "□ Get receipt and pickup information"
            ])
        
        elif current_position["stage"] == "filed_with_court":
            checklist.extend([
                "□ Pick up your court-stamped forms",
                "□ Read DV-109 for your court date and time",
                "□ Check if DV-110 (TRO) was signed by judge",
                "□ Keep a copy of all forms with you"
            ])
        
        elif current_position["stage"] == "service_required":
            checklist.extend([
                "□ Choose sheriff or private server",
                "□ Complete service request forms",
                "□ Provide server with all court papers",
                "□ Track service deadline"
            ])
        
        elif current_position["stage"] == "hearing_scheduled":
            checklist.extend([
                "□ Print 3 copies of all evidence",
                "□ Review your forms and evidence",
                "□ Plan transportation to court",
                "□ Bring all forms and proof of service"
            ])
        
        # Add form-specific checklist items
        for form_code in forms_involved.get("pending", []):
            form_info = self.court_forms.get(form_code)
            if form_info:
                checklist.append(f"□ Complete {form_code} ({form_info['name']})")
        
        return checklist

    def _generate_glossary(self, forms_involved: Dict[str, List[str]]) -> Dict[str, str]:
        """Generate a glossary of terms and forms"""
        glossary = {
            "DVRO": "Domestic Violence Restraining Order - a court order to protect you from abuse",
            "TRO": "Temporary Restraining Order - immediate protection while waiting for court hearing",
            "CLETS": "California Law Enforcement Telecommunications System - law enforcement database",
            "Service": "The legal process of delivering court papers to the other person",
            "Petitioner": "Person asking for the restraining order",
            "Respondent": "Person the restraining order is against"
        }
        
        # Add form-specific explanations
        for form_code in forms_involved.get("completed", []) + forms_involved.get("pending", []):
            form_info = self.court_forms.get(form_code)
            if form_info:
                glossary[form_code] = form_info["description"]
        
        return glossary

    def _generate_facilitator_guidance(self, situation_details: Dict[str, Any]) -> Dict[str, Any]:
        """Generate guidance for court facilitators"""
        guidance = {
            "priority_level": "medium",
            "recommendations": [],
            "safety_notes": [],
            "resource_referrals": []
        }
        
        # Assess priority based on safety concerns
        if situation_details.get("safety_concerns", {}).get("abuse_type"):
            guidance["priority_level"] = "high"
            guidance["safety_notes"].append("User reports abuse - immediate attention recommended")
        
        # Add recommendations based on situation
        if situation_details.get("children_involved", {}).get("has_children"):
            guidance["recommendations"].append("Consider child custody and support forms")
            guidance["resource_referrals"].append("Child support services")
        
        if situation_details.get("financial_situation", {}).get("income_level") == "low":
            guidance["recommendations"].append("Assist with fee waiver application")
            guidance["resource_referrals"].append("Legal aid services")
        
        return guidance

    def _assess_urgency(self, situation_details: Dict[str, Any]) -> str:
        """Assess the urgency of the case"""
        if situation_details.get("safety_concerns", {}).get("abuse_type"):
            return "high"
        return "medium"

    def _assess_safety(self, situation_details: Dict[str, Any]) -> str:
        """Assess safety concerns"""
        if situation_details.get("safety_concerns", {}).get("abuse_type"):
            return "immediate_attention"
        return "standard"

    def _assess_complexity(self, situation_details: Dict[str, Any]) -> str:
        """Assess case complexity"""
        complexity_factors = 0
        
        if situation_details.get("children_involved", {}).get("has_children"):
            complexity_factors += 1
        
        if situation_details.get("financial_situation", {}).get("income_level") == "low":
            complexity_factors += 1
        
        if complexity_factors >= 2:
            return "high"
        elif complexity_factors == 1:
            return "medium"
        else:
            return "low"

    def _track_progress(self, flow_data: Dict[str, Any], user_answers: Dict[str, Any]) -> Dict[str, Any]:
        """Track user progress through the flow"""
        total_steps = len(flow_data.get("nodes", {}))
        completed_steps = len(user_answers)
        
        return {
            "total_steps": total_steps,
            "completed_steps": completed_steps,
            "progress_percentage": round((completed_steps / total_steps) * 100, 1) if total_steps > 0 else 0,
            "current_node": list(user_answers.keys())[-1] if user_answers else None
        }
