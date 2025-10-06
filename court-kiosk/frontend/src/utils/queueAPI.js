// Queue API utility for connecting with backend
import { API_ENDPOINTS, buildApiUrl, isProduction } from './apiConfig';

// Configuration constants
const CONFIG = {
  DEFAULT_CASE_TYPE: 'DVRO',
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_PRIORITY: 'A',
  DEFAULT_WAIT_TIME: 15,
  QUEUE_NUMBER_PREFIX: 'A',
  QUEUE_NUMBER_PADDING: 4
};

// Mock queue data for development (replace with real backend calls)
let mockQueue = [];
let queueCounter = 1;

/**
 * Helper function to make HTTP requests with consistent error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
const makeRequest = async (endpoint, options = {}) => {
  try {
    const url = buildApiUrl(endpoint);
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.log(`API request failed for ${endpoint}:`, error.message);
    if (isProduction()) {
      console.error('Production API error:', error);
    }
    throw error;
  }
};

/**
 * Helper function to handle backend fallback logic
 * @param {Function} backendCall - Function that calls the backend
 * @param {Function} fallbackCall - Function to call if backend fails
 * @returns {Promise<Object>} Result from backend or fallback
 */
const withFallback = async (backendCall, fallbackCall) => {
  try {
    return await backendCall();
  } catch (error) {
    console.log('Backend not available, using fallback:', error.message);
    return await fallbackCall();
  }
};

/**
 * Generate a queue number for mock queue
 * @param {string} existingNumber - Existing queue number if any
 * @returns {string} Generated queue number
 */
const generateQueueNumber = (existingNumber) => {
  if (existingNumber) return existingNumber;
  
  return `${CONFIG.QUEUE_NUMBER_PREFIX}${String(queueCounter).padStart(CONFIG.QUEUE_NUMBER_PADDING, '0')}`;
};

/**
 * Create a queue item object
 * @param {Object} queueData - Queue data
 * @param {string} queueNumber - Queue number
 * @returns {Object} Queue item
 */
const createQueueItem = (queueData, queueNumber) => ({
  queue_number: queueNumber,
  priority: queueData.priority || CONFIG.DEFAULT_PRIORITY,
  case_type: queueData.case_type || 'Domestic Violence',
  arrived_at: new Date().toISOString(),
  timestamp: new Date().toISOString(),
  status: 'waiting',
  answers: queueData.answers,
  history: queueData.history,
  summary: queueData.summary
});

/**
 * Save mock queue to localStorage
 */
const saveMockQueue = () => {
  localStorage.setItem('mockQueue', JSON.stringify(mockQueue));
  localStorage.setItem('queueCounter', queueCounter.toString());
};

/**
 * Load mock queue from localStorage
 */
const loadMockQueue = () => {
  const storedQueue = localStorage.getItem('mockQueue');
  const storedCounter = localStorage.getItem('queueCounter');
  
  if (storedQueue) {
    mockQueue = JSON.parse(storedQueue);
  }
  if (storedCounter) {
    queueCounter = parseInt(storedCounter);
  }
};

/**
 * Add a new case to the queue
 * @param {Object} queueData - Queue data containing case information
 * @returns {Promise<Object>} Queue operation result
 */
export const addToQueue = async (queueData) => {
  const backendCall = async () => {
    // Align with Flask backend: /api/generate-queue
    const result = await makeRequest(API_ENDPOINTS.GENERATE_QUEUE, {
      method: 'POST',
      body: JSON.stringify({
        case_type: queueData.case_type || CONFIG.DEFAULT_CASE_TYPE,
        priority: queueData.priority || CONFIG.DEFAULT_PRIORITY,
        language: queueData.language || CONFIG.DEFAULT_LANGUAGE,
        user_name: queueData.user_name || '',
        user_email: queueData.user_email || '',
        phone_number: queueData.phone_number || ''
      })
    });

    // Flask returns { queue_number } on success
    if (result.queue_number && queueData.phone_number) {
      await sendQueueNumberSMS(result.queue_number, queueData.phone_number);
    }

    return {
      success: Boolean(result.queue_number),
      queue_number: result.queue_number,
      estimated_wait_time: CONFIG.DEFAULT_WAIT_TIME,
      priority_level: queueData.priority || CONFIG.DEFAULT_PRIORITY
    };
  };

  const fallbackCall = async () => {
    const queueNumber = generateQueueNumber(queueData.queue_number);
    const queueItem = createQueueItem(queueData, queueNumber);

    // Check if queue number already exists
    const existingIndex = mockQueue.findIndex(item => item.queue_number === queueNumber);
    if (existingIndex !== -1) {
      // Update existing entry
      mockQueue[existingIndex] = queueItem;
    } else {
      // Add new entry
      mockQueue.push(queueItem);
      if (!queueData.queue_number) {
        queueCounter++;
      }
    }

    saveMockQueue();

    // Send SMS for mock queue too
    if (queueData.phone_number) {
      await sendQueueNumberSMS(queueNumber, queueData.phone_number);
    }

    return {
      success: true,
      queue_number: queueNumber,
      estimated_wait_time: CONFIG.DEFAULT_WAIT_TIME,
      priority_level: CONFIG.DEFAULT_PRIORITY
    };
  };

  return await withFallback(backendCall, fallbackCall);
};

