import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Heart, 
  FileText, 
  Users, 
  Globe,
  ArrowRight,
  Clock,
  CheckCircle,
  FileText as FileTextIcon
} from 'lucide-react';

const UserKiosk = () => {
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [selectedCase, setSelectedCase] = useState(null);
  const [queueNumber, setQueueNumber] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [caseSummary, setCaseSummary] = useState('');
  const [nextSteps, setNextSteps] = useState('');

  const caseTypes = [
    {
      id: 'A',
      priority: 'A',
      title: { en: 'Domestic Violence', es: 'Violencia Doméstica' },
      description: { 
        en: 'Restraining orders, protection orders, emergency cases', 
        es: 'Órdenes de restricción, órdenes de protección, casos de emergencia' 
      },
      icon: Shield,
      color: 'bg-red-500',
      borderColor: 'border-red-500'
    },
    {
      id: 'B',
      priority: 'B',
      title: { en: 'Child Custody & Support', es: 'Custodia y Manutención' },
      description: { 
        en: 'Child custody, child support, visitation rights', 
        es: 'Custodia de menores, manutención infantil, derechos de visita' 
      },
      icon: Heart,
      color: 'bg-orange-500',
      borderColor: 'border-orange-500'
    },
    {
      id: 'C',
      priority: 'C',
      title: { en: 'Divorce & Separation', es: 'Divorcio y Separación' },
      description: { 
        en: 'Divorce proceedings, legal separation, property division', 
        es: 'Procedimientos de divorcio, separación legal, división de bienes' 
      },
      icon: FileText,
      color: 'bg-yellow-500',
      borderColor: 'border-yellow-500'
    },
    {
      id: 'D',
      priority: 'D',
      title: { en: 'Other Family Law', es: 'Otro Derecho de Familia' },
      description: { 
        en: 'Adoption, guardianship, name changes, other family matters', 
        es: 'Adopción, tutela, cambios de nombre, otros asuntos familiares' 
      },
      icon: Users,
      color: 'bg-blue-500',
      borderColor: 'border-blue-500'
    }
  ];

  const handleCaseSelection = async (caseType) => {
    setSelectedCase(caseType);
    setIsProcessing(true);

    try {
      // For Domestic Violence cases (Priority A), redirect to the comprehensive DVRO page
      if (caseType.id === 'A') {
        navigate('/dvro');
        return;
      }

      // For other cases, use the existing queue system
      const response = await fetch('http://localhost:5001/api/generate-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_type: caseType.id,
          priority: caseType.priority,
          language: language
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQueueNumber(data.queue_number);
        // For non-DV cases, show the queue number directly
        setCaseSummary(data.summary || '');
        setNextSteps(data.next_steps || '');
      } else {
        console.error('Failed to generate queue number');
      }
    } catch (error) {
      console.error('Error generating queue number:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetKiosk = () => {
    setSelectedCase(null);
    setQueueNumber(null);
    setCaseSummary('');
    setNextSteps('');
  };

  // Show final queue number with summary (for non-DV cases)
  if (queueNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {language === 'en' ? 'Your Queue Number' : 'Tu Número de Cola'}
          </h1>
          
          <div className={`text-6xl font-bold mb-6 p-6 rounded-lg ${
            selectedCase?.color || 'bg-gray-500'
          } text-white`}>
            {queueNumber}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedCase?.title[language]}
            </h2>
            <p className="text-gray-600">
              {selectedCase?.description[language]}
            </p>
          </div>

          {caseSummary && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">
                {language === 'en' ? 'Case Summary' : 'Resumen del Caso'}
              </h3>
              <div className="text-blue-800 text-sm whitespace-pre-line">
                {caseSummary}
              </div>
            </div>
          )}

          {nextSteps && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-left">
              <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                <FileTextIcon className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Next Steps' : 'Próximos Pasos'}
              </h3>
              <div className="text-green-800 text-sm whitespace-pre-line">
                {nextSteps}
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 font-semibold">
                {language === 'en' ? 'Please wait to be called' : 'Por favor espera a ser llamado'}
              </span>
            </div>
            <p className="text-yellow-700 text-sm">
              {language === 'en' 
                ? 'A facilitator will call your number when it\'s your turn. Please have a seat and wait.'
                : 'Un facilitador llamará su número cuando sea su turno. Por favor tome asiento y espere.'
              }
            </p>
          </div>

          <button
            onClick={resetKiosk}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            {language === 'en' ? 'Start Over' : 'Comenzar de Nuevo'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg mr-3"></div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'en' ? 'Court Kiosk' : 'Quiosco de la Corte'}
              </h1>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              <Globe className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Español' : 'English'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {language === 'en' ? 'Select Your Case Type' : 'Seleccione su Tipo de Caso'}
          </h2>
          <p className="text-gray-600 text-lg">
            {language === 'en' 
              ? 'Choose the category that best describes your legal matter'
              : 'Elija la categoría que mejor describa su asunto legal'
            }
          </p>
        </div>

        {/* Case Type Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {caseTypes.map((caseType) => {
            const Icon = caseType.icon;
            return (
              <button
                key={caseType.id}
                onClick={() => handleCaseSelection(caseType)}
                disabled={isProcessing}
                className={`group p-6 bg-white rounded-lg shadow-md border-2 transition-all text-left hover:shadow-lg ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                } ${caseType.borderColor}`}
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg mr-4 ${caseType.color} text-white`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {caseType.title[language]}
                    </h3>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium text-white ${
                      caseType.id === 'A' ? 'bg-red-500' :
                      caseType.id === 'B' ? 'bg-orange-500' :
                      caseType.id === 'C' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}>
                      {language === 'en' ? 'Priority' : 'Prioridad'} {caseType.priority}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  {caseType.description[language]}
                </p>
                <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                  <span className="font-medium">
                    {language === 'en' ? 'Select' : 'Seleccionar'}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Emergency Information */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <Shield className="w-6 h-6 text-red-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                {language === 'en' ? 'Emergency Information' : 'Información de Emergencia'}
              </h3>
              <p className="text-red-700">
                {language === 'en' 
                  ? 'If you are in immediate danger, call 911 or go to your nearest police station.'
                  : 'Si está en peligro inmediato, llame al 911 o vaya a la estación de policía más cercana.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-700">
                {language === 'en' ? 'Processing...' : 'Procesando...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserKiosk; 