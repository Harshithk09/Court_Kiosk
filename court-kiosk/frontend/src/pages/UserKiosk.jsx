import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useKioskMode } from '../contexts/KioskModeContext';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  HeartHandshake,
  FileText,
  Users,
  ChevronRight,
  Clock,
  CheckCircle,
  FileText as FileTextIcon,
  AlertTriangle,
  
} from 'lucide-react';
import ModernHeader from '../components/ModernHeader';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import '../components/ModernHeader.css';
import '../components/ModernCard.css';
import '../components/ModernButton.css';
import '../styles/kiosk-mode.css';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  'http://localhost:4000';

const UserKiosk = () => {
  const { language, toggleLanguage } = useLanguage();
  const { isKioskMode } = useKioskMode();
  const navigate = useNavigate();
  const [selectedCase, setSelectedCase] = useState(null);
  const [queueNumber, setQueueNumber] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [caseSummary, setCaseSummary] = useState('');
  const [nextSteps, setNextSteps] = useState('');

  const caseTypes = [
    {
      id: 'DV',
      priority: 'A',
      case_type: 'DVRO',
      title: { en: 'Domestic Violence', es: 'Violencia Doméstica' },
      description: {
        en: 'Domestic violence restraining orders, safety planning, emergency help.',
        es: 'Órdenes de restricción por violencia doméstica, planificación de seguridad, ayuda de emergencia.'
      },
      icon: Shield,
      accent: 'bg-red-50'
    },
    {
      id: 'DIV',
      priority: 'B',
      case_type: 'DIVORCE',
      title: { en: 'Divorce & Separation', es: 'Divorcio y Separación' },
      description: {
        en: 'Divorce, legal separation, serving papers, and financial disclosures.',
        es: 'Divorcio, separación legal, entrega de documentos y declaraciones financieras.'
      },
      icon: FileText,
      accent: 'bg-blue-50'
    },
    {
      id: 'CUST',
      priority: 'C',
      case_type: 'CUSTODY',
      title: { en: 'Child Custody & Support', es: 'Custodia y Manutención' },
      description: {
        en: 'Child custody, visitation, support, and safety concerns.',
        es: 'Custodia de menores, visitas, manutención y preocupaciones de seguridad.'
      },
      icon: HeartHandshake,
      accent: 'bg-amber-50'
    },
    {
      id: 'OTHER',
      priority: 'D',
      case_type: 'OTHER',
      title: { en: 'Other Family Court Issues', es: 'Otros Asuntos de la Corte de Familia' },
      description: {
        en: 'Civil Harassment (neighbors/strangers), elder abuse, parentage, guardianship, name change, fee waivers.',
        es: 'Acoso civil (vecinos/desconocidos), abuso a mayores, paternidad, tutela, cambio de nombre, exenciones de tarifas.'
      },
      icon: Users,
      accent: 'bg-emerald-50'
    }
  ];

  const handleCaseSelection = async (caseType) => {
    setSelectedCase(caseType);
    setIsProcessing(true);

    try {
      // For Domestic Violence cases, redirect to the comprehensive DVRO page
      if (caseType.case_type === 'DVRO') {
        navigate('/dvro');
        return;
      }

      // For Divorce & Separation cases, redirect to the divorce page
      if (caseType.case_type === 'DIVORCE') {
        navigate('/divorce');
        return;
      }

      // For Child Custody cases, redirect to custody resources
      if (caseType.case_type === 'CUSTODY') {
        navigate('/custody');
        return;
      }

      // For civil harassment and other family law issues, show the extended options page
      if (caseType.case_type === 'OTHER') {
        navigate('/other');
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
      <div className="min-h-screen bg-gray-50">
        <ModernHeader 
          title={language === 'en' ? 'Queue Number Assigned' : 'Número de Cola Asignado'} 
          subtitle={language === 'en' ? 'Please wait to be called' : 'Por favor espera a ser llamado'} 
          showLanguageToggle={true}
          onLanguageToggle={toggleLanguage}
          currentLanguage={language}
        />
        <div className="flex items-center justify-center min-h-[80vh] p-4">
          <div className="max-w-4xl w-full space-y-6">
            <ModernCard variant="elevated" className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              
              <h1 className={`${isKioskMode ? 'text-5xl' : 'text-4xl'} font-bold text-gray-900 mb-8`}>
                {language === 'en' ? 'YOUR QUEUE NUMBER' : 'TU NÚMERO DE COLA'}
              </h1>
              
              <ModernCard variant="gradient" className="mb-8">
                <div className={`${isKioskMode ? 'text-9xl' : 'text-7xl'} font-black text-white mb-4`}>#{queueNumber}</div>
              </ModernCard>

              <div className="mb-8">
                <h2 className={`${isKioskMode ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl'} font-black text-gray-800 mb-4`}>
                  {selectedCase?.title[language]}
                </h2>
                <p className={`text-gray-600 ${isKioskMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'} font-bold`}>
                  {selectedCase?.description[language]}
                </p>
              </div>
            </ModernCard>

            {caseSummary && (
              <ModernCard variant="outlined" className="text-left">
                <h3 className="font-bold text-gray-900 mb-4 text-xl">
                  {language === 'en' ? 'Case Summary' : 'Resumen del Caso'}
                </h3>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed text-lg">
                  {caseSummary}
                </div>
              </ModernCard>
            )}

            {nextSteps && (
              <ModernCard variant="info" className="text-left">
                <h3 className="font-bold text-white mb-4 flex items-center text-xl">
                  <FileTextIcon className="w-6 h-6 mr-3" />
                  {language === 'en' ? 'Next Steps' : 'Próximos Pasos'}
                </h3>
                <div className="text-white whitespace-pre-line leading-relaxed text-lg">
                  {nextSteps}
                </div>
              </ModernCard>
            )}

            <ModernCard variant="warning" className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-white mr-3" />
                <span className="text-white font-bold text-xl">
                  {language === 'en' ? 'Please wait to be called' : 'Por favor espera a ser llamado'}
                </span>
              </div>
              <p className="text-white text-lg">
                {language === 'en' 
                  ? 'A facilitator will call your number when it\'s your turn. Please have a seat and wait.'
                  : 'Un facilitador llamará su número cuando sea su turno. Por favor tome asiento y espere.'
                }
              </p>
            </ModernCard>

            <div className="text-center">
              <ModernButton
                variant="secondary"
                size="large"
                onClick={resetKiosk}
                icon={<ChevronRight className="w-5 h-5" />}
                iconPosition="right"
              >
                {language === 'en' ? 'Start Over' : 'Comenzar de Nuevo'}
              </ModernButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Priority badge removed per feedback
  // Case Type Tile Component
  const Tile = ({ caseType, onClick }) => {
    const Icon = caseType.icon;
    const priorityColors = {
      A: 'from-red-500 to-red-600',
      B: 'from-amber-500 to-amber-600',
      C: 'from-blue-500 to-blue-600',
      D: 'from-emerald-500 to-emerald-600'
    };

    return (
      <ModernCard
        variant="elevated" 
        className={`h-full cursor-pointer group transition-all duration-300 ${
          isKioskMode 
            ? 'hover:scale-105' 
            : 'hover:scale-[1.02] hover:shadow-xl'
        }`}
        onClick={() => handleCaseSelection(caseType)}
      >
        <div className="h-full flex flex-col">
          <div className={`rounded-t-lg ${isKioskMode ? 'px-8 py-8' : 'px-6 py-6'} bg-gradient-to-r ${priorityColors[caseType.priority]} text-white`}>
            <div className={`flex items-center justify-between ${isKioskMode ? 'mb-6' : 'mb-4'}`}>
              <div className="flex items-center gap-4">
                <div className={`${isKioskMode ? 'w-20 h-20' : 'w-16 h-16'} rounded-xl bg-white/20 backdrop-blur-sm grid place-items-center`}>
                  <Icon className={`${isKioskMode ? 'w-10 h-10' : 'w-8 h-8'} text-white`} aria-hidden />
                </div>
                <h3 className={`${isKioskMode ? 'text-5xl sm:text-6xl' : 'text-3xl sm:text-4xl'} font-black text-white`}>
                  {caseType.title[language]}
                </h3>
              </div>
              {/* Priority hidden per feedback */}
            </div>
          </div>
          <div className={`${isKioskMode ? 'px-8 py-8' : 'px-6 py-6'} flex-1 flex flex-col`}>
            <p className={`text-gray-800 ${isKioskMode ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'} font-bold leading-relaxed ${isKioskMode ? 'mb-10' : 'mb-6'} flex-1`}>
              {caseType.description[language]}
            </p>
            <div className="flex items-center justify-between">
              <span className={`text-gray-600 ${isKioskMode ? 'text-xl' : 'text-base'} font-bold`}>
                {language === 'en' ? 'Click to select' : 'Haga clic para seleccionar'}
              </span>
              <ChevronRight className={`${isKioskMode ? 'w-6 h-6' : 'w-5 h-5'} text-gray-400 group-hover:text-gray-600 transition-colors`} />
            </div>
          </div>
        </div>
      </ModernCard>
    );
  };

  const modeClass = isKioskMode ? 'kiosk-mode' : 'website-mode';

  return (
    <div className={`min-h-screen bg-gray-50 ${modeClass}`}>
      <ModernHeader 
        title={language === 'en' ? 'Family Law Self-Help Kiosk' : 'Quiosco de Autoayuda de Derecho de Familia'} 
        showLanguageToggle={true}
        onLanguageToggle={toggleLanguage}
        currentLanguage={language}
      />

      {/* Hero Section - Removed empty box per feedback */}

      {/* Case Type Selection */}
      <div className={`mx-auto ${isKioskMode ? 'max-w-[1400px]' : 'max-w-7xl'} w-full px-4 ${isKioskMode ? 'py-16' : 'py-12'}`}>
          <div className={`grid grid-cols-1 md:grid-cols-2 ${isKioskMode ? 'gap-12' : 'gap-8'}`}>
          {caseTypes.map((caseType) => (
            <Tile key={caseType.id} caseType={caseType} />
          ))}
        </div>
      </div>

      {/* Highlight the civil harassment pilot flow while keeping four core categories */}
      <div className="mx-auto max-w-5xl w-full px-4 pb-8">
        <ModernCard variant="info" className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {language === 'en'
                ? 'Civil Harassment Restraining Order (for non-family members)'
                : 'Orden de restricción por acoso civil (para personas sin relación familiar)'}
            </h3>
            <p className="text-white/90 text-lg font-medium">
              {language === 'en'
                ? 'Neighbors, coworkers, roommates, or strangers. Start the dedicated flow here so staff can implement it quickly.'
                : 'Vecinos, compañeros de trabajo, compañeros de vivienda o desconocidos. Inicie el flujo dedicado aquí para que el personal pueda implementarlo rápidamente.'}
            </p>
          </div>
          <ModernButton
            variant="primary"
            size="large"
            onClick={() => navigate('/chro')}
            icon={<ChevronRight className="w-5 h-5" />}
            iconPosition="right"
          >
            {language === 'en' ? 'Start Civil Harassment' : 'Comenzar Acoso Civil'}
          </ModernButton>
        </ModernCard>
      </div>

      {/* Info Strip (keep only emergency; remove location/hours per feedback) */}
      <div className="mx-auto max-w-7xl w-full px-4 py-8">
        <div className="grid grid-cols-1 gap-6">
          <ModernCard variant="warning" className="text-left">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-white mt-1" />
              <div>
                <h4 className="font-bold text-white text-xl sm:text-2xl mb-3">
                  {language === 'en' ? 'Emergency Help' : 'Ayuda de Emergencia'}
                </h4>
                <p className="text-white text-lg sm:text-xl leading-relaxed font-medium">
                  {language === 'en' 
                    ? 'If you are in immediate danger, call 911. For same‑day DVRO assistance, visit the Self‑Help Center.'
                    : 'Si está en peligro inmediato, llame al 911. Para asistencia de DVRO el mismo día, visite el Centro de Autoayuda.'
                  }
                </p>
              </div>
            </div>
          </ModernCard>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="mx-auto max-w-7xl w-full px-4">
          <div className="py-6 text-center text-sm text-gray-600">
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
          <ModernCard variant="elevated" className="text-center max-w-sm mx-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-gray-800 text-lg font-semibold">
              {language === 'en' ? 'Processing...' : 'Procesando...'}
            </p>
          </ModernCard>
        </div>
      )}
    </div>
  );
};

export default UserKiosk;
