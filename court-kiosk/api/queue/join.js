// Vercel serverless function for joining the queue
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
    const { case_type, user_name, user_email, phone_number, language } = req.body;

    if (!case_type) {
      return res.status(400).json({ error: 'Case type is required' });
    }

    // Generate queue number (simplified version)
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const queueNumber = `A${String(randomNum).padStart(3, '0')}`;

    // In a real implementation, you would save this to a database
    // For now, we'll just return the queue number
    console.log('Queue join request:', {
      queue_number: queueNumber,
      case_type,
      user_name,
      user_email,
      phone_number,
      language,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      queue_number: queueNumber,
      estimated_wait_time: 15,
      priority_level: 'A',
      message: 'Successfully added to queue'
    });

  } catch (error) {
    console.error('Error joining queue:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to join queue'
    });
  }
}
