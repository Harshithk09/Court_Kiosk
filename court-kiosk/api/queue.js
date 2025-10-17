// Vercel serverless function for queue management
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Return queue status
    try {
      const mockQueueData = {
        waiting: [
          {
            queue_number: 'A001',
            case_type: 'DVRO',
            priority_level: 'A',
            user_name: 'Maria Garcia',
            user_email: 'maria@example.com',
            phone_number: '(555) 123-4567',
            language: 'es',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            status: 'waiting'
          },
          {
            queue_number: 'A002',
            case_type: 'DVRO',
            priority_level: 'A',
            user_name: 'John Smith',
            user_email: 'john@example.com',
            phone_number: '(555) 987-6543',
            language: 'en',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            status: 'waiting'
          }
        ],
        in_progress: [],
        completed: []
      };

      return res.status(200).json({
        success: true,
        ...mockQueueData,
        total_in_queue: mockQueueData.waiting.length,
        estimated_wait_minutes: mockQueueData.waiting.length * 15
      });

    } catch (error) {
      console.error('Error getting queue status:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to get queue status'
      });
    }
  }

  if (req.method === 'POST') {
    // Add to queue
    try {
      const { case_type, user_name, user_email, phone_number, language } = req.body;

      if (!case_type) {
        return res.status(400).json({ 
          success: false,
          error: 'Case type is required' 
        });
      }

      // Generate queue number
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000);
      const queueNumber = `A${String(randomNum).padStart(3, '0')}`;

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

  return res.status(405).json({ error: 'Method not allowed' });
}
