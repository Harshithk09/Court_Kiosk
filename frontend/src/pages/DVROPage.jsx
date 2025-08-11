import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import DVROInformation from '../components/DVROInformation';
import DVROWizard from '../components/DVROWizard';
import DVROResults from '../components/DVROResults';
import { Info, HelpCircle, ArrowLeft, Shield, Globe, Home } from 'lucide-react';

const DVROPage = () => {
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [currentMode, setCurrentMode] = useState('menu'); // menu, info, wizard, results
  const [wizardResults, setWizardResults] = useState(null);

  const handleWizardComplete = (results) => {
    setWizardResults(results);
    setCurrentMode('results');
  };

  const handleBack = () => {
    if (currentMode === 'results') {
      setCurrentMode('menu');
      setWizardResults(null);
    } else if (currentMode === 'info' || currentMode === 'wizard') {
      setCurrentMode('menu');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const renderMenu = () => (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Shield className="w-12 h-12 text-red-500 mr-4" />
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              {language === 'es' ? 'Órdenes de Restricción' : 'Restraining Orders'}
            </h1>
            <p className="text-gray-600 text-lg">
              {language === 'es' 
                ? 'Asistente completo para órdenes de restricción por violencia doméstica'
                : 'Complete assistant for domestic violence restraining orders'
              }
            </p>
          </div>
        </div>
        
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center mx-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Globe className="w-4 h-4 mr-2" />
          {language === 'es' ? 'English' : 'Español'}
        </button>
      </div>

      {/* Menu Options */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Information Option */}
        <button
          onClick={() => setCurrentMode('info')}
          className="group p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Info className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {language === 'es' ? 'Información' : 'Information'}
              </h3>
              <p className="text-gray-600">
                {language === 'es' 
                  ? 'Aprenda sobre el proceso'
                  : 'Learn about the process'
                }
              </p>
            </div>
          </div>
          <p className="text-gray-700">
            {language === 'es' 
              ? 'Información detallada sobre órdenes de restricción, quién puede solicitarlas, tipos de órdenes, y el proceso completo.'
              : 'Detailed information about restraining orders, who can apply, types of orders, and the complete process.'
            }
          </p>
        </button>

        {/* Wizard Option */}
        <button
          onClick={() => setCurrentMode('wizard')}
          className="group p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center mb-4">
            <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <HelpCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {language === 'es' ? 'Asistente' : 'Wizard'}
              </h3>
              <p className="text-gray-600">
                {language === 'es' 
                  ? 'Obtenga ayuda personalizada'
                  : 'Get personalized help'
                }
              </p>
            </div>
          </div>
          <p className="text-gray-700">
            {language === 'es' 
              ? 'Responda preguntas para recibir formularios recomendados y pasos específicos para su situación.'
              : 'Answer questions to get recommended forms and specific steps for your situation.'
            }
          </p>
        </button>
      </div>

      {/* Emergency Information */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <Shield className="w-6 h-6 text-red-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              {language === 'es' ? '¿Está en peligro inmediato?' : 'Are you in immediate danger?'}
            </h3>
            <div className="text-red-700 space-y-1">
              <p className="font-medium">
                {language === 'es' ? 'Si está en peligro inmediato:' : 'If you are in immediate danger:'}
              </p>
              <ul className="space-y-1">
                <li>• {language === 'es' ? 'Llame al 911 inmediatamente' : 'Call 911 immediately'}</li>
                <li>• {language === 'es' ? 'Vaya a un lugar seguro' : 'Go to a safe location'}</li>
                <li>• {language === 'es' ? 'Solicite una Orden de Protección de Emergencia (EPO)' : 'Request an Emergency Protective Order (EPO)'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">
          {language === 'es' 
            ? 'Para obtener más información, consulte con el personal de la corte o un abogado.'
            : 'For more information, consult with court staff or an attorney.'
          }
        </p>
        <div className="flex justify-center space-x-4 text-sm text-gray-500">
          <span>• {language === 'es' ? 'Información general' : 'General information'}</span>
          <span>• {language === 'es' ? 'Formularios' : 'Forms'}</span>
          <span>• {language === 'es' ? 'Recursos legales' : 'Legal resources'}</span>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentMode) {
      case 'info':
        return <DVROInformation />;
      case 'wizard':
        return <DVROWizard onComplete={handleWizardComplete} />;
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
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToHome}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                {language === 'es' ? 'Inicio' : 'Home'}
              </button>
              
              {currentMode !== 'menu' && (
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  {language === 'es' ? 'Volver al menú' : 'Back to menu'}
                </button>
              )}
            </div>
            
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-red-500 mr-2" />
              <span className="font-semibold text-gray-800">
                {language === 'es' ? 'Órdenes de Restricción' : 'Restraining Orders'}
              </span>
            </div>

            <button
              onClick={toggleLanguage}
              className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
            >
              <Globe className="w-4 h-4 mr-1" />
              {language === 'es' ? 'EN' : 'ES'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default DVROPage; 