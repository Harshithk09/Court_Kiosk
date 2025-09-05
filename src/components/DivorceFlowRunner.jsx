import React, { useState, useEffect } from 'react';
import SimpleFlowRunner from '../components/SimpleFlowRunner';

const DivorceFlowRunner = () => {
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQueueForm, setShowQueueForm] = useState(false);
  const [flowResults, setFlowResults] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isAddingToQueue, setIsAddingToQueue] = useState(false);
  const [queueNumber, setQueueNumber] = useState(null);

  useEffect(() => {
    fetch('/data/divorce/divorce_flow_enhanced.json')
      .then(response => response.json())
      .then(data => {
        setFlow(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading flow data:', error);
        setLoading(false);
      });
  }, []);

  const handleAddToQueue = async () => {
    if (!userInfo.name.trim()) {
      alert('Please enter your name');
      return;
    }

    setIsAddingToQueue(true);
    try {
      const response = await fetch('/api/generate-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_type: 'DIVORCE',
          priority: 'C',
          language: 'en',
          user_name: userInfo.name,
          user_email: userInfo.email,
          phone_number: userInfo.phone
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQueueNumber(data.queue_number);
      } else {
        console.error('Failed to add to queue');
        alert('Failed to add to queue. Please try again.');
      }
    } catch (error) {
      console.error('Error adding to queue:', error);
      alert('Error adding to queue. Please try again.');
    } finally {
      setIsAddingToQueue(false);
    }
  };

  const handleInputChange = (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFlowFinish = ({ answers, forms }) => {
    console.log('divorce answers', answers);
    console.log('divorce forms', forms);
    setFlowResults({ answers, forms });
    setShowQueueForm(true);
  };

  const handleStartOver = () => {
    setShowQueueForm(false);
    setFlowResults(null);
    setQueueNumber(null);
    setUserInfo({ name: '', email: '', phone: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading divorce process guide...</p>
        </div>
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load flow data</p>
        </div>
      </div>
    );
  }

  // Show queue form after flow completion
  if (showQueueForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Divorce Process Complete!</h1>
              <p className="text-gray-600">You've completed the divorce process overview. To get help from a court facilitator, please provide your information below.</p>
            </div>

            {!queueNumber ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={userInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={userInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>

                <button
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  onClick={handleAddToQueue}
                  disabled={isAddingToQueue}
                >
                  {isAddingToQueue ? 'Adding to Queue...' : 'Join Queue'}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-semibold text-green-900 mb-4">Successfully Added to Queue!</h3>
                  <div className="text-6xl font-bold text-green-600 mb-4">#{queueNumber}</div>
                  <p className="text-green-700 text-lg">Please wait to be called by a court facilitator.</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                  <h4 className="font-semibold text-blue-900 mb-2">Your Case Summary</h4>
                  <div className="text-blue-800 text-sm space-y-1">
                    <p><strong>Case Type:</strong> Divorce & Separation</p>
                    <p><strong>Priority:</strong> C</p>
                    {flowResults?.forms && flowResults.forms.length > 0 && (
                      <p><strong>Forms Identified:</strong> {flowResults.forms.join(', ')}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={handleStartOver}
                className="bg-gray-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SimpleFlowRunner
        flow={flow}
        onFinish={handleFlowFinish}
        onBack={() => window.history.back()}
        onHome={() => window.location.href = '/'}
      />
    </div>
  );
};

export default DivorceFlowRunner;
