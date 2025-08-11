import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getInfoForTopic } from '../data/flows';
import { ChevronDown, ChevronRight, Info, Shield } from 'lucide-react';

const DVROInformation = () => {
  const { language } = useLanguage();
  const [expandedSections, setExpandedSections] = useState(new Set(['what_is_dvro']));
  const infoSections = getInfoForTopic('restraining');

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const isExpanded = (sectionId) => expandedSections.has(sectionId);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-red-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">
            {language === 'es' ? 'Información sobre Órdenes de Restricción' : 'Restraining Order Information'}
          </h1>
        </div>
        <p className="text-gray-600 text-lg">
          {language === 'es' 
            ? 'Información completa sobre el proceso de órdenes de restricción por violencia doméstica'
            : 'Complete information about domestic violence restraining order process'
          }
        </p>
      </div>

      {/* Information Sections */}
      <div className="space-y-4">
        {infoSections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg shadow-md border border-gray-200">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Info className="w-5 h-5 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">
                  {section.title[language]}
                </h3>
              </div>
              {isExpanded(section.id) ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {/* Section Content */}
            {isExpanded(section.id) && (
              <div className="px-6 pb-4 border-t border-gray-100">
                <div className="pt-4 text-gray-700 leading-relaxed">
                  {section.body[language]}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Emergency Information */}
      <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-red-800">
              {language === 'es' ? '¿Está en peligro inmediato?' : 'Are you in immediate danger?'}
            </h3>
            <div className="mt-2 text-red-700">
              <p className="font-medium">
                {language === 'es' ? 'Si está en peligro inmediato:' : 'If you are in immediate danger:'}
              </p>
              <ul className="mt-2 space-y-1">
                <li>• {language === 'es' ? 'Llame al 911 inmediatamente' : 'Call 911 immediately'}</li>
                <li>• {language === 'es' ? 'Vaya a un lugar seguro' : 'Go to a safe location'}</li>
                <li>• {language === 'es' ? 'Solicite una Orden de Protección de Emergencia (EPO)' : 'Request an Emergency Protective Order (EPO)'}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          {language === 'es' 
            ? 'Para obtener más información, consulte con el personal de la corte o un abogado.'
            : 'For more information, consult with court staff or an attorney.'
          }
        </p>
      </div>
    </div>
  );
};

export default DVROInformation; 