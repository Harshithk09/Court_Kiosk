import React, { useState } from 'react';
import { FileText, PlayCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { STAGE_ICONS } from '../data/stageIcons';

const FlowRoadmap = ({ stages, title, onStart, onHome }) => {
  const { language, toggleLanguage } = useLanguage();
  const [selectedStageId, setSelectedStageId] = useState(stages[0].id);

  const selectedStage = stages.find((stage) => stage.id === selectedStageId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {onHome && (
              <button
                onClick={onHome}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← {language === 'es' ? 'Inicio' : 'Home'}
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-900">
              {title[language]}
            </h1>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            {language === 'es' ? 'English' : 'Español'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-10 px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {language === 'es' ? 'Su Camino, Paso a Paso' : 'Your Path, Step by Step'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {language === 'es'
              ? 'Aquí está todo el proceso de un vistazo. Toque cualquier paso para saber más antes de comenzar.'
              : "Here's the whole process at a glance. Tap any step to learn more before you begin."}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="overflow-x-auto">
            <div className="flex items-start gap-1 min-w-max px-2 pb-2">
              {stages.map((stage, index) => {
                const Icon = STAGE_ICONS[stage.icon] || FileText;
                const isSelected = stage.id === selectedStageId;
                const isLast = index === stages.length - 1;

                return (
                  <React.Fragment key={stage.id}>
                    <button
                      onClick={() => setSelectedStageId(stage.id)}
                      className="flex flex-col items-center w-28 text-center focus:outline-none group"
                    >
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100'
                            : 'bg-white text-blue-600 border-2 border-blue-200 group-hover:border-blue-400'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div
                        className={`mt-2 text-xs font-bold ${isSelected ? 'text-blue-700' : 'text-gray-400'}`}
                      >
                        {language === 'es' ? 'PASO' : 'STEP'} {stage.number}
                      </div>
                      <div
                        className={`mt-0.5 text-sm leading-tight ${
                          isSelected ? 'font-semibold text-gray-900' : 'text-gray-600'
                        }`}
                      >
                        {stage.label[language]}
                      </div>
                    </button>
                    {!isLast && (
                      <div className="flex-1 min-w-[16px] h-0.5 bg-gray-200 mt-7" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {selectedStage && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                {(() => {
                  const Icon = STAGE_ICONS[selectedStage.icon] || FileText;
                  return <Icon className="w-6 h-6" />;
                })()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-600 mb-1">
                  {language === 'es' ? 'PASO' : 'STEP'} {selectedStage.number}
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedStage.label[language]}</h3>
                <p className="text-gray-700 leading-relaxed">{selectedStage.description[language]}</p>

                {selectedStage.videoUrl && (
                  <button className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                    <PlayCircle className="w-4 h-4" />
                    <span>{language === 'es' ? 'Ver video' : 'Watch video'}</span>
                  </button>
                )}

                {selectedStage.eligibilityNote && (
                  <div className="mt-4 flex items-start space-x-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      {selectedStage.eligibilityNote[language]}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onStart}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-sm transition-colors"
          >
            {language === 'es' ? 'Comenzar' : 'Start'}
          </button>
          <p className="mt-3 text-sm text-gray-500">
            {language === 'es'
              ? 'Le haremos algunas preguntas para asegurarnos de que este es el camino correcto.'
              : "We'll ask a few questions first to make sure this is the right path for you."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlowRoadmap;
