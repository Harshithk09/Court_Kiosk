// Vercel serverless function for sending case summary emails
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, case_data } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!case_data) {
      return res.status(400).json({ error: 'Case data is required' });
    }

    // Generate email content
    const subject = `Your DVRO Case Summary - Queue #${case_data.queue_number || 'N/A'}`;
    
    // Create HTML email content
    const htmlContent = generateEmailHTML(case_data);
    const textContent = generateEmailText(case_data);

    // Send email using Resend
    const result = await resend.emails.send({
      from: 'San Mateo Court Kiosk <noreply@your-domain.com>', // Replace with your verified domain
      to: email,
      subject: subject,
      html: htmlContent,
      text: textContent,
    });

    console.log('Email sent successfully:', result);

    return res.status(200).json({
      success: true,
      message: 'Case summary email sent successfully',
      email_id: result.data?.id,
      queue_number: case_data.queue_number
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email'
    });
  }
}

function generateEmailHTML(caseData) {
  const { queue_number, case_type, summary } = caseData;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your DVRO Case Summary</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f8fafc; }
        .section { margin-bottom: 20px; }
        .section h3 { color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        .form-list { background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .step-list { background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .timeline-item { background-color: #fef3c7; padding: 10px; margin: 5px 0; border-left: 4px solid #f59e0b; }
        .important-note { background-color: #fee2e2; padding: 10px; margin: 5px 0; border-left: 4px solid #ef4444; }
        .footer { background-color: #374151; color: white; padding: 20px; text-align: center; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>San Mateo County Court</h1>
          <h2>Your DVRO Case Summary</h2>
        </div>
        
        <div class="content">
          <div class="section">
            <h3>Case Information</h3>
            <p><strong>Queue Number:</strong> ${queue_number || 'N/A'}</p>
            <p><strong>Case Type:</strong> ${case_type || 'Domestic Violence Restraining Order'}</p>
            <p><strong>Priority Level:</strong> A (High Priority)</p>
          </div>

          ${summary.forms && summary.forms.length > 0 ? `
          <div class="section">
            <h3>Required Forms</h3>
            <div class="form-list">
              ${summary.forms.map(form => `<div>• ${form}</div>`).join('')}
            </div>
          </div>
          ` : ''}

          ${summary.steps && summary.steps.length > 0 ? `
          <div class="section">
            <h3>Next Steps</h3>
            <div class="step-list">
              <ol>
                ${summary.steps.map(step => `<li>${step}</li>`).join('')}
              </ol>
            </div>
          </div>
          ` : ''}

          ${summary.timeline && summary.timeline.length > 0 ? `
          <div class="section">
            <h3>Important Timeline</h3>
            ${summary.timeline.map(item => `<div class="timeline-item">• ${item}</div>`).join('')}
          </div>
          ` : ''}

          ${summary.importantNotes && summary.importantNotes.length > 0 ? `
          <div class="section">
            <h3>Important Notes</h3>
            ${summary.importantNotes.map(note => `<div class="important-note">• ${note}</div>`).join('')}
          </div>
          ` : ''}

          <div class="section">
            <h3>Emergency Information</h3>
            <p><strong>If you are in immediate danger, call 911</strong></p>
            <p>Keep copies of all forms with you at all times. The other party must be served for the order to be valid.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>San Mateo County Court Kiosk System</p>
          <p>This is an automated message. Please contact court staff for assistance.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateEmailText(caseData) {
  const { queue_number, case_type, summary } = caseData;
  
  let text = `
SAN MATEO COUNTY COURT - YOUR DVRO CASE SUMMARY

Case Information:
- Queue Number: ${queue_number || 'N/A'}
- Case Type: ${case_type || 'Domestic Violence Restraining Order'}
- Priority Level: A (High Priority)

`;

  if (summary.forms && summary.forms.length > 0) {
    text += `Required Forms:\n`;
    summary.forms.forEach(form => {
      text += `• ${form}\n`;
    });
    text += `\n`;
  }

  if (summary.steps && summary.steps.length > 0) {
    text += `Next Steps:\n`;
    summary.steps.forEach((step, index) => {
      text += `${index + 1}. ${step}\n`;
    });
    text += `\n`;
  }

  if (summary.timeline && summary.timeline.length > 0) {
    text += `Important Timeline:\n`;
    summary.timeline.forEach(item => {
      text += `• ${item}\n`;
    });
    text += `\n`;
  }

  if (summary.importantNotes && summary.importantNotes.length > 0) {
    text += `Important Notes:\n`;
    summary.importantNotes.forEach(note => {
      text += `• ${note}\n`;
    });
    text += `\n`;
  }

  text += `
Emergency Information:
- If you are in immediate danger, call 911
- Keep copies of all forms with you at all times
- The other party must be served for the order to be valid

---
San Mateo County Court Kiosk System
This is an automated message. Please contact court staff for assistance.
`;

  return text;
}
