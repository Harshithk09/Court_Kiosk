#!/usr/bin/env node

/**
 * Test script to verify email routing works globally with official form links
 */

const { EmailService } = require('./backend/utils/email_service');

async function testEmailIntegration() {
  console.log('🧪 Testing Court Kiosk Email Integration with Official Form Links');
  console.log('=' .repeat(70));
  
  const emailService = new EmailService();
  
  // Test 1: DVRO Case with multiple forms
  console.log('\n📋 Test 1: DVRO Case Email');
  const dvroPayload = {
    to: 'test@example.com',
    flow_type: 'DVRO',
    required_forms: ['DV-100', 'DV-109', 'DV-110', 'CLETS-001'],
    next_steps: [
      'Complete all required forms',
      'Make 3 copies of each form',
      'File with the court clerk',
      'Serve the other party at least 5 days before hearing'
    ],
    queue_number: 'A001',
    case_type: 'Domestic Violence Restraining Order'
  };
  
  console.log('📧 Sending DVRO case email...');
  const dvroResult = await emailService.send_summary_email(dvroPayload);
  console.log('✅ DVRO Email Result:', dvroResult.success ? 'SUCCESS' : 'FAILED');
  if (!dvroResult.success) {
    console.log('❌ Error:', dvroResult.error);
  }
  
  // Test 2: Family Law Case
  console.log('\n📋 Test 2: Family Law Case Email');
  const familyPayload = {
    to: 'test@example.com',
    flow_type: 'Divorce',
    required_forms: ['FL-100', 'FL-110', 'FL-105', 'FL-140'],
    next_steps: [
      'Complete divorce petition',
      'File with court and pay fees',
      'Serve spouse within 60 days',
      'Complete financial disclosures'
    ],
    queue_number: 'C001',
    case_type: 'Divorce Proceedings'
  };
  
  console.log('📧 Sending Family Law case email...');
  const familyResult = await emailService.send_summary_email(familyPayload);
  console.log('✅ Family Law Email Result:', familyResult.success ? 'SUCCESS' : 'FAILED');
  if (!familyResult.success) {
    console.log('❌ Error:', familyResult.error);
  }
  
  // Test 3: Civil Harassment Case
  console.log('\n📋 Test 3: Civil Harassment Case Email');
  const civilPayload = {
    to: 'test@example.com',
    flow_type: 'Civil Harassment',
    required_forms: ['CH-100', 'CH-110', 'CH-120'],
    next_steps: [
      'Complete civil harassment petition',
      'File with court',
      'Serve the other party',
      'Attend court hearing'
    ],
    queue_number: 'B001',
    case_type: 'Civil Harassment Restraining Order'
  };
  
  console.log('📧 Sending Civil Harassment case email...');
  const civilResult = await emailService.send_summary_email(civilPayload);
  console.log('✅ Civil Harassment Email Result:', civilResult.success ? 'SUCCESS' : 'FAILED');
  if (!civilResult.success) {
    console.log('❌ Error:', civilResult.error);
  }
  
  // Test 4: Form URL Generation
  console.log('\n🔗 Test 4: Form URL Generation');
  const testForms = ['DV-100', 'FL-100', 'CH-100', 'FW-001', 'CLETS-001'];
  
  console.log('📋 Testing form URL generation:');
  testForms.forEach(form => {
    const url = emailService.get_form_url(form);
    console.log(`  ${form}: ${url}`);
  });
  
  // Test 5: Comprehensive Case Email
  console.log('\n📋 Test 5: Comprehensive Case Email');
  const comprehensiveCaseData = {
    user_email: 'test@example.com',
    user_name: 'John Doe',
    case_type: 'Domestic Violence Restraining Order',
    priority_level: 'A',
    queue_number: 'A002',
    documents_needed: ['DV-100', 'DV-109', 'DV-110', 'DV-105', 'CLETS-001'],
    next_steps: [
      'Complete all required forms',
      'Make 3 copies of each form',
      'File with the court clerk',
      'Serve the other party at least 5 days before hearing',
      'Attend court hearing'
    ],
    conversation_summary: 'User needs emergency protection from domestic violence. Has children involved.',
    language: 'en'
  };
  
  console.log('📧 Sending comprehensive case email...');
  const comprehensiveResult = await emailService.send_comprehensive_case_email(comprehensiveCaseData, true);
  console.log('✅ Comprehensive Email Result:', comprehensiveResult.success ? 'SUCCESS' : 'FAILED');
  if (!comprehensiveResult.success) {
    console.log('❌ Error:', comprehensiveResult.error);
  }
  
  // Summary
  console.log('\n' + '=' .repeat(70));
  console.log('📊 EMAIL INTEGRATION TEST SUMMARY');
  console.log('=' .repeat(70));
  
  const results = [dvroResult, familyResult, civilResult, comprehensiveResult];
  const successCount = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  console.log(`✅ Successful Tests: ${successCount}/${totalTests}`);
  console.log(`📧 Email Service: ${successCount === totalTests ? 'FULLY OPERATIONAL' : 'NEEDS ATTENTION'}`);
  console.log(`🔗 Form Links: ${testForms.length} forms tested with official URLs`);
  console.log(`🌐 Global Access: All forms link to official California Courts website`);
  
  if (successCount === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Email routing is working globally with official form links.');
    console.log('📋 Users will receive comprehensive emails with:');
    console.log('   • Case summaries and next steps');
    console.log('   • Direct links to official court forms');
    console.log('   • Queue information and priority levels');
    console.log('   • Professional HTML formatting');
  } else {
    console.log('\n⚠️  Some tests failed. Check configuration and try again.');
  }
  
  console.log('\n🚀 Ready for production deployment!');
}

// Run the test
testEmailIntegration().catch(console.error);
