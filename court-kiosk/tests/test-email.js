// Test script for email functionality
// Run this with: node test-email.js

const testEmailFunction = async () => {
  const API_URL =
    process.env.REACT_APP_API_URL ||
    process.env.API_URL ||
    'http://localhost:5001';
  
  const testData = {
    email: 'test@example.com', // Replace with your email for testing
    case_data: {
      queue_number: 'A001',
      case_type: 'DVRO',
      summary: {
        forms: ['DV-100', 'DV-109', 'DV-110'],
        steps: [
          'Fill out all required forms completely',
          'Make 3 copies of each form',
          'File forms with the court clerk',
          'Arrange for service of the other party'
        ],
        timeline: [
          'File forms as soon as possible',
          'Serve papers before your court date'
        ],
        importantNotes: [
          'The other party must be served for the order to be valid',
          'Keep a copy of your TRO with you at all times'
        ]
      }
    }
  };

  try {
    console.log('Testing email functionality...');
    console.log('API URL:', API_URL);
    console.log('Test data:', JSON.stringify(testData, null, 2));

    const response = await fetch(`${API_URL}/api/email/send-case-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Email test successful!');
    } else {
      console.log('❌ Email test failed:', result.error);
    }

  } catch (error) {
    console.error('❌ Error testing email:', error.message);
  }
};

// Run the test
testEmailFunction();
