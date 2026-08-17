import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Heart, Shield, FileText, Calendar, HelpCircle, ArrowRight } from 'lucide-react';
import FamilyCourtAsk from '../components/FamilyCourtAsk';
import '../styles/process-ui.css';

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
      hint: {
        en: 'Guided forms and next steps',
        es: 'Formularios guiados y próximos pasos'
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
      hint: {
        en: 'We will help you choose the right type',
        es: 'Le ayudaremos a elegir el tipo correcto'
      },
      route: '/restraining-order'
    },
    {
      id: 'served',
      icon: FileText,
      text: {
        en: 'I was served with court papers',
        es: 'Me entregaron documentos judiciales'
      },
      hint: {
        en: 'Response and deadline guidance',
        es: 'Orientación sobre respuesta y plazos'
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
      hint: {
        en: 'Prepare for your hearing',
        es: 'Prepárese para su audiencia'
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
      hint: {
        en: 'Short questions to point you the right way',
        es: 'Preguntas breves para orientarle'
      },
      route: '/kiosk'
    }
  ];

  return (
    <div className="kiosk-page flex flex-col">
      <div className="kiosk-page__header px-6 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {language === 'es' ? 'Tribunal Superior de San Mateo' : 'San Mateo Superior Court'}
            </p>
            <p className="text-sm text-slate-600">
              {language === 'es' ? 'Centro de Autoayuda · Quiosco' : 'Self-Help Center · Kiosk'}
            </p>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-white border border-slate-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            {language === 'es' ? 'English' : 'Español'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 sm:px-8 py-12 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3 text-center">
          {language === 'es' ? '¿Cómo podemos ayudarte hoy?' : 'How can we help you today?'}
        </h1>

        <p className="text-lg text-slate-600 mb-3 text-center max-w-2xl">
          {language === 'es'
            ? 'Elija un punto de partida. Le mostraremos el camino paso a paso y podrá continuar a su ritmo.'
            : "Choose a starting point. We'll show your path step by step so you always know how to continue."}
        </p>

        <div className="continue-hint mb-10 w-full max-w-xl justify-center">
          <ArrowRight className="w-4 h-4 flex-shrink-0" />
          <span>
            {language === 'es'
              ? 'Después de elegir, verá un mapa del proceso antes de comenzar.'
              : "After you choose, you'll see a process map before you begin."}
          </span>
        </div>

        <div className="w-full space-y-3">
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => navigate(option.route)}
                className="w-full bg-white hover:bg-blue-50 text-left px-6 py-5 rounded-xl transition-colors flex items-center gap-4 shadow-sm border border-slate-200 hover:border-blue-300 group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-lg font-semibold text-slate-900 block">{option.text[language]}</span>
                  <span className="text-sm text-slate-500">{option.hint[language]}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 flex-shrink-0" />
              </button>
            );
          })}
        </div>

        <div className="w-full mt-10">
          <FamilyCourtAsk />
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-slate-500">
            {language === 'es'
              ? 'Si está en peligro inmediato, llame al 911.'
              : 'If you are in immediate danger, call 911.'}
          </p>
        </div>
      </div>

      <div className="bg-white/80 border-t border-slate-200 py-4 px-8">
        <p className="text-center text-xs text-slate-500">
          {language === 'es'
            ? `Tribunal Superior de San Mateo © ${new Date().getFullYear()} · Información general, no asesoramiento legal`
            : `San Mateo Superior Court © ${new Date().getFullYear()} · General information, not legal advice`}
        </p>
      </div>
    </div>
  );
};

export default HomePage;