/**
 * Add test data to mock queue for development/testing
 * @returns {Promise<Object>} Result of adding test data
 */
export const addTestData = async () => {
  const testCases = [
    {
      queue_number: 'A001',
      priority_level: 'A',
      case_type: 'Domestic Violence',
      user_name: 'Maria Garcia',
      language: 'es',
      status: 'waiting',
      arrived_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      answers: { emergency: 'yes', children: 'yes' },
      history: ['Emergency protection needed', 'Children involved']
    },
    {
      queue_number: 'A002',
      priority_level: 'A',
      case_type: 'Domestic Violence',
      user_name: 'Carlos Lopez',
      language: 'es',
      status: 'waiting',
      arrived_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 1.5 hours ago
      answers: { emergency: 'yes', children: 'no' },
      history: ['Emergency protection needed']
    },
    {
      queue_number: 'A003',
      priority_level: 'A',
      case_type: 'Domestic Violence',
      user_name: 'Jennifer Davis',
      language: 'en',
      status: 'waiting',
      arrived_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 2 hours ago
      answers: { emergency: 'yes', restraining_order: 'yes' },
      history: ['Restraining order needed', 'Immediate protection required']
    },
    {
      queue_number: 'B001',
      priority_level: 'B',
      case_type: 'Custody & Support',
      user_name: 'John Smith',
      language: 'en',
      status: 'waiting',
      arrived_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      answers: { custody: 'yes', support: 'yes' },
      history: ['Custody modification', 'Support calculation needed']
    },
    {
      queue_number: 'B002',
      priority_level: 'B',
      case_type: 'Custody & Support',
      user_name: 'Lisa Wilson',
      language: 'en',
      status: 'waiting',
      arrived_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(), // 1.25 hours ago
      answers: { custody: 'yes', support: 'no' },
      history: ['Custody modification needed']
    },
    {
      queue_number: 'C001',
      priority_level: 'C',
      case_type: 'Divorce',
      user_name: 'Sarah Johnson',
      language: 'en',
      status: 'waiting',
      arrived_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
      answers: { property: 'yes', assets: 'yes' },
      history: ['Property division', 'Asset distribution']
    },
    {
      queue_number: 'A004',
      priority_level: 'A',
      case_type: 'Domestic Violence',
      user_name: 'Ana Rodriguez',
      language: 'es',
      status: 'in_progress',
      arrived_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(), // 3 hours ago
      answers: { emergency: 'yes', restraining_order: 'yes' },
      history: ['Restraining order needed', 'Immediate protection required']
    }
  ];

  // Clear existing mock queue
  mockQueue = [];
  queueCounter = 1;

  // Add test cases
  testCases.forEach(caseData => {
    const queueItem = createQueueItem(caseData, caseData.queue_number);
    mockQueue.push(queueItem);
  });

  // Save to localStorage
  saveMockQueue();

  console.log('Test data added to mock queue:', mockQueue);
  
  return {
    success: true,
    message: `Added ${testCases.length} test cases to queue`,
    queue: mockQueue
  };
};

/**
 * Get current queue status
 * @returns {Promise<Object>} Queue status with queue array and current number
 */
export const getQueue = async () => {
  const backendCall = async () => {
    console.log('Fetching queue data from backend...');
    // Align with Flask backend: /api/queue
    const data = await makeRequest(API_ENDPOINTS.QUEUE);
    console.log('Backend queue data received:', data);
    
    // Flask already returns { queue: [...], current_number: {...} }
    console.log('Final queue result:', data);
    return data;
  };

  const fallbackCall = async () => {
    console.log('Using fallback mock queue...');
    loadMockQueue();
    console.log('Mock queue loaded:', mockQueue);
    
    const result = {
      queue: mockQueue,
      current_number: mockQueue.length > 0 ? mockQueue[0] : null
    };
    
    console.log('Fallback queue result:', result);
    return result;
  };

  return await withFallback(backendCall, fallbackCall);
};

/**
 * Call the next case in the queue
 * @returns {Promise<Object>} Next case information
 */
export const callNext = async () => {
  const backendCall = async () => {
    // Align with Flask backend: /api/call-next
    return await makeRequest(API_ENDPOINTS.CALL_NEXT, {
      method: 'POST'
    });
  };

  const fallbackCall = async () => {
    if (mockQueue.length > 0) {
      const nextItem = mockQueue.shift();
      saveMockQueue();
      return {
        success: true,
        queue_entry: nextItem,
        current_number: nextItem
      };
    }

    return {
      success: false,
      message: 'No cases in queue',
      current_number: null
    };
  };

  return await withFallback(backendCall, fallbackCall);
};

/**
 * Complete a case in the queue
 * @param {string} queueNumber - Queue number to complete
 * @returns {Promise<Object>} Completion result
 */
