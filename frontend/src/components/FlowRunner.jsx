import React, { useMemo, useState } from 'react';
import SummaryPage from './SummaryPage';

function computeRecommendations(flow, answers) {
  const forms = new Set();
  
  // Add forms based on page-specific forms_add
  Object.keys(answers).forEach(pageId => {
    const page = flow.pages[pageId];
    if (page && page.forms_add) {
      page.forms_add.forEach(form => forms.add(form));
    }
  });
  
  // Apply flow rules for conditional forms
  if (flow.rules) {
    // Add forms based on children
    if (answers['children'] === 'yes' && flow.rules.add_if_children) {
      flow.rules.add_if_children.forEach(form => forms.add(form));
    }
    
    // Add forms based on support requests
    if (answers['support'] && answers['support'] !== 'none' && flow.rules.add_if_support_requested) {
      flow.rules.add_if_support_requested.forEach(form => forms.add(form));
    }
    
    // Always add proof of service
    if (flow.rules.always_add_proof) {
      flow.rules.always_add_proof.forEach(form => forms.add(form));
    }
  }
  
  // Add abduction protection forms if needed
  if (answers['abduction_check'] === 'yes') {
    forms.add('DV-108');
    forms.add('DV-145');
  }
  
  // Add firearms forms if applicable
  if (answers['firearms'] === 'yes' || answers['firearms_details'] === 'yes') {
    forms.add('DV-800');
  }
  
  // Add response forms if this is a response process
  if (answers['respond_intro'] === 'yes') {
    forms.add('DV-120');
    if (answers['respond_custody'] === 'yes') {
      forms.add('DV-125');
    }
    if (answers['respond_firearms_surrender'] === 'yes') {
      forms.add('DV-800');
    }
  }
  
  // Add change/modify forms if applicable
  if (answers['change_intro'] === 'yes') {
    forms.add('DV-300');
    forms.add('DV-310');
    if (answers['change_custody'] === 'yes') {
      forms.add('DV-305');
    }
  }
  
  // Add renewal forms if applicable
  if (answers['renew_intro'] === 'yes') {
    forms.add('DV-700');
    forms.add('DV-710');
    forms.add('CLETS-001');
  }
  
  return Array.from(forms);
}

function getFormDisplayName(formNumber, formsCatalog) {
  const form = formsCatalog.find(f => f.number === formNumber);
  return form ? `${form.number} - ${form.name}` : formNumber;
}

function getFormExplanation(formNumber) {
  const explanations = {
    'DV-100': 'Main form to request a Domestic Violence Restraining Order. Describe your situation and what protection you need.',
    'CLETS-001': 'Confidential form for law enforcement. Contains information that helps police enforce your restraining order.',
    'DV-109': 'Notice of Court Hearing. Tells you when and where your court hearing will be. You must attend this hearing.',
    'DV-110': 'Temporary Restraining Order. The actual restraining order that the judge signs. This is what protects you legally.',
    'DV-105': 'Request for Child Custody and Visitation Orders. Required if you have children and want custody protection.',
    'DV-140': 'Child Custody and Visitation Order. The judge\'s decision about child custody and visitation.',
    'DV-200': 'Proof of Personal Service. Proof that the other person was served with your papers. Required for the restraining order to be valid.',
    'FL-150': 'Income and Expense Declaration. Required if you are asking for child or spousal support.',
    'DV-120': 'Response to Request for Domestic Violence Restraining Order. Used by the person you filed against to tell their side.',
    'DV-125': 'Response to Request for Child Custody & Visitation Orders. Used when responding to custody requests.',
    'DV-250': 'Proof of Service by Mail. Used when serving documents by mail instead of in person.',
    'DV-300': 'Request to Change or End Restraining Order. Used to modify or terminate an existing order.',
    'DV-310': 'Notice of Court Hearing and Temporary Order to Change or End Restraining Order.',
    'DV-305': 'Request to Change Child Custody and Visitation Orders. Used to modify custody arrangements.',
    'DV-330': 'Order to Change or End Restraining Order. The judge\'s decision on modification requests.',
    'DV-700': 'Request to Renew Restraining Order. Used to extend an existing order before it expires.',
    'DV-710': 'Notice of Hearing to Renew Restraining Order. Court hearing notice for renewal.',
    'DV-720': 'Response to Request to Renew Restraining Order. Used by the other party to respond to renewal.',
    'DV-800': 'Receipt for Firearms, Firearm Parts, and Ammunition. Required when surrendering firearms.',
    'SER-001': 'Request for Sheriff to Serve Court Papers. Used when asking the sheriff to serve documents.',
    'MC-025': 'Attachment Form. Used when you need more space to write additional information.',
    'DV-108': 'Request for Orders to Prevent Child Abduction. Used when concerned about child abduction.',
    'DV-145': 'Order to Prevent Child Abduction. The judge\'s decision on abduction prevention.',
    'CH-100': 'Request for Civil Harassment Restraining Order. Used when the person is not a family member or partner.',
    'CH-110': 'Temporary Civil Harassment Restraining Order. Provides immediate protection for civil harassment cases.',
    'CH-109': 'Notice of Court Hearing (Civil Harassment). Court hearing notice for civil harassment cases.',
    'CH-120': 'Response to Civil Harassment Restraining Order. Used to respond to civil harassment orders.',
    'CH-130': 'Civil Harassment Restraining Order. The actual civil harassment restraining order.',
    'CH-250': 'Proof of Service by Mail (Civil Harassment). Proof of service for civil harassment cases.',
    'CH-700': 'Request to Renew Civil Harassment Restraining Order. Used to renew civil harassment orders.',
    'CH-710': 'Notice of Hearing to Renew Civil Harassment Restraining Order. Hearing notice for civil harassment renewal.',
    'CH-720': 'Response to Request to Renew Civil Harassment Restraining Order. Response to civil harassment renewal.',
    'CH-730': 'Order Renewing Civil Harassment Restraining Order. Judge\'s decision on civil harassment renewal.',
    'CH-800': 'Receipt for Firearms, Firearm Parts, and Ammunition (Civil Harassment). Firearms receipt for civil harassment cases.',
    'CM-010': 'Civil Case Cover Sheet. Tells the court the type of case you are filing.',
    'FW-001': 'Request to Waive Court Fees. Used to ask the court to waive filing fees.',
    'FW-003': 'Order on Request to Waive Court Fees. Judge\'s decision on fee waiver request.'
  };
  return explanations[formNumber] || 'Required form for your case.';
}

