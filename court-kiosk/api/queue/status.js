// Vercel serverless function for getting queue status
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // In a real implementation, you would fetch this from a database
    // For now, we'll return mock data
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

    return res.status(200).json(mockQueueData);

  } catch (error) {
    console.error('Error getting queue status:', error);
    return res.status(500).json({
      error: error.message || 'Failed to get queue status'
    });
  }
}