export const completeCase = async (queueNumber) => {
  const backendCall = async () => {
    // Align with Flask backend: /api/complete-case with JSON body
    return await makeRequest(API_ENDPOINTS.COMPLETE_CASE, {
      method: 'POST',
      body: JSON.stringify({ queue_number: queueNumber })
    });
  };

  const fallbackCall = async () => {
    mockQueue = mockQueue.filter(item => item.queue_number !== queueNumber);
    saveMockQueue();
    return { success: true };
  };

  return await withFallback(backendCall, fallbackCall);
};

/**
 * Send SMS with queue number
 * @param {string} queueNumber - Queue number to send
 * @param {string} phoneNumber - Phone number to send to
 * @returns {Promise<boolean>} Success status
 */
export const sendQueueNumberSMS = async (queueNumber, phoneNumber) => {
  try {
    const result = await makeRequest(API_ENDPOINTS.SEND_SMS, {
      method: 'POST',
      body: JSON.stringify({
        queue_number: queueNumber,
        phone_number: phoneNumber
      })
    });
    
    return result.success;
  } catch (error) {
    console.log('SMS service not available:', error.message);
  }
  
  // Fallback: store in localStorage for demo purposes
  const smsHistory = JSON.parse(localStorage.getItem('smsHistory') || '[]');
  smsHistory.push({
    queue_number: queueNumber,
    phone_number: phoneNumber,
    timestamp: new Date().toISOString(),
    message: `Your queue number is ${queueNumber}. Please wait in the waiting area.`
  });
  localStorage.setItem('smsHistory', JSON.stringify(smsHistory));
  
  console.log(`SMS would be sent to ${phoneNumber}: Your queue number is ${queueNumber}`);
  return true;
};

/**
 * Get available facilitators
 * @returns {Promise<Array>} List of facilitators
 */
export const getFacilitators = async () => {
  try {
    return await makeRequest(API_ENDPOINTS.FACILITATORS);
  } catch (error) {
    console.log('Failed to fetch facilitators:', error.message);
    return [];
  }
};

/**
 * Get cases for a specific facilitator
 * @param {string} facilitatorId - Facilitator ID (optional)
 * @returns {Promise<Array>} List of facilitator cases
 */
export const getFacilitatorCases = async (facilitatorId = null) => {
  try {
    const url = facilitatorId 
      ? `${API_ENDPOINTS.FACILITATOR_CASES}?facilitator_id=${facilitatorId}`
      : API_ENDPOINTS.FACILITATOR_CASES;
    return await makeRequest(url);
  } catch (error) {
    console.log('Failed to fetch facilitator cases:', error.message);
    return [];
  }
};

/**
 * Assign a case to a facilitator
 * @param {string} queueNumber - Queue number to assign
 * @param {string} facilitatorId - Facilitator ID
 * @returns {Promise<Object>} Assignment result
 */
export const assignCase = async (queueNumber, facilitatorId) => {
  try {
    return await makeRequest(`${API_ENDPOINTS.ASSIGN_CASE}/${queueNumber}/assign`, {
      method: 'POST',
      body: JSON.stringify({ facilitator_id: facilitatorId })
    });
  } catch (error) {
    console.log('Failed to assign case:', error.message);
    return { success: false };
  }
};

/**
 * Get case summary for a queue number
 * @param {string} queueNumber - Queue number to get summary for
 * @returns {Promise<Object>} Case summary
 */
export const getCaseSummary = async (queueNumber) => {
  try {
    return await makeRequest(`${API_ENDPOINTS.ASSIGN_CASE}/${queueNumber}/summary`);
  } catch (error) {
    console.log('Failed to get case summary:', error.message);
    return { success: false };
  }
};

/**
 * Send comprehensive email with case summary and PDF attachments
 * @param {Object} emailData - Email data including case information
 * @returns {Promise<Object>} Email sending result
 */
export const sendComprehensiveEmail = async (emailData) => {
  try {
    return await makeRequest(API_ENDPOINTS.SEND_EMAIL, {
      method: 'POST',
      body: JSON.stringify(emailData)
    });
  } catch (error) {
    console.log('Failed to send comprehensive email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Generate case summary and optionally add to queue
 * @param {Object} summaryData - Case summary data
 * @returns {Promise<Object>} Case summary generation result
 */
export const generateCaseSummary = async (summaryData) => {
  try {
    return await makeRequest(API_ENDPOINTS.CASE_SUMMARY, {
      method: 'POST',
      body: JSON.stringify(summaryData)
    });
  } catch (error) {
    console.log('Failed to generate case summary:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send email for a specific case summary
 * @param {number} summaryId - Case summary ID
 * @param {boolean} includeQueue - Whether to include queue information
 * @returns {Promise<Object>} Email sending result
 */
export const sendCaseSummaryEmail = async (summaryId, includeQueue = false) => {
  try {
    return await makeRequest(API_ENDPOINTS.SEND_CASE_SUMMARY_EMAIL, {
      method: 'POST',
      body: JSON.stringify({
        summary_id: summaryId,
        include_queue: includeQueue
      })
    });
  } catch (error) {
    console.log('Failed to send case summary email:', error.message);
    return { success: false, error: error.message };
  }
};
