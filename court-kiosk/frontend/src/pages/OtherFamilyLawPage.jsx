import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { buildApiUrl, API_ENDPOINTS } from '../utils/apiConfig';

const OtherFamilyLawPage = () => {
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queueNumber, setQueueNumber] = useState(null);

  const generateQueue = useCallback(async () => {
    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  }, [language]);

  useEffect(() => {
    // Auto-generate queue when page loads
    generateQueue();
  }, [generateQueue]);

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'es' ? 'Procesando...' : 'Processing...'}</p>
        </div>
      </div>
    );
  }

  if (queueNumber) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="bg-blue-50 border-b border-blue-200 px-8 py-4">
          <div className="flex justify-end">
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 bg-white text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              {language === 'es' ? 'English' : 'Español'}
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

  return null;
};

export default OtherFamilyLawPage;
