import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import SimpleFlowRunner from '../components/SimpleFlowRunner';
import GuidedQuestionPage from './GuidedQuestionPage';
import { buildApiUrl, API_ENDPOINTS } from '../utils/apiConfig';

export default function DVROPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('question');
  const [answers, setAnswers] = useState({});
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
      const res = await fetch(buildApiUrl(API_ENDPOINTS.GENERATE_QUEUE), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_type: 'DVRO', priority: 'A', language })
      });
      if (res.ok) {
        const data = await res.json();
        queueNumber = data.queue_number;

        // send answers and summary to backend for facilitator review
        await fetch(buildApiUrl('/api/process-answers'), {
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

  const handleFirstQuestionAnswer = (answer) => {
    setAnswers({ ...answers, relationship_question: answer });
    // If yes, proceed to full flow. If no, redirect to other options
    if (answer === 'yes') {
      setCurrentStep('flow');
    } else {
      // Could redirect to CHRO or other options
      navigate('/other');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (!flowData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load application data</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show first guided question
  if (currentStep === 'question') {
    return (
      <GuidedQuestionPage
        question={language === 'es' 
          ? '¿Se trata de una relación con un cónyuge, pareja o co-padre?'
          : 'Is this about a relationship with a spouse, partner, or co-parent?'
        }
        explanation={language === 'es'
          ? 'Esto nos ayuda a entender si su situación cae bajo el derecho de familia, que cubre cosas como divorcio, separación y custodia de hijos. No incluye problemas como disputas con vecinos.'
          : 'This helps us understand if your situation falls under family law, which covers things like divorce, separation, and child custody. It does not include issues like neighbor disputes.'
        }
        onAnswer={handleFirstQuestionAnswer}
        onBack={() => navigate('/')}
        stepNumber={1}
        totalSteps={2}
      />
    );
  }

  // Show full flow after answering the first question
  if (currentStep === 'flow') {
    return (
      <SimpleFlowRunner
        flow={flowData}
        onFinish={handleFinish}
        onBack={() => setCurrentStep('question')}
        onHome={() => navigate('/')}
      />
    );
  }

  return null;
} 