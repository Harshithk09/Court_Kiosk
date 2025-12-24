import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const GuidedQuestionPage = ({ 
  question, 
  explanation, 
  onAnswer, 
  onBack,
  stepNumber = 1,
  totalSteps = 2 
}) => {
  const { language, toggleLanguage } = useLanguage();
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleContinue = () => {
    if (selectedAnswer !== null && onAnswer) {
      onAnswer(selectedAnswer);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Simple Header */}
      <div className="bg-blue-50 border-b border-blue-200 px-8 py-4">
        <div className="flex justify-between items-center">
          <button
            onClick={onBack}
            className="text-blue-700 hover:text-blue-900 font-medium"
          >
            {language === 'es' ? '< Atrás' : '< Back'}
          </button>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-white text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            {language === 'es' ? 'English' : 'Español'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-100 h-1">
        <div 
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 max-w-3xl mx-auto w-full">
        {/* Court Icon */}
        <div className="mb-8">
          <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
        </div>

        {/* Question */}
        <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center leading-tight">
          {question}
        </h1>

        {/* Explanation */}
        {explanation && (
          <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl leading-relaxed">
            {explanation}
          </p>
        )}

        {/* Answer Buttons */}
        <div className="w-full space-y-4 mb-12">
          <button
            onClick={() => setSelectedAnswer('yes')}
            className={`w-full px-8 py-6 rounded-lg transition-colors text-lg font-medium ${
              selectedAnswer === 'yes'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            {language === 'es' ? 'Sí, es sobre eso.' : 'Yes, it is about that.'}
          </button>
          <button
            onClick={() => setSelectedAnswer('no')}
            className={`w-full px-8 py-6 rounded-lg transition-colors text-lg font-medium ${
              selectedAnswer === 'no'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            {language === 'es' ? 'No, es sobre otra cosa.' : "No, it's about something else."}
          </button>
        </div>

        {/* Navigation */}
        <div className="w-full flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
          >
            {language === 'es' ? '< Atrás' : '< Back'}
          </button>
          <div className="text-sm text-gray-500">
            {stepNumber} {language === 'es' ? 'de' : 'of'} {totalSteps}
          </div>
          <button
            onClick={handleContinue}
            disabled={selectedAnswer === null}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedAnswer !== null
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {language === 'es' ? 'Continuar >' : 'Continue >'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidedQuestionPage;

