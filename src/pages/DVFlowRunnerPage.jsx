import React, { useState, useEffect } from 'react';
import SimpleFlowRunner from '../components/SimpleFlowRunner';

const DVFlowRunnerPage = () => {
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/dv_flow_combined.json')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flow data...</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SimpleFlowRunner
        flow={flow}
        onFinish={({ answers, forms }) => {
          console.log('answers', answers);
          console.log('forms', forms);
        }}
        onBack={() => window.history.back()}
        onHome={() => window.location.href = '/'}
      />
    </div>
  );
};

export default DVFlowRunnerPage;
