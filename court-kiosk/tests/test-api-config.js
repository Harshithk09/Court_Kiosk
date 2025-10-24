#!/usr/bin/env node

// Test script to verify API configuration for global deployment
const https = require('https');
const http = require('http');

// Test configuration
const API_URL = process.env.REACT_APP_API_URL || 'https://court-kiosk-backend.vercel.app';
const TEST_ENDPOINTS = [
  '/api/health',
  '/api/queue',
  '/api/facilitators'
];

console.log('🧪 Testing API Configuration for Global Deployment');
console.log('=' .repeat(60));
console.log(`API Base URL: ${API_URL}`);
console.log('');

// Test function
async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${API_URL}${endpoint}`;
    const client = url.startsWith('https') ? https : http;
    
    console.log(`Testing: ${url}`);
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const status = res.statusCode;
        const success = status >= 200 && status < 300;
        
        console.log(`  ✅ Status: ${status} ${success ? 'SUCCESS' : 'FAILED'}`);
        
        if (res.headers['access-control-allow-origin']) {
          console.log(`  🌐 CORS: ${res.headers['access-control-allow-origin']}`);
        }
        
        if (data && data.length < 500) {
          console.log(`  📄 Response: ${data.substring(0, 100)}...`);
        }
        
        console.log('');
        resolve({ endpoint, status, success, cors: res.headers['access-control-allow-origin'] });
      });
    });
    
    req.on('error', (error) => {
      console.log(`  ❌ Error: ${error.message}`);
      console.log('');
      resolve({ endpoint, status: 0, success: false, error: error.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`  ⏰ Timeout: Request took too long`);
      console.log('');
      req.destroy();
      resolve({ endpoint, status: 0, success: false, error: 'Timeout' });
    });
  });
}

// Run tests
async function runTests() {
  console.log('Starting API tests...\n');
  
  const results = [];
  
  for (const endpoint of TEST_ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  // Summary
  console.log('📊 Test Summary');
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${total - successful}`);
  
  if (successful === total) {
    console.log('\n🎉 All tests passed! API is ready for global deployment.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the configuration.');
    
    const failed = results.filter(r => !r.success);
    console.log('\nFailed endpoints:');
    failed.forEach(f => {
      console.log(`  - ${f.endpoint}: ${f.error || 'HTTP ' + f.status}`);
    });
  }
  
  // CORS check
  const corsEnabled = results.some(r => r.cors && (r.cors === '*' || r.cors.includes('vercel')));
  if (corsEnabled) {
    console.log('\n🌐 CORS is properly configured for global access.');
  } else {
    console.log('\n⚠️  CORS may not be properly configured. Check backend settings.');
  }
}

// Run the tests
runTests().catch(console.error);
