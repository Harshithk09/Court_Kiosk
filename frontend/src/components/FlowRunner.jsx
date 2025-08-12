import React, { useMemo, useState } from 'react';

function computeRecommendations(flow, answers) {
  const out = new Set();
  if (answers['relationship'] === 'non_domestic') {
    out.add('CH-100');
    out.add('CH-110');
  } else {
    out.add('DV-100');
    out.add('CLETS-001');
    out.add('DV-109');
    out.add('DV-110');
  }
  if (answers['children'] === 'yes') {
    (flow.rules?.add_if_children || []).forEach(n => out.add(n));
  }
  const sr = answers['support'];
  if (sr && sr !== 'none') {
    (flow.rules?.add_if_support_requested || []).forEach(n => out.add(n));
  }
  (flow.rules?.always_add_proof || []).forEach(n => out.add(n));
  return Array.from(out);
}

export default function FlowRunner({ flow, locale = 'en', onFinish }) {
  const [cur, setCur] = useState(flow.meta.start);
  const [lang, setLang] = useState(locale);
  const [answers, setAnswers] = useState({});

  const page = useMemo(() => ({ id: cur, ...(flow.pages[cur] || {}) }), [cur, flow.pages, cur]);

  const handleNext = (next) => {
    if (!next) {
      const forms = computeRecommendations(flow, answers);
      onFinish?.({ answers, forms });
      return;
    }
    setCur(next);
  };

  if (!page) {
    return <div className="p-6">Unknown page: {cur}</div>;
  }

  const isQuestion = page.type === 'question';

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Family Court Clinic — DVRO</h1>
        <button className="text-sm underline" onClick={() => setLang(lang === 'en' ? 'es' : 'en')}>
          {lang === 'en' ? 'Español' : 'English'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white shadow">
          <h2 className="text-lg font-medium mb-2">Info</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{page.info?.[lang]}</p>
          {page.forms_add && page.forms_add.length > 0 && (
            <div className="mt-3">
              <div className="font-semibold mb-1">Forms mentioned:</div>
              <ul className="list-disc ml-5">
                {page.forms_add.map(f => <li key={f}>{f}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div className="p-4 rounded-2xl bg-white shadow">
          {isQuestion ? (
            <div>
              <h2 className="text-lg font-medium mb-2">{page.question?.[lang]}</h2>
              <div className="space-y-2">
                {page.options?.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 p-2 rounded border cursor-pointer">
                    <input
                      type="radio"
                      name={page.id}
                      className="accent-red-600"
                      onChange={() => setAnswers(prev => ({ ...prev, [page.id]: opt.value }))}
                      checked={answers[page.id] === opt.value}
                    />
                    <span>{opt.label?.[lang] || opt.value}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  className="px-4 py-2 rounded bg-red-600 text-white"
                  onClick={() => {
                    const selected = page.options?.find(o => o.value === answers[page.id]);
                    handleNext(selected?.next);
                  }}
                  disabled={!answers[page.id]}
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-end h-full">
              <button
                className="ml-auto px-4 py-2 rounded bg-red-600 text-white"
                onClick={() => handleNext(page.next)}
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
