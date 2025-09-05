import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronDown, MapPin, Phone } from 'lucide-react';

const DVROProcessMap = ({ currentStep = 0 }) => {
  const { language } = useLanguage();

  const processSteps = [
    {
      id: 'prepare',
      title: { en: 'Complete Restraining Order Forms (DV-100, CH-100)', es: 'Complete Formularios de Orden de Restricción (DV-100, CH-100)' }
    },
    {
      id: 'copies',
      title: { en: 'Make Copies of All Forms (3 copies: Court, Other Party, Yourself)', es: 'Hacer Copias de Todos los Formularios (3 copias: Tribunal, Otra Parte, Usted)' }
    },
    {
      id: 'file',
      title: { en: 'File Forms with Court Clerk (No fee for DVRO)', es: 'Presentar Formularios al Secretario del Tribunal (Sin cargo para DVRO)' }
    },
    {
      id: 'temporary',
      title: { en: 'Get Temporary Restraining Order (TRO) Issued by Judge', es: 'Obtener Orden de Restricción Temporal (OTR) Emitida por el Juez' }
    },
    {
      id: 'serve',
      title: { en: 'Serve the Other Party (At least 5 days before hearing)', es: 'Notificar a la Otra Parte (Al menos 5 días antes de la audiencia)' }
    },
    {
      id: 'proof',
      title: { en: 'File Proof of Service (DV-200)', es: 'Presentar Prueba de Notificación (DV-200)' }
    },
    {
      id: 'hearing',
      title: { en: 'Attend Court Hearing', es: 'Asistir a la Audiencia Judicial' }
    }
  ];

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 mb-6">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {language === 'es' 
            ? 'Guía del Proceso de DVRO - Tribunal de Familia del Condado de San Mateo'
            : 'San Mateo County Family Court DVRO Process Guide'
          }
        </h2>
        <div className="w-24 h-1 bg-blue-600 mx-auto rounded"></div>
      </div>

      {/* Process Flow */}
      <div className="flex flex-col items-center space-y-0 max-w-3xl mx-auto">
        {processSteps.map((step, index) => {
          const status = getStepStatus(index);
          
          return (
            <React.Fragment key={step.id}>
              {/* Process Step Box */}
              <div className={`w-full p-6 rounded-lg border-2 transition-all duration-300 ${
                status === 'completed' 
                  ? 'bg-green-50 border-green-300 shadow-sm'
                  : status === 'current'
                  ? 'bg-blue-50 border-blue-400 shadow-md'
                  : 'bg-blue-50 border-blue-300 shadow-sm'
              }`}>
                <div className="text-center">
                  <h3 className={`font-semibold text-lg leading-relaxed ${
                    status === 'completed' 
                      ? 'text-green-800'
                      : status === 'current'
                      ? 'text-blue-800'
                      : 'text-blue-700'
                  }`}>
                    {step.title[language]}
                  </h3>
                  {status === 'current' && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {language === 'es' ? 'Paso Actual' : 'Current Step'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Downward Arrow */}
              {index < processSteps.length - 1 && (
                <div className="flex justify-center py-3">
                  <ChevronDown className="w-6 h-6 text-blue-600" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress Summary */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">
            {language === 'es' ? 'Progreso del Proceso' : 'Process Progress'}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(((currentStep + 1) / processSteps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / processSteps.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center">
          {language === 'es' 
            ? `Paso ${currentStep + 1} de ${processSteps.length} completado`
            : `Step ${currentStep + 1} of ${processSteps.length} completed`
          }
        </p>
      </div>

      {/* Emergency Information */}
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start">
          <Phone className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-red-800 mb-1">
              {language === 'es' ? '¿En peligro inmediato?' : 'In immediate danger?'}
            </h4>
            <p className="text-sm text-red-700">
              {language === 'es' 
                ? 'Llame al 911 inmediatamente. La policía puede solicitar una Orden de Protección de Emergencia (EPO).'
                : 'Call 911 immediately. Police can request an Emergency Protective Order (EPO).'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DVROProcessMap; 