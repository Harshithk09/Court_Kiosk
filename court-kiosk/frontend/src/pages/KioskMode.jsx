import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import SimpleFlowRunner from '../components/SimpleFlowRunner';
import GuidedQuestionPage from './GuidedQuestionPage';

const KioskMode = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState('question');
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

  const handleFirstQuestionAnswer = (answer) => {
    if (answer === 'yes') {
      setCurrentStep('flow');
    } else {
      // Could show another question or redirect
      navigate('/other');
    }
  };

  const handleFinish = async ({ answers, forms }) => {
    console.log('Flow completed:', { answers, forms });
    // In a real app, you might want to save this data or redirect
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Assistance</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'question') {
    return (
      <GuidedQuestionPage
        question={language === 'es' 
          ? '¿Se trata de una relación con un cónyuge, pareja o co-padre?'
          : 'Is this about a relationship with a spouse, partner, or co-parent?'
        }
        explanation={language === 'es'
          ? 'Esto nos ayuda a entender si su situación cae bajo el derecho de familia, que cubre cosas como divorcio, separación y custodia de hijos. No incluye problemas como disputas con vecinos.'
          : 'This helps us understand if your situation falls under family law, which covers things like divorce, separation, and child custody. It does not include issues like neighbor disputes.'
        }
        onAnswer={handleFirstQuestionAnswer}
        onBack={() => navigate('/')}
        stepNumber={1}
        totalSteps={2}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SimpleFlowRunner
        flow={flow}
        onFinish={handleFinish}
        onBack={() => setCurrentStep('question')}
        onHome={() => navigate('/')}
      />
    </div>
  );
};

export default KioskMode;
