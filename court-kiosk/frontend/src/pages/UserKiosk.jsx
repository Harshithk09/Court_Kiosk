import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  HeartHandshake, 
  FileText, 
  Users, 
  Languages,
  ChevronRight,
  Clock,
  CheckCircle,
  FileText as FileTextIcon,
  AlertTriangle,
  MapPin,
  Phone
} from 'lucide-react';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  'http://localhost:4000';

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
      case_type: 'DVRO',
      title: { en: 'Domestic Violence', es: 'Violencia Doméstica' },
      description: { 
        en: 'Restraining orders, protection orders, emergency cases.', 
        es: 'Órdenes de restricción, órdenes de protección, casos de emergencia.' 
      },
      icon: Shield,
      accent: 'bg-red-50'
    },
    {
      id: 'B',
      priority: 'B',
      case_type: 'CUSTODY',
      title: { en: 'Child Custody & Support', es: 'Custodia y Manutención' },
      description: { 
        en: 'Child custody, support, visitation rights.', 
        es: 'Custodia de menores, manutención infantil, derechos de visita.' 
      },
      icon: HeartHandshake,
      accent: 'bg-amber-50'
    },
    {
      id: 'C',
      priority: 'C',
      case_type: 'DIVORCE',
      title: { en: 'Divorce & Separation', es: 'Divorcio y Separación' },
      description: { 
        en: 'Divorce, legal separation, serving papers, next steps.', 
        es: 'Divorcio, separación legal, entrega de documentos, próximos pasos.' 
      },
      icon: FileText,
      accent: 'bg-blue-50'
    },
    {
      id: 'D',
      priority: 'D',
      case_type: 'OTHER',
      title: { en: 'Other Family Law', es: 'Otro Derecho de Familia' },
      description: { 
        en: 'Parentage, guardianship, name change, and more.', 
        es: 'Paternidad, tutela, cambio de nombre y más.' 
      },
      icon: Users,
      accent: 'bg-emerald-50'
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

      // For Divorce & Separation cases (Priority C), redirect to the divorce flow runner
      if (caseType.id === 'C') {
        navigate('/divorce');
        return;
      }

      // For other cases (Priority B, D), use the existing queue system
      const response = await fetch(`${API_BASE_URL}/api/generate-queue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case_type: caseType.case_type,
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-12 max-w-3xl w-full text-center animate-fade-in-up">
          <div className="p-4 bg-green-100 rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold modern-title mb-8" style={{ fontFamily: 'Times New Roman, serif' }}>
            {language === 'en' ? 'YOUR QUEUE NUMBER' : 'TU NÚMERO DE COLA'}
          </h1>
          
          <div className={`text-6xl font-bold mb-8 p-6 ${
            selectedCase?.color || 'bg-gray-500'
          } text-white shadow-lg animate-pulse-slow`} style={{ borderRadius: '0' }}>
            {queueNumber}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
              {selectedCase?.title[language]}
            </h2>
            <p className="text-gray-600 text-base" style={{ fontFamily: 'Arial, sans-serif' }}>
              {selectedCase?.description[language]}
            </p>
          </div>

          {caseSummary && (
            <div className="mb-8 glass-card p-6 text-left bg-blue-50 border-blue-200">
              <h3 className="font-bold text-blue-800 mb-3 text-lg">
                {language === 'en' ? 'Case Summary' : 'Resumen del Caso'}
              </h3>
              <div className="text-blue-700 whitespace-pre-line leading-relaxed">
                {caseSummary}
              </div>
            </div>
          )}

          {nextSteps && (
            <div className="mb-8 glass-card p-6 text-left bg-green-50 border-green-200">
              <h3 className="font-bold text-green-800 mb-3 flex items-center text-lg">
                <FileTextIcon className="w-5 h-5 mr-2" />
                {language === 'en' ? 'Next Steps' : 'Próximos Pasos'}
              </h3>
              <div className="text-green-700 whitespace-pre-line leading-relaxed">
                {nextSteps}
              </div>
            </div>
          )}

          <div className="glass-card p-6 mb-8 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-yellow-600 mr-3" />
              <span className="text-yellow-800 font-bold text-lg">
                {language === 'en' ? 'Please wait to be called' : 'Por favor espera a ser llamado'}
              </span>
            </div>
            <p className="text-yellow-700">
              {language === 'en' 
                ? 'A facilitator will call your number when it\'s your turn. Please have a seat and wait.'
                : 'Un facilitador llamará su número cuando sea su turno. Por favor tome asiento y espere.'
              }
            </p>
          </div>

          <button
            onClick={resetKiosk}
            className="glass-button px-8 py-4 text-lg font-semibold"
          >
            {language === 'en' ? 'Start Over' : 'Comenzar de Nuevo'}
          </button>
        </div>
      </div>
    );
  }

  // Priority Badge Component
  const Priority = ({ tone }) => {
    const tones = {
      A: "bg-red-600",
      B: "bg-amber-600", 
      C: "bg-blue-700",
      D: "bg-emerald-700",
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white ${tones[tone]}`}>
        PRIORITY {tone}
      </span>
    );
  };

  // Case Type Tile Component
  const Tile = ({ caseType, onClick }) => {
    const Icon = caseType.icon;
    return (
      <button
        onClick={() => handleCaseSelection(caseType)}
        disabled={isProcessing}
        className="text-left w-full h-full group"
        aria-label={`${caseType.title[language]} – Select`}
      >
        <div className="h-full rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200">
          <div className={`rounded-t-3xl px-5 py-4 ${caseType.accent}`}> 
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-white/90 grid place-items-center">
                  <Icon className="w-5 h-5 text-blue-900" aria-hidden />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-blue-900">{caseType.title[language]}</h3>
              </div>
              <Priority tone={caseType.priority} />
            </div>
          </div>
          <div className="px-5 pt-4 pb-5">
            <p className="text-slate-700 text-sm sm:text-base min-h-[3.5rem]">{caseType.description[language]}</p>
            <div className="mt-4 inline-flex items-center gap-2 text-blue-900 font-medium">
              Select <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-6xl w-full px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-900 grid place-items-center text-white font-semibold">SM</div>
              <div className="leading-tight">
                <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
                  {language === 'en' 
                    ? 'Superior Court of California, County of San Mateo'
                    : 'Tribunal Superior de California, Condado de San Mateo'
                  }
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  {language === 'en' 
                    ? 'Family Law Self‑Help Kiosk'
                    : 'Quiosco de Autoayuda de Derecho de Familia'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Cambiar idioma / Change language"
            >
              <Languages className="w-4 h-4" /> {language === 'en' ? 'Español' : 'English'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl w-full px-4">
          <div className="py-8 sm:py-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900">
              {language === 'en' ? 'Select Your Case Type' : 'Seleccione su Tipo de Caso'}
            </h2>
            <p className="mt-2 text-base sm:text-lg text-slate-700 max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Choose the category that best describes your legal matter.'
                : 'Elija la categoría que mejor describa su asunto legal.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Case Type Selection */}
      <div className="mx-auto max-w-6xl w-full px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7 lg:gap-8 py-6">
          {caseTypes.map((caseType) => (
            <Tile key={caseType.id} caseType={caseType} />
          ))}
        </div>
      </div>

      {/* Info Strip */}
      <div className="mx-auto max-w-6xl w-full px-4">
        <div className="grid lg:grid-cols-2 gap-4 mt-8">
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900">
                  {language === 'en' ? 'Emergency Help' : 'Ayuda de Emergencia'}
                </h4>
                <p className="text-sm text-amber-900/90">
                  {language === 'en' 
                    ? 'If you are in immediate danger, call 911. For same‑day DVRO assistance, visit the Self‑Help Center.'
                    : 'Si está en peligro inmediato, llame al 911. Para asistencia de DVRO el mismo día, visite el Centro de Autoayuda.'
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-3 text-slate-800">
              <MapPin className="w-5 h-5" /> 
              {language === 'en' 
                ? 'Hall of Justice, 400 County Center, 6th Floor'
                : 'Salón de Justicia, 400 County Center, 6to Piso'
              }
              <Clock className="w-5 h-5" /> 
              {language === 'en' ? 'Mon–Fri · 8:00–12:00, 1:30–3:00' : 'Lun–Vie · 8:00–12:00, 1:30–3:00'}
              <Phone className="w-5 h-5" /> 
              {language === 'en' ? 'Self‑Help Center' : 'Centro de Autoayuda'}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 border-t border-slate-200">
        <div className="mx-auto max-w-6xl w-full px-4">
          <div className="py-4 text-center text-xs text-slate-600">
            {language === 'en' 
              ? `San Mateo Superior Court © ${new Date().getFullYear()} · Family Law Self‑Help Center`
              : `Tribunal Superior de San Mateo © ${new Date().getFullYear()} · Centro de Autoayuda de Derecho de Familia`
            }
          </div>
        </div>
      </footer>

      {/* Processing State */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4 shadow-xl">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-slate-800 text-lg font-semibold">
              {language === 'en' ? 'Processing...' : 'Procesando...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserKiosk;
