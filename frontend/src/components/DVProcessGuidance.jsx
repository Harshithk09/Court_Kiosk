import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, ArrowRight, CheckCircle, FileText, AlertTriangle, Shield, Clock, Scale } from 'lucide-react';
import { topics, getFormsForTopic, getNextStepsForTopic } from '../data/flows.js';

const DVProcessGuidance = ({ queueNumber, onComplete }) => {
  const { language } = useLanguage();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [processing, setProcessing] = useState(false);

  const dvTopic = topics.restraining;
  const questions = dvTopic.questions;

  const handleAnswer = (value) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: value
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitAnswers();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitAnswers = async () => {
    setProcessing(true);
    
    try {
      // Get forms and next steps based on answers
      const forms = getFormsForTopic('restraining', answers);
      const nextSteps = getNextStepsForTopic('restraining', answers);
      
      // Generate summary
      const summary = generateSummary(answers, forms, language);
      
      // Send to backend
      const response = await fetch('http://localhost:1904/api/process-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queue_number: queueNumber,
          answers: {
            case_type: 'A',
            current_step: 'dv_process',
            progress: Object.entries(answers).map(([key, value]) => ({
              question: key,
              answer: value
            })),
            summary: summary,
            next_steps: nextSteps.map(step => step.title).join('\n'),
            forms: forms
          },
          language: language
        })
      });

      if (response.ok) {
        onComplete(summary, nextSteps.map(step => step.title).join('\n'));
      }
    } catch (error) {
      console.error('Error processing completion:', error);
    } finally {
      setProcessing(false);
    }
  };

  const generateSummary = (answers, forms, lang) => {
    const caseTypeLabel = lang === 'en' ? 'Domestic Violence' : 'Violencia Doméstica';
    const relationshipLabels = {
      'spouse': lang === 'en' ? 'Spouse/Partner' : 'Cónyuge/Pareja',
      'family': lang === 'en' ? 'Family Member' : 'Miembro de Familia',
      'other': lang === 'en' ? 'Other Relationship' : 'Otra Relación'
    };
    const protectionLabels = {
      'emergency': lang === 'en' ? 'Emergency Protection' : 'Protección de Emergencia',
      'permanent': lang === 'en' ? 'Long-term Protection' : 'Protección a Largo Plazo'
    };

    return `${lang === 'en' ? 'Case Type' : 'Tipo de Caso'}: ${caseTypeLabel}\n${lang === 'en' ? 'Relationship' : 'Relación'}: ${relationshipLabels[answers.relationship] || 'Unknown'}\n${lang === 'en' ? 'Protection Type' : 'Tipo de Protección'}: ${protectionLabels[answers.protection_type] || 'Unknown'}\n${lang === 'en' ? 'Children Involved' : 'Niños Involucrados'}: ${answers.children_involved === 'yes' ? (lang === 'en' ? 'Yes' : 'Sí') : (lang === 'en' ? 'No' : 'No')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];

  // Check if this is the immediate danger question
  const isImmediateDanger = currentQuestion.id === 'immediate_danger';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full border border-gray-200">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600 font-medium">
              {language === 'en' ? 'Question' : 'Pregunta'} {currentQuestionIndex + 1} {language === 'en' ? 'of' : 'de'} {questions.length}
            </span>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-600 font-medium">
                {queueNumber}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Emergency Alert for Immediate Danger */}
        {isImmediateDanger && (
          <div className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-red-900 font-bold text-lg mb-2">
                  {language === 'en' ? 'Emergency Information' : 'Información de Emergencia'}
                </h3>
                <p className="text-red-800 leading-relaxed">
                  {language === 'en' 
                    ? 'If you are in immediate danger, call 911 now. You can also go to a police station or domestic violence shelter.'
                    : 'Si estás en peligro inmediato, llama al 911 ahora. También puedes ir a una estación de policía o refugio de violencia doméstica.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {typeof currentQuestion.question === 'object' 
              ? currentQuestion.question[language] 
              : currentQuestion.question
            }
          </h2>
          {currentQuestion.subtitle && (
            <p className="text-gray-600 text-lg leading-relaxed">
              {currentQuestion.subtitle}
            </p>
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-4 mb-8">
          {currentQuestion.options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className={`w-full p-6 text-left rounded-xl border-2 transition-all duration-300 group ${
                currentAnswer === option.value
                  ? 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-red-300 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                  currentAnswer === option.value
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-300 group-hover:border-red-400'
                }`}>
                  {currentAnswer === option.value && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="text-xl font-semibold text-gray-900">
                      {typeof option.label === 'object' 
                        ? option.label[language] 
                        : option.label
                      }
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {typeof option.description === 'object' 
                      ? option.description[language] 
                      : option.description
                    }
                  </p>
                </div>
                <ArrowRight className={`w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors flex-shrink-0 mt-1 ${
                  currentAnswer === option.value ? 'text-red-500' : ''
                }`} />
              </div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'en' ? 'Previous' : 'Anterior'}
          </button>
          
          <button
            onClick={nextQuestion}
            disabled={!currentAnswer}
            className="flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
          >
            {currentQuestionIndex === questions.length - 1 
              ? (language === 'en' ? 'Complete Process' : 'Completar Proceso')
              : (language === 'en' ? 'Next' : 'Siguiente')
            }
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        {processing && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-3 bg-white rounded-xl px-6 py-4 shadow-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              <p className="text-gray-700 font-medium">
                {language === 'en' ? 'Processing your answers...' : 'Procesando tus respuestas...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DVProcessGuidance; 