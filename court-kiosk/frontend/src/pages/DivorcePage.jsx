import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import GuidedQuestionPage from './GuidedQuestionPage';

const DivorcePage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleAnswer = (answer) => {
    if (answer === 'yes') {
      // Proceed to divorce flow
      navigate('/divorce-flow');
    } else {
      // Redirect back or to other options
      navigate('/');
    }
  };

  return (
    <GuidedQuestionPage
      question={language === 'es' 
        ? '¿Se trata de una relación con un cónyuge, pareja o co-padre?'
        : 'Is this about a relationship with a spouse, partner, or co-parent?'
      }
      explanation={language === 'es'
        ? 'Esto nos ayuda a entender si su situación cae bajo el derecho de familia, que cubre cosas como divorcio, separación y custodia de hijos.'
        : 'This helps us understand if your situation falls under family law, which covers things like divorce, separation, and child custody.'
      }
      onAnswer={handleAnswer}
      onBack={() => navigate('/')}
      stepNumber={1}
      totalSteps={2}
    />
  );
};

export default DivorcePage;
