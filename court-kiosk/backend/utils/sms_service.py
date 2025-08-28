import os
import re
from twilio.rest import Client
from twilio.base.exceptions import TwilioException

class SMSService:
    def __init__(self):
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.from_number = os.getenv('TWILIO_FROM_E164')
        
        if all([self.account_sid, self.auth_token, self.from_number]):
            try:
                self.client = Client(self.account_sid, self.auth_token)
                self.enabled = True
            except Exception as e:
                print(f"Failed to initialize Twilio client: {e}")
                self.enabled = False
        else:
            print("Twilio credentials not configured. SMS notifications disabled.")
            self.enabled = False
    
    def format_phone_number(self, phone):
        """Format phone number to E.164 format"""
        if not phone:
            return None
        
        # Remove all non-digit characters
        digits = re.sub(r'\D', '', phone)
        
        # Handle US numbers
        if len(digits) == 10:
            return f"+1{digits}"
        elif len(digits) == 11 and digits.startswith('1'):
            return f"+{digits}"
        elif len(digits) > 11 and digits.startswith('1'):
            return f"+{digits[:11]}"
        elif len(digits) == 10:
            return f"+1{digits}"
        
        # If it's already in E.164 format, return as is
        if phone.startswith('+'):
            return phone
        
        return None
    
    def send_queue_notification(self, phone, queue_number, location="the counter"):
        """Send SMS notification when queue number is called"""
        if not self.enabled:
            print(f"SMS disabled. Would send to {phone}: Now serving #{queue_number}")
            return {'success': False, 'reason': 'sms_disabled'}
        
        formatted_phone = self.format_phone_number(phone)
        if not formatted_phone:
            return {'success': False, 'reason': 'invalid_phone'}
        
        message_body = f"Family Court Kiosk: Now serving ticket #{queue_number}. Please proceed to {location}."
        
        try:
            message = self.client.messages.create(
                from_=self.from_number,
                to=formatted_phone,
                body=message_body
            )
            
            return {
                'success': True,
                'message_sid': message.sid,
                'to': formatted_phone,
                'body': message_body
            }
            
        except TwilioException as e:
            print(f"Twilio SMS error: {e}")
            return {
                'success': False,
                'reason': 'twilio_error',
                'error': str(e)
            }
        except Exception as e:
            print(f"Unexpected SMS error: {e}")
            return {
                'success': False,
                'reason': 'unknown_error',
                'error': str(e)
            }
    
    def send_test_message(self, phone):
        """Send a test SMS message"""
        if not self.enabled:
            return {'success': False, 'reason': 'sms_disabled'}
        
        formatted_phone = self.format_phone_number(phone)
        if not formatted_phone:
            return {'success': False, 'reason': 'invalid_phone'}
        
        message_body = "This is a test message from the Family Court Kiosk SMS service."
        
        try:
            message = self.client.messages.create(
                from_=self.from_number,
                to=formatted_phone,
                body=message_body
            )
            
            return {
                'success': True,
                'message_sid': message.sid,
                'to': formatted_phone
            }
            
        except Exception as e:
            return {
                'success': False,
                'reason': 'error',
                'error': str(e)
            }

# Global SMS service instance
sms_service = SMSService()
