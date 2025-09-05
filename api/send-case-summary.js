import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, case_data } = req.body;

    if (!email || !case_data) {
      return res.status(400).json({ error: 'Email and case_data are required' });
    }

    // Extract data from case_data
    const queue_number = case_data.queue_number || `DVRO${Math.floor(Math.random() * 9000) + 1000}`;
    const case_type = case_data.case_type || 'DVRO';
    const summary = case_data.summary || {};

    // Extract forms, steps, timeline, and notes from the detailed summary
    const forms = summary.forms || [];
    const steps = summary.steps || [];
    const timeline = summary.timeline || [];
    const important_notes = summary.importantNotes || [];

    // Generate forms HTML
    const forms_html = forms.map(form => {
      const url = `https://www.courts.ca.gov/documents/${form.code}.pdf`;
      return `<li><a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline;">${form.code}</a> - <a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #059669; text-decoration: none;">View PDF</a></li>`;
    }).join('');

    // Generate steps HTML
    const steps_html = steps.map(step => `<li>${step}</li>`).join('');

    // Generate timeline HTML
    const timeline_html = timeline.map(item => `<li>${item}</li>`).join('');

    // Generate notes HTML
    const notes_html = important_notes.map(note => `<li>${note}</li>`).join('');

    // Prepare PDF attachments
    const attachments = [];
    const court_documents_path = path.join(process.cwd(), 'court_documents');
    
    try {
      // Check if court_documents directory exists
      if (fs.existsSync(court_documents_path)) {
        // Get all PDF files from the forms list
        for (const form of forms) {
          const pdf_filename = `${form.code}.pdf`;
          const pdf_path = path.join(court_documents_path, pdf_filename);
          
          if (fs.existsSync(pdf_path)) {
            const pdf_content = fs.readFileSync(pdf_path);
            attachments.push({
              filename: pdf_filename,
              content: pdf_content.toString('base64'),
              type: 'application/pdf'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error preparing PDF attachments:', error);
    }

    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin: 0; font-size: 24px;">Family Court Clinic</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Case Summary</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0; color: #374151;"><strong>Queue Number:</strong> ${queue_number}</p>
            <p style="margin: 5px 0 0 0; color: #374151;"><strong>Case Type:</strong> ${case_type}</p>
          </div>

          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 25px;">Required Forms</h3>
          <ul style="color: #374151; line-height: 1.6;">
            ${forms_html}
          </ul>

          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 25px;">Next Steps</h3>
          <ul style="color: #374151; line-height: 1.6;">
            ${steps_html}
          </ul>

          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 25px;">Important Timeline</h3>
          <ul style="color: #374151; line-height: 1.6;">
            ${timeline_html}
          </ul>

          <h3 style="color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-top: 25px;">Important Notes</h3>
          <ul style="color: #374151; line-height: 1.6;">
            ${notes_html}
          </ul>

          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin-top: 25px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Note:</strong> All relevant court documents have been attached to this email for your convenience.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              If you have any questions, please contact the Family Court Clinic.
            </p>
          </div>
        </div>
      </div>
    `;

    // Send email using Resend
    const emailData = {
      from: 'Family Court Clinic <onboarding@resend.dev>',
      to: [email],
      subject: `Case Summary - ${queue_number}`,
      html: emailContent,
    };

    // Add attachments if any
    if (attachments.length > 0) {
      emailData.attachments = attachments;
    }

    const response = await resend.emails.send(emailData);

    console.log('Email sent successfully:', response);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      email_id: response.data?.id
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send email'
    });
  }
}
