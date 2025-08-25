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
    'DV-700': 'Request to Renew Restraining Order. Used to extend an existing restraining order.',
    'DV-710': 'Notice of Hearing to Renew Restraining Order.',
    'DV-720': 'Proof of Service for Renewal.',
    'DV-800': 'Receipt for Firearms, Firearm Parts, and Ammunition.',
    'DV-108': 'Request for Orders to Prevent Child Abduction.',
    'DV-145': 'Order to Prevent Child Abduction.',
    'SER-001': 'Request for Sheriff to Serve Court Papers.',
    'MC-025': 'Attachment Form. Use when you need more space on other forms.'
  };
  return explanations[formNumber] || `Form ${formNumber} - Please consult court staff for details.`;
}

function getFormUrl(formCode) {
  const standardized = formCode.toUpperCase();
  
  // Judicial Council forms follow pattern: https://www.courts.ca.gov/documents/formcode.pdf
  if (/^(DV|CH|FL|CM|FW|JV|MC|POS|SC|SUM|UD|WC)-\d+$/i.test(standardized) || 
      /^CLETS-001$/i.test(standardized) || 
      /^SER-001$/i.test(standardized)) {
    return `https://www.courts.ca.gov/documents/${standardized.toLowerCase()}.pdf`;
  }
  
  // County/local forms - fall back to search
  return `https://www.google.com/search?q=${encodeURIComponent(formCode + ' form pdf california court')}`;
}

