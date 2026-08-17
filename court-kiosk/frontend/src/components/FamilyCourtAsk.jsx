import React, { useState } from 'react';
import { HelpCircle, Send, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { buildApiUrl, getApiHeaders } from '../utils/apiConfig';

/**
 * Compact family-court RAG ask panel for home / completion screens.
 */
const FamilyCourtAsk = ({ caseType = null, className = '' }) => {
  const { language } = useLanguage();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const copy = {
    title: language === 'es' ? '¿Pregunta común sobre la corte familiar?' : 'Have a common family court question?',
    subtitle:
      language === 'es'
        ? 'Respuestas generales sobre órdenes de restricción, divorcio, presentación y notificación — no es asesoramiento legal.'
        : 'General answers about restraining orders, divorce, filing, and service — not legal advice.',
    placeholder:
      language === 'es'
        ? 'Ej: ¿Cuál es la diferencia entre DVRO y acoso civil?'
        : 'e.g. What is the difference between a DVRO and civil harassment?',
    ask: language === 'es' ? 'Preguntar' : 'Ask',
    sources: language === 'es' ? 'Fuentes' : 'Sources',
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || loading) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    setSources([]);
    try {
      const res = await fetch(buildApiUrl('/api/family-court-rag'), {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          question: question.trim(),
          language,
          case_type: caseType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setAnswer(data.answer);
      setSources(data.sources || []);
      try {
        const { trackEvent } = await import('../utils/analytics');
        trackEvent('ask_used', {
          flowType: caseType || 'general',
          properties: { refused: !!data.refused, source_count: (data.sources || []).length },
        });
      } catch {
        /* ignore */
      }
    } catch (err) {
      setError(
        language === 'es'
          ? 'No se pudo obtener una respuesta. Pregunte al personal de Autoayuda.'
          : 'Could not get an answer. Please ask Self-Help staff.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`family-ask ${className}`}>
      <div className="family-ask__header">
        <div className="family-ask__icon">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="family-ask__title">{copy.title}</h3>
          <p className="family-ask__subtitle">{copy.subtitle}</p>
        </div>
      </div>
      <form onSubmit={handleAsk} className="family-ask__form">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={copy.placeholder}
          className="family-ask__input"
          maxLength={1000}
          aria-label={copy.title}
        />
        <button type="submit" className="family-ask__submit" disabled={loading || !question.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>{copy.ask}</span>
        </button>
      </form>
      {error && <p className="family-ask__error">{error}</p>}
      {answer && (
        <div className="family-ask__answer">
          <p className="family-ask__answer-text">{answer}</p>
          {sources.length > 0 && (
            <div className="family-ask__sources">
              <p className="family-ask__sources-label">{copy.sources}</p>
              <ul>
                {sources.slice(0, 4).map((s) => (
                  <li key={s.id}>{s.title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default FamilyCourtAsk;
