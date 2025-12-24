import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import SimpleFlowRunner from '../components/SimpleFlowRunner';
import GuidedQuestionPage from './GuidedQuestionPage';

const CHROPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('question');
  const [flowData, setFlowData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/civil-harassment-flow.json')
      .then(response => response.json())
      .then(data => {
        setFlowData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading flow data:', error);
        setLoading(false);
      });
  }, []);

  const handleFirstQuestionAnswer = (answer) => {
    if (answer === 'no') {
      // If not about family relationship, proceed to CHRO flow
      setCurrentStep('flow');
    } else {
      // If about family relationship, redirect to DVRO
      navigate('/dvro');
    }
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

  if (currentStep === 'question') {
    return (
      <GuidedQuestionPage
        question={language === 'es' 
          ? '¿Se trata de una relación con un cónyuge, pareja o co-padre?'
          : 'Is this about a relationship with a spouse, partner, or co-parent?'
        }
        explanation={language === 'es'
          ? 'Las órdenes de restricción por acoso civil son para personas que NO tienen una relación cercana (como vecinos, compañeros de trabajo o extraños).'
          : 'Civil harassment restraining orders are for people who are NOT in a close relationship (like neighbors, coworkers, or strangers).'
        }
        onAnswer={handleFirstQuestionAnswer}
        onBack={() => navigate('/')}
        stepNumber={1}
        totalSteps={2}
      />
    );
  }

  if (currentStep === 'flow' && flowData) {
    return (
      <SimpleFlowRunner
        flow={flowData}
        onFinish={() => navigate('/')}
        onBack={() => setCurrentStep('question')}
        onHome={() => navigate('/')}
      />
    );
  }

  return null;
};

export default CHROPage;