function getSupportType(support) {
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
  const [caseSummaryId, setCaseSummaryId] = useState(null);
  const [caseNumber, setCaseNumber] = useState(null);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSending(true);
    setEmailError('');

    try {
      // First, save the case summary
      const summaryResponse = await fetch('/api/case-summary/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flow_type: 'DVRO',
          answers: answers,
          flow_data: flow,
          user_email: email,
          user_name: answers.user_name || 'Anonymous',
          language: 'en',
          join_queue: false
        }),
      });

      if (!summaryResponse.ok) {
        throw new Error('Failed to save case summary');
      }

      const summaryData = await summaryResponse.json();
      setCaseSummaryId(summaryData.summary_id);
      setCaseNumber(summaryData.case_number);

      // Then send the email
      const emailResponse = await fetch('/api/email/send-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          flow_type: 'DVRO',
          case_number: summaryData.case_number,
          required_forms: forms.map(f => f.number),
          next_steps: generateNextSteps(answers),
          extra_notes: generateExtraNotes(answers)
        }),
      });

      if (emailResponse.ok) {
        setEmailSent(true);
      } else {
        const errorData = await emailResponse.json();
        setEmailError(errorData.error || 'Failed to send email. Please try again.');
      }
    } catch (error) {
      setEmailError('Network error. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const generateSummary = (answers, forms, flow) => {
    const summary = [];
    
    // Add case type
    summary.push(`Case Type: ${getCaseType(answers)}`);
    
    // Add relationship information
    if (answers.relationship) {
      summary.push(`Relationship: ${answers.relationship}`);
    }
    
    // Add children information
    if (answers.children === 'yes') {
      summary.push('Children involved: Yes');
      if (answers.abduction_check === 'yes') {
        summary.push('Abduction protection requested: Yes');
      }
    }
    
    // Add support information
    if (answers.support && answers.support !== 'none') {
      summary.push(`Support requested: ${getSupportType(answers.support)}`);
    }
    
    // Add forms
    summary.push(`Required forms: ${forms.map(f => f.number).join(', ')}`);
    
    return summary.join('\n');
  };

  const generateNextSteps = (answers) => {
    const steps = [
      "Fill out all required forms completely",
      "Make 3 copies of each form (original + 2 copies)",
      "Serve the other party with your papers",
      "Use a process server, sheriff, or someone 18+ (not you)",
      "File proof of service with the court",
      "Attend your court hearing on the scheduled date",
      "Bring all evidence (photos, texts, emails, witnesses)",
      "Dress appropriately for court"
    ];

    // Add specific steps based on answers
    if (answers.children === 'yes') {
      steps.push("Prepare child custody and visitation information");
    }
    
    if (answers.support && answers.support !== 'none') {
      steps.push("Gather income and expense documentation");
    }

    return steps;
  };

  const generateExtraNotes = (answers) => {
    const notes = [
      "Serve papers before your court date",
      "Attend hearing on the date listed in your papers",
      "The other party must be served for the order to be valid"
    ];

    if (answers.firearms === 'yes') {
      notes.push("Firearms surrender required within 24 hours");
    }

    return notes;
  };

  const handleJoinQueue = async () => {
    try {
      const response = await fetch('/api/case-summary/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flow_type: 'DVRO',
          answers: answers,
          flow_data: flow,
          user_email: email,
          user_name: answers.user_name || 'Anonymous',
          language: 'en',
          join_queue: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCaseSummaryId(data.summary_id);
        setCaseNumber(data.case_number);
        // You can add queue number display logic here
        alert(`You are now in the queue! Queue number: ${data.queue_number}`);
      }
    } catch (error) {
      console.error('Error joining queue:', error);
      alert('Failed to join queue. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Process Complete</h1>
          <p className="text-gray-600">Here's your summary and next steps</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setCurrentPage('summary')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'summary'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Your Summary
            </button>
            <button
              onClick={() => setCurrentPage('nextSteps')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'nextSteps'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Next Steps
            </button>
          </div>
        </div>

        {currentPage === 'summary' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Summary</h2>
            
            {/* Required Forms */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Required Forms:</h3>
              <div className="grid grid-cols-3 gap-3">
                {forms.map((form) => (
                  <a
                    key={form.number}
                    href={getFormUrl(form.number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-3 rounded-md text-center transition-colors"
                  >
                    {form.number}
                  </a>
                ))}
              </div>
            </div>

            {/* Case Information */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Case Information:</h3>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-gray-700 mb-2">
                  <strong>Case Type:</strong> {getCaseType(answers)}
                </p>
                {answers.relationship && (
                  <p className="text-gray-700 mb-2">
                    <strong>Relationship:</strong> {answers.relationship}
                  </p>
                )}
                {answers.children === 'yes' && (
                  <p className="text-gray-700 mb-2">
                    <strong>Children Involved:</strong> Yes
                    {answers.abduction_check === 'yes' && (
                      <span className="ml-2 text-orange-600">(Abduction protection requested)</span>
                    )}
                  </p>
                )}
                {answers.support && answers.support !== 'none' && (
                  <p className="text-gray-700 mb-2">
                    <strong>Support Requested:</strong> {getSupportType(answers.support)}
                  </p>
                )}
              </div>
            </div>

            {/* Email Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Get Your Summary by Email</h3>
              {!emailSent ? (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  {emailError && (
                    <p className="text-red-600 text-sm">{emailError}</p>
                  )}
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={isSending}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      {isSending ? 'Sending...' : 'Send Summary Email'}
                    </button>
                    <button
                      type="button"
                      onClick={handleJoinQueue}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Join Queue for Help
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-green-800">
                    ✅ Email sent successfully! Check your inbox for your detailed summary with hyperlinked forms.
                  </p>
                  {caseNumber && (
                    <p className="text-green-800 mt-2">
                      <strong>Case Number:</strong> {caseNumber}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {currentPage === 'nextSteps' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h2>
            
            <div className="space-y-6">
              {/* Steps */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">What to do now:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  {generateNextSteps(answers).map((step, index) => (
                    <li key={index} className="pl-2">{step}</li>
                  ))}
                </ol>
              </div>

              {/* Important Timeline */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Important Timeline:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Serve papers before your court date</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Attend hearing on the date listed in your papers</span>
                  </li>
                </ul>
              </div>

              {/* Important Notes */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Important Notes:</h3>
                <ul className="space-y-2 text-gray-700">
                  {generateExtraNotes(answers).map((note, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-3 h-3 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Back
          </button>
          <button
            onClick={onHome}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
} 