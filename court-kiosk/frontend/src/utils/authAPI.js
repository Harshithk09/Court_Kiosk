// Authenticated API utility for admin operations
import { buildApiUrl, isProduction } from './apiConfig';

/**
 * Helper function to make authenticated HTTP requests
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @param {string} sessionToken - Authentication token
 * @returns {Promise<Object>} Response data
 */
const makeAuthenticatedRequest = async (endpoint, options = {}, sessionToken = null) => {
  try {
    const url = buildApiUrl(endpoint);
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add authentication header if token is provided
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Authentication failed, redirect to login
        localStorage.removeItem('sessionToken');
        window.location.href = '/admin';
        throw new Error('Authentication required');
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.log(`Authenticated API request failed for ${endpoint}:`, error.message);
    if (isProduction()) {
      console.error('Production API error:', error);
    }
    throw error;
  }
};

/**
 * Get current user information
 * @param {string} sessionToken - Authentication token
 * @returns {Promise<Object>} User information
 */
export const getCurrentUser = async (sessionToken) => {
  return await makeAuthenticatedRequest('/api/auth/me', {
    method: 'GET'
  }, sessionToken);
};

/**
 * Get admin queue data (authenticated)
 * @param {string} sessionToken - Authentication token
 * @returns {Promise<Object>} Queue data
 */
export const getAdminQueue = async (sessionToken) => {
  return await makeAuthenticatedRequest('/api/admin/queue', {
    method: 'GET'
  }, sessionToken);
};

/**
 * Call next case (authenticated)
 * @param {string} sessionToken - Authentication token
 * @returns {Promise<Object>} Next case information
 */
export const callNextAuthenticated = async (sessionToken) => {
  return await makeAuthenticatedRequest('/api/admin/call-next', {
    method: 'POST'
  }, sessionToken);
};

/**
 * Complete case (authenticated)
 * @param {string} queueNumber - Queue number to complete
 * @param {string} sessionToken - Authentication token
 * @returns {Promise<Object>} Completion result
 */
export const completeCaseAuthenticated = async (queueNumber, sessionToken) => {
  return await makeAuthenticatedRequest('/api/admin/complete-case', {
    method: 'POST',
    body: JSON.stringify({ queue_number: queueNumber })
  }, sessionToken);
};

/**
 * Get audit logs (admin only)
 * @param {string} sessionToken - Authentication token
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Audit logs
 */
export const getAuditLogs = async (sessionToken, options = {}) => {
  const params = new URLSearchParams();
  if (options.limit) params.append('limit', options.limit);
  if (options.offset) params.append('offset', options.offset);
  if (options.user_id) params.append('user_id', options.user_id);
  if (options.action) params.append('action', options.action);

  const endpoint = `/api/auth/audit-logs${params.toString() ? '?' + params.toString() : ''}`;
  return await makeAuthenticatedRequest(endpoint, {
    method: 'GET'
  }, sessionToken);
};

/**
 * Get all users (admin only)
 * @param {string} sessionToken - Authentication token
 * @returns {Promise<Object>} Users list
 */
export const getUsers = async (sessionToken) => {
  return await makeAuthenticatedRequest('/api/auth/users', {
    method: 'GET'
  }, sessionToken);
};

/**
 * Create new user (admin only)
 * @param {Object} userData - User data
 * @param {string} sessionToken - Authentication token
 * @returns {Promise<Object>} Creation result
 */
export const createUser = async (userData, sessionToken) => {
  return await makeAuthenticatedRequest('/api/auth/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  }, sessionToken);
};
