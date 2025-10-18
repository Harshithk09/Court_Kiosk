import os
import resend
import json
import tempfile
import base64
from datetime import datetime
from config import Config
from .pdf_service import PDFService

# Initialize Resend
if Config.RESEND_API_KEY:
    resend.api_key = Config.RESEND_API_KEY

class EmailService:
    def __init__(self):
        # Use Resend's default verified domain for testing
        self.from_email = "Court Kiosk <onboarding@resend.dev>"
        self.support_email = "onboarding@resend.dev"
        self.pdf_service = PDFService()
    
    def _get_form_details(self, form_code: str) -> dict:
        """Get detailed information about a specific form - supports all California Judicial Council forms"""
        form_details = {
            # Domestic Violence Forms
            "DV-100": {
                "instructions": "<li>Fill in your personal information (name, address, phone)</li><li>Describe the incidents of domestic violence in detail</li><li>List any children involved and their information</li><li>Request specific orders you want the court to make</li><li>Sign and date the form</li>",
                "warning": "This is the main form to request a domestic violence restraining order. Be specific about dates, times, and what happened."
            },
            "DV-101": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to each allegation in the petition</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li><li>Sign and date the form</li>",
                "warning": "You must respond within 30 days or the court may grant the restraining order by default."
            },
            "DV-105": {
                "instructions": "<li>Fill in information about your children</li><li>Describe current custody arrangements</li><li>Request specific custody and visitation orders</li><li>Include any safety concerns about the children</li>",
                "warning": "This form affects your children's safety and well-being. Be thorough and honest about any concerns."
            },
            "DV-105A": {
                "instructions": "<li>Fill in child information and current arrangements</li><li>Describe the proposed custody and visitation schedule</li><li>Include any special conditions or restrictions</li><li>Consider the child's best interests</li>",
                "warning": "This form creates a permanent custody order. Make sure the schedule works for your family's situation."
            },
            "DV-108": {
                "instructions": "<li>Fill in information about your children</li><li>Describe any risk of abduction</li><li>Request specific orders to prevent abduction</li><li>Include travel restrictions and passport controls</li>",
                "warning": "This form helps prevent child abduction. Be specific about any concerns or threats."
            },
            "DV-109": {
                "instructions": "<li>Fill in the case number (will be assigned by court)</li><li>Include your name and the respondent's name</li><li>List the date and time of your court hearing</li><li>Include court location and department information</li>",
                "warning": "This form tells you when and where your court hearing will be. Keep it safe and bring it to court."
            },
            "DV-110": {
                "instructions": "<li>Fill in case information and party names</li><li>Check the boxes for the specific orders you want</li><li>Include any special conditions or restrictions</li><li>Judge will sign this if temporary orders are granted</li>",
                "warning": "This form contains the temporary restraining orders. Read it carefully and follow all conditions listed."
            },
            "DV-112": {
                "instructions": "<li>Fill in your personal information</li><li>Describe the service of process details</li><li>Include who served the papers and when</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with court papers. File it with the court after service."
            },
            "DV-116": {
                "instructions": "<li>Fill in case information and party details</li><li>Describe the property or items you want protected</li><li>Include specific addresses or locations</li><li>Request orders to prevent property damage</li>",
                "warning": "This form protects your property and belongings. List everything you want protected."
            },
            "DV-120": {
                "instructions": "<li>Fill in case information and party details</li><li>Describe the property or items you want protected</li><li>Include specific addresses or locations</li><li>Request orders to prevent property damage</li>",
                "warning": "This form protects your property and belongings. List everything you want protected."
            },
            "DV-120INFO": {
                "instructions": "<li>Read all information carefully</li><li>Understand your rights and responsibilities</li><li>Keep this sheet for your records</li><li>Contact the court if you have questions</li>",
                "warning": "This information sheet explains your rights. Keep it for your records."
            },
            "DV-125": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to the property restraining order request</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li>",
                "warning": "You must respond within 30 days or the court may grant the property restraining order by default."
            },
            "DV-130": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to each allegation in the petition</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li>",
                "warning": "You must respond within 30 days or the court may grant the restraining order by default."
            },
            "DV-140": {
                "instructions": "<li>Fill in child information and current arrangements</li><li>Describe the proposed custody and visitation schedule</li><li>Include any special conditions or restrictions</li><li>Consider the child's best interests</li>",
                "warning": "This form creates a permanent custody order. Make sure the schedule works for your family's situation."
            },
            "DV-145": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to the custody and visitation request</li><li>Provide your proposed custody arrangement</li><li>Include any safety concerns</li>",
                "warning": "This form affects your children's custody. Be thorough and consider the child's best interests."
            },
            "DV-200": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to each allegation in the petition</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li>",
                "warning": "You must respond within 30 days or the court may grant the restraining order by default."
            },
            "DV-200INFO": {
                "instructions": "<li>Read all information carefully</li><li>Understand your rights and responsibilities</li><li>Keep this sheet for your records</li><li>Contact the court if you have questions</li>",
                "warning": "This information sheet explains how to respond to a restraining order request. Read it carefully."
            },
            "DV-250": {
                "instructions": "<li>Fill in case information and party names</li><li>Describe the specific conduct you want stopped</li><li>Include dates and details of harassment</li><li>Request appropriate restraining orders</li>",
                "warning": "This form is for civil harassment cases. Document all incidents with dates and details."
            },
            "DV-300": {
                "instructions": "<li>Fill in case information and party names</li><li>Explain why you need to renew the restraining order</li><li>Describe any continued threats or concerns</li><li>Request renewal of specific orders</li>",
                "warning": "You must file this form before your current restraining order expires."
            },
            "DV-305": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to the request to renew the restraining order</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li>",
                "warning": "You must respond within 30 days or the court may renew the restraining order by default."
            },
            "DV-310": {
                "instructions": "<li>Fill in case information and party names</li><li>Explain what changes you want to make</li><li>Describe why the changes are necessary</li><li>Request specific modifications to the order</li>",
                "warning": "You can only request changes if there has been a significant change in circumstances."
            },
            "DV-330": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to the request to modify the restraining order</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li>",
                "warning": "You must respond within 30 days or the court may modify the restraining order by default."
            },
            "DV-700": {
                "instructions": "<li>Fill in your personal information (name, address, phone)</li><li>Describe the incidents of domestic violence in detail</li><li>List any children involved and their information</li><li>Request specific orders you want the court to make</li>",
                "warning": "This form is used in specific circumstances. Be specific about dates, times, and what happened."
            },
            "DV-710": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to each allegation in the petition</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li>",
                "warning": "You must respond within 30 days or the court may grant the restraining order by default."
            },
            "DV-720": {
                "instructions": "<li>Fill in your personal information (name, address, phone)</li><li>Describe the incidents of domestic violence in detail</li><li>List any children involved and their information</li><li>Request specific orders you want the court to make</li>",
                "warning": "This form is used in specific circumstances. Be specific about dates, times, and what happened."
            },
            "DV-730": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to each allegation in the petition</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li>",
                "warning": "You must respond within 30 days or the court may grant the restraining order by default."
            },
            "DV-800": {
                "instructions": "<li>Fill in case information and party names</li><li>List all firearms and ammunition to be surrendered</li><li>Include locations where items are stored</li><li>Request specific surrender orders</li>",
                "warning": "This form orders the surrender of firearms. All items must be surrendered immediately."
            },
            
            # Family Law Forms
            "FL-100": {
                "instructions": "<li>Fill in your personal information and marriage details</li><li>List all children from the marriage</li><li>Describe your property and debts</li><li>Request specific orders for custody, support, and property division</li><li>Sign and date the form</li>",
                "warning": "This is the main form to start a divorce. Be accurate about all information as it affects your case."
            },
            "FL-105": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to each request in the petition</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li>",
                "warning": "You must respond within 30 days or the court may grant the divorce by default."
            },
            "FL-110": {
                "instructions": "<li>Fill in information about your children</li><li>Describe where the children have lived</li><li>List any other custody cases involving the children</li><li>Include information about other states where cases might exist</li>",
                "warning": "This form is required when there are child custody issues. Be accurate about the children's residence history."
            },
            "FL-115": {
                "instructions": "<li>Fill in your personal information</li><li>Describe how and when you served the other party</li><li>Include who served the papers and their relationship to you</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with your divorce papers. File it with the court after service."
            },
            "FL-117": {
                "instructions": "<li>Fill in your personal information</li><li>Describe how and when you served the other party</li><li>Include who served the papers and their relationship to you</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with your court papers. File it with the court after service."
            },
            "FL-120": {
                "instructions": "<li>Fill in case information and party names</li><li>Include the date the petition was filed</li><li>List the court location and department</li><li>Include the 30-day response deadline</li>",
                "warning": "This form notifies the other party that you have filed for divorce. They must respond within 30 days."
            },
            "FL-130": {
                "instructions": "<li>Fill in your personal information</li><li>Describe how and when you served the other party</li><li>Include who served the papers and their relationship to you</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with your court papers. File it with the court after service."
            },
            "FL-140": {
                "instructions": "<li>Fill in your personal information</li><li>Describe how and when you served the other party</li><li>Include who served the papers and their relationship to you</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with your court papers. File it with the court after service."
            },
            "FL-141": {
                "instructions": "<li>Fill in your personal information</li><li>Describe how and when you served the other party</li><li>Include who served the papers and their relationship to you</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with your court papers. File it with the court after service."
            },
            "FL-142": {
                "instructions": "<li>Fill in your personal information</li><li>Describe how and when you served the other party</li><li>Include who served the papers and their relationship to you</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with your court papers. File it with the court after service."
            },
            "FL-144": {
                "instructions": "<li>Fill in your personal information</li><li>Describe how and when you served the other party</li><li>Include who served the papers and their relationship to you</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with your court papers. File it with the court after service."
            },
            "FL-150": {
                "instructions": "<li>Fill in your personal information</li><li>Describe how and when you served the other party</li><li>Include who served the papers and their relationship to you</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with your court papers. File it with the court after service."
            },
            "FL-157": {
                "instructions": "<li>Fill in your personal information</li><li>Describe how and when you served the other party</li><li>Include who served the papers and their relationship to you</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with your court papers. File it with the court after service."
            },
            "FL-160": {
                "instructions": "<li>Fill in your personal information</li><li>Describe how and when you served the other party</li><li>Include who served the papers and their relationship to you</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with your court papers. File it with the court after service."
            },
            "FL-165": {
                "instructions": "<li>Fill in your personal information</li><li>Describe how and when you served the other party</li><li>Include who served the papers and their relationship to you</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with your court papers. File it with the court after service."
            },
            "FL-170": {
                "instructions": "<li>Fill in your personal information</li><li>Describe how and when you served the other party</li><li>Include who served the papers and their relationship to you</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with your court papers. File it with the court after service."
            },
            "FL-180": {
                "instructions": "<li>Fill in your personal information</li><li>Describe how and when you served the other party</li><li>Include who served the papers and their relationship to you</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with your court papers. File it with the court after service."
            },
            "FL-190": {
                "instructions": "<li>Fill in your personal information</li><li>Describe how and when you served the other party</li><li>Include who served the papers and their relationship to you</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with your court papers. File it with the court after service."
            },
            "FL-191": {
                "instructions": "<li>Fill in your personal information</li><li>Describe how and when you served the other party</li><li>Include who served the papers and their relationship to you</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with your court papers. File it with the court after service."
            },
            "FL-192": {
                "instructions": "<li>Fill in your personal information</li><li>Describe how and when you served the other party</li><li>Include who served the papers and their relationship to you</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with your court papers. File it with the court after service."
            },
            "FL-195": {
                "instructions": "<li>Fill in your personal information</li><li>Describe how and when you served the other party</li><li>Include who served the papers and their relationship to you</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with your court papers. File it with the court after service."
            },
            "FL-300": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Check the boxes for the specific orders you want</li><li>Describe the circumstances that require the orders</li><li>Include any supporting documentation</li>",
                "warning": "This form is used to request various orders in family law cases. Be specific about what you need and why."
            },
            "FL-305": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to each request in the petition</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li>",
                "warning": "You must respond within 30 days or the court may grant the requested orders by default."
            },
            "FL-320": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Check the boxes for the specific orders you want</li><li>Describe the circumstances that require the orders</li><li>Include any supporting documentation</li>",
                "warning": "This form is used to request various orders in family law cases. Be specific about what you need and why."
            },
            "FL-326": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to each request in the petition</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li>",
                "warning": "You must respond within 30 days or the court may grant the requested orders by default."
            },
            "FL-330": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Check the boxes for the specific orders you want</li><li>Describe the circumstances that require the orders</li><li>Include any supporting documentation</li>",
                "warning": "This form is used to request various orders in family law cases. Be specific about what you need and why."
            },
            "FL-334": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to each request in the petition</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li>",
                "warning": "You must respond within 30 days or the court may grant the requested orders by default."
            },
            "FL-335": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Check the boxes for the specific orders you want</li><li>Describe the circumstances that require the orders</li><li>Include any supporting documentation</li>",
                "warning": "This form is used to request various orders in family law cases. Be specific about what you need and why."
            },
            "FL-341": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to each request in the petition</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li>",
                "warning": "You must respond within 30 days or the court may grant the requested orders by default."
            },
            "FL-342": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Check the boxes for the specific orders you want</li><li>Describe the circumstances that require the orders</li><li>Include any supporting documentation</li>",
                "warning": "This form is used to request various orders in family law cases. Be specific about what you need and why."
            },
            "FL-343": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to each request in the petition</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li>",
                "warning": "You must respond within 30 days or the court may grant the requested orders by default."
            },
            "FL-345": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Check the boxes for the specific orders you want</li><li>Describe the circumstances that require the orders</li><li>Include any supporting documentation</li>",
                "warning": "This form is used to request various orders in family law cases. Be specific about what you need and why."
            },
            "FL-435": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Check the boxes for the specific orders you want</li><li>Describe the circumstances that require the orders</li><li>Include any supporting documentation</li>",
                "warning": "This form is used to request various orders in family law cases. Be specific about what you need and why."
            },
            "FL-800": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Check the boxes for the specific orders you want</li><li>Describe the circumstances that require the orders</li><li>Include any supporting documentation</li>",
                "warning": "This form is used to request various orders in family law cases. Be specific about what you need and why."
            },
            "FL-810": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to each request in the petition</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li>",
                "warning": "You must respond within 30 days or the court may grant the requested orders by default."
            },
            "FL-825": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Check the boxes for the specific orders you want</li><li>Describe the circumstances that require the orders</li><li>Include any supporting documentation</li>",
                "warning": "This form is used to request various orders in family law cases. Be specific about what you need and why."
            },
            "FL-830": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to each request in the petition</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li>",
                "warning": "You must respond within 30 days or the court may grant the requested orders by default."
            },
            
            # Child Custody Forms
            "CH-100": {
                "instructions": "<li>Fill in your personal information and case details</li><li>List all children involved and their information</li><li>Describe current custody arrangements</li><li>Request specific custody and visitation orders</li>",
                "warning": "This form affects your children's custody. Be thorough and consider the child's best interests."
            },
            "CH-109": {
                "instructions": "<li>Fill in the case number (will be assigned by court)</li><li>Include your name and the other parent's name</li><li>List the date and time of your court hearing</li><li>Include court location and department information</li>",
                "warning": "This form tells you when and where your court hearing will be. Keep it safe and bring it to court."
            },
            "CH-110": {
                "instructions": "<li>Fill in child information and current arrangements</li><li>Describe the proposed custody and visitation schedule</li><li>Include any special conditions or restrictions</li><li>Consider the child's best interests</li>",
                "warning": "This form creates a permanent custody order. Make sure the schedule works for your family's situation."
            },
            "CH-120": {
                "instructions": "<li>Fill in your personal information and case details</li><li>List all children involved and their information</li><li>Describe current custody arrangements</li><li>Request specific custody and visitation orders</li>",
                "warning": "This form affects your children's custody. Be thorough and consider the child's best interests."
            },
            "CH-120INFO": {
                "instructions": "<li>Read all information carefully</li><li>Understand your rights and responsibilities</li><li>Keep this sheet for your records</li><li>Contact the court if you have questions</li>",
                "warning": "This information sheet explains the child custody process and your rights. Keep it for your records."
            },
            "CH-130": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to the custody and visitation request</li><li>Provide your proposed custody arrangement</li><li>Include any safety concerns</li>",
                "warning": "You must respond within 30 days or the court may grant the requested custody orders by default."
            },
            "CH-200": {
                "instructions": "<li>Fill in your personal information and case details</li><li>List all children involved and their information</li><li>Describe current custody arrangements</li><li>Request specific custody and visitation orders</li>",
                "warning": "This form affects your children's custody. Be thorough and consider the child's best interests."
            },
            "CH-250": {
                "instructions": "<li>Fill in your personal information and case details</li><li>List all children involved and their information</li><li>Describe current custody arrangements</li><li>Request specific custody and visitation orders</li>",
                "warning": "This form affects your children's custody. Be thorough and consider the child's best interests."
            },
            "CH-700": {
                "instructions": "<li>Fill in your personal information and case details</li><li>List all children involved and their information</li><li>Describe current custody arrangements</li><li>Request specific custody and visitation orders</li>",
                "warning": "This form affects your children's custody. Be thorough and consider the child's best interests."
            },
            "CH-710": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to the custody and visitation request</li><li>Provide your proposed custody arrangement</li><li>Include any safety concerns</li>",
                "warning": "You must respond within 30 days or the court may grant the requested custody orders by default."
            },
            "CH-720": {
                "instructions": "<li>Fill in your personal information and case details</li><li>List all children involved and their information</li><li>Describe current custody arrangements</li><li>Request specific custody and visitation orders</li>",
                "warning": "This form affects your children's custody. Be thorough and consider the child's best interests."
            },
            "CH-730": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to the custody and visitation request</li><li>Provide your proposed custody arrangement</li><li>Include any safety concerns</li>",
                "warning": "You must respond within 30 days or the court may grant the requested custody orders by default."
            },
            "CH-800": {
                "instructions": "<li>Fill in your personal information and case details</li><li>List all children involved and their information</li><li>Describe current custody arrangements</li><li>Request specific custody and visitation orders</li>",
                "warning": "This form affects your children's custody. Be thorough and consider the child's best interests."
            },
            
            # Fee Waiver Forms
            "FW-001": {
                "instructions": "<li>Fill in your personal information</li><li>List your income and expenses</li><li>Describe your financial situation</li><li>Provide supporting documentation if available</li>",
                "warning": "You must provide accurate financial information. False information may result in criminal charges."
            },
            "FW-002": {
                "instructions": "<li>Read the court's decision carefully</li><li>Understand what fees are waived or not waived</li><li>Follow any additional instructions from the court</li><li>Keep this form for your records</li>",
                "warning": "This form shows the court's decision on your fee waiver request. Follow all instructions."
            },
            "FW-003": {
                "instructions": "<li>Fill in your personal information</li><li>List your income and expenses</li><li>Describe your financial situation</li><li>Provide supporting documentation if available</li>",
                "warning": "You must provide accurate financial information. False information may result in criminal charges."
            },
            "FW-005": {
                "instructions": "<li>Read the court's decision carefully</li><li>Understand what fees are waived or not waived</li><li>Follow any additional instructions from the court</li><li>Keep this form for your records</li>",
                "warning": "This form shows the court's decision on your fee waiver request. Follow all instructions."
            },
            
            # Other Forms
            "CLETS-001": {
                "instructions": "<li>Read all information carefully</li><li>Understand how CLETS affects your restraining order</li><li>Keep this sheet for your records</li><li>Contact the court if you have questions</li>",
                "warning": "This information sheet explains how restraining orders are entered into law enforcement databases."
            },
            "CM-010": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Check the boxes for the specific orders you want</li><li>Describe the circumstances that require the orders</li><li>Include any supporting documentation</li>",
                "warning": "This form is used to request various orders in civil cases. Be specific about what you need and why."
            },
            "EPO-001": {
                "instructions": "<li>Fill in case information and party names</li><li>Describe the emergency situation</li><li>List the specific orders needed</li><li>Include any immediate safety concerns</li>",
                "warning": "This form is used by law enforcement in emergency situations. It provides immediate protection."
            },
            "JV-255": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Check the boxes for the specific orders you want</li><li>Describe the circumstances that require the orders</li><li>Include any supporting documentation</li>",
                "warning": "This form is used to request various orders in juvenile court cases. Be specific about what you need and why."
            },
            "MC-025": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Check the boxes for the specific orders you want</li><li>Describe the circumstances that require the orders</li><li>Include any supporting documentation</li>",
                "warning": "This form is used to request various orders in misdemeanor cases. Be specific about what you need and why."
            },
            "MC-031": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to each request in the petition</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li>",
                "warning": "You must respond within 30 days or the court may grant the requested orders by default."
            },
            "MC-040": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Check the boxes for the specific orders you want</li><li>Describe the circumstances that require the orders</li><li>Include any supporting documentation</li>",
                "warning": "This form is used to request various orders in misdemeanor cases. Be specific about what you need and why."
            },
            "MC-050": {
                "instructions": "<li>Fill in your personal information and case details</li><li>Respond to each request in the petition</li><li>Provide your version of events</li><li>Request any orders you want the court to make</li>",
                "warning": "You must respond within 30 days or the court may grant the requested orders by default."
            },
            "POS-040": {
                "instructions": "<li>Fill in your personal information</li><li>Describe the service of process details</li><li>Include who served the papers and when</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with court papers. File it with the court after service."
            },
            "SER-001": {
                "instructions": "<li>Fill in your personal information</li><li>Describe the service of process details</li><li>Include who served the papers and when</li><li>Sign and date the form</li>",
                "warning": "This form proves the other party was served with court papers. File it with the court after service."
            }
        }
        
        return form_details.get(form_code, {
            "instructions": "<li>Read all instructions carefully before filling out</li><li>Use black ink and print clearly</li><li>Complete all required fields (marked with *)</li><li>Sign and date the form</li>",
            "warning": "Make sure to sign and date the form before filing with the court."
        })

    def _get_form_title(self, form_code: str) -> str:
        """Get the title for a form code - supports all California Judicial Council forms"""
        form_titles = {
            # Domestic Violence Forms
            "DV-100": "Request for Domestic Violence Restraining Order",
            "DV-101": "Response to Request for Domestic Violence Restraining Order",
            "DV-105": "Request for Child Custody and Visitation",
            "DV-105A": "Child Custody and Visitation Order",
            "DV-108": "Request for Child Abduction Prevention",
            "DV-109": "Notice of Court Hearing",
            "DV-110": "Temporary Restraining Order",
            "DV-112": "Proof of Service",
            "DV-116": "Request for Property Restraining Order",
            "DV-120": "Property Restraining Order",
            "DV-120INFO": "Information Sheet for Property Restraining Order",
            "DV-125": "Response to Request for Property Restraining Order",
            "DV-130": "Response to Request for Domestic Violence Restraining Order",
            "DV-140": "Child Custody and Visitation Order",
            "DV-145": "Response to Request for Child Custody and Visitation",
            "DV-200": "Response to Request for Domestic Violence Restraining Order",
            "DV-200INFO": "Information Sheet for Response to Request for Domestic Violence Restraining Order",
            "DV-250": "Request for Civil Harassment Restraining Order",
            "DV-300": "Request to Renew Restraining Order",
            "DV-305": "Response to Request to Renew Restraining Order",
            "DV-310": "Request to Modify Restraining Order",
            "DV-330": "Response to Request to Modify Restraining Order",
            "DV-700": "Request for Domestic Violence Restraining Order",
            "DV-710": "Response to Request for Domestic Violence Restraining Order",
            "DV-720": "Request for Domestic Violence Restraining Order",
            "DV-730": "Response to Request for Domestic Violence Restraining Order",
            "DV-800": "Firearms Surrender Order",
            
            # Family Law Forms
            "FL-100": "Petition for Dissolution of Marriage",
            "FL-105": "Response to Petition for Dissolution of Marriage",
            "FL-110": "Declaration Under Uniform Child Custody Jurisdiction and Enforcement Act",
            "FL-115": "Declaration of Service",
            "FL-117": "Declaration of Service",
            "FL-120": "Summons",
            "FL-130": "Declaration of Service",
            "FL-140": "Declaration of Service",
            "FL-141": "Declaration of Service",
            "FL-142": "Declaration of Service",
            "FL-144": "Declaration of Service",
            "FL-150": "Declaration of Service",
            "FL-157": "Declaration of Service",
            "FL-160": "Declaration of Service",
            "FL-165": "Declaration of Service",
            "FL-170": "Declaration of Service",
            "FL-180": "Declaration of Service",
            "FL-190": "Declaration of Service",
            "FL-191": "Declaration of Service",
            "FL-192": "Declaration of Service",
            "FL-195": "Declaration of Service",
            "FL-300": "Request for Order",
            "FL-305": "Response to Request for Order",
            "FL-320": "Request for Order",
            "FL-326": "Response to Request for Order",
            "FL-330": "Request for Order",
            "FL-334": "Response to Request for Order",
            "FL-335": "Request for Order",
            "FL-341": "Response to Request for Order",
            "FL-342": "Request for Order",
            "FL-343": "Response to Request for Order",
            "FL-345": "Request for Order",
            "FL-435": "Request for Order",
            "FL-800": "Request for Order",
            "FL-810": "Response to Request for Order",
            "FL-825": "Request for Order",
            "FL-830": "Response to Request for Order",
            
            # Child Custody Forms
            "CH-100": "Request for Child Custody and Visitation Orders",
            "CH-109": "Notice of Court Hearing",
            "CH-110": "Child Custody and Visitation Order",
            "CH-120": "Request for Child Custody and Visitation Orders",
            "CH-120INFO": "Information Sheet for Child Custody and Visitation",
            "CH-130": "Response to Request for Child Custody and Visitation Orders",
            "CH-200": "Request for Child Custody and Visitation Orders",
            "CH-250": "Request for Child Custody and Visitation Orders",
            "CH-700": "Request for Child Custody and Visitation Orders",
            "CH-710": "Response to Request for Child Custody and Visitation Orders",
            "CH-720": "Request for Child Custody and Visitation Orders",
            "CH-730": "Response to Request for Child Custody and Visitation Orders",
            "CH-800": "Request for Child Custody and Visitation Orders",
            
            # Fee Waiver Forms
            "FW-001": "Request to Waive Court Fees",
            "FW-002": "Order on Request to Waive Court Fees",
            "FW-003": "Request to Waive Court Fees",
            "FW-005": "Order on Request to Waive Court Fees",
            
            # Other Forms
            "CLETS-001": "CLETS Information Sheet",
            "CM-010": "Request for Order",
            "EPO-001": "Emergency Protective Order",
            "JV-255": "Request for Order",
            "MC-025": "Request for Order",
            "MC-031": "Response to Request for Order",
            "MC-040": "Request for Order",
            "MC-050": "Response to Request for Order",
            "POS-040": "Proof of Service",
            "SER-001": "Proof of Service"
        }
        return form_titles.get(form_code, f"{form_code} Form")

    def _get_form_description(self, form_code: str) -> str:
        """Get the description for a form code - supports all California Judicial Council forms"""
        form_descriptions = {
            # Domestic Violence Forms
            "DV-100": "This is the main form to request a domestic violence restraining order. It includes information about the incidents, children, and orders you want the court to make.",
            "DV-101": "This form is used by the respondent to respond to a request for a domestic violence restraining order.",
            "DV-105": "This form is used to request custody and visitation orders for your children in domestic violence cases.",
            "DV-105A": "This form creates a permanent custody and visitation order after your court hearing.",
            "DV-108": "This form helps prevent child abduction by establishing custody orders and travel restrictions.",
            "DV-109": "This form tells you when and where your court hearing will be. Keep it safe and bring it to court.",
            "DV-110": "This form contains the temporary restraining orders that may be granted immediately. Read it carefully and follow all conditions.",
            "DV-112": "This form proves that the other party was served with your court papers. It must be filed with the court after service.",
            "DV-116": "This form is used to request protection for your property and belongings.",
            "DV-120": "This form protects your property and belongings from damage or interference.",
            "DV-120INFO": "This information sheet explains the property restraining order process and your rights.",
            "DV-125": "This form is used by the respondent to respond to a request for a property restraining order.",
            "DV-130": "This form is used by the respondent to respond to a request for a domestic violence restraining order.",
            "DV-140": "This form creates a permanent custody and visitation order after your court hearing.",
            "DV-145": "This form is used by the respondent to respond to a request for child custody and visitation.",
            "DV-200": "This form is used by the respondent to respond to a request for a domestic violence restraining order.",
            "DV-200INFO": "This information sheet explains how to respond to a domestic violence restraining order request.",
            "DV-250": "This form is for civil harassment cases where you need protection from someone who is not a family member or intimate partner.",
            "DV-300": "This form is used to request renewal of an existing restraining order before it expires.",
            "DV-305": "This form is used by the respondent to respond to a request to renew a restraining order.",
            "DV-310": "This form is used to request changes to an existing restraining order.",
            "DV-330": "This form is used by the respondent to respond to a request to modify a restraining order.",
            "DV-700": "This form is used to request a domestic violence restraining order in specific circumstances.",
            "DV-710": "This form is used by the respondent to respond to a domestic violence restraining order request.",
            "DV-720": "This form is used to request a domestic violence restraining order in specific circumstances.",
            "DV-730": "This form is used by the respondent to respond to a domestic violence restraining order request.",
            "DV-800": "This form orders the surrender of firearms and ammunition when a restraining order is issued.",
            
            # Family Law Forms
            "FL-100": "This is the main form to start a divorce (dissolution of marriage) case. It includes information about your marriage, children, and property.",
            "FL-105": "This form is used by the respondent to respond to a petition for dissolution of marriage.",
            "FL-110": "This form is required when there are child custody issues and helps determine which state has jurisdiction.",
            "FL-115": "This form proves that the other party was served with your divorce papers.",
            "FL-117": "This form proves that the other party was served with your court papers.",
            "FL-120": "This form notifies the other party that you have filed for divorce and they must respond within 30 days.",
            "FL-130": "This form proves that the other party was served with your court papers.",
            "FL-140": "This form proves that the other party was served with your court papers.",
            "FL-141": "This form proves that the other party was served with your court papers.",
            "FL-142": "This form proves that the other party was served with your court papers.",
            "FL-144": "This form proves that the other party was served with your court papers.",
            "FL-150": "This form proves that the other party was served with your court papers.",
            "FL-157": "This form proves that the other party was served with your court papers.",
            "FL-160": "This form proves that the other party was served with your court papers.",
            "FL-165": "This form proves that the other party was served with your court papers.",
            "FL-170": "This form proves that the other party was served with your court papers.",
            "FL-180": "This form proves that the other party was served with your court papers.",
            "FL-190": "This form proves that the other party was served with your court papers.",
            "FL-191": "This form proves that the other party was served with your court papers.",
            "FL-192": "This form proves that the other party was served with your court papers.",
            "FL-195": "This form proves that the other party was served with your court papers.",
            "FL-300": "This form is used to request orders for child custody, visitation, child support, spousal support, or property division.",
            "FL-305": "This form is used by the respondent to respond to a request for orders.",
            "FL-320": "This form is used to request orders for child custody, visitation, child support, spousal support, or property division.",
            "FL-326": "This form is used by the respondent to respond to a request for orders.",
            "FL-330": "This form is used to request orders for child custody, visitation, child support, spousal support, or property division.",
            "FL-334": "This form is used by the respondent to respond to a request for orders.",
            "FL-335": "This form is used to request orders for child custody, visitation, child support, spousal support, or property division.",
            "FL-341": "This form is used by the respondent to respond to a request for orders.",
            "FL-342": "This form is used to request orders for child custody, visitation, child support, spousal support, or property division.",
            "FL-343": "This form is used by the respondent to respond to a request for orders.",
            "FL-345": "This form is used to request orders for child custody, visitation, child support, spousal support, or property division.",
            "FL-435": "This form is used to request orders for child custody, visitation, child support, spousal support, or property division.",
            "FL-800": "This form is used to request orders for child custody, visitation, child support, spousal support, or property division.",
            "FL-810": "This form is used by the respondent to respond to a request for orders.",
            "FL-825": "This form is used to request orders for child custody, visitation, child support, spousal support, or property division.",
            "FL-830": "This form is used by the respondent to respond to a request for orders.",
            
            # Child Custody Forms
            "CH-100": "This form is used to request child custody and visitation orders when you are not married to the other parent.",
            "CH-109": "This form tells you when and where your court hearing will be for child custody matters.",
            "CH-110": "This form creates the child custody and visitation order after your court hearing.",
            "CH-120": "This form is used to request child custody and visitation orders when you are not married to the other parent.",
            "CH-120INFO": "This information sheet explains the child custody and visitation process and your rights.",
            "CH-130": "This form is used by the respondent to respond to a request for child custody and visitation orders.",
            "CH-200": "This form is used to request child custody and visitation orders when you are not married to the other parent.",
            "CH-250": "This form is used to request child custody and visitation orders when you are not married to the other parent.",
            "CH-700": "This form is used to request child custody and visitation orders when you are not married to the other parent.",
            "CH-710": "This form is used by the respondent to respond to a request for child custody and visitation orders.",
            "CH-720": "This form is used to request child custody and visitation orders when you are not married to the other parent.",
            "CH-730": "This form is used by the respondent to respond to a request for child custody and visitation orders.",
            "CH-800": "This form is used to request child custody and visitation orders when you are not married to the other parent.",
            
            # Fee Waiver Forms
            "FW-001": "This form is used to request that court fees be waived if you cannot afford to pay them.",
            "FW-002": "This form shows the court's decision on your request to waive court fees.",
            "FW-003": "This form is used to request that court fees be waived if you cannot afford to pay them.",
            "FW-005": "This form shows the court's decision on your request to waive court fees.",
            
            # Other Forms
            "CLETS-001": "This form provides information about the California Law Enforcement Telecommunications System (CLETS) and restraining orders.",
            "CM-010": "This form is used to request various court orders in civil cases.",
            "EPO-001": "This form is used by law enforcement to request an emergency protective order in domestic violence situations.",
            "JV-255": "This form is used to request orders in juvenile court cases.",
            "MC-025": "This form is used to request orders in misdemeanor cases.",
            "MC-031": "This form is used by the respondent to respond to a request for orders in misdemeanor cases.",
            "MC-040": "This form is used to request orders in misdemeanor cases.",
            "MC-050": "This form is used by the respondent to respond to a request for orders in misdemeanor cases.",
            "POS-040": "This form proves that the other party was served with your court papers.",
            "SER-001": "This form proves that the other party was served with your court papers. It must be filed with the court after service."
        }
        return form_descriptions.get(form_code, f"Required form for your case type")

    def _get_case_specific_filing_instructions(self, case_type: str) -> str:
        """Generate case-type specific filing instructions"""
        
        if case_type in ['DVRO', 'DOMESTIC VIOLENCE', 'DV']:
            return """
            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #0c4a6e;">📋 How to File Your Domestic Violence Restraining Order</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 1: Prepare Your Forms</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Print all forms on white paper</li>
                            <li>Use black ink and print clearly</li>
                            <li>Make 3 copies of each form</li>
                            <li>Sign and date all forms</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 2: File with Court</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Go to the Clerk's Office (Room 101)</li>
                            <li>Bring photo ID and all forms</li>
                            <li>Pay filing fees (or request fee waiver)</li>
                            <li>Get your case number and hearing date</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 3: Serve the Other Party</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Have someone 18+ serve the papers</li>
                            <li>Cannot be you or a party to the case</li>
                            <li>Use sheriff, process server, or friend</li>
                            <li>File proof of service with court</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 4: Attend Court Hearing</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Arrive 15 minutes early</li>
                            <li>Bring all evidence and witnesses</li>
                            <li>Dress appropriately for court</li>
                            <li>Be prepared to explain your case</li>
                        </ul>
                    </div>
                </div>
            </div>
            """
        
        elif case_type in ['DIVORCE', 'DISSOLUTION', 'FL']:
            return """
            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #0c4a6e;">📋 How to File Your Divorce Case</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 1: Prepare Your Forms</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Print all forms on white paper</li>
                            <li>Use black ink and print clearly</li>
                            <li>Make 2 copies of each form</li>
                            <li>Sign and date all forms</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 2: File with Court</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Go to the Clerk's Office (Room 101)</li>
                            <li>Bring photo ID and all forms</li>
                            <li>Pay filing fees (or request fee waiver)</li>
                            <li>Get your case number</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 3: Serve Your Spouse</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Have someone 18+ serve the papers</li>
                            <li>Cannot be you or a party to the case</li>
                            <li>Use sheriff, process server, or friend</li>
                            <li>File proof of service with court</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 4: Complete Your Divorce</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Wait for response from spouse (30 days)</li>
                            <li>Complete financial disclosures</li>
                            <li>File final judgment forms</li>
                            <li>Attend final hearing if required</li>
                        </ul>
                    </div>
                </div>
            </div>
            """
        
        elif case_type in ['CHILD CUSTODY', 'CUSTODY', 'CH']:
            return """
            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #0c4a6e;">📋 How to File Your Child Custody Case</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 1: Prepare Your Forms</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Print all forms on white paper</li>
                            <li>Use black ink and print clearly</li>
                            <li>Make 2 copies of each form</li>
                            <li>Sign and date all forms</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 2: File with Court</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Go to the Clerk's Office (Room 101)</li>
                            <li>Bring photo ID and all forms</li>
                            <li>Pay filing fees (or request fee waiver)</li>
                            <li>Get your case number and hearing date</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 3: Serve the Other Parent</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Have someone 18+ serve the papers</li>
                            <li>Cannot be you or a party to the case</li>
                            <li>Use sheriff, process server, or friend</li>
                            <li>File proof of service with court</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 4: Attend Court Hearing</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Arrive 15 minutes early</li>
                            <li>Bring all evidence and witnesses</li>
                            <li>Dress appropriately for court</li>
                            <li>Focus on the child's best interests</li>
                        </ul>
                    </div>
                </div>
            </div>
            """
        
        elif case_type in ['CIVIL HARASSMENT', 'HARASSMENT', 'CH-250']:
            return """
            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #0c4a6e;">📋 How to File Your Civil Harassment Restraining Order</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 1: Prepare Your Forms</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Print all forms on white paper</li>
                            <li>Use black ink and print clearly</li>
                            <li>Make 3 copies of each form</li>
                            <li>Sign and date all forms</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 2: File with Court</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Go to the Clerk's Office (Room 101)</li>
                            <li>Bring photo ID and all forms</li>
                            <li>Pay filing fees (or request fee waiver)</li>
                            <li>Get your case number and hearing date</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 3: Serve the Other Party</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Have someone 18+ serve the papers</li>
                            <li>Cannot be you or a party to the case</li>
                            <li>Use sheriff, process server, or friend</li>
                            <li>File proof of service with court</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 4: Attend Court Hearing</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Arrive 15 minutes early</li>
                            <li>Bring all evidence and witnesses</li>
                            <li>Dress appropriately for court</li>
                            <li>Be prepared to explain your case</li>
                        </ul>
                    </div>
                </div>
            </div>
            """
        
        else:
            # Default filing instructions for any other case type
            return """
            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #0c4a6e;">📋 How to File Your Forms with the Court</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 1: Prepare Your Forms</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Print all forms on white paper</li>
                            <li>Use black ink and print clearly</li>
                            <li>Make 2-3 copies of each form</li>
                            <li>Sign and date all forms</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 2: File with Court</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Go to the Clerk's Office (Room 101)</li>
                            <li>Bring photo ID and all forms</li>
                            <li>Pay filing fees (or request fee waiver)</li>
                            <li>Get your case number and hearing date</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 3: Serve the Other Party</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Have someone 18+ serve the papers</li>
                            <li>Cannot be you or a party to the case</li>
                            <li>Use sheriff, process server, or friend</li>
                            <li>File proof of service with court</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 16px;">Step 4: Attend Court Hearing</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0c4a6e; font-size: 14px;">
                            <li>Arrive 15 minutes early</li>
                            <li>Bring all evidence and witnesses</li>
                            <li>Dress appropriately for court</li>
                            <li>Be prepared to explain your case</li>
                        </ul>
                    </div>
                </div>
            </div>
            """
    
    def get_form_url(self, form_code: str) -> str:
        """Return a public hyperlink for a given Judicial Council form code.

        Uses official California Courts website URLs for all forms.
        """
        if not form_code:
            return "https://www.courts.ca.gov/forms.htm"

        normalized = str(form_code).strip().upper()
        
        # Comprehensive mapping of all California Judicial Council forms
        # Using official California Courts website URLs
        known_forms = {
            # Domestic Violence Forms
            "DV-100": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv100.pdf",
            "DV-101": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv101.pdf",
            "DV-105": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv105.pdf",
            "DV-105A": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv105a.pdf",
            "DV-108": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv108.pdf",
            "DV-109": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv109.pdf",
            "DV-110": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv110.pdf",
            "DV-112": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv112.pdf",
            "DV-116": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv116.pdf",
            "DV-120": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv120.pdf",
            "DV-120INFO": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv120info.pdf",
            "DV-125": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv125.pdf",
            "DV-130": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv130.pdf",
            "DV-140": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv140.pdf",
            "DV-145": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv145.pdf",
            "DV-200": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv200.pdf",
            "DV-200INFO": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv200info.pdf",
            "DV-250": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv250.pdf",
            "DV-300": "https://courts.ca.gov/sites/default/files/courts/default/2024-12/dv300.pdf",
            "DV-305": "https://courts.ca.gov/sites/default/files/courts/default/2024-12/dv305.pdf",
            "DV-310": "https://courts.ca.gov/sites/default/files/courts/default/2024-12/dv310.pdf",
            "DV-330": "https://courts.ca.gov/sites/default/files/courts/default/2024-12/dv330.pdf",
            "DV-700": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv700.pdf",
            "DV-710": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv710.pdf",
            "DV-720": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv720.pdf",
            "DV-730": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv730.pdf",
            "DV-800": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv800.pdf",
            
            # Family Law Forms
            "FL-100": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl100.pdf",
            "FL-105": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl105.pdf",
            "FL-110": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl110.pdf",
            "FL-115": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl115.pdf",
            "FL-117": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl117.pdf",
            "FL-120": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl120.pdf",
            "FL-130": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl130.pdf",
            "FL-140": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl140.pdf",
            "FL-141": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl141.pdf",
            "FL-142": "https://courts.ca.gov/system/files?file=2025-07/fl142.pdf",
            "FL-144": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl144.pdf",
            "FL-150": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl150.pdf",
            "FL-157": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl157.pdf",
            "FL-160": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl160.pdf",
            "FL-165": "https://courts.ca.gov/system/files?file=2025-07/fl165.pdf",
            "FL-170": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl170.pdf",
            "FL-180": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl180.pdf",
            "FL-190": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl190.pdf",
            "FL-191": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl191.pdf",
            "FL-192": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl192.pdf",
            "FL-195": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl195.pdf",
            "FL-300": "https://courts.ca.gov/system/files?file=2025-07/fl300.pdf",
            "FL-305": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl305.pdf",
            "FL-320": "https://courts.ca.gov/system/files?file=2025-07/fl320.pdf",
            "FL-326": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl326.pdf",
            "FL-330": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl330.pdf",
            "FL-334": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl334.pdf",
            "FL-335": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl335.pdf",
            "FL-341": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl341.pdf",
            "FL-342": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl342.pdf",
            "FL-343": "https://courts.ca.gov/system/files?file=2025-07/fl343.pdf",
            "FL-345": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl345.pdf",
            "FL-435": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl435.pdf",
            "FL-800": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl800.pdf",
            "FL-810": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl810.pdf",
            "FL-825": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl825.pdf",
            "FL-830": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl830.pdf",
            
            # Civil Harassment Forms
            "CH-100": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch100.pdf",
            "CH-109": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch109.pdf",
            "CH-110": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch110.pdf",
            "CH-120": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch120.pdf",
            "CH-120INFO": "https://courts.ca.gov/system/files?file=2025-07/ch120info.pdf",
            "CH-130": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch130.pdf",
            "CH-200": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch200.pdf",
            "CH-250": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch250.pdf",
            "CH-700": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch700.pdf",
            "CH-710": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch710.pdf",
            "CH-720": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch720.pdf",
            "CH-730": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch730.pdf",
            "CH-800": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch800.pdf",
            
            # Fee Waiver Forms
            "FW-001": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fw001.pdf",
            "FW-002": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fw002.pdf",
            "FW-003": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fw003.pdf",
            "FW-005": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fw005.pdf",
            
            # Other Forms
            "CLETS-001": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/clets001.pdf",
            "CM-010": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/cm010.pdf",
            "EPO-001": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/epo001.pdf",
            "JV-255": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/jv255.pdf",
            "MC-025": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/mc025.pdf",
            "MC-031": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/mc031.pdf",
            "MC-040": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/mc040.pdf",
            "MC-050": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/mc050.pdf",
            "POS-040": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/pos040.pdf",
            "SER-001": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ser001.pdf",
        }

        if normalized in known_forms:
            return known_forms[normalized]

        # Fallback to generic California Courts forms page
        return "https://www.courts.ca.gov/forms.htm"

    def send_summary_email(self, payload: dict) -> dict:
        """Send a detailed summary email using a generic payload.

        Expected payload keys:
          - to: recipient email
          - flow_type: e.g., 'DVRO'
          - required_forms: list[str] (form codes)
          - next_steps: list[str]
          - queue_number (optional)
          - case_type (optional)
        """
        try:
            if not Config.RESEND_API_KEY:
                print("Resend API key not configured, skipping email send")
                return {"success": False, "error": "Email service not configured"}

            to_addr = payload.get('to')
            if not to_addr:
                return {"success": False, "error": "Missing 'to' address"}

            queue_number = payload.get('queue_number', 'N/A')
            subject = f"Your Court Case Summary - {queue_number}"

            # Build HTML with hyperlinked forms
            forms = payload.get('required_forms', []) or []
            linked_forms = []
            for code in forms:
                url = self.get_form_url(code)
                linked_forms.append(f"<li><a href=\"{url}\" target=\"_blank\" rel=\"noopener noreferrer\">{code}</a></li>")

            forms_html = ""
            if linked_forms:
                forms_html = "<h3>Required Forms:</h3><ul>" + "".join(linked_forms) + "</ul>"

            steps = payload.get('next_steps', []) or []
            steps_html = ""
            if steps:
                steps_html = "<h3>Next Steps:</h3><ol>" + "".join([f"<li>{s}</li>" for s in steps]) + "</ol>"

            html = f"""
            <!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Case Summary</title></head>
            <body style="font-family: Arial, sans-serif; color: #111827;">
              <h1 style="margin-bottom: 0.25rem;">San Mateo Family Court Clinic</h1>
              <div style="margin: 0 0 1rem 0; color: #6b7280;">Your Case Summary</div>
              <div style="display:inline-block;background:#dc2626;color:#fff;padding:8px 12px;border-radius:6px;font-weight:700;">Queue Number: {queue_number}</div>
              <div style="margin-top:16px; padding:16px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;">
                {forms_html}
                {steps_html}
                <p style="margin-top:16px;color:#374151;">Only complete the forms listed above first. Do not fill out additional forms unless instructed by court staff.</p>
              </div>
              <div style="margin-top:16px;color:#6b7280; font-size:12px;">This is an automated message. Please do not reply.</div>
            </body>
            </html>
            """

            response = resend.Emails.send({
                "from": self.from_email,
                "to": to_addr,
                "subject": subject,
                "html": html,
            })
            return {"success": True, "id": response.get('id')}

        except Exception as e:
            print(f"Error sending summary email: {e}")
            return {"success": False, "error": str(e)}

    def send_case_summary_email(self, to_email, case_data):
        """Send case summary email to user"""
        try:
            if not Config.RESEND_API_KEY:
                print("Resend API key not configured, skipping email send")
                return {"success": False, "error": "Email service not configured"}
            
            subject = f"Your Court Case Summary - {case_data.get('queue_number', 'N/A')}"
            
            html_content = self._generate_case_summary_html(case_data)
            
            response = resend.Emails.send({
                "from": self.from_email,
                "to": to_email,
                "subject": subject,
                "html": html_content,
            })
            
            print(f"Email sent successfully to {to_email}")
            return {"success": True, "id": response.get('id')}
            
        except Exception as e:
            print(f"Error sending email: {e}")
            return {"success": False, "error": str(e)}
    
    def send_queue_notification_email(self, to_email, queue_data):
        """Send queue notification email to user"""
        try:
            if not Config.RESEND_API_KEY:
                print("Resend API key not configured, skipping email send")
                return {"success": False, "error": "Email service not configured"}
            
            subject = f"Your Queue Number - {queue_data.get('queue_number', 'N/A')}"
            
            html_content = self._generate_queue_notification_html(queue_data)
            
            response = resend.Emails.send({
                "from": self.from_email,
                "to": to_email,
                "subject": subject,
                "html": html_content,
            })
            
            print(f"Queue notification email sent successfully to {to_email}")
            return {"success": True, "id": response.get('id')}
            
        except Exception as e:
            print(f"Error sending queue notification email: {e}")
            return {"success": False, "error": str(e)}
    
    def send_facilitator_notification(self, facilitator_email, case_data):
        """Send notification to facilitator about new case"""
        try:
            if not Config.RESEND_API_KEY:
                print("Resend API key not configured, skipping email send")
                return {"success": False, "error": "Email service not configured"}
            
            subject = f"New Case in Queue - {case_data.get('queue_number', 'N/A')}"
            
            html_content = self._generate_facilitator_notification_html(case_data)
            
            response = resend.Emails.send({
                "from": self.from_email,
                "to": facilitator_email,
                "subject": subject,
                "html": html_content,
            })
            
            print(f"Facilitator notification sent successfully to {facilitator_email}")
            return {"success": True, "id": response.get('id')}
            
        except Exception as e:
            print(f"Error sending facilitator notification: {e}")
            return {"success": False, "error": str(e)}
    
    def send_comprehensive_case_email(self, case_data: dict, include_queue: bool = False) -> dict:
        """Send comprehensive email with case summary, PDF attachments, and optional queue info"""
        try:
            if not Config.RESEND_API_KEY:
                print("Resend API key not configured, skipping email send")
                return {"success": False, "error": "Email service not configured"}
            
            user_email = case_data.get('user_email')
            if not user_email:
                return {"success": False, "error": "No email address provided"}
            
            # Generate case summary PDF
            case_summary_path = self.pdf_service.generate_case_summary_pdf(case_data)
            
            # Generate form PDFs
            forms = case_data.get('documents_needed', [])
            if isinstance(forms, str):
                try:
                    forms = json.loads(forms)
                except:
                    forms = []
            
            form_attachments = self.pdf_service.generate_forms_package(forms, case_data)
            
            # Prepare email content
            subject = f"Your Court Case Summary - {case_data.get('queue_number', 'N/A')}"
            html_content = self._generate_comprehensive_email_html(case_data, include_queue)
            
            # Prepare attachments
            attachments = []
            
            # Add case summary PDF
            if os.path.exists(case_summary_path):
                with open(case_summary_path, 'rb') as f:
                    attachments.append({
                        'filename': f"Case_Summary_{case_data.get('queue_number', 'N/A')}.pdf",
                        'content': base64.b64encode(f.read()).decode('utf-8'),
                        'type': 'application/pdf'
                    })
            
            # Add form PDFs
            for form_attachment in form_attachments:
                if os.path.exists(form_attachment['path']):
                    with open(form_attachment['path'], 'rb') as f:
                        attachments.append({
                            'filename': form_attachment['filename'],
                            'content': base64.b64encode(f.read()).decode('utf-8'),
                            'type': 'application/pdf'
                        })
            
            # Send email with attachments
            email_data = {
                "from": self.from_email,
                "to": user_email,
                "subject": subject,
                "html": html_content
            }
            
            # Add attachments if any
            if attachments:
                email_data["attachments"] = attachments
            
            response = resend.Emails.send(email_data)
            
            # Clean up temporary files
            try:
                os.remove(case_summary_path)
                for form_attachment in form_attachments:
                    if os.path.exists(form_attachment['path']):
                        os.remove(form_attachment['path'])
            except:
                pass
            
            print(f"Comprehensive case email sent successfully to {user_email}")
            response_id = response.get('id')
            # Ensure response_id is serializable
            if isinstance(response_id, bytes):
                response_id = response_id.decode('utf-8')
            return {"success": True, "id": str(response_id) if response_id else None}
            
        except Exception as e:
            print(f"Error sending comprehensive case email: {e}")
            return {"success": False, "error": str(e)}
    
    def _generate_comprehensive_email_html(self, case_data: dict, include_queue: bool = False) -> str:
        """Generate comprehensive HTML email content"""
        queue_number = case_data.get('queue_number', 'N/A')
        case_type = case_data.get('case_type', 'Unknown')
        priority = case_data.get('priority_level', 'C')
        language = case_data.get('language', 'en')
        user_name = case_data.get('user_name', '')
        
        # Get forms and steps
        forms = case_data.get('documents_needed', [])
        if isinstance(forms, str):
            try:
                forms = json.loads(forms)
            except:
                forms = []
        
        next_steps = case_data.get('next_steps', [])
        if isinstance(next_steps, str):
            try:
                next_steps = json.loads(next_steps)
            except:
                next_steps = []
        
        # Priority color mapping
        priority_colors = {
            'A': '#dc2626',  # Red - DV cases
            'B': '#ea580c',  # Orange - Civil harassment, elder abuse
            'C': '#ca8a04',  # Yellow - Workplace violence
            'D': '#16a34a'   # Green - General questions
        }
        priority_color = priority_colors.get(priority, '#6b7280')
        
        # Generate forms HTML
        forms_html = ""
        if forms:
            forms_html = "<h3>📋 Required Forms (Attached as PDFs):</h3><ul>"
            for form in forms:
                form_url = self.get_form_url(form)
                forms_html += f'<li><strong>{form}</strong> - <a href="{form_url}" target="_blank">Download Official Form</a></li>'
            forms_html += "</ul>"
        
        # Generate next steps HTML
        steps_html = ""
        if next_steps:
            steps_html = "<h3>📝 Next Steps:</h3><ol>"
            for step in next_steps:
                steps_html += f"<li>{step}</li>"
            steps_html += "</ol>"
        
        # Queue information HTML
        queue_html = ""
        if include_queue and queue_number != 'N/A':
            queue_html = f"""
            <div style="background-color: {priority_color}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h2 style="margin: 0; font-size: 24px;">Your Queue Number</h2>
                <div style="font-size: 48px; font-weight: bold; margin: 10px 0;">{queue_number}</div>
                <p style="margin: 0;">Please keep this number visible while waiting for assistance</p>
            </div>
            """
        
        return self._generate_enhanced_email_html(case_data, include_queue, queue_number, case_type, priority, language, user_name, priority_color, forms_html, steps_html, queue_html)
    
    def _generate_enhanced_email_html(self, case_data, include_queue, queue_number, case_type, priority, language, user_name, priority_color, forms_html, steps_html, queue_html):
        """Generate enhanced HTML email content with user-friendly format"""
        
        # Get enhanced summary data
        summary_json = case_data.get('summary_json', '{}')
        if isinstance(summary_json, str):
            try:
                summary_data = json.loads(summary_json)
            except:
                summary_data = {}
        else:
            summary_data = summary_json
        
        # Extract enhanced summary components
        header = summary_data.get('header', {})
        forms_completed = summary_data.get('forms_completed', [])
        key_answers = summary_data.get('key_answers', [])
        next_steps = summary_data.get('next_steps', [])
        resources = summary_data.get('resources', {})
        
        # Generate enhanced forms HTML with detailed guidance
        enhanced_forms_html = ""
        
        # Get forms from both the summary data and the case data
        all_forms = []
        if forms_completed:
            all_forms.extend(forms_completed)
        
        # Also check for forms in the case data
        documents_needed = case_data.get('documents_needed', [])
        if documents_needed:
            for form_code in documents_needed:
                if isinstance(form_code, str):
                    all_forms.append({
                        'form_code': form_code,
                        'title': self._get_form_title(form_code),
                        'description': self._get_form_description(form_code)
                    })
        
        if all_forms:
            enhanced_forms_html = "<h3>📋 Required Forms & Instructions:</h3>"
            for form in all_forms:
                form_code = form.get('form_code', '')
                form_title = form.get('title', '')
                form_description = form.get('description', '')
                
                # Get detailed form information
                form_details = self._get_form_details(form_code)
                
                enhanced_forms_html += f"""
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 15px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 style="margin: 0; color: #1e293b; font-size: 18px;">{form_code} - {form_title}</h4>
                        <a href="{self.get_form_url(form_code)}" target="_blank" style="background-color: #3b82f6; color: white; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-size: 14px;">Download Form</a>
                    </div>
                    <p style="margin: 10px 0; color: #475569; font-size: 14px;">{form_description}</p>
                    <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 10px 0;">
                        <h5 style="margin: 0 0 8px 0; color: #334155; font-size: 14px;">📝 How to Fill Out This Form:</h5>
                        <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 13px;">
                            {form_details.get('instructions', '<li>Read all instructions carefully before filling out</li><li>Use black ink and print clearly</li><li>Complete all required fields (marked with *)</li>')}
                        </ul>
                    </div>
                    <div style="background-color: #fef3c7; padding: 12px; border-radius: 6px; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0; color: #92400e; font-size: 13px; font-weight: 500;">⚠️ Important: {form_details.get('warning', 'Make sure to sign and date the form before filing with the court.')}</p>
                    </div>
                </div>
                """
        
        # Generate key answers HTML
        key_answers_html = ""
        if key_answers:
            key_answers_html = "<h3>📝 Your Information:</h3><ul>"
            for answer in key_answers:
                key_answers_html += f'<li>✓ {answer}</li>'
            key_answers_html += "</ul>"
        
        # Generate enhanced next steps HTML
        enhanced_steps_html = ""
        if next_steps:
            enhanced_steps_html = "<h3>✔ Next Steps:</h3>"
            for step in next_steps:
                action = step.get('action', '')
                priority_level = step.get('priority', 'medium')
                timeline = step.get('timeline', '')
                details = step.get('details', '')
                
                priority_class = {
                    'critical': 'background-color: #fef2f2; border-left: 4px solid #dc2626;',
                    'high': 'background-color: #fffbeb; border-left: 4px solid #ea580c;',
                    'medium': 'background-color: #f0f9ff; border-left: 4px solid #3b82f6;'
                }.get(priority_level, 'background-color: #f9fafb; border-left: 4px solid #6b7280;')
                
                enhanced_steps_html += f"""
                <div style="{priority_class} padding: 15px; margin: 10px 0; border-radius: 4px;">
                    <div style="font-weight: bold; margin-bottom: 5px;">{action}</div>
                    <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">
                        <strong>Timeline:</strong> {timeline}
                    </div>
                    <div style="font-size: 14px; color: #374151;">{details}</div>
                </div>
                """
        
        # Generate case-type specific filing instructions
        case_type = case_data.get('case_type', 'DVRO').upper()
        filing_instructions_html = self._get_case_specific_filing_instructions(case_type)

        # Generate legal information HTML
        legal_info_html = """
        <div style="background-color: #fefce8; border: 1px solid #eab308; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #a16207;">⚖️ Important Legal Information</h3>
            <div style="color: #a16207; font-size: 14px; line-height: 1.6;">
                <p style="margin: 0 0 10px 0;"><strong>This is not legal advice.</strong> The information provided is for general guidance only. Every case is different, and you should consult with an attorney for specific legal advice.</p>
                <p style="margin: 0 0 10px 0;"><strong>Court procedures can be complex.</strong> If you have questions about your case, contact the court's self-help center or consult with a qualified attorney.</p>
                <p style="margin: 0 0 10px 0;"><strong>Keep copies of everything.</strong> Make copies of all forms, court orders, and correspondence. Keep them in a safe place.</p>
                <p style="margin: 0 0 10px 0;"><strong>Follow all court orders.</strong> Violating a court order can result in serious consequences, including criminal charges.</p>
                <p style="margin: 0;"><strong>If you are in immediate danger, call 911.</strong> Court orders are not a substitute for emergency protection.</p>
            </div>
        </div>
        """

        # Generate resources HTML
        resources_html = ""
        if resources:
            court_info = resources.get('court_info', {})
            self_help = resources.get('self_help_center', {})
            legal_aid = resources.get('legal_aid', {})
            emergency = resources.get('emergency', {})
            
            resources_html = f"""
            <div class="section">
                <h3>📞 Resources & Help</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <h4 style="margin: 0 0 10px 0; color: #1f2937;">Court Information</h4>
                        <p style="margin: 5px 0; font-size: 14px;">{court_info.get('name', 'San Mateo County Superior Court')}</p>
                        <p style="margin: 5px 0; font-size: 14px;">{court_info.get('address', '400 County Center, Redwood City, CA 94063')}</p>
                        <p style="margin: 5px 0; font-size: 14px;">Phone: {court_info.get('phone', '(650) 261-5100')}</p>
                        <p style="margin: 5px 0; font-size: 14px;">Hours: {court_info.get('hours', 'Monday-Friday, 8:00 AM - 4:00 PM')}</p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <h4 style="margin: 0 0 10px 0; color: #1f2937;">Self-Help Center</h4>
                        <p style="margin: 5px 0; font-size: 14px;">Phone: {self_help.get('phone', '(650) 261-5100 ext. 2')}</p>
                        <p style="margin: 5px 0; font-size: 14px;">Hours: {self_help.get('hours', 'Monday-Friday, 8:30 AM - 12:00 PM')}</p>
                        <p style="margin: 5px 0; font-size: 14px;">Location: {self_help.get('location', 'Room 101, First Floor')}</p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <h4 style="margin: 0 0 10px 0; color: #1f2937;">Legal Aid</h4>
                        <p style="margin: 5px 0; font-size: 14px;">{legal_aid.get('name', 'Legal Aid Society of San Mateo County')}</p>
                        <p style="margin: 5px 0; font-size: 14px;">Phone: {legal_aid.get('phone', '(650) 558-0915')}</p>
                    </div>
                    <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border: 1px solid #fecaca;">
                        <h4 style="margin: 0 0 10px 0; color: #dc2626;">Emergency</h4>
                        <p style="margin: 5px 0; font-size: 14px; color: #dc2626;">Phone: {emergency.get('phone', '911')}</p>
                        <p style="margin: 5px 0; font-size: 14px; color: #dc2626;">{emergency.get('text', 'For immediate danger, call 911')}</p>
                    </div>
                </div>
            </div>
            """
        
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Court Case Summary</title>
            <style>
                body {{ 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px; 
                    background-color: #f9fafb;
                }}
                .header {{ 
                    background-color: #1f2937; 
                    color: white; 
                    padding: 30px; 
                    text-align: center; 
                    border-radius: 8px 8px 0 0; 
                }}
                .content {{ 
                    background-color: white; 
                    padding: 30px; 
                    border: 1px solid #e5e7eb; 
                }}
                .case-info {{ 
                    background-color: #f3f4f6; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin: 20px 0; 
                    border-left: 4px solid {priority_color};
                }}
                .section {{ 
                    margin: 25px 0; 
                    padding: 20px; 
                    background-color: #f9fafb; 
                    border-radius: 8px; 
                    border: 1px solid #e5e7eb;
                }}
                .footer {{ 
                    background-color: #1f2937; 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                    border-radius: 0 0 8px 8px; 
                    font-size: 14px; 
                }}
                .priority-badge {{
                    background-color: {priority_color};
                    color: white;
                    padding: 5px 15px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                    display: inline-block;
                }}
                h1 {{ color: white; margin: 0; }}
                h2 {{ color: #1f2937; margin-top: 0; }}
                h3 {{ color: #374151; }}
                h4 {{ color: #1f2937; margin: 0 0 10px 0; }}
                ul, ol {{ padding-left: 20px; }}
                li {{ margin: 8px 0; }}
                .important {{ 
                    background-color: #fef2f2; 
                    border: 1px solid #fecaca; 
                    color: #dc2626; 
                    padding: 15px; 
                    border-radius: 8px; 
                    margin: 20px 0;
                }}
                .attachment-note {{
                    background-color: #ecfdf5;
                    border: 1px solid #bbf7d0;
                    color: #166534;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                }}
                .disclaimer {{
                    background-color: #fffbeb;
                    border: 1px solid #fde68a;
                    color: #92400e;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏛️ San Mateo Family Court Clinic</h1>
                <p>Your Case Summary & Next Steps</p>
            </div>
            
            <div class="content">
                {queue_html}
                
                <div class="case-info">
                    <h2>📋 Case Information</h2>
                    <p><strong>Case Type:</strong> {case_type}</p>
                    <p><strong>Priority Level:</strong> <span class="priority-badge">{priority}</span></p>
                    <p><strong>Language:</strong> {language.upper()}</p>
                    <p><strong>Date Generated:</strong> {header.get('date', datetime.now().strftime('%B %d, %Y at %I:%M %p'))}</p>
                    <p><strong>Session ID:</strong> {header.get('session_id', 'N/A')}</p>
                    <p><strong>Location:</strong> {header.get('location', 'San Mateo County Superior Court Kiosk')}</p>
                    {f'<p><strong>Client Name:</strong> {user_name}</p>' if user_name else ''}
                </div>
                
                {key_answers_html}
                {enhanced_forms_html}
                
                <div class="attachment-note">
                    <h3>📎 PDF Attachments</h3>
                    <p>This email includes the following PDF attachments:</p>
                    <ul>
                        <li><strong>Case Summary Report</strong> - Complete overview of your case</li>
                        {''.join([f'<li><strong>{form.get("form_code", form)} Form</strong> - Template and instructions</li>' for form in forms_completed])}
                    </ul>
                </div>
                
                {enhanced_steps_html}
                
                {filing_instructions_html}
                
                {legal_info_html}
                
                {resources_html}
                
                <div class="disclaimer">
                    <h3>⚠️ Important Disclaimer</h3>
                    <p>This summary is for informational purposes only and does not constitute legal advice. Please consult with an attorney for legal guidance.</p>
                </div>
            </div>
            
            <div class="footer">
                <p>San Mateo Family Court Clinic<br>
                This is an automated message. Please do not reply to this email.</p>
                <p>Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
            </div>
        </body>
        </html>
        """
    
    def _generate_case_summary_html(self, case_data):
        """Generate HTML for case summary email"""
        queue_number = case_data.get('queue_number', 'N/A')
        case_type = case_data.get('case_type', 'Unknown')
        summary = case_data.get('summary', {})
        forms = summary.get('forms', [])
        steps = summary.get('steps', [])
        timeline = summary.get('timeline', [])
        important_notes = summary.get('importantNotes', [])
        
        forms_html = ""
        if forms:
            forms_html = "<h3>Required Forms:</h3><ul>"
            for form in forms:
                forms_html += f"<li>{form}</li>"
            forms_html += "</ul>"
        
        steps_html = ""
        if steps:
            steps_html = "<h3>Next Steps:</h3><ol>"
            for step in steps:
                steps_html += f"<li>{step}</li>"
            steps_html += "</ol>"
        
        timeline_html = ""
        if timeline:
            timeline_html = "<h3>Important Timeline:</h3><ul>"
            for item in timeline:
                timeline_html += f"<li>{item}</li>"
            timeline_html += "</ul>"
        
        notes_html = ""
        if important_notes:
            notes_html = "<h3>Important Notes:</h3><ul>"
            for note in important_notes:
                notes_html += f"<li style='color: #dc2626;'>{note}</li>"
            notes_html += "</ul>"
        
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Court Case Summary</title>
            <style>
                body {{ 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px; 
                }}
                .header {{ 
                    background-color: #1f2937; 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                    border-radius: 8px 8px 0 0; 
                }}
                .content {{ 
                    background-color: #f9fafb; 
                    padding: 20px; 
                    border: 1px solid #e5e7eb; 
                }}
                .queue-number {{ 
                    background-color: #dc2626; 
                    color: white; 
                    padding: 10px 20px; 
                    border-radius: 4px; 
                    font-size: 18px; 
                    font-weight: bold; 
                    display: inline-block; 
                    margin: 10px 0; 
                }}
                .section {{ 
                    margin: 20px 0; 
                    padding: 15px; 
                    background-color: white; 
                    border-radius: 4px; 
                    border-left: 4px solid #3b82f6; 
                }}
                .footer {{ 
                    background-color: #1f2937; 
                    color: white; 
                    padding: 15px; 
                    text-align: center; 
                    border-radius: 0 0 8px 8px; 
                    font-size: 14px; 
                }}
                h2 {{ color: #1f2937; margin-top: 0; }}
                h3 {{ color: #374151; }}
                ul, ol {{ padding-left: 20px; }}
                li {{ margin: 5px 0; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>San Mateo Family Court Clinic</h1>
                <p>Your Case Summary</p>
                <div class="queue-number">Queue Number: {queue_number}</div>
            </div>
            
            <div class="content">
                <div class="section">
                    <h2>Case Information</h2>
                    <p><strong>Case Type:</strong> {case_type}</p>
                    <p><strong>Date:</strong> {datetime.now().strftime('%B %d, %Y')}</p>
                </div>
                
                {forms_html}
                {steps_html}
                {timeline_html}
                {notes_html}
                
                <div class="section">
                    <h2>Important Reminders</h2>
                    <ul>
                        <li>Keep copies of all forms with you at all times</li>
                        <li>Arrive at court 15 minutes before your hearing</li>
                        <li>Bring all evidence and witnesses to court</li>
                        <li>Dress appropriately for court</li>
                        <li>If you have questions, contact court staff</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>San Mateo Family Court Clinic<br>
                This is an automated message. Please do not reply to this email.</p>
            </div>
        </body>
        </html>
        """
    
    def _generate_queue_notification_html(self, queue_data):
        """Generate HTML for queue notification email"""
        queue_number = queue_data.get('queue_number', 'N/A')
        estimated_wait = queue_data.get('estimated_wait_time', 30)
        case_type = queue_data.get('case_type', 'Unknown')
        
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Queue Notification</title>
            <style>
                body {{ 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px; 
                }}
                .header {{ 
                    background-color: #059669; 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                    border-radius: 8px 8px 0 0; 
                }}
                .content {{ 
                    background-color: #f9fafb; 
                    padding: 20px; 
                    border: 1px solid #e5e7eb; 
                }}
                .queue-number {{ 
                    background-color: #dc2626; 
                    color: white; 
                    padding: 15px 25px; 
                    border-radius: 4px; 
                    font-size: 24px; 
                    font-weight: bold; 
                    display: inline-block; 
                    margin: 15px 0; 
                }}
                .info-box {{ 
                    background-color: white; 
                    padding: 15px; 
                    border-radius: 4px; 
                    border-left: 4px solid #059669; 
                    margin: 15px 0; 
                }}
                .footer {{ 
                    background-color: #1f2937; 
                    color: white; 
                    padding: 15px; 
                    text-align: center; 
                    border-radius: 0 0 8px 8px; 
                    font-size: 14px; 
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>San Mateo Family Court Clinic</h1>
                <p>You've Been Added to the Queue</p>
            </div>
            
            <div class="content">
                <div style="text-align: center;">
                    <div class="queue-number">{queue_number}</div>
                    <p>Please keep this number visible while you wait.</p>
                </div>
                
                <div class="info-box">
                    <h3>Queue Information</h3>
                    <p><strong>Case Type:</strong> {case_type}</p>
                    <p><strong>Estimated Wait Time:</strong> {estimated_wait} minutes</p>
                    <p><strong>Status:</strong> Waiting</p>
                </div>
                
                <div class="info-box">
                    <h3>What to Expect</h3>
                    <ul>
                        <li>Your number will be called when it's your turn</li>
                        <li>Please wait in the designated waiting area</li>
                        <li>You can use the kiosk while waiting</li>
                        <li>A facilitator will assist you with your case</li>
                    </ul>
                </div>
                
                <div class="info-box">
                    <h3>Important Reminders</h3>
                    <ul>
                        <li>Keep your queue number visible</li>
                        <li>Stay in the waiting area</li>
                        <li>Listen for your number to be called</li>
                        <li>If you need to step away, inform staff</li>
                    </ul>
                </div>
            </div>
            
            <div class="footer">
                <p>San Mateo Family Court Clinic<br>
                This is an automated message. Please do not reply to this email.</p>
            </div>
        </body>
        </html>
        """
    
    def _generate_facilitator_notification_html(self, case_data):
        """Generate HTML for facilitator notification email"""
        queue_number = case_data.get('queue_number', 'N/A')
        case_type = case_data.get('case_type', 'Unknown')
        priority = case_data.get('priority_level', 'C')
        language = case_data.get('language', 'en')
        user_name = case_data.get('user_name', 'Anonymous')
        
        priority_color = {
            'A': '#dc2626',
            'B': '#ea580c', 
            'C': '#ca8a04',
            'D': '#16a34a'
        }.get(priority, '#6b7280')
        
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Case in Queue</title>
            <style>
                body {{ 
                    font-family: Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px; 
                }}
                .header {{ 
                    background-color: #1f2937; 
                    color: white; 
                    padding: 20px; 
                    text-align: center; 
                    border-radius: 8px 8px 0 0; 
                }}
                .content {{ 
                    background-color: #f9fafb; 
                    padding: 20px; 
                    border: 1px solid #e5e7eb; 
                }}
                .queue-number {{ 
                    background-color: {priority_color}; 
                    color: white; 
                    padding: 15px 25px; 
                    border-radius: 4px; 
                    font-size: 24px; 
                    font-weight: bold; 
                    display: inline-block; 
                    margin: 15px 0; 
                }}
                .info-box {{ 
                    background-color: white; 
                    padding: 15px; 
                    border-radius: 4px; 
                    border-left: 4px solid #3b82f6; 
                    margin: 15px 0; 
                }}
                .footer {{ 
                    background-color: #1f2937; 
                    color: white; 
                    padding: 15px; 
                    text-align: center; 
                    border-radius: 0 0 8px 8px; 
                    font-size: 14px; 
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>New Case in Queue</h1>
                <p>Facilitator Notification</p>
            </div>
            
            <div class="content">
                <div style="text-align: center;">
                    <div class="queue-number">{queue_number}</div>
                    <p>New case requires facilitator assistance</p>
                </div>
                
                <div class="info-box">
                    <h3>Case Details</h3>
                    <p><strong>Queue Number:</strong> {queue_number}</p>
                    <p><strong>Case Type:</strong> {case_type}</p>
                    <p><strong>Priority Level:</strong> {priority}</p>
                    <p><strong>Language:</strong> {language.upper()}</p>
                    <p><strong>User Name:</strong> {user_name}</p>
                    <p><strong>Time Added:</strong> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}</p>
                </div>
                
                <div class="info-box">
                    <h3>Action Required</h3>
                    <p>Please review this case in the facilitator dashboard and assist the client when ready.</p>
                </div>
            </div>
            
            <div class="footer">
                <p>San Mateo Family Court Clinic<br>
                This is an automated notification for facilitators.</p>
            </div>
        </body>
        </html>
        """
