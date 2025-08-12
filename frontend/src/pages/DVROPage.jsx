import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import DVROInformation from '../components/DVROInformation';
import DVROWizard from '../components/DVROWizard';
import DVROResults from '../components/DVROResults';
import Logo from '../components/Logo';
import { Info, HelpCircle, ArrowLeft, Shield, Globe, Home } from 'lucide-react';

const DVROPage = () => {
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [currentMode, setCurrentMode] = useState('menu');
  const [wizardResults, setWizardResults] = useState(null);
  const [currentWizardStep, setCurrentWizardStep] = useState(0);

  const handleWizardComplete = (results) => {
    setWizardResults(results);
    setCurrentMode('results');
  };

  const handleBack = () => {
    if (currentMode === 'results') {
      setCurrentMode('wizard');
      setWizardResults(null);
    } else if (currentMode === 'wizard') {
      setCurrentMode('menu');
    } else if (currentMode === 'info') {
      setCurrentMode('menu');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const renderMenu = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {language === 'es' ? 'Órdenes de Restricción' : 'Restraining Orders'}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {language === 'es' 
            ? 'Obtenga ayuda para solicitar una orden de restricción por violencia doméstica. Le guiaremos a través del proceso paso a paso.'
            : 'Get help applying for a domestic violence restraining order. We\'ll guide you through the process step by step.'
          }
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <button
          onClick={() => setCurrentMode('info')}
          className="flex items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-red-200"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
            <Info className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-800 mb-1">
              {language === 'es' ? 'Información' : 'Information'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'es' 
                ? 'Aprenda sobre órdenes de restricción y el proceso'
                : 'Learn about restraining orders and the process'
              }
            </p>
          </div>
        </button>

        <button
          onClick={() => setCurrentMode('wizard')}
          className="flex items-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-red-200"
        >
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
            <HelpCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-800 mb-1">
              {language === 'es' ? 'Comenzar' : 'Get Started'}
            </h3>
            <p className="text-sm text-gray-600">
              {language === 'es' 
                ? 'Responda preguntas para obtener ayuda personalizada'
                : 'Answer questions to get personalized help'
              }
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentMode) {
      case 'info':
        return <DVROInformation />;
      case 'wizard':
        return (
          <DVROWizard 
            onComplete={handleWizardComplete}
            onStepChange={setCurrentWizardStep}
          />
        );
      case 'results':
        return (
          <DVROResults 
            results={wizardResults} 
            onBack={handleBack}
            onPrint={() => window.print()}
          />
        );
      default:
        return renderMenu();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={handleBackToHome} className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                <Home className="w-5 h-5 mr-2" />
                {language === 'es' ? 'Inicio' : 'Home'}
              </button>
              {currentMode !== 'menu' && (
                <button onClick={handleBack} className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  {language === 'es' ? 'Volver al menú' : 'Back to menu'}
                </button>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Logo size="small" />
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {language === 'es' ? 'EN' : 'ES'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default DVROPage; 