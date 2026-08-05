import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import SimpleFlowRunner from '../components/SimpleFlowRunner';
import FlowRoadmap from '../components/FlowRoadmap';
import { WORKPLACE_VIOLENCE_ROADMAP_STAGES } from '../data/workplaceViolenceRoadmapStages';

const WORKPLACE_VIOLENCE_TITLE = {
  en: 'Workplace Violence Restraining Order',
  es: 'Orden de Restricción por Violencia en el Trabajo'
};

export default function WorkplaceViolencePage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('roadmap');
  const [flowData, setFlowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/workplace-violence-flow.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load Workplace Violence data: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        setFlowData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading Workplace Violence flow data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleFinish = async ({ answers, forms }) => {
    navigate('/');
  };

  if (currentStep === 'roadmap') {
    return (
      <FlowRoadmap
        stages={WORKPLACE_VIOLENCE_ROADMAP_STAGES}
        title={WORKPLACE_VIOLENCE_TITLE}
        onStart={() => setCurrentStep('flow')}
        onHome={() => navigate('/')}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'es' ? 'Cargando...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error || !flowData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load Workplace Violence data</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-blue-600 text-white rounded-lg">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <SimpleFlowRunner
      flow={flowData}
      onFinish={handleFinish}
      onBack={() => setCurrentStep('roadmap')}
      onHome={() => navigate('/')}
      roadmapStages={WORKPLACE_VIOLENCE_ROADMAP_STAGES}
    />
  );
}

