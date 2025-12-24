import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import SimpleFlowRunner from '../components/SimpleFlowRunner';
import { buildApiUrl, API_ENDPOINTS } from '../utils/apiConfig';

const OtherFamilyLawPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [flowData, setFlowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [queueNumber, setQueueNumber] = useState(null);
  const [isGeneratingQueue, setIsGeneratingQueue] = useState(false);

  useEffect(() => {
    fetch('/data/other-family-law-flow.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load flow data: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        setFlowData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading flow data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Monitor flow progress and generate queue when reaching GetQueue node
  useEffect(() => {
    if (flowData) {
      // This will be handled by the flow itself - when user reaches terminal node
      // we'll generate queue in handleFinish
    }
  }, [flowData]);

  const generateQueue = async () => {
    setIsGeneratingQueue(true);
    try {
      const response = await fetch(buildApiUrl(API_ENDPOINTS.GENERATE_QUEUE), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_type: 'OTHER',
          priority: 'D',
          language: language
        })
      });
      if (response.ok) {
        const data = await response.json();
        setQueueNumber(data.queue_number);
      }
    } catch (error) {
      console.error('Error generating queue:', error);
    } finally {
      setIsGeneratingQueue(false);
    }
  };

  const handleFinish = async ({ answers, forms }) => {
    // Generate queue when flow completes (user reached terminal node)
    // This is called when user clicks "View Next Steps" on the terminal node
    if (!queueNumber && !isGeneratingQueue) {
      await generateQueue();
    }
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
          <p className="text-red-600 mb-4">{error || 'Failed to load flow data'}</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-blue-600 text-white rounded-lg">
            {language === 'es' ? 'Volver al inicio' : 'Return Home'}
          </button>
        </div>
      </div>
    );
  }

  // Show queue number if generated
  if (queueNumber) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="bg-blue-50 border-b border-blue-200 px-8 py-4">
          <div className="flex justify-end">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-white text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              {language === 'es' ? 'Inicio' : 'Home'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 max-w-4xl mx-auto w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            {language === 'es' ? 'TU NÚMERO DE COLA' : 'YOUR QUEUE NUMBER'}
          </h1>

          <div className="bg-blue-600 text-white px-12 py-8 rounded-lg mb-8">
            <div className="text-7xl font-black text-center">#{queueNumber}</div>
          </div>

          <p className="text-lg text-gray-600 mb-8 text-center">
            {language === 'es'
              ? 'Por favor espera a ser llamado. Un facilitador te ayudará pronto.'
              : 'Please wait to be called. A facilitator will help you soon.'
            }
          </p>

          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
          >
            {language === 'es' ? 'Volver al inicio' : 'Return to Home'}
          </button>
        </div>
      </div>
    );
  }

  if (isGeneratingQueue) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'es' ? 'Generando número de cola...' : 'Generating queue number...'}</p>
        </div>
      </div>
    );
  }

  return (
    <SimpleFlowRunner
      flow={flowData}
      onFinish={handleFinish}
      onBack={() => navigate('/')}
      onHome={() => navigate('/')}
    />
  );
};

export default OtherFamilyLawPage;
