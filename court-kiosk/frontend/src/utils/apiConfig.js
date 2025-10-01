// API Configuration for Court Kiosk Application
// This file centralizes API configuration for both development and production environments

// Get the API base URL from environment variables
// In production (Vercel), this should be set to the backend Vercel URL
// In development, this can be localhost or any other backend URL
const getApiBaseUrl = () => {
  // Check for environment variable first (set in Vercel dashboard)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Check for Vercel environment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Development fallback
  return 'http://localhost:5001';
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// API Endpoints
export const API_ENDPOINTS = {
  // Queue Management
  QUEUE: '/api/queue',
  GENERATE_QUEUE: '/api/generate-queue',
  CALL_NEXT: '/api/call-next',
  COMPLETE_CASE: '/api/complete-case',
  
  // Case Management
  CASE_SUMMARY: '/api/generate-case-summary',
  SEND_EMAIL: '/api/send-comprehensive-email',
  SEND_CASE_SUMMARY_EMAIL: '/api/send-case-summary-email',
  
  // SMS Service
  SEND_SMS: '/api/sms/send-queue-number',
  
  // Facilitator Management
  FACILITATORS: '/api/facilitators',
  FACILITATOR_CASES: '/api/facilitator/cases',
  ASSIGN_CASE: '/api/queue',
  
  // Health Check
  HEALTH: '/api/health',
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to check if we're in production
export const isProduction = () => {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
};

// Helper function to check if we're in development
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development' && !process.env.VERCEL;
};

// Log API configuration (only in development)
if (isDevelopment()) {
  console.log('API Configuration:', {
    baseUrl: API_CONFIG.BASE_URL,
    environment: process.env.NODE_ENV,
    isVercel: process.env.VERCEL === '1',
    vercelUrl: process.env.VERCEL_URL,
  });
}
