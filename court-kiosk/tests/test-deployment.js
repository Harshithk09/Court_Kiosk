#!/usr/bin/env node

const https = require('https');

console.log('🧪 Testing Court Kiosk Deployment');
console.log('==================================');

const testEndpoints = [
  { name: 'Frontend', url: 'https://court-kiosk.vercel.app/' },
  { name: 'Health API', url: 'https://court-kiosk.vercel.app/api/health' },
  { name: 'Queue API', url: 'https://court-kiosk.vercel.app/api/queue' },
  { name: 'Email API', url: 'https://court-kiosk.vercel.app/api/email/send-case-summary' }
];

async function testEndpoint(name, url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        const isHtml = data.includes('<!doctype html>');
        const isJson = data.includes('{') && data.includes('}');
        
        console.log(`\n📡 ${name}:`);
        console.log(`   URL: ${url}`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Duration: ${duration}ms`);
        console.log(`   Content Type: ${res.headers['content-type'] || 'unknown'}`);
        
        if (isHtml) {
          console.log(`   ⚠️  Returns HTML (frontend) - API not working`);
        } else if (isJson) {
          console.log(`   ✅ Returns JSON - API working`);
          try {
            const json = JSON.parse(data);
            console.log(`   📄 Response: ${JSON.stringify(json).substring(0, 100)}...`);
          } catch (e) {
            console.log(`   📄 Response: ${data.substring(0, 100)}...`);
          }
        } else {
          console.log(`   ❓ Unknown response type`);
          console.log(`   📄 Response: ${data.substring(0, 100)}...`);
        }
        
        resolve({ name, status: res.statusCode, duration, isHtml, isJson });
      });
    }).on('error', (err) => {
      console.log(`\n❌ ${name}:`);
      console.log(`   URL: ${url}`);
      console.log(`   Error: ${err.message}`);
      resolve({ name, error: err.message });
    });
  });
}

async function runTests() {
  console.log('Starting tests...\n');
  
  const results = [];
  for (const endpoint of testEndpoints) {
    const result = await testEndpoint(endpoint.name, endpoint.url);
    results.push(result);
  }
  
  console.log('\n📊 Test Summary');
  console.log('================');
  
  const working = results.filter(r => r.isJson).length;
  const htmlResponses = results.filter(r => r.isHtml).length;
  const errors = results.filter(r => r.error).length;
  
  console.log(`✅ Working APIs: ${working}`);
  console.log(`⚠️  HTML Responses: ${htmlResponses}`);
  console.log(`❌ Errors: ${errors}`);
  
  if (htmlResponses > 0) {
    console.log('\n🔧 Issues Found:');
    console.log('   - API endpoints are returning HTML instead of JSON');
    console.log('   - This means the backend serverless functions are not deployed');
    console.log('   - Need to fix Vercel configuration for Python functions');
  }
  
  if (working > 0) {
    console.log('\n🎉 Good News:');
    console.log('   - Frontend is working and accessible');
    console.log('   - Some APIs are functional');
  }
  
  console.log('\n🚀 Next Steps:');
  console.log('   1. Fix Vercel project configuration');
  console.log('   2. Deploy Python serverless functions');
  console.log('   3. Test all endpoints again');
}

runTests().catch(console.error);
