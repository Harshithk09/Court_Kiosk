import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Heart, Shield, FileText, Calendar, HelpCircle } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();

  const options = [
    {
      id: 'divorce',
      icon: Heart,
      text: {
        en: 'I want to start a divorce or legal separation',
        es: 'Quiero iniciar un divorcio o separación legal'
      },
      route: '/divorce'
    },
    {
      id: 'restraining',
      icon: Shield,
      text: {
        en: 'I need a restraining order',
        es: 'Necesito una orden de restricción'
      },
      route: '/dvro'
    },
    {
      id: 'served',
      icon: FileText,
      text: {
        en: 'I was served with court papers',
        es: 'Me entregaron documentos judiciales'
      },
      route: '/other'
    },
    {
      id: 'court-date',
      icon: Calendar,
      text: {
        en: 'I have a court date coming up',
        es: 'Tengo una fecha de audiencia próxima'
      },
      route: '/custody'
    },
    {
      id: 'not-sure',
      icon: HelpCircle,
      text: {
        en: "I'm not sure — help me figure it out",
        es: 'No estoy seguro — ayúdame a descubrirlo'
      },
      route: '/kiosk'
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Simple Header */}
      <div className="bg-blue-50 border-b border-blue-200 px-8 py-4">
        <div className="flex justify-end">
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-white text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            {language === 'es' ? 'English' : 'Español'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 max-w-4xl mx-auto w-full">
        {/* Court Icon */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl font-bold text-gray-900 mb-4 text-center">
          {language === 'es' ? '¿Cómo podemos ayudarte hoy?' : 'How can we help you today?'}
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-600 mb-12 text-center">
          {language === 'es' ? 'Te guiaremos paso a paso.' : "We'll guide you step by step."}
        </p>

        {/* Options - Vertical Stack */}
        <div className="w-full space-y-4">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => navigate(option.route)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-left px-8 py-6 rounded-lg transition-colors flex items-center space-x-4 shadow-sm"
              >
                <Icon className="w-6 h-6 flex-shrink-0" />
                <span className="text-lg font-medium">{option.text[language]}</span>
              </button>
            );
          })}
        </div>

        {/* Emergency Notice */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            {language === 'es' 
              ? 'Si está en peligro inmediato, llame al 911.'
              : 'If you are in immediate danger, call 911.'
            }
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t border-gray-200 py-4 px-8">
        <p className="text-center text-xs text-gray-500">
          {language === 'es'
            ? `Tribunal Superior de San Mateo © ${new Date().getFullYear()}`
            : `San Mateo Superior Court © ${new Date().getFullYear()}`
          }
        </p>
      </div>
    </div>
  );
};

export default HomePage;

