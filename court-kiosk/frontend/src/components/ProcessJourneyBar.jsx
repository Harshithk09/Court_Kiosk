import React, { useMemo } from 'react';
import { Check, Circle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { STAGE_ICONS } from '../data/stageIcons';
import { FileText } from 'lucide-react';

/**
 * Horizontal journey strip: completed / current / upcoming stages.
 * Used in-flow so visitors always see where they are and what remains.
 */
const ProcessJourneyBar = ({
  stages = [],
  currentNodeId,
  history = [],
  title,
  compact = false,
}) => {
  const { language } = useLanguage();

  const stageStates = useMemo(() => {
    if (!stages.length) return [];
    const historySet = new Set(history);
    let currentIndex = stages.findIndex((s) => s.nodeIds?.includes(currentNodeId));
    if (currentIndex < 0) {
      // Fall back: last stage that intersects history
      for (let i = stages.length - 1; i >= 0; i -= 1) {
        if ((stages[i].nodeIds || []).some((id) => historySet.has(id))) {
          currentIndex = i;
          break;
        }
      }
    }
    return stages.map((stage, index) => {
      const touched = (stage.nodeIds || []).some((id) => historySet.has(id));
      let status = 'upcoming';
      if (index === currentIndex) status = 'current';
      else if (currentIndex >= 0 && index < currentIndex) status = 'done';
      else if (touched && currentIndex < 0) status = 'done';
      return { ...stage, status, index };
    });
  }, [stages, currentNodeId, history]);

  if (!stages.length) return null;

  const doneCount = stageStates.filter((s) => s.status === 'done' || s.status === 'current').length;
  const pct = Math.round((doneCount / stages.length) * 100);

  return (
    <div className={`process-journey ${compact ? 'process-journey--compact' : ''}`}>
      <div className="process-journey__meta">
        <div>
          {title && <p className="process-journey__kicker">{title}</p>}
          <p className="process-journey__label">
            {language === 'es' ? 'Su camino' : 'Your path'}
            <span className="process-journey__count">
              {language === 'es' ? ` · Paso ${Math.min(doneCount, stages.length)} de ${stages.length}` : ` · Step ${Math.min(doneCount, stages.length)} of ${stages.length}`}
            </span>
          </p>
        </div>
        <div className="process-journey__pct" aria-hidden="true">{pct}%</div>
      </div>
      <div className="process-journey__track" role="list" aria-label={language === 'es' ? 'Progreso del proceso' : 'Process progress'}>
        <div className="process-journey__fill" style={{ width: `${pct}%` }} />
      </div>
      <ol className="process-journey__steps">
        {stageStates.map((stage) => {
          const Icon = STAGE_ICONS[stage.icon] || FileText;
          const label = stage.label?.[language] || stage.label?.en || stage.label;
          return (
            <li key={stage.id} className={`process-journey__step process-journey__step--${stage.status}`}>
              <div className="process-journey__icon" aria-hidden="true">
                {stage.status === 'done' ? <Check className="w-3.5 h-3.5" /> : stage.status === 'current' ? <Icon className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              </div>
              <span className="process-journey__step-label">{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default ProcessJourneyBar;
