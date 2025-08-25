import React from 'react';

interface SummaryPageProps {
  caseNumber?: string;
  answers: Record<string, string>;
  forms: string[];
  onBack?: () => void;
  onPrint?: () => void;
  onJoinQueue?: () => void;
}

export default function SummaryPage({ caseNumber, answers, forms, onBack, onPrint, onJoinQueue }: SummaryPageProps) {
  const getFormDisplayName = (formNumber: string) => {
    const formNames: Record<string, string> = {
      'DV-100': 'Request for Domestic Violence Restraining Order',
      'CLETS-001': 'Confidential CLETS Information',
      'DV-109': 'Notice of Court Hearing',
      'DV-110': 'Temporary Restraining Order',
      'DV-105': 'Request for Child Custody and Visitation Orders',
      'DV-140': 'Child Custody and Visitation Order',
      'DV-200': 'Proof of Personal Service',
      'FL-150': 'Income and Expense Declaration',
      'DV-120': 'Response to Request for Domestic Violence Restraining Order',
      'CH-100': 'Request for Civil Harassment Restraining Order',
      'CH-110': 'Temporary Restraining Order (Civil Harassment)'
    };
    return formNames[formNumber] || formNumber;
  };

  const getPriorityColor = () => {
    return 'bg-gradient-to-r from-red-500 to-red-600';
  };

  const getRelationshipText = () => {
    if (answers['relationship'] === 'domestic') {
      return 'Spouse/Partner or Family Member';
    } else if (answers['relationship'] === 'non_domestic') {
      return 'Other (Neighbor, Co-worker, etc.)';
    }
    return 'Not specified';
  };

  const getSupportText = () => {
    const support = answers['support'];
    if (support === 'child') return 'Child Support';
    if (support === 'spousal') return 'Spousal Support';
    if (support === 'both') return 'Both Child and Spousal Support';
    return 'No Support Requested';
  };

  const getImmediateSteps = (): string[] => {
    const steps: string[] = [];
    
    if (answers['immediate_danger'] === 'yes') {
      steps.push('Call 911 immediately if you are still in danger');
      steps.push('Go to a safe location');
      steps.push('Ask police about Emergency Protective Order (EPO)');
    }
    
    steps.push('Complete all required forms (see list below)');
    steps.push('Make 3 copies of each form');
    steps.push('File forms with court clerk');
    steps.push('Ask clerk about TRO pickup time and hearing date');
    
    return steps;
  };

  const getServiceSteps = () => {
    return [
      'Choose how to serve the other party (Sheriff, process server, or adult)',
      'Ensure service happens at least 5 days before hearing',
      'Have server complete DV-200 (Proof of Service)',
      'File DV-200 with court before hearing'
    ];
  };

  const getHearingSteps = () => {
    return [
      'Bring all forms and copies to court',
      'Bring any evidence (photos, messages, medical records)',
      'Bring witnesses who can testify',
      'Arrive 15 minutes early',
      'Dress appropriately for court'
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className={`${getPriorityColor()} text-white p-6 rounded-t-xl`}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">{caseNumber || 'Case Summary'}</h1>
              <h2 className="text-2xl font-semibold mb-1">Domestic Violence Restraining Order</h2>
              <p className="text-red-100">Priority A - Immediate attention required</p>
            </div>
            <div className="text-right">
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                Priority A
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-xl shadow-lg">
          <div className="p-6">
            {/* Case Summary */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Case Summary</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Case Type:</span>
                    <span className="font-medium">Domestic Violence</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Relationship:</span>
                    <span className="font-medium">{getRelationshipText()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Children Involved:</span>
                    <span className="font-medium">{answers['children'] === 'yes' ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Support Requested:</span>
                    <span className="font-medium">{getSupportText()}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Immediate Danger:</span>
                    <span className="font-medium">{answers['immediate_danger'] === 'yes' ? 'Yes - Emergency' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Forms Required:</span>
                    <span className="font-medium">{forms.length} forms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">Ready for Processing</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Required Forms */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Required Forms</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {forms.map((form, index) => (
                  <div key={form} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{form}</div>
                      <div className="text-sm text-gray-600">{getFormDisplayName(form)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Steps */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Immediate Action Steps</h3>
              </div>
              
              <div className="space-y-3">
                {getImmediateSteps().map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm font-bold text-green-600">{index + 1}</span>
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Process */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Service Process</h3>
              </div>
              
              <div className="space-y-3">
                {getServiceSteps().map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hearing Preparation */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Hearing Preparation</h3>
              </div>
              
              <div className="space-y-3">
                {getHearingSteps().map((step, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Information */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Important Information</h3>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Keep copies of all forms with you at all times</li>
                  <li>• If you are in immediate danger, call 911</li>
                  <li>• The facilitator will call your number when ready</li>
                  <li>• Bring your current order if modifying an existing one</li>
                  <li>• Ask about fee waivers if you cannot afford filing fees</li>
                </ul>
              </div>
            </div>

            {/* Wait for Call / Join Queue */}
            {caseNumber ? (
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold">Please Wait to be Called</h3>
                </div>
                <p className="text-green-100 mb-2">
                  A facilitator will assist you shortly. Your information has been sent to the facilitator office.
                </p>
                <p className="text-green-100 text-sm">
                  Your queue number <span className="font-bold">{caseNumber}</span> will be called when ready.
                </p>
              </div>
            ) : (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={onJoinQueue}
                  className="px-6 py-3 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Get Help from a Facilitator
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Questions
          </button>
          <button
            onClick={onPrint}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Print Summary
          </button>
        </div>
      </div>
    </div>
  );
} 