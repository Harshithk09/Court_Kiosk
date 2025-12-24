import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import SimpleFlowRunner from '../components/SimpleFlowRunner';

export default function GVROPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [flowData, setFlowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/gvro-flow.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load GVRO data: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        setFlowData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading GVRO flow data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleFinish = async ({ answers, forms }) => {
    // Handle completion
    console.log('GVRO flow completed', { answers, forms });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'es' ? 'Cargando...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error || !flowData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load GVRO data</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-blue-600 text-white rounded-lg">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <SimpleFlowRunner
      flow={flowData}
      onFinish={handleFinish}
      onBack={() => navigate('/restraining-order')}
      onHome={() => navigate('/')}
    />
  );
}

