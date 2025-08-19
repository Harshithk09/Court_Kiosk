import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import SimpleFlowRunner from '../components/SimpleFlowRunner';
import { Shield, Home } from 'lucide-react';

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:5001';

export default function DVROPage() {
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [showFlow, setShowFlow] = useState(false);
  const [flowData, setFlowData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/dv_flow_combined.json')
      .then(response => response.json())
      .then(data => {
        setFlowData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading flow data:', error);
        setLoading(false);
      });
  }, []);

  const handleFinish = async ({ answers, forms }) => {
    const summary = generateSummary(answers, forms);
    let queueNumber = '';

    try {
      const res = await fetch(`${API_BASE_URL}/api/generate-queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_type: 'A', priority: 'A', language })
      });
      if (res.ok) {
        const data = await res.json();
        queueNumber = data.queue_number;

        // send answers and summary to backend for facilitator review
        await fetch(`${API_BASE_URL}/api/process-answers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            queue_number: queueNumber,
            answers: {
              case_type: getCaseType(answers),
              current_step: 'completed',
              progress: Object.entries(answers).map(([pageId, value]) => ({ pageId, option: value })),
              summary,
              next_steps: []
            },
            language
          })
        });
      }
    } catch (error) {
      console.error('Error communicating with backend:', error);
    }

    return queueNumber;
  };

  const getCaseType = (answers) => {
    // Determine case type based on user answers
    if (answers['respond_intro'] === 'yes') {
      return 'Response to Domestic Violence Restraining Order';
    }
    if (answers['change_intro'] === 'yes') {
      return 'Modification of Domestic Violence Restraining Order';
    }
    if (answers['renew_intro'] === 'yes') {
      return 'Renewal of Domestic Violence Restraining Order';
    }
    if (answers['triage_start'] === 'elder_disabled') {
      return 'Elder or Dependent Adult Abuse Restraining Order';
    }
    if (answers['triage_start'] === 'other') {
      return 'Civil Harassment Restraining Order';
    }
    return 'Domestic Violence Restraining Order';
  };

  const generateSummary = (answers, forms) => {
    const summary = [];

    const caseType = getCaseType(answers);
    summary.push(`Case Type: ${caseType}`);

    if (answers['immediate_danger'] === 'yes') {
      summary.push('User reported immediate danger - emergency protocols activated');
    }

    if (answers['triage_start']) {
      switch (answers['triage_start']) {
        case 'close_relationship':
          summary.push('Domestic relationship - using DVRO forms');
          break;
        case 'elder_disabled':
          summary.push('Elder or dependent adult - using Elder Abuse forms');
          break;
        case 'other':
          summary.push('Non-domestic relationship - using Civil Harassment forms');
          break;
        default:
          summary.push('Unknown relationship type');
          break;
      }
    }

    if (answers['children'] === 'yes') {
      summary.push('Children involved - child custody/visitation forms included');
    }

    if (answers['abduction_check'] === 'yes') {
      summary.push('Child abduction protection requested');
    }

    if (answers['support'] && answers['support'] !== 'none') {
      summary.push(`Support requested: ${answers['support']} - income forms included`);
    }

    if (answers['firearms'] === 'yes' || answers['firearms_details'] === 'yes') {
      summary.push('Firearms surrender required - DV-800 form included');
    }

    summary.push(`Total forms recommended: ${forms.length}`);

    return summary.join('. ');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (!flowData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load application data</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If flow is active, show the SimpleFlowRunner without any wrapper
  if (showFlow) {
    return (
      <SimpleFlowRunner
        flow={flowData}
        onFinish={handleFinish}
        onBack={() => setShowFlow(false)}
        onHome={() => navigate('/')}
      />
    );
  }

  // Show the simplified landing page
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors font-medium"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </button>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Family Court Clinic</span>
              </div>

              <button
                onClick={toggleLanguage}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm hover:bg-blue-100 transition-colors"
              >
                {language === 'es' ? 'EN' : 'ES'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Expanded and Better Utilized */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Hero Section - Wider and More Prominent */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {language === 'es' ? 'Órdenes de Restricción' : 'Domestic Violence Restraining Orders'}
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            {language === 'es'
              ? 'Obtenga ayuda para solicitar una orden de restricción. Le guiaremos paso a paso con información y formularios específicos.'
              : 'Get help applying for a restraining order. We\'ll guide you step by step with information and specific forms.'
            }
          </p>
        </div>

        {/* Compact Emergency Notice - Wider */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-12 max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <p className="text-red-800 text-base">
              {language === 'es'
                ? 'Si está en peligro inmediato, llame al 911. '
                : 'If you are in immediate danger, call 911. '
              }
              <span className="font-medium">
                {language === 'es'
                  ? 'Ahora puede comenzar su solicitud.'
                  : 'You can now begin your application.'
                }
              </span>
            </p>
          </div>
        </div>

        {/* Main Action - Prominent and Centered */}
        <div className="text-center mb-16">
          <button
            onClick={() => setShowFlow(true)}
            className="inline-flex items-center px-12 py-6 bg-red-600 text-white font-semibold text-lg rounded-lg hover:bg-red-700 transition-colors shadow-lg"
          >
            <Shield className="w-6 h-6 mr-3" />
            {language === 'es' ? 'Comenzar Solicitud' : 'Start Application'}
          </button>

          <p className="text-base text-gray-500 mt-4">
            {language === 'es'
              ? 'Gratis y confidencial • 15-20 minutos'
              : 'Free and confidential • 15-20 minutes'
            }
          </p>
        </div>

        {/* Quick Info - Wider Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold text-lg">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
              {language === 'es' ? 'Información' : 'Information'}
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              {language === 'es'
                ? 'Aprenda sobre el proceso legal, sus derechos y las opciones disponibles para su situación específica.'
                : 'Learn about the legal process, your rights, and the options available for your specific situation.'
              }
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 font-bold text-lg">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
              {language === 'es' ? 'Preguntas' : 'Questions'}
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              {language === 'es'
                ? 'Responda preguntas simples sobre su situación para recibir orientación personalizada y específica.'
                : 'Answer simple questions about your situation to receive personalized and specific guidance.'
              }
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 font-bold text-lg">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">
              {language === 'es' ? 'Formularios' : 'Forms'}
            </h3>
            <p className="text-gray-600 text-center leading-relaxed">
              {language === 'es'
                ? 'Obtenga los formularios específicos que necesita para su caso, con instrucciones detalladas.'
                : 'Get the specific forms you need for your case, with detailed instructions.'
              }
            </p>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {language === 'es' ? '¿Por qué usar este sistema?' : 'Why use this system?'}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {language === 'es' ? 'Información Completa' : 'Complete Information'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {language === 'es'
                    ? 'Cada pregunta incluye información contextual para que comprenda completamente antes de tomar decisiones.'
                    : 'Every question includes contextual information so you understand completely before making decisions.'
                  }
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {language === 'es' ? 'Formularios Específicos' : 'Specific Forms'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {language === 'es'
                    ? 'Reciba solo los formularios que necesita para su situación específica, sin confusión.'
                    : 'Receive only the forms you need for your specific situation, without confusion.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 