import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';
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
  MapPin,
  Phone
} from 'lucide-react';
import ModernHeader from '../components/ModernHeader';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import '../components/ModernHeader.css';
import '../components/ModernCard.css';
import '../components/ModernButton.css';

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  'http://localhost:4000';

const CASE_TYPES = [
  {
    id: 'A',
    priority: 'A',
    case_type: 'DVRO',
    icon: Shield,
    accent: 'bg-red-50'
  },
  {
    id: 'B',
    priority: 'B',
    case_type: 'CUSTODY',
    icon: HeartHandshake,
    accent: 'bg-amber-50'
  },
  {
    id: 'C',
    priority: 'C',
    case_type: 'DIVORCE',
    icon: FileText,
    accent: 'bg-blue-50'
  },
  {
    id: 'D',
    priority: 'D',
    case_type: 'OTHER',
    icon: Users,
    accent: 'bg-emerald-50'
  }
];

const UserKiosk = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [queueNumber, setQueueNumber] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [caseSummary, setCaseSummary] = useState('');
  const [nextSteps, setNextSteps] = useState('');

  const caseTypes = useMemo(() => (
    CASE_TYPES.map((caseType) => ({
      ...caseType,
      title: t(`userKiosk.caseTypes.${caseType.id}.title`),
      description: t(`userKiosk.caseTypes.${caseType.id}.description`)
    }))
  ), [t]);

  const selectedCase = selectedCaseId
    ? caseTypes.find((caseType) => caseType.id === selectedCaseId)
    : null;

  const handleCaseSelection = useCallback(async (caseType) => {
    setSelectedCaseId(caseType.id);
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
  }, [language, navigate]);

  const resetKiosk = () => {
    setSelectedCaseId(null);
    setQueueNumber(null);
    setCaseSummary('');
    setNextSteps('');
  };

  const preselectCaseId = location.state?.preselectCaseId;

  useEffect(() => {
    if (!preselectCaseId) {
      return;
    }
    const targetCase = caseTypes.find((caseType) => caseType.id === preselectCaseId);
    if (targetCase) {
      handleCaseSelection(targetCase);
    }
    navigate(location.pathname, { replace: true, state: {} });
  }, [preselectCaseId, caseTypes, handleCaseSelection, navigate, location.pathname]);

  // Show final queue number with summary (for non-DV cases)
  if (queueNumber) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ModernHeader
          title={t('userKiosk.queueAssignedTitle')}
          subtitle={t('userKiosk.queueAssignedSubtitle')}
          showLanguageToggle={true}
        />
        <div className="flex items-center justify-center min-h-[80vh] p-4">
          <div className="max-w-4xl w-full space-y-6">
            <ModernCard variant="elevated" className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-8">
                {t('userKiosk.queueNumberLabel')}
              </h1>

              <ModernCard variant="gradient" className="mb-8">
                <div className="text-8xl font-black text-white mb-4">#{queueNumber}</div>
                <p className="text-white text-xl font-medium">
                  {t('userKiosk.priorityLevel', { values: { value: selectedCase?.priority ?? '' } })}
                </p>
              </ModernCard>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  {selectedCase?.title}
                </h2>
                <p className="text-gray-600 text-lg">
                  {selectedCase?.description}
                </p>
              </div>
            </ModernCard>

            {caseSummary && (
              <ModernCard variant="outlined" className="text-left">
                <h3 className="font-bold text-gray-900 mb-4 text-xl">
                  {t('userKiosk.caseSummaryLabel')}
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
                  {t('userKiosk.nextStepsLabel')}
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
                  {t('userKiosk.waitMessageHeading')}
                </span>
              </div>
              <p className="text-white text-lg">
                {t('userKiosk.waitMessageBody')}
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
                {t('userKiosk.startOver')}
              </ModernButton>
            </div>
          </div>
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
        {t('userKiosk.priorityLevel', { values: { value: tone } })}
      </span>
    );
  };

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
        className="h-full cursor-pointer group hover:scale-105 transition-all duration-300"
        onClick={() => handleCaseSelection(caseType)}
      >
        <div className="h-full flex flex-col">
          <div className={`rounded-t-lg px-6 py-5 bg-gradient-to-r ${priorityColors[caseType.priority]} text-white`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm grid place-items-center">
                  <Icon className="w-6 h-6 text-white" aria-hidden />
                </div>
                <h3 className="text-xl font-bold text-white">{caseType.title}</h3>
              </div>
              <Priority tone={caseType.priority} />
            </div>
          </div>
          <div className="px-6 py-6 flex-1 flex flex-col">
            <p className="text-gray-700 text-base leading-relaxed mb-6 flex-1">
              {caseType.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm font-medium">
                {t('userKiosk.tileCallToAction')}
              </span>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </div>
        </div>
      </ModernCard>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader
        title={t('userKiosk.headerTitle')}
        subtitle={t('userKiosk.headerSubtitle')}
        showLanguageToggle={true}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-7xl w-full px-4">
          <div className="py-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              {t('userKiosk.heroTitle')}
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              {t('userKiosk.heroDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Case Type Selection */}
      <div className="mx-auto max-w-7xl w-full px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {caseTypes.map((caseType) => (
            <Tile key={caseType.id} caseType={caseType} />
          ))}
        </div>
      </div>

      {/* Info Strip */}
      <div className="mx-auto max-w-7xl w-full px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <ModernCard variant="warning" className="text-left">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-white mt-1" />
              <div>
                <h4 className="font-bold text-white text-lg mb-2">
                  {t('userKiosk.emergencyTitle')}
                </h4>
                <p className="text-white text-base leading-relaxed">
                  {t('userKiosk.emergencyMessage')}
                </p>
              </div>
            </div>
          </ModernCard>

          <ModernCard variant="outlined" className="text-left">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="font-medium">
                  {t('userKiosk.locationLine1')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="font-medium">
                  {t('userKiosk.locationLine2')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="font-medium">
                  {t('userKiosk.locationLine3')}
                </span>
              </div>
            </div>
          </ModernCard>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="mx-auto max-w-7xl w-full px-4">
          <div className="py-6 text-center text-sm text-gray-600">
            {t('userKiosk.footer', { values: { year: new Date().getFullYear() } })}
          </div>
        </div>
      </footer>

      {/* Processing State */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <ModernCard variant="elevated" className="text-center max-w-sm mx-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-6"></div>
            <p className="text-gray-800 text-lg font-semibold">
              {t('userKiosk.processing')}
            </p>
          </ModernCard>
        </div>
      )}
    </div>
  );
};

export default UserKiosk;
