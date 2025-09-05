import React, { useState, useEffect } from 'react';
import SimpleFlowRunner from '../components/SimpleFlowRunner';

const KioskMode = () => {
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/dv_flow_combined.json')
      .then(response => response.json())
      .then(data => {
        setFlow(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading flow data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleFinish = async ({ answers, forms }) => {
    console.log('Flow completed:', { answers, forms });
    // In a real app, you might want to save this data or redirect
  };

  const handleBack = () => {
    // In kiosk mode, going back should return to home
    window.location.href = '/';
  };

  const handleHome = () => {
    // In kiosk mode, home should return to main kiosk interface
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading guided assistance...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Assistance</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleFlowRunner
        flow={flow}
        onFinish={handleFinish}
        onBack={handleBack}
        onHome={handleHome}
      />
    </div>
  );
};

export default KioskMode;
