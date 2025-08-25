import React, { useMemo, useState } from 'react';
import SummaryPage from './SummaryPage';

type Locale = 'en' | 'es';

type InfoPage = {
  id: string;
  type: 'info';
  info: Record<Locale, string>;
  next?: string | null;
  forms_add?: string[];
};

type QuestionPage = {
  id: string;
  type: 'question';
  info: Record<Locale, string>;
  question: Record<Locale, string>;
  options: { value: string; label: Record<Locale, string>; next?: string }[];
  forms_add?: string[];
};

type Page = InfoPage | QuestionPage;

type Flow = {
  meta: { start: string; locales: Locale[] };
  forms_catalog: { number: string; name: string }[];
  pages: Record<string, Page>;
  rules?: { 
    add_if_children?: string[]; 
    add_if_support_requested?: string[]; 
    always_add_proof?: string[] 
  };
};

export type Answers = Record<string, string>;

function computeRecommendations(flow: Flow, answers: Answers): string[] {
  const out = new Set<string>();
  
  // Base packet from relationship
  if (answers['relationship'] === 'non_domestic') {
    out.add('CH-100'); 
    out.add('CH-110');
  } else {
    out.add('DV-100'); 
    out.add('CLETS-001'); 
    out.add('DV-109'); 
    out.add('DV-110');
  }
  
  // Add child-related forms if children are involved
  if (answers['children'] === 'yes') {
    (flow.rules?.add_if_children || []).forEach(n => out.add(n));
  }
  
  // Add support forms if support is requested
  const sr = answers['support'];
  if (sr && sr !== 'none') {
    (flow.rules?.add_if_support_requested || []).forEach(n => out.add(n));
  }
  
  // Always add proof of service
  (flow.rules?.always_add_proof || []).forEach(n => out.add(n));
  
  return Array.from(out);
}

export default function FlowRunner({
  flow,
  locale = 'en',
  onFinish
}: {
  flow: Flow;
  locale?: Locale;
  onFinish?: (payload: { answers: Answers; forms: string[] }) => void;
}) {
  const [cur, setCur] = useState<string>(flow.meta.start);
  const [lang, setLang] = useState<Locale>(locale);
  const [answers, setAnswers] = useState<Answers>({});
  const [showSummary, setShowSummary] = useState(false);
  const [queueNumber, setQueueNumber] = useState('');

  const page = useMemo(() => {
    const pageData = flow.pages[cur];
    return pageData ? { ...pageData, id: cur } : null;
  }, [cur, flow.pages]);
  
  if (!page) return <div className="p-6">Unknown page: {cur}</div>;

  const isQuestion = page.type === 'question';

  const handleNext = (next?: string | null) => {
    if (!next) {
      const forms = computeRecommendations(flow, answers);

      // Call onFinish for backend processing
      onFinish?.({ answers, forms });

      // Show summary page
      setShowSummary(true);
      return;
    }
    setCur(next);
  };

  const handleJoinQueue = async () => {
    try {
      const response = await fetch('/api/queue/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseType: 'DVRO',
          language: lang
        })
      });
      const data = await response.json();
      if (data.queue_number) {
        setQueueNumber(data.queue_number);
      }
    } catch (err) {
      console.error('Error joining queue:', err);
    }
  };

  const getFormName = (formNumber: string) => {
    const form = flow.forms_catalog.find(f => f.number === formNumber);
    return form ? `${formNumber} - ${form.name}` : formNumber;
  };

  // Show summary page if flow is complete
  if (showSummary) {
    const forms = computeRecommendations(flow, answers);
    return (
      <SummaryPage
        caseNumber={queueNumber}
        answers={answers}
        forms={forms}
        onBack={() => setShowSummary(false)}
        onPrint={() => window.print()}
        onJoinQueue={handleJoinQueue}
      />
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Family Court Clinic</h1>
          <p className="text-gray-600">Domestic Violence Restraining Order</p>
        </div>
        <button 
          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
          onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
        >
          {lang === 'en' ? 'Español' : 'English'}
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info Column */}
        <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Information</h2>
          </div>
          
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {page.info?.[lang]}
            </p>
          </div>

          {/* Forms mentioned */}
          {page.forms_add && page.forms_add.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                {lang === 'en' ? 'Forms mentioned:' : 'Formularios mencionados:'}
              </h3>
              <ul className="space-y-1">
                {page.forms_add.map(formNumber => (
                  <li key={formNumber} className="text-sm text-blue-800 font-medium">
                    {getFormName(formNumber)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Question/Continue Column */}
        <div className="p-6 rounded-xl bg-white shadow-sm border border-gray-200">
          {isQuestion ? (
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {lang === 'en' ? 'Question' : 'Pregunta'}
                </h2>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {(page as QuestionPage).question?.[lang]}
              </h3>

              <div className="space-y-3 mb-6">
                {(page as QuestionPage).options?.map(opt => (
                  <label 
                    key={opt.value} 
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 ${
                      answers[page.id] === opt.value 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name={page.id}
                      className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      onChange={() => setAnswers(prev => ({ ...prev, [page.id]: opt.value }))}
                      checked={answers[page.id] === opt.value}
                    />
                    <span className="text-gray-900 font-medium">
                      {opt.label?.[lang] || opt.value}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    answers[page.id]
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    const selected = (page as QuestionPage).options?.find(o => o.value === answers[page.id]);
                    handleNext(selected?.next);
                  }}
                  disabled={!answers[page.id]}
                >
                  {lang === 'en' ? 'Next' : 'Siguiente'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-end h-full">
              <button className="px-8 py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors" onClick={() => handleNext((page as InfoPage).next)}>
                {lang === 'en' ? 'Continue' : 'Continuar'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {lang === 'en' ? 'Current step:' : 'Paso actual:'} {page.id}
          </span>
          <span>
            {lang === 'en' ? 'Answers collected:' : 'Respuestas recopiladas:'} {Object.keys(answers).length}
          </span>
        </div>
      </div>
    </div>
  );
} 