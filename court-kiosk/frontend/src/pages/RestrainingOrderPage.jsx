import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import SimpleFlowRunner from '../components/SimpleFlowRunner';
import { buildApiUrl, API_ENDPOINTS } from '../utils/apiConfig';

export default function RestrainingOrderPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [flowData, setFlowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/Restraining-order.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load restraining order data: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        setFlowData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading restraining order flow data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const getCaseType = (answers) => {
    // Determine case type based on user answers from the triage flow
    // The flow starts with TriageRO and branches to different types
    
    // Check for DVRO path
    if (answers['CloseRel'] === 'Yes' || answers['DVROEntry']) {
      if (answers['DV2']) {
        return 'Response to Domestic Violence Restraining Order';
      }
      if (answers['DV3']) {
        return 'Modification of Domestic Violence Restraining Order';
      }
      if (answers['DV5']) {
        return 'Renewal of Domestic Violence Restraining Order';
      }
      return 'Domestic Violence Restraining Order';
    }
    
    // Check for Elder/Dependent Adult Abuse
    if (answers['ElderAge'] === 'Yes' || answers['EA_Start']) {
      return 'Elder or Dependent Adult Abuse Restraining Order';
    }
    
    // Check for Gun Violence Restraining Order
    if (answers['GVRO_Start'] || answers['SpecialCheck'] === "I'm worried someone may hurt themselves or others with a gun") {
      return 'Gun Violence Restraining Order';
    }
    
    // Check for Workplace Violence
    if (answers['WV_Start'] || answers['SpecialCheck'] === "I'm an employer trying to protect an employee at the workplace") {
      return 'Workplace Violence Restraining Order';
    }
    
    // Check for Civil Harassment
    if (answers['CRO'] || answers['CROInfo'] === 'Yes' || answers['Starting']) {
      if (answers['Renew']) {
        return 'Renewal of Civil Harassment Restraining Order';
      }
      if (answers['Responding']) {
        return 'Response to Civil Harassment Restraining Order';
      }
      return 'Civil Harassment Restraining Order';
    }
    
    // Default
    return 'Restraining Order';
  };

  const generateSummary = (answers, forms) => {
    const summary = [];
    
    const caseType = getCaseType(answers);
    summary.push(`Case Type: ${caseType}`);
    
    // Add information about the path taken
    if (answers['CloseRel'] === 'Yes') {
      summary.push('Domestic relationship identified - using DVRO forms');
    } else if (answers['ElderAge'] === 'Yes') {
      summary.push('Elder or dependent adult identified - using Elder Abuse forms');
    } else if (answers['CROInfo'] === 'Yes') {
      summary.push('Non-domestic relationship - using Civil Harassment forms');
    }
    
    // Check for immediate danger indicators
    if (answers['DVCheck1'] === 'Yes' || answers['CHROGrounds']) {
      summary.push('User reported abuse/harassment - appropriate forms included');
    }
    
    // Check for children involved (DVRO specific)
    if (answers['DVCustody'] || answers['DVChildSupport']) {
      summary.push('Children involved - child custody/visitation forms included');
    }
    
    if (answers['AbductionCheck'] === 'Yes') {
      summary.push('Child abduction protection requested');
    }
    
    // Check for support requests
    if (answers['DVChildSupport'] || answers['DVSpousalSupport']) {
      const supportTypes = [];
      if (answers['DVChildSupport']) supportTypes.push('child support');
      if (answers['DVSpousalSupport']) supportTypes.push('spousal support');
      summary.push(`Support requested: ${supportTypes.join(', ')} - income forms included`);
    }
    
    // Check for firearms
    if (answers['GunHave'] === 'Yes' || answers['CHGunHave'] === 'Yes') {
      summary.push('Firearms surrender required - appropriate form included');
    }
    
    // Check for emergency/TRO request
    if (answers['DV110a'] || answers['CH110'] || answers['GVRO_110'] || answers['WV_110']) {
      summary.push('Temporary Restraining Order requested - expedited processing');
    }
    
    summary.push(`Total forms recommended: ${forms.length}`);
    
    return summary.join('. ');
  };

  const handleFinish = async ({ answers, forms }) => {
    const summary = generateSummary(answers, forms);
    let queueNumber = '';

    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.GENERATE_QUEUE), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          case_type: getCaseType(answers), 
          priority: 'A', 
          language 
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        queueNumber = data.queue_number;

        // Send answers and summary to backend for facilitator review
        await fetch(buildApiUrl('/api/process-answers'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            queue_number: queueNumber,
            answers: {
              case_type: getCaseType(answers),
              current_step: 'completed',
              progress: Object.entries(answers).map(([pageId, value]) => ({ 
                pageId, 
                option: value 
              })),
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === 'es' ? 'Cargando...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !flowData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="mb-4">
            <svg 
              className="w-16 h-16 text-red-500 mx-auto" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <p className="text-red-600 mb-4 text-lg font-medium">
            {language === 'es' 
              ? 'Error al cargar los datos de la aplicación' 
              : 'Failed to load application data'
            }
          </p>
          {error && (
            <p className="text-gray-600 mb-6 text-sm">
              {error}
            </p>
          )}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {language === 'es' ? 'Intentar de nuevo' : 'Try Again'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="block w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              {language === 'es' ? 'Volver al inicio' : 'Return to Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show the flow runner
  return (
    <SimpleFlowRunner
      flow={flowData}
      onFinish={handleFinish}
      onBack={() => navigate('/')}
      onHome={() => navigate('/')}
    />
  );
}

