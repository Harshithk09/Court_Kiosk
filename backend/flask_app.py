import os
import json
from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from google.generativeai import GenerativeModel
from threading import Thread
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# --- CONFIGURATION ---

# App and Database Config
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///conversations.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# LLM Config (Make sure your GOOGLE_API_KEY is set as an environment variable)
model = GenerativeModel('gemini-pro')

# Email Config (Use environment variables for security)
EMAIL_HOST = os.environ.get('EMAIL_HOST') # e.g., 'smtp.gmail.com'
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USER = os.environ.get('EMAIL_USER')
EMAIL_PASS = os.environ.get('EMAIL_PASS')
FACILITATOR_EMAIL = os.environ.get('FACILITATOR_EMAIL') # The office's email

# Load the Q&A knowledge base
with open('qna_knowledge.json', 'r') as f:
    knowledge_base = json.load(f)
    knowledge_text = "\n\n".join([f"Q: {item['question']}\nA: {item['answer']}" for item in knowledge_base])

# Load the flowchart for guided flows
with open('flowchart.json', 'r') as f:
    flowchart_data = json.load(f)

# --- MOCK DATA ---
# In a real system, this would be a call to an external court API.
MOCK_CASE_STATUS_DB = {
    "SMC-DV-2024-111": "GunHave",      # Simulates a user who has been served and needs to deal with firearms.
    "SMC-DV-2024-222": "FL150Check",   # Simulates a user who is at the financial disclosure step.
    "SMC-DV-2024-333": "RespWantWrite",# Simulates a user deciding whether to file a written response.
}

# --- DATABASE MODEL ---

class Conversation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    case_number = db.Column(db.String(50), nullable=True)
    user_email = db.Column(db.String(120), nullable=False)
    conversation_summary = db.Column(db.Text, nullable=False)
    language = db.Column(db.String(10), nullable=False, default='en')
    timestamp = db.Column(db.DateTime, server_default=db.func.now())

    def __repr__(self):
        return f'<Conversation {self.id} for {self.user_email}>'

# --- ROUTES ---

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_info', methods=['POST'])
def get_info():
    """Handles simple, one-off informational requests from buttons."""
    data = request.json
    topic = data.get('topic')
    language = data.get('language', 'English') # Default to English

    # --- Non-LLM Implementation ---
    # Find the question in the knowledge base that most closely matches the topic.
    # This is more robust and faster than an LLM for predictable Q&A.
    found_answer = "I'm sorry, I don't have information on that specific topic."
    for item in knowledge_base:
        # A simple `in` check is good enough for this button-driven approach.
        # For more complex matching, you could use a library like fuzzywuzzy.
        if topic.lower() in item['question'].lower():
            found_answer = item['answer']
            break
    
    # TODO: If you implement full multilingual support, you would translate `found_answer` here
    # before returning it.

    return jsonify({'reply': found_answer})

@app.route('/flow_step', methods=['POST'])
def flow_step():
    """
    Handles a step in a guided flow.
    It receives the ID of the next node and returns that node's data.
    """
    data = request.json
    node_id = data.get('node_id')
    language = data.get('language', 'English') # Future use: translate content

    if not node_id:
        return jsonify({'error': 'No node_id provided'}), 400

    node_data = flowchart_data.get(node_id)

    if not node_data:
        return jsonify({'error': 'Invalid node_id'}), 404
    
    # In a real implementation, you would translate node_data['text'] here
    # based on the 'language' parameter before returning.
    return jsonify(node_data)

@app.route('/lookup_case', methods=['POST'])
def lookup_case():
    """Looks up a case number in our mock DB and returns the user's current step."""
    data = request.json
    case_number = data.get('caseNumber', '').strip()

    if not case_number:
        return jsonify({'status': 'error', 'message': 'Please provide a case number.'}), 400

    # Look up the case number in our mock database (case-insensitive)
    node_id = MOCK_CASE_STATUS_DB.get(case_number.upper())

    if node_id:
        return jsonify({'status': 'success', 'node_id': node_id})
    else:
        return jsonify({'status': 'not_found', 'message': 'Case number not found. Please check the number or start a new session below.'})

@app.route('/facilitator_view')
def facilitator_view():
    """A simple, unprotected view for facilitators to see conversation logs."""
    # In a real application, this route should be protected by a login.
    # Query all conversations, ordering by the most recent first.
    conversations = Conversation.query.order_by(Conversation.timestamp.desc()).all()
    return render_template('facilitator_view.html', conversations=conversations)

@app.route('/save_and_email', methods=['POST'])
def save_and_email():
    data = request.json
    user_email = data.get('email')
    case_number = data.get('caseNumber')
    chat_history = data.get('history') # Expecting a string of the conversation
    summary = data.get('summary') # Or a pre-made summary

    if not user_email or not (chat_history or summary):
        return jsonify({'error': 'Missing email or content to send'}), 400

    # Save to database
    new_conversation = Conversation(
        user_email=user_email,
        case_number=case_number,
        conversation_summary=summary
    )
    db.session.add(new_conversation)
    db.session.commit()

    # --- Send emails in a background thread to avoid blocking the request ---
    email_subject = f"DVRO Kiosk Summary (Case: {case_number or 'N/A'})"
    
    # We need to pass the app context to the new thread
    app_context = app.app_context()
    
    user_thread = Thread(target=send_summary_email_async, args=[app_context, user_email, email_subject, summary])
    user_thread.start()
    
    if FACILITATOR_EMAIL:
        facilitator_thread = Thread(target=send_summary_email_async, args=[app_context, FACILITATOR_EMAIL, email_subject, summary])
        facilitator_thread.start()

    return jsonify({'status': 'success', 'message': 'Summary saved and will be emailed shortly.'})

# --- HELPER FUNCTIONS ---

def send_summary_email_async(app_context, to_address, subject, body):
    with app_context:
        send_summary_email(to_address, subject, body)

def send_summary_email(to_address, subject, body):
    if not all([EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS]):
        print("Email configuration is missing. Skipping email.")
        return False

    msg = MIMEMultipart()
    msg['From'] = EMAIL_USER
    msg['To'] = to_address
    msg['Subject'] = subject
    
    # You can add links to required forms here
    email_body = f"{body}\n\nHelpful Links:\n- DV-100 Form: [Link to PDF]\n- FL-150 Form: [Link to PDF]"
    msg.attach(MIMEText(email_body, 'plain'))

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)
            print(f"Email sent successfully to {to_address}")
            return True
    except Exception as e:
        print(f"Failed to send email to {to_address}: {e}")
        return False

if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Creates the database file and table if they don't exist
    app.run(debug=True)