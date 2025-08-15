import React, { useState } from 'react';

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

function getCaseType(answers) {
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
}

export default function SummaryPage({ answers, forms, flow, queueNumber, onBack, onHome, onEmail }) {
  const [currentPage, setCurrentPage] = useState('summary'); // 'summary' or 'nextSteps'
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSending(true);
    setEmailError('');

    try {
      const response = await fetch('/api/send-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          answers,
          forms,
          summary: generateSummary(answers, forms, flow)
        }),
      });

      if (response.ok) {
        setEmailSent(true);
      } else {
        setEmailError('Failed to send email. Please try again.');
      }
    } catch (error) {
      setEmailError('Network error. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const generateSummary = (answers, forms, flow) => {
    const summary = [];
    
    const caseType = getCaseType(answers);
    summary.push(`Case Type: ${caseType}`);
    summary.push(`Priority: A (High Priority)`);
    
    if (answers['triage_start']) {
      summary.push(`Relationship: ${getRelationshipText(answers['triage_start'])}`);
    }
    
    if (answers['children'] === 'yes') {
      summary.push(`Children Involved: Yes`);
    }
    
    if (answers['support'] && answers['support'] !== 'none') {
      summary.push(`Support Requested: ${getSupportText(answers['support'])}`);
    }
    
    if (answers['abduction_check'] === 'yes') {
      summary.push(`Child Abduction Protection: Requested`);
    }
    
    if (answers['firearms'] === 'yes' || answers['firearms_details'] === 'yes') {
      summary.push(`Firearms Surrender: Required`);
    }
    
    summary.push(`\nRequired Forms:`);
    forms.forEach(form => {
      summary.push(`- ${getFormDisplayName(form, flow.forms_catalog)}`);
    });
    
    return summary.join('\n');
  };

  // Summary Page
  if (currentPage === 'summary') {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Questions
            </button>
            <h1 className="text-lg font-bold text-gray-900">Case Summary</h1>
            {queueNumber && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold">
                {queueNumber}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={onHome}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Home
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Panel - Case Summary */}
          <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Your Case Summary
              </h2>
            </div>
            
            <div className="flex-1 px-6 py-4 overflow-y-auto">
              {/* Case Details */}
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Case Information</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {queueNumber && (
                      <li><span className="font-medium">Queue Number:</span> {queueNumber}</li>
                    )}
                    <li><span className="font-medium">Type:</span> Domestic Violence Restraining Order</li>
                    <li><span className="font-medium">Priority:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getPriorityColor('A')}`}>
                        Priority A
                      </span>
                    </li>
                    {answers['relationship'] && (
                      <li><span className="font-medium">Relationship:</span> {getRelationshipText(answers['relationship'])}</li>
                    )}
                    {answers['children'] === 'yes' && (
                      <li><span className="font-medium">Children:</span> Yes - Custody/visitation included</li>
                    )}
                    {answers['support'] && answers['support'] !== 'none' && (
                      <li><span className="font-medium">Support:</span> {getSupportText(answers['support'])}</li>
                    )}
                  </ul>
                </div>

                {/* Required Forms with Explanations */}
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-4 h-4 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Required Forms ({forms.length})
                  </h4>
                  <div className="space-y-3">
                    {forms.map(form => (
                      <div key={form} className="bg-yellow-100 p-3 rounded border border-yellow-300">
                        <div className="font-semibold text-yellow-800 mb-1">
                          {getFormDisplayName(form, flow.forms_catalog)}
                        </div>
                        <div className="text-sm text-yellow-700">
                          {getFormExplanation(form)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Quick Overview */}
          <div className="w-1/2 bg-gray-50 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What's Next?
              </h2>
            </div>
            
            <div className="flex-1 px-6 py-4 flex flex-col">
              <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">Your Next Steps</h4>
                <ul className="space-y-2 text-sm text-gray-700 mb-6">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">1.</span>
                    Complete all required forms
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">2.</span>
                    Make copies of all documents
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">3.</span>
                    File forms with the court clerk
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">4.</span>
                    Arrange for service of the other party
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">5.</span>
                    Attend your court hearing
                  </li>
                </ul>
                
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-2">Need Help?</h5>
                  <p className="text-sm text-blue-800 mb-3">
                    We can email you a detailed summary and all required forms to help you get started.
                  </p>
                  <button
                    onClick={() => setCurrentPage('nextSteps')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all duration-200"
                  >
                    Get Detailed Next Steps & Forms
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-3 bg-white border-t border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">
            Summary completed
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onBack}
              className="px-5 py-2 bg-gray-600 text-white rounded-lg font-semibold text-sm hover:bg-gray-700 transition-all duration-200"
            >
              Back to Questions
            </button>
            <button
              onClick={() => setCurrentPage('nextSteps')}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all duration-200"
            >
              Next Steps & Forms
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Next Steps Page
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setCurrentPage('summary')}
            className="px-3 py-1.5 text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Summary
          </button>
          <h1 className="text-lg font-bold text-gray-900">Next Steps & Forms</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={onHome}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Home
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Detailed Steps */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Detailed Next Steps
            </h2>
          </div>
          
          <div className="flex-1 px-6 py-4 overflow-y-auto">
            {/* Immediate Steps */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Immediate Steps
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Complete all required forms (see list on right)
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Make 3 copies of each form
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  File forms with the court clerk
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Ask clerk about hearing date and time
                </li>
              </ul>
            </div>

            {/* Service Process */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Service Process
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Someone 18+ (not you) must serve the other party
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Service must be completed at least 5 days before hearing
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  Server completes DV-200 (Proof of Service)
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  File DV-200 with court before hearing
                </li>
              </ul>
            </div>

            {/* Hearing Preparation */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Hearing Preparation
              </h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Arrive 15 minutes early to court
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Bring all original forms and copies
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Bring evidence (photos, documents, witnesses)
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Dress appropriately for court
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Be prepared to testify
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Panel - Forms & Email */}
        <div className="w-1/2 bg-gray-50 flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Forms & Email
            </h2>
          </div>
          
          <div className="flex-1 px-6 py-4 overflow-y-auto">
            {/* Forms List */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Your Required Forms</h4>
              <div className="space-y-2">
                {forms.map((form, index) => (
                  <div key={form} className="bg-gray-50 p-3 rounded border">
                    <div className="font-medium text-gray-900 mb-1">
                      {index + 1}. {getFormDisplayName(form, flow.forms_catalog)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {getFormExplanation(form)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Section */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Get Forms by Email
              </h4>
              
              {emailSent ? (
                <div className="bg-green-100 border border-green-200 p-3 rounded">
                  <p className="text-green-800 text-sm font-medium">
                    ✓ Summary and forms sent to {email}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  
                  {emailError && (
                    <p className="text-red-600 text-sm">{emailError}</p>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSending || !email}
                    className={`w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      isSending || !email
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isSending ? 'Sending...' : 'Send Summary & Forms'}
                  </button>
                  
                  <p className="text-xs text-gray-600">
                    We'll email you a detailed summary and all required forms as PDF attachments.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-6 py-3 bg-white border-t border-gray-200 shadow-sm">
        <div className="text-sm text-gray-600">
          Ready to proceed
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentPage('summary')}
            className="px-5 py-2 bg-gray-600 text-white rounded-lg font-semibold text-sm hover:bg-gray-700 transition-all duration-200"
          >
            Back to Summary
          </button>
          <button
            onClick={onHome}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-all duration-200"
          >
            Start New Case
          </button>
        </div>
      </div>
    </div>
  );
} 