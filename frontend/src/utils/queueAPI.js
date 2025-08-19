// Queue API utility for connecting with backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Mock queue data for development (replace with real backend calls)
let mockQueue = [];
let queueCounter = 1;

export const addToQueue = async (queueData) => {
  try {
    // Try to connect to real backend first
    const response = await fetch(`${API_BASE_URL}/api/add-to-queue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queueData)
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('Backend not available, using mock queue');
  }

  // Fallback to mock queue
  const queueNumber = queueData.queue_number || `A${String(queueCounter).padStart(4, '0')}`;
  const queueItem = {
    queue_number: queueNumber,
    priority: queueData.priority || 'A',
    case_type: queueData.case_type || 'Domestic Violence',
    arrived_at: new Date().toISOString(),
    status: 'waiting',
    answers: queueData.answers,
    history: queueData.history,
    summary: queueData.summary
  };

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

  // Store in localStorage for persistence
  localStorage.setItem('mockQueue', JSON.stringify(mockQueue));
  localStorage.setItem('queueCounter', queueCounter.toString());

  return { queue_number: queueNumber };
};

export const getQueue = async () => {
  try {
    // Try to connect to real backend first
    const response = await fetch(`${API_BASE_URL}/api/queue`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('Backend not available, using mock queue');
  }

  // Fallback to mock queue
  const storedQueue = localStorage.getItem('mockQueue');
  const storedCounter = localStorage.getItem('queueCounter');
  
  if (storedQueue) {
    mockQueue = JSON.parse(storedQueue);
  }
  if (storedCounter) {
    queueCounter = parseInt(storedCounter);
  }

  return {
    queue: mockQueue,
    current_number: mockQueue.length > 0 ? mockQueue[0] : null
  };
};

export const callNext = async () => {
  try {
    // Try to connect to real backend first
    const response = await fetch(`${API_BASE_URL}/api/call-next`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('Backend not available, using mock queue');
  }

  // Fallback to mock queue
  if (mockQueue.length > 0) {
    const nextItem = mockQueue.shift();
    localStorage.setItem('mockQueue', JSON.stringify(mockQueue));
    return { current_number: nextItem };
  }

  return { current_number: null };
};

export const completeCase = async (queueNumber) => {
  try {
    // Try to connect to real backend first
    const response = await fetch(`${API_BASE_URL}/api/complete-case`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ queue_number: queueNumber })
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('Backend not available, using mock queue');
  }

  // Fallback to mock queue
  mockQueue = mockQueue.filter(item => item.queue_number !== queueNumber);
  localStorage.setItem('mockQueue', JSON.stringify(mockQueue));
  
  return { success: true };
};
