import React, { useState, useEffect } from 'react';
import SimpleFlowRunner from '../components/SimpleFlowRunner';
import ModernHeader from './ModernHeader';
import ModernCard from './ModernCard';
import ModernButton from './ModernButton';
import { useToast } from './Toast';
import { CheckCircle, User, Mail, Phone, ArrowLeft } from 'lucide-react';
import './ModernHeader.css';
import './ModernCard.css';
import './ModernButton.css';

const DivorceFlowRunner = () => {
  const toast = useToast();
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
    fetch('/data/divorce_flow.json')
      .then(response => response.json())
      .then(data => {
        setFlow(data);
        setLoading(false);
      })
      .catch(error => {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading flow data:', error);
        }
        setLoading(false);
      });
  }, []);

  const handleAddToQueue = async () => {
    if (!userInfo.name.trim()) {
      toast.error('Please enter your name');
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
        toast.success('Successfully added to queue!');
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to add to queue');
        }
        toast.error('Failed to add to queue. Please try again.');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error adding to queue:', error);
      }
      toast.error('Error adding to queue. Please try again.');
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
    if (process.env.NODE_ENV === 'development') {
      console.log('divorce answers', answers);
      console.log('divorce forms', forms);
    }
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
      <div className="min-h-screen bg-gray-50">
        <ModernHeader 
          title="Divorce & Separation" 
          subtitle="Loading process guide..." 
          showLanguageToggle={false}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <ModernCard variant="elevated" className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading divorce process guide...</p>
          </ModernCard>
        </div>
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernHeader 
          title="Divorce & Separation" 
          subtitle="Error loading process guide" 
          showLanguageToggle={false}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <ModernCard variant="error" className="text-center">
            <p className="text-white font-medium">Failed to load flow data</p>
          </ModernCard>
        </div>
      </div>
    );
  }

  // Show queue form after flow completion
  if (showQueueForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernHeader 
          title="Divorce & Separation" 
          subtitle="Process Complete" 
          showLanguageToggle={true}
        />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <ModernCard variant="elevated" className="text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Divorce Process Complete!</h1>
              <p className="text-gray-600 text-lg">You've completed the divorce process overview. To get help from a court facilitator, please provide your information below.</p>
            </div>

            {!queueNumber ? (
              <div className="space-y-6 text-left">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={userInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={userInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your phone number"
                  />
                </div>

                <ModernButton
                  variant="primary"
                  size="large"
                  className="w-full"
                  onClick={handleAddToQueue}
                  disabled={isAddingToQueue}
                  loading={isAddingToQueue}
                >
                  {isAddingToQueue ? 'Adding to Queue...' : 'Join Queue'}
                </ModernButton>
              </div>
            ) : (
              <div className="text-center">
                <ModernCard variant="success" className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-4">Successfully Added to Queue!</h3>
                  <div className="text-8xl font-black text-white mb-6">#{queueNumber}</div>
                  <p className="text-white text-xl font-medium">Please wait to be called by a court facilitator.</p>
                </ModernCard>
                
                <ModernCard variant="outlined" className="mb-6 text-left">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">Your Case Summary</h4>
                  <div className="text-gray-700 space-y-2">
                    <p><strong>Case Type:</strong> Divorce & Separation</p>
                    <p><strong>Priority:</strong> C</p>
                    {flowResults?.forms && flowResults.forms.length > 0 && (
                      <p><strong>Forms Identified:</strong> {flowResults.forms.join(', ')}</p>
                    )}
                  </div>
                </ModernCard>
              </div>
            )}

            <div className="mt-8 text-center">
              <ModernButton
                variant="secondary"
                size="medium"
                onClick={handleStartOver}
                icon={<ArrowLeft className="w-4 h-4" />}
                iconPosition="left"
              >
                Start Over
              </ModernButton>
            </div>
          </ModernCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader 
        title="Divorce & Separation" 
        subtitle="Guided Process Assistant" 
        showLanguageToggle={true}
      />
      <div className="py-8">
        <SimpleFlowRunner
          flow={flow}
          onFinish={handleFlowFinish}
          onBack={() => window.history.back()}
          onHome={() => window.location.href = '/'}
        />
      </div>
    </div>
  );
};

export default DivorceFlowRunner;
