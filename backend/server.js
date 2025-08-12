const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to other services
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// PDF Generation function
const generatePDF = (topic, answers, forms, nextSteps, location) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Add content to PDF
    doc.fontSize(24).text('Court Self-Help Center', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(`${topic} - Form Recommendations`, { align: 'center' });
    doc.moveDown(2);

    // Add forms section with null checks
    doc.fontSize(16).text('Required Forms:', { underline: true });
    doc.moveDown();
    
    if (Array.isArray(forms)) {
      forms.forEach((form, index) => {
        doc.fontSize(12).text(`${index + 1}. ${form.number} - ${form.name}`);
        doc.fontSize(10).text(`   ${form.description}`, { color: 'gray' });
        if (form.required) {
          doc.fontSize(10).text('   Required', { color: 'red' });
        }
        doc.moveDown();
      });
    } else {
      doc.fontSize(12).text('No forms specified');
      doc.moveDown();
    }

    doc.moveDown();
    doc.fontSize(16).text('Next Steps:', { underline: true });
    doc.moveDown();
    
    if (Array.isArray(nextSteps)) {
      nextSteps.forEach((step, index) => {
        doc.fontSize(12).text(`${index + 1}. ${step}`);
        doc.moveDown();
      });
    } else {
      doc.fontSize(12).text('No next steps specified');
      doc.moveDown();
    }

    if (location) {
      doc.moveDown();
      doc.fontSize(16).text('Court Information:', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text(location.name);
      doc.fontSize(10).text(location.address);
      doc.fontSize(10).text(`Phone: ${location.phone}`);
      doc.fontSize(10).text(`Hours: ${location.hours}`);
    }

    doc.moveDown(2);
    doc.fontSize(10).text('Disclaimer: This information is provided for general guidance only and does not constitute legal advice.', { color: 'gray' });

    doc.end();
  });
};

const semanticSearchRouter = require('./routes/semanticSearch');
app.use(semanticSearchRouter);

// Routes
app.post('/api/send-email', async (req, res) => {
  try {
    const { email, topic, answers, forms, nextSteps, location } = req.body;

    // Generate PDF
    const pdfBuffer = await generatePDF(topic, answers, forms, nextSteps, location);

    // Email options with null checks
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: `Court Forms - ${topic}`,
      html: `
        <h2>Court Self-Help Center</h2>
        <p>Thank you for using our self-help system. Here are your personalized form recommendations for ${topic}.</p>
        
        <h3>Required Forms:</h3>
        <ul>
          ${Array.isArray(forms) ? forms.map(form => `<li><strong>${form.number}</strong> - ${form.name}<br><em>${form.description}</em></li>`).join('') : '<li>No forms specified</li>'}
        </ul>
        
        <h3>Next Steps:</h3>
        <ol>
          ${Array.isArray(nextSteps) ? nextSteps.map(step => `<li>${step}</li>`).join('') : '<li>No next steps specified</li>'}
        </ol>
        
        ${location ? `
        <h3>Court Information:</h3>
        <p><strong>${location.name}</strong><br>
        ${location.address}<br>
        Phone: ${location.phone}<br>
        Hours: ${location.hours}</p>
        ` : ''}
        
        <p><em>Disclaimer: This information is provided for general guidance only and does not constitute legal advice.</em></p>
      `,
      attachments: [
        {
          filename: `court-forms-${topic}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { topic, answers, forms, nextSteps, location } = req.body;

    // Generate PDF
    const pdfBuffer = await generatePDF(topic, answers, forms, nextSteps, location);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=court-forms-${topic}.pdf`);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to generate PDF' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});