function getPriorityColor(priority) {
  switch (priority) {
    case 'A': return 'bg-red-100 text-red-800';
    case 'B': return 'bg-yellow-100 text-yellow-800';
    case 'C': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getRelationshipText(relationship) {
  switch (relationship) {
    case 'close_relationship': return 'Domestic Relationship (Spouse/Partner/Family)';
    case 'elder_disabled': return 'Elder or Dependent Adult';
    case 'other': return 'Non-Domestic Relationship (Civil Harassment)';
    default: return 'Not specified';
  }
}

function getSupportText(support) {
  if (!support || support === 'none') return 'No support requested';
  switch (support) {
    case 'child': return 'Child Support';
    case 'spousal': return 'Spousal Support';
    case 'both': return 'Child and Spousal Support';
    default: return support;
  }
}

function getImmediateSteps(answers) {
  const steps = [];
  
  if (answers['immediate_danger'] === 'yes') {
    steps.push('Call 911 immediately if still in danger');
    steps.push('Go to a safe location');
    steps.push('Ask police about Emergency Protective Order (EPO)');
  }
  
  steps.push('Complete all required forms');
  steps.push('Make copies of all documents');
  steps.push('File forms with the court clerk');
  
  return steps;
}

function getServiceSteps(answers) {
  const steps = [];
  
  if (answers['service_method']) {
    switch (answers['service_method']) {
      case 'sheriff':
        steps.push('Contact Sheriff\'s office for service (often free)');
        steps.push('Complete SER-001 form for sheriff service');
        break;
      case 'server':
        steps.push('Hire professional process server');
        break;
      case 'adult':
        steps.push('Have someone 18+ (not in case) serve documents');
        break;
      default:
        steps.push('Arrange for service by someone 18+ (not you)');
    }
  }
  
  steps.push('Ensure service at least 5 days before hearing');
  steps.push('Complete DV-200 (Proof of Service) or DV-250 (Proof of Service by Mail)');
  
  return steps;
}

function getHearingSteps(answers) {
  const steps = [];
  
  steps.push('Bring all original forms and copies');
  steps.push('Bring evidence (photos, documents, witnesses)');
  steps.push('Arrive early to court');
  steps.push('Dress appropriately for court');
  steps.push('Be prepared to testify');
  
  if (answers['firearms'] === 'yes' || answers['firearms_details'] === 'yes') {
    steps.push('Surrender firearms by court deadline');
    steps.push('Complete DV-800 form for firearms surrender');
    steps.push('File proof of surrender with court within 48 hours');
  }
  
  return steps;
}

export default function FlowRunner({ flow, locale = 'en', onFinish, onBack, onHome }) {
  const [cur, setCur] = useState(flow.meta.start);
  const [lang, setLang] = useState(locale);
  const [answers, setAnswers] = useState({});
  const [pageHistory, setPageHistory] = useState([flow.meta.start]);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  const page = useMemo(() => {
    const pageData = flow.pages[cur];
    return pageData ? { ...pageData, id: cur } : null;
  }, [cur, flow.pages]);

  const handleNext = async (next) => {
    if (!next) {
      const forms = computeRecommendations(flow, answers);
      let queueNumber = null;
      if (onFinish) {
        try {
          queueNumber = await onFinish({ answers, forms });
        } catch (e) {
          console.error('Error finishing flow:', e);
        }
      }
      const data = { answers, forms, queueNumber };
      setSummaryData(data);
      setShowSummary(true);
      return;
    }
    setPageHistory(prev => [...prev, next]);
    setCur(next);
  };

  const handleBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = pageHistory.slice(0, -1);
      const previousPage = newHistory[newHistory.length - 1];
      setPageHistory(newHistory);
      setCur(previousPage);
    } else {
      onBack?.();
    }
  };

  const handleHome = () => {
    onHome?.();
  };

  const handleSummaryBack = () => {
    setShowSummary(false);
    setSummaryData(null);
  };

  if (showSummary && summaryData) {
    return (
      <SummaryPage
        answers={summaryData.answers}
        forms={summaryData.forms}
        flow={flow}
        queueNumber={summaryData.queueNumber}
        onBack={handleSummaryBack}
        onHome={onHome}
      />
    );
  }

  if (!page) {
    return <div className="p-4">Unknown page: {cur}</div>;
  }

  const isQuestion = page.type === 'question';
  const canGoBack = pageHistory.length > 1;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-base font-medium flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Family Court Clinic</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleHome}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-base font-medium"
          >
            Home
          </button>
          <button
            className="px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors text-base font-medium"
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
          >
            {lang === 'en' ? 'Español' : 'English'}
          </button>
        </div>
      </div>

      {/* Main Content - Two Panels */}
      <div className="flex-1 flex">
        {/* Left Panel - Legal Information */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-8 py-6 border-b border-gray-200 bg-blue-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Important Legal Information
            </h2>
          </div>

          <div className="flex-1 px-8 py-6">
            {/* Main Information */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
              <p className="text-lg font-semibold text-gray-800 leading-relaxed">
                {page.info?.[lang]}
              </p>
            </div>

            {/* Emergency Information for immediate_danger page */}
            {page.id === 'immediate_danger' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Emergency Information
                </h3>
                <p className="text-base text-red-800 font-medium">
                  If you are in immediate danger, call 911 right now. Police can request an Emergency Protective Order (EPO) immediately.
                </p>
              </div>
            )}

            {/* Forms Section with Explanations */}
            {page.forms_add && page.forms_add.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Forms You'll Need:
                </h3>
                <div className="space-y-3">
                  {page.forms_add.map(f => (
                    <div key={f} className="bg-yellow-100 p-3 rounded border border-yellow-300">
                      <div className="font-semibold text-yellow-800 mb-1">
                        {getFormDisplayName(f, flow.forms_catalog)}
                      </div>
                      <div className="text-sm text-yellow-700">
                        {getFormExplanation(f)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Question */}
        <div className="w-1/2 bg-gray-50 flex flex-col">
          <div className="px-8 py-6 border-b border-gray-200 bg-white">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Your Response
            </h2>
          </div>

          <div className="flex-1 px-8 py-6 flex flex-col">
            {isQuestion ? (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-8">
                  {page.question?.[lang]}
                </h3>

                <div className="space-y-4 flex-1">
                  {page.options?.map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-center p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        answers[page.id] === opt.value
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={page.id}
                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                        onChange={() => setAnswers(prev => ({ ...prev, [page.id]: opt.value }))}
                        checked={answers[page.id] === opt.value}
                      />
                      <span className="ml-4 text-lg font-medium text-gray-900">
                        {opt.label?.[lang] || opt.value}
                      </span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-lg">
                  <p className="text-xl font-semibold text-gray-700 mb-8">
                    {page.info?.[lang]}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-8 py-4 bg-white border-t border-gray-200">
        <div className="text-base text-gray-600 font-medium">
          Step {pageHistory.length} of {Object.keys(flow.pages).length}
        </div>
        <div className="flex space-x-4">
          <button
            className={`px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 ${
              canGoBack
                ? 'bg-gray-600 text-white hover:bg-gray-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleBack}
            disabled={!canGoBack}
          >
            Previous
          </button>

          {isQuestion ? (
            <button
              className={`px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 ${
                !answers[page.id]
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              onClick={async () => {
                const selected = page.options?.find(o => o.value === answers[page.id]);
                await handleNext(selected?.next);
              }}
              disabled={!answers[page.id]}
            >
              Continue
            </button>
          ) : (
            <button
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold text-base hover:bg-green-700 transition-all duration-200"
              onClick={async () => handleNext(page.next)}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
