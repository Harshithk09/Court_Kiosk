import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import ModernCourtHeader from '../components/ModernCourtHeader';
import SimpleFlowRunner from '../components/SimpleFlowRunner';
import CompletionPage from '../components/CompletionPage';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

const CHROPage = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [flowData, setFlowData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFlowData();
  }, []);

  const loadFlowData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/data/civil-harassment-flow.json');
      if (!response.ok) {
        throw new Error('Failed to load civil harassment flow data');
      }
      const data = await response.json();
      setFlowData(data);
      setCurrentStep(data.start);
    } catch (err) {
      console.error('Error loading civil harassment flow:', err);
      setError('Failed to load civil harassment flow data');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleStepComplete = (stepData) => {
    if (stepData.isComplete) {
      setIsCompleted(true);
    } else {
      setCurrentStep(stepData.nextStep);
    }
  };

  const handleBack = () => {
    navigate('/kiosk');
  };

  const handleHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Civil Harassment flow...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadFlowData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <CompletionPage
        answers={answers}
        history={[]}
        flow={flowData}
        onBack={handleBack}
        onHome={handleHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernCourtHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Case Types
            </button>
            <button
              onClick={handleHome}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Home
            </button>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="bg-orange-100 p-3 rounded-lg mr-4">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'es' ? 'Acoso Civil' : 'Civil Harassment'}
              </h1>
              <p className="text-gray-600">
                {language === 'es' 
                  ? 'Órdenes de restricción por acoso civil para vecinos, compañeros de trabajo, extraños'
                  : 'Civil harassment restraining orders for neighbors, coworkers, strangers'
                }
              </p>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-orange-800 mb-1">
                  {language === 'es' ? 'Información Importante' : 'Important Information'}
                </h3>
                <p className="text-orange-700 text-sm">
                  {language === 'es' 
                    ? 'Si está en peligro inmediato, llame al 911. Las órdenes de restricción por acoso civil son para personas que NO tienen una relación cercana (como vecinos, compañeros de trabajo o extraños).'
                    : 'If you are in immediate danger, call 911. Civil harassment restraining orders are for people who are NOT in a close relationship (like neighbors, coworkers, or strangers).'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Flow Runner */}
        {flowData && currentStep && (
          <SimpleFlowRunner
            flowData={flowData}
            currentStep={currentStep}
            answers={answers}
            onAnswer={handleAnswer}
            onStepComplete={handleStepComplete}
            language={language}
          />
        )}
      </div>
    </div>
  );
};

export default CHROPage;
