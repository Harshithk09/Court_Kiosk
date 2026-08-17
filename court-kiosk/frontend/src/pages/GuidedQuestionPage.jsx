import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/process-ui.css';

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
      window.scrollTo({ top: 0, behavior: 'auto' });
      onAnswer(selectedAnswer);
    }
  };

  const pct = Math.round((stepNumber / Math.max(totalSteps, 1)) * 100);

  return (
    <div className="kiosk-page flex flex-col min-h-screen">
      <div className="kiosk-page__header px-6 sm:px-8 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <button
            onClick={onBack}
            className="text-blue-700 hover:text-blue-900 font-medium"
          >
            {language === 'es' ? '← Atrás' : '← Back'}
          </button>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-white border border-slate-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            {language === 'es' ? 'English' : 'Español'}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-6 sm:px-8 pt-6">
        <div className="process-journey process-journey--compact">
          <div className="process-journey__meta">
            <div>
              <p className="process-journey__kicker">
                {language === 'es' ? 'Antes de comenzar' : 'Before you begin'}
              </p>
              <p className="process-journey__label">
                {language === 'es'
                  ? `Pregunta ${stepNumber} de ${totalSteps}`
                  : `Question ${stepNumber} of ${totalSteps}`}
              </p>
            </div>
            <div className="process-journey__pct">{pct}%</div>
          </div>
          <div className="process-journey__track">
            <div className="process-journey__fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 py-10 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 text-center leading-tight">
          {question}
        </h1>

        {explanation && (
          <p className="text-lg text-slate-600 mb-10 text-center max-w-2xl leading-relaxed">
            {explanation}
          </p>
        )}

        <div className="w-full space-y-4 mb-10">
          <button
            onClick={() => setSelectedAnswer('yes')}
            className={`w-full px-8 py-6 rounded-xl transition-colors text-lg font-medium border ${
              selectedAnswer === 'yes'
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                : 'bg-white text-blue-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            {language === 'es' ? 'Sí' : 'Yes'}
          </button>
          <button
            onClick={() => setSelectedAnswer('no')}
            className={`w-full px-8 py-6 rounded-xl transition-colors text-lg font-medium border ${
              selectedAnswer === 'no'
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                : 'bg-white text-blue-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            {language === 'es' ? 'No' : 'No'}
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={selectedAnswer === null}
          className="w-full max-w-md px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {language === 'es' ? 'Continuar' : 'Continue'}
        </button>
        <p className="mt-4 text-sm text-slate-500 text-center">
          {language === 'es'
            ? 'Su respuesta nos ayuda a mostrar el camino correcto.'
            : 'Your answer helps us show the right path next.'}
        </p>
      </div>
    </div>
  );
};

export default GuidedQuestionPage;
