import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, ArrowRight, CheckCircle, FileText, AlertTriangle, Clock } from 'lucide-react';

const ProcessGuidance = ({ caseType, queueNumber, onComplete }) => {
  const { language } = useLanguage();
  const [flowchartData, setFlowchartData] = useState(null);
  const [currentStep, setCurrentStep] = useState('start');
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formLinks, setFormLinks] = useState({});

  useEffect(() => {
    fetchFlowchartData();
  }, []);

  // Load hyperlink URLs for any forms in the current step
  useEffect(() => {
    const loadFormLinks = async () => {
      try {
        if (!flowchartData) return;
        const step = flowchartData.flowchart[currentStep];
        if (!step || !Array.isArray(step.forms)) return;
        const codes = step.forms.map(f => f.number).filter(Boolean);
        const entries = await Promise.all(codes.map(async (code) => {
          try {
            const res = await fetch(`http://localhost:1904/api/forms/hyperlink/${encodeURIComponent(code)}`);
            const data = await res.json();
            if (data && data.success) {
              return [code, data.url];
            }
          } catch (e) {
            // ignore
          }
          return [code, null];
        }));
        setFormLinks(Object.fromEntries(entries));
      } catch (e) {
        // ignore
      }
    };
    loadFormLinks();
  }, [flowchartData, currentStep]);

  const fetchFlowchartData = async () => {
    try {
      const response = await fetch('http://localhost:1904/api/flowchart');
      if (response.ok) {
        const data = await response.json();
        setFlowchartData(data);
        // Navigate directly to the relevant help section based on case type
        const helpStep = getHelpStepForCaseType(caseType);
        setCurrentStep(helpStep);
      }
    } catch (error) {
      console.error('Error fetching flowchart:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHelpStepForCaseType = (caseType) => {
    switch (caseType) {
      case 'A': return 'dv_help';
      case 'B': return 'custody_help'; // Default to custody, will ask for clarification
      case 'C': return 'divorce_help';
      case 'D': return 'other_help';
      default: return 'start';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'A': return '#dc3545'; // Red
      case 'B': return '#fd7e14'; // Orange
      case 'C': return '#ffc107'; // Yellow
      case 'D': return '#0d6efd'; // Blue
      default: return '#6c757d';
    }
  };

  const handleOptionClick = (option) => {
    setProgress([...progress, { step: currentStep, option: option.text[language] }]);
    setCurrentStep(option.next);
  };

  const handleBack = () => {
    if (progress.length > 0) {
      const newProgress = progress.slice(0, -1);
      setProgress(newProgress);
      setCurrentStep(newProgress.length > 0 ? newProgress[newProgress.length - 1].step : 'start');
    }
  };

  const handleComplete = async () => {
    setProcessing(true);
    
    try {
      const currentStepData = flowchartData.flowchart[currentStep];
      const summary = generateSummary(currentStepData, progress, language);
      const nextSteps = currentStepData.next_steps?.[language] || [];
      
      // Send to backend
      const response = await fetch('http://localhost:1904/api/process-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queue_number: queueNumber,
          answers: {
            case_type: caseType,
            current_step: currentStep,
            progress: progress,
            summary: summary,
            next_steps: nextSteps
          },
          language: language
        })
      });

      if (response.ok) {
        onComplete(summary, nextSteps.join('\n'));
      }
    } catch (error) {
      console.error('Error processing completion:', error);
    } finally {
      setProcessing(false);
    }
  };

  const generateSummary = (stepData, progress, lang) => {
    const caseTypeLabels = {
      'A': lang === 'en' ? 'Domestic Violence' : 'Violencia Doméstica',
      'B': lang === 'en' ? 'Custody/Support' : 'Custodia/Manutención',
      'C': lang === 'en' ? 'Divorce' : 'Divorcio',
      'D': lang === 'en' ? 'Other Family Law' : 'Otro Derecho de Familia'
    };

    return `${lang === 'en' ? 'Case Type' : 'Tipo de Caso'}: ${caseTypeLabels[caseType]}\n${lang === 'en' ? 'Current Step' : 'Paso Actual'}: ${stepData.title[lang]}\n${lang === 'en' ? 'Description' : 'Descripción'}: ${stepData.description[lang]}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === 'en' ? 'Loading guidance...' : 'Cargando orientación...'}
          </p>
        </div>
      </div>
    );
  }

  if (!flowchartData || !flowchartData.flowchart[currentStep]) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'en' ? 'Guidance Not Available' : 'Orientación No Disponible'}
          </h2>
          <p className="text-gray-600 mb-4">
            {language === 'en' 
              ? 'Unable to load process guidance. Please contact court staff.'
              : 'No se pudo cargar la orientación del proceso. Por favor contacte al personal del tribunal.'
            }
          </p>
          <button
            onClick={() => onComplete('', '')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {language === 'en' ? 'Continue' : 'Continuar'}
          </button>
        </div>
      </div>
    );
  }

  const currentStepData = flowchartData.flowchart[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full">
        {/* Progress Bar */}
        {progress.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                {language === 'en' ? 'Your Path' : 'Tu Camino'}
              </span>
              <span className="text-sm text-gray-600">
                {queueNumber}
              </span>
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto">
              {progress.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm whitespace-nowrap">
                    {item.option}
                  </div>
                  {index < progress.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Step */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentStepData.title[language]}
              </h2>
              {currentStepData.priority && (
                <div 
                  className="inline-block px-3 py-1 rounded-full text-white text-sm font-medium mb-3"
                  style={{ backgroundColor: getPriorityColor(currentStepData.priority) }}
                >
                  {language === 'en' ? `Priority ${currentStepData.priority}` : `Prioridad ${currentStepData.priority}`}
                </div>
              )}
            </div>
          </div>

          <p className="text-gray-700 text-lg mb-6">
            {currentStepData.description[language]}
          </p>

          {/* Options */}
          {currentStepData.options && (
            <div className="space-y-3 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {language === 'en' ? 'Where are you in your process?' : '¿Dónde estás en tu proceso?'}
              </h3>
              {currentStepData.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                  style={{ 
                    borderLeftColor: getPriorityColor(option.priority),
                    borderLeftWidth: '8px'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-medium">
                      {option.text[language]}
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Forms Section */}
          {currentStepData.forms && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                {language === 'en' ? 'Required Forms (fill these first):' : 'Formularios requeridos (complete estos primero):'}
              </h3>
              <p className="text-blue-900 text-sm mb-3">
                {language === 'en'
                  ? 'Only complete the forms below first. Do not fill out everything; staff will tell you if more is needed.'
                  : 'Complete solo los formularios a continuación primero. No llene todo; el personal le indicará si necesita más.'}
              </p>
              <div className="space-y-2">
                {currentStepData.forms.map((form, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                    <div>
                      <strong className="text-gray-900">{form.number}</strong>
                      <span className="text-gray-600 ml-2">- {form.name[language]}</span>
                    </div>
                    {formLinks[form.number] ? (
                      <a
                        className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                        href={formLinks[form.number]}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        {language === 'en' ? 'Open form' : 'Abrir formulario'}
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">{language === 'en' ? 'Link loading…' : 'Cargando enlace…'}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {currentStepData.next_steps && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-3">
                {language === 'en' ? 'Next Steps:' : 'Próximos Pasos:'}
              </h3>
              <ol className="space-y-2">
                {currentStepData.next_steps[language].map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-green-800">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={async () => {
                    try {
                      const email = window.prompt(language === 'en' ? 'Enter your email to receive your summary' : 'Ingrese su correo electrónico para recibir su resumen');
                      if (!email) return;
                      const stepData = flowchartData.flowchart[currentStep] || {};
                      const requiredForms = (stepData.forms || []).map(f => f.number);
                      const nextSteps = stepData.next_steps?.[language] || [];
                      const res = await fetch('http://localhost:1904/api/email/send-summary', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          to: email,
                          flow_type: caseType,
                          queue_number: queueNumber,
                          required_forms: requiredForms,
                          next_steps: nextSteps
                        })
                      });
                      const data = await res.json();
                      if (!res.ok || !data.success) {
                        alert((language === 'en' ? 'Failed to send email: ' : 'No se pudo enviar el correo: ') + (data.error || ''));
                      } else {
                        alert(language === 'en' ? 'Summary sent to your email.' : 'Resumen enviado a su correo.');
                      }
                    } catch (e) {
                      alert(language === 'en' ? 'An error occurred sending the email.' : 'Ocurrió un error al enviar el correo.');
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  {language === 'en' ? 'Email me this summary' : 'Enviarme este resumen'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          {progress.length > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Back' : 'Atrás'}
            </button>
          )}
          <button
            onClick={handleComplete}
            disabled={processing}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {language === 'en' ? 'Processing...' : 'Procesando...'}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Complete Process' : 'Completar Proceso'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessGuidance; 