import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import SimpleFlowRunner from '../components/SimpleFlowRunner';

export default function RestrainingOrderTriagePage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [flowData, setFlowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const routingHandledRef = useRef(false);

  // Map routing nodes to their destinations (moved outside useEffect to avoid dependency)
  const routingMap = {
    'DVROEntry': '/dvro',
    'EA_Start': '/elder-abuse',
    'GVRO_Start': '/gvro',
    'WV_Start': '/workplace-violence',
    'CRO': '/chro'
  };

  useEffect(() => {
    fetch('/data/restraining-order-triage.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load triage data: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        // Modify routing nodes to be terminal and add route information
        const modifiedNodes = { ...data.nodes };
        Object.keys(routingMap).forEach(nodeId => {
          if (modifiedNodes[nodeId]) {
            modifiedNodes[nodeId] = {
              ...modifiedNodes[nodeId],
              type: 'terminal',
              routeTarget: routingMap[nodeId]
            };
          }
        });

        setFlowData({
          ...data,
          nodes: modifiedNodes
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading triage flow data:', error);
        setError(error.message);
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Custom finish handler that checks for routing
  const handleFinish = async ({ answers, forms }) => {
    // Prevent double navigation
    if (routingHandledRef.current) return;
    
    // Check answers for routing indicators - look at the last few answers
    const answerKeys = Object.keys(answers);
    
    // Check if any routing node was selected
    for (const [nodeId, route] of Object.entries(routingMap)) {
      // Check if this node appears in answers or if user selected an edge leading to it
      if (answers[nodeId] !== undefined || 
          answers[`ROUTE_${nodeId}`] !== undefined ||
          answerKeys.some(key => key.includes(nodeId))) {
        routingHandledRef.current = true;
        
        // Show brief message then navigate
        setTimeout(() => {
          navigate(route);
        }, 800);
        return;
      }
    }

    // Check history for routing nodes
    // We'll need to pass history through onFinish, but for now check answers
    // If CRONO (no match), just go home
    if (answers['CRONO'] !== undefined) {
      navigate('/');
      return;
    }

    // Default: go home
    navigate('/');
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
              ? 'Error al cargar los datos' 
              : 'Failed to load data'
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

  // Handle routing when a routing node is reached
  const handleRoute = (routeTarget, nodeId) => {
    routingHandledRef.current = true;
    navigate(routeTarget);
  };

  // Show the triage flow runner
  return (
    <SimpleFlowRunner
      flow={flowData}
      onFinish={handleFinish}
      onBack={() => navigate('/')}
      onHome={() => navigate('/')}
      onRoute={handleRoute}
    />
  );
}
