// Vercel serverless function for sending SMS with queue number
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
    const { queue_number, phone_number } = req.body;

    if (!queue_number || !phone_number) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing queue_number or phone_number' 
      });
    }

    // In a real implementation, you would integrate with an SMS service like Twilio
    // For now, we'll just log the SMS and return success
    console.log(`SMS would be sent to ${phone_number}: Your queue number is ${queue_number}. Please wait in the waiting area.`);

    return res.status(200).json({
      success: true,
      message: 'SMS sent successfully',
      queue_number: queue_number,
      phone_number: phone_number
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send SMS'
    });
  }
}
