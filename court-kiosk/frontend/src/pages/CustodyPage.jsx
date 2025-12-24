import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { buildApiUrl, API_ENDPOINTS } from '../utils/apiConfig';
import GuidedQuestionPage from './GuidedQuestionPage';

const CustodyPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFirstQuestionAnswer = async (answer) => {
    if (answer === 'yes') {
      // If about family relationship, proceed to generate queue
      setIsSubmitting(true);
      try {
        const response = await fetch(buildApiUrl(API_ENDPOINTS.GENERATE_QUEUE), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            case_type: 'CUSTODY',
            priority: 'B',
            language: language
          })
        });
        if (response.ok) {
          // Redirect to completion or show queue number
          navigate('/');
        }
      } catch (error) {
        console.error('Error generating queue:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // If not about family relationship, redirect
      navigate('/other');
    }
  };

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing...</p>
        </div>
      </div>
    );
  }

  return (
    <GuidedQuestionPage
      question={language === 'es' 
        ? '¿Se trata de una relación con un cónyuge, pareja o co-padre?'
        : 'Is this about a relationship with a spouse, partner, or co-parent?'
      }
      explanation={language === 'es'
        ? 'Esto nos ayuda a entender si su situación cae bajo el derecho de familia, que cubre cosas como custodia de hijos y manutención.'
        : 'This helps us understand if your situation falls under family law, which covers things like child custody and support.'
      }
      onAnswer={handleFirstQuestionAnswer}
      onBack={() => navigate('/')}
      stepNumber={1}
      totalSteps={2}
    />
  );
};

export default CustodyPage;
