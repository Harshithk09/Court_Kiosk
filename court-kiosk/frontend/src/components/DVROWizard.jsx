import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { topics, getFormsForTopic, getNextStepsForTopic } from '../data/flows';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Shield,
  FileText,
  Users,
  Clock,
  Phone
} from 'lucide-react';

const DVROWizard = ({ onComplete }) => {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  
  const questions = topics.restraining.questions;
  const currentQuestion = questions[currentStep];

  // Check for immediate danger
  useEffect(() => {
    if (answers.immediate_danger === 'yes') {
      setShowEmergencyAlert(true);
    }
  }, [answers.immediate_danger]);

  const handleAnswer = (value) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    
    // Auto-advance for certain questions
    if (currentQuestion.id === 'immediate_danger' && value === 'yes') {
      // Don't auto-advance for immediate danger - let user see emergency alert
      return;
    }
    
    // Auto-advance for simple yes/no questions
    if (['copies_made', 'filed_with_court', 'received_tro', 'served_other_party', 
         'proof_of_service_filed', 'hearing_date_set', 'attended_hearing'].includes(currentQuestion.id)) {
      setTimeout(() => nextStep(), 500);
    }
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Wizard complete
      const forms = getFormsForTopic('restraining', answers);
      const steps = getNextStepsForTopic('restraining', answers);
      onComplete({ answers, forms, steps });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getProgressPercentage = () => {
    return ((currentStep + 1) / questions.length) * 100;
  };

  const getStepIcon = (stepIndex) => {
    const question = questions[stepIndex];
    if (question.urgent) return AlertTriangle;
    if (question.id === 'relationship') return Users;
    if (question.id === 'protection_type') return Shield;
    if (question.id.includes('service')) return Clock;
    if (question.id.includes('hearing')) return FileText;
    return CheckCircle;
  };

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  const renderEmergencyAlert = () => {
    if (!showEmergencyAlert) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
            <h3 className="text-xl font-bold text-red-800">
              {language === 'es' ? '¡PELIGRO INMEDIATO!' : 'IMMEDIATE DANGER!'}
            </h3>
          </div>
          <div className="text-red-700 mb-6">
            <p className="font-medium mb-3">
              {language === 'es' 
                ? 'Si está en peligro inmediato, su seguridad es lo más importante:'
                : 'If you are in immediate danger, your safety is most important:'
              }
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Phone className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{language === 'es' ? 'Llame al 911 inmediatamente' : 'Call 911 immediately'}</span>
              </li>
              <li className="flex items-start">
                <Shield className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{language === 'es' ? 'Vaya a un lugar seguro' : 'Go to a safe location'}</span>
              </li>
              <li className="flex items-start">
                <FileText className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{language === 'es' ? 'Solicite una Orden de Protección de Emergencia (EPO)' : 'Request an Emergency Protective Order (EPO)'}</span>
              </li>
            </ul>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowEmergencyAlert(false)}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
            >
              {language === 'es' ? 'Entendido' : 'I Understand'}
            </button>
            <button
              onClick={() => window.location.href = 'tel:911'}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
            >
              {language === 'es' ? 'Llamar 911' : 'Call 911'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            {language === 'es' ? 'Paso' : 'Step'} {currentStep + 1} {language === 'es' ? 'de' : 'of'} {questions.length}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(getProgressPercentage())}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-red-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {questions.map((question, index) => {
            const Icon = getStepIcon(index);
            const status = getStepStatus(index);
            
            return (
              <div
                key={index}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                  status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : status === 'current'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {question.id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Question */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {currentQuestion.question[language]}
          </h2>
          {currentQuestion.urgent && (
            <div className="flex items-center text-red-600 mb-2">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span className="font-medium">
                {language === 'es' ? 'Pregunta urgente' : 'Urgent question'}
              </span>
            </div>
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option.value)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                answers[currentQuestion.id] === option.value
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium text-gray-800">
                {option.label[language]}
              </div>
              {option.description && (
                <div className="text-sm text-gray-600 mt-1">
                  {option.description[language]}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            currentStep === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'es' ? 'Anterior' : 'Previous'}
        </button>

        <button
          onClick={nextStep}
          disabled={!answers[currentQuestion.id]}
          className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
            !answers[currentQuestion.id]
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {currentStep === questions.length - 1 
            ? (language === 'es' ? 'Completar' : 'Complete')
            : (language === 'es' ? 'Siguiente' : 'Next')
          }
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>

      {/* Emergency Alert */}
      {renderEmergencyAlert()}
    </div>
  );
};

export default DVROWizard; 