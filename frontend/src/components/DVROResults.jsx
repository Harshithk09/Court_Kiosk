import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FileText, CheckCircle, AlertTriangle, Download, Printer, ArrowRight, Shield, Users, Phone } from 'lucide-react';

const DVROResults = ({ results, onBack, onPrint }) => {
  const { language } = useLanguage();
  const [expandedSections, setExpandedSections] = useState(new Set(['forms', 'steps']));
  const { answers, forms, steps } = results;

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

  const getFormCategory = (formNumber) => {
    if (formNumber.startsWith('DV-')) return 'domestic_violence';
    if (formNumber.startsWith('CH-')) return 'civil_harassment';
    if (formNumber.startsWith('FL-')) return 'support_income';
    return 'other';
  };

  const getFormIcon = (formNumber) => {
    const category = getFormCategory(formNumber);
    switch (category) {
      case 'domestic_violence': return Shield;
      case 'civil_harassment': return AlertTriangle;
      case 'support_income': return Users;
      default: return FileText;
    }
  };

  const getFormColor = (formNumber) => {
    const category = getFormCategory(formNumber);
    switch (category) {
      case 'domestic_violence': return 'text-red-600 bg-red-50';
      case 'civil_harassment': return 'text-orange-600 bg-orange-50';
      case 'support_income': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const groupFormsByCategory = () => {
    const grouped = {};
    forms.forEach(form => {
      const category = getFormCategory(form.number);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(form);
    });
    return grouped;
  };

  const getCategoryTitle = (category) => {
    switch (category) {
      case 'domestic_violence': 
        return language === 'es' ? 'Formularios de Violencia Doméstica' : 'Domestic Violence Forms';
      case 'civil_harassment': 
        return language === 'es' ? 'Formularios de Acoso Civil' : 'Civil Harassment Forms';
      case 'support_income': 
        return language === 'es' ? 'Formularios de Manutención' : 'Support & Income Forms';
      default: 
        return language === 'es' ? 'Otros Formularios' : 'Other Forms';
    }
  };

  const groupedForms = groupFormsByCategory();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-800">
            {language === 'es' ? 'Resultados del Asistente' : 'Wizard Results'}
          </h1>
        </div>
        <p className="text-gray-600 text-lg">
          {language === 'es' 
            ? 'Basado en sus respuestas, aquí están sus formularios recomendados y próximos pasos'
            : 'Based on your answers, here are your recommended forms and next steps'
          }
        </p>
      </div>

      {/* Emergency Alert (if applicable) */}
      {answers.immediate_danger === 'yes' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-2">
                {language === 'es' ? '¡PELIGRO INMEDIATO!' : 'IMMEDIATE DANGER!'}
              </h3>
              <p className="text-red-700 mb-3">
                {language === 'es' 
                  ? 'Su seguridad es lo más importante. Complete estos pasos solo cuando esté seguro.'
                  : 'Your safety is most important. Complete these steps only when you are safe.'
                }
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => window.location.href = 'tel:911'}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex items-center"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {language === 'es' ? 'Llamar 911' : 'Call 911'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forms Section */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <button
          onClick={() => toggleSection('forms')}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-blue-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">
              {language === 'es' ? 'Formularios Recomendados' : 'Recommended Forms'}
            </h3>
            <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
              {forms.length}
            </span>
          </div>
          <ArrowRight className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded('forms') ? 'rotate-90' : ''}`} />
        </button>

        {isExpanded('forms') && (
          <div className="px-6 pb-4 border-t border-gray-100">
            <div className="pt-4 space-y-6">
              {Object.entries(groupedForms).map(([category, categoryForms]) => (
                <div key={category}>
                  <h4 className="font-semibold text-gray-700 mb-3">
                    {getCategoryTitle(category)}
                  </h4>
                  <div className="space-y-3">
                    {categoryForms.map((form, index) => {
                      const Icon = getFormIcon(form.number);
                      return (
                        <div key={index} className="flex items-start p-3 border border-gray-200 rounded-lg">
                          <div className={`p-2 rounded-lg mr-3 ${getFormColor(form.number)}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-800">
                                  {form.number} - {form.name}
                                </h5>
                                <p className="text-sm text-gray-600 mt-1">
                                  {form.description}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {form.required && (
                                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                    {language === 'es' ? 'Requerido' : 'Required'}
                                  </span>
                                )}
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Next Steps Section */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <button
          onClick={() => toggleSection('steps')}
          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">
              {language === 'es' ? 'Próximos Pasos' : 'Next Steps'}
            </h3>
            <span className="ml-2 bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
              {steps.length}
            </span>
          </div>
          <ArrowRight className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded('steps') ? 'rotate-90' : ''}`} />
        </button>

        {isExpanded('steps') && (
          <div className="px-6 pb-4 border-t border-gray-100">
            <div className="pt-4 space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-semibold text-sm mr-4">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 mb-1">
                      {step.title}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          {language === 'es' ? 'Volver' : 'Back'}
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={onPrint}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          >
            <Printer className="w-4 h-4 mr-2" />
            {language === 'es' ? 'Imprimir' : 'Print'}
          </button>
          
          <button
            onClick={() => window.print()}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            {language === 'es' ? 'Descargar PDF' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DVROResults; 