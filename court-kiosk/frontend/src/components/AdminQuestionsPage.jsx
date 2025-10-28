import React, { useState, useEffect } from 'react';
import { CheckCircle, FileText, ArrowRight, ArrowLeft } from 'lucide-react';

const AdminQuestionsPage = ({ 
  history, 
  flow, 
  onBack, 
  onComplete, 
  onHome 
}) => {
  const [hasFilledForms, setHasFilledForms] = useState('');
  const [selectedForms, setSelectedForms] = useState([]);
  const [availableForms, setAvailableForms] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract all forms from the user's flow history
  useEffect(() => {
    const forms = new Set();
    const formDescriptions = {
      'DV-100': 'Request for Domestic Violence Restraining Order',
      'DV-101': 'Response to Request for Domestic Violence Restraining Order',
      'DV-105': 'Request for Child Custody and Visitation Orders',
      'DV-105A': 'Child Custody and Visitation Order',
      'DV-108': 'Request for Child Abduction Prevention Order',
      'DV-109': 'Notice of Court Hearing',
      'DV-110': 'Temporary Restraining Order',
      'DV-112': 'Proof of Personal Service',
      'DV-116': 'Proof of Service by Mail',
      'DV-120': 'Response to Request for Domestic Violence Restraining Order',
      'DV-125': 'Response to Request for Child Custody and Visitation Orders',
      'DV-130': 'Response to Request for Child Abduction Prevention Order',
      'DV-140': 'Child Custody and Visitation Order',
      'DV-145': 'Child Abduction Prevention Order',
      'DV-200': 'Proof of Personal Service',
      'DV-250': 'Proof of Service by Mail',
      'DV-300': 'Request for Domestic Violence Restraining Order (Simplified)',
      'DV-305': 'Response to Request for Domestic Violence Restraining Order (Simplified)',
      'DV-310': 'Request for Child Custody and Visitation Orders (Simplified)',
      'DV-330': 'Response to Request for Child Custody and Visitation Orders (Simplified)',
      'DV-700': 'Request for Domestic Violence Restraining Order (Emergency)',
      'DV-710': 'Response to Request for Domestic Violence Restraining Order (Emergency)',
      'DV-720': 'Request for Child Custody and Visitation Orders (Emergency)',
      'DV-730': 'Response to Request for Child Custody and Visitation Orders (Emergency)',
      'DV-800': 'Firearms Restraining Order',
      'FL-100': 'Petition for Dissolution of Marriage',
      'FL-105': 'Response to Petition for Dissolution of Marriage',
      'FL-110': 'Declaration Under Uniform Child Custody Jurisdiction and Enforcement Act',
      'FL-115': 'Declaration of Service',
      'FL-117': 'Declaration of Service',
      'FL-120': 'Summons',
      'FL-130': 'Declaration of Service',
      'FL-140': 'Declaration of Service',
      'FL-141': 'Declaration of Service',
      'FL-142': 'Declaration of Service',
      'FL-144': 'Declaration of Service',
      'FL-150': 'Income and Expense Declaration',
      'FL-157': 'Declaration of Service',
      'FL-160': 'Declaration of Service',
      'FL-165': 'Declaration of Service',
      'FL-170': 'Declaration of Service',
      'FL-180': 'Declaration of Service',
      'FL-190': 'Declaration of Service',
      'FL-191': 'Declaration of Service',
      'FL-192': 'Declaration of Service',
      'FL-195': 'Declaration of Service',
      'FL-300': 'Petition for Dissolution of Marriage (Simplified)',
      'FL-305': 'Response to Petition for Dissolution of Marriage (Simplified)',
      'FL-320': 'Declaration Under Uniform Child Custody Jurisdiction and Enforcement Act (Simplified)',
      'FL-326': 'Declaration of Service (Simplified)',
      'FL-330': 'Declaration of Service (Simplified)',
      'FL-334': 'Declaration of Service (Simplified)',
      'FL-335': 'Declaration of Service (Simplified)',
      'FL-341': 'Declaration of Service (Simplified)',
      'FL-342': 'Declaration of Service (Simplified)',
      'FL-343': 'Declaration of Service (Simplified)',
      'FL-345': 'Declaration of Service (Simplified)',
      'FL-435': 'Declaration of Service (Simplified)',
      'FL-800': 'Petition for Dissolution of Marriage (Emergency)',
      'FL-810': 'Response to Petition for Dissolution of Marriage (Emergency)',
      'FL-825': 'Declaration Under Uniform Child Custody Jurisdiction and Enforcement Act (Emergency)',
      'FL-830': 'Declaration of Service (Emergency)',
      'CH-100': 'Request for Civil Harassment Restraining Order',
      'CH-109': 'Notice of Court Hearing (Civil Harassment)',
      'CH-110': 'Temporary Restraining Order (Civil Harassment)',
      'CH-120': 'Response to Request for Civil Harassment Restraining Order',
      'CH-130': 'Response to Request for Civil Harassment Restraining Order',
      'CH-200': 'Proof of Personal Service (Civil Harassment)',
      'CH-250': 'Proof of Service by Mail (Civil Harassment)',
      'CH-700': 'Request for Civil Harassment Restraining Order (Emergency)',
      'CH-710': 'Response to Request for Civil Harassment Restraining Order (Emergency)',
      'CH-720': 'Request for Civil Harassment Restraining Order (Emergency)',
      'CH-730': 'Response to Request for Civil Harassment Restraining Order (Emergency)',
      'CH-800': 'Firearms Restraining Order (Civil Harassment)',
      'FW-001': 'Request to Waive Court Fees',
      'FW-002': 'Request to Waive Court Fees (Simplified)',
      'FW-003': 'Request to Waive Court Fees (Emergency)',
      'FW-005': 'Request to Waive Court Fees (Special)',
      'CLETS-001': 'CLETS Information Form',
      'CM-010': 'Case Management Order',
      'EPO-001': 'Emergency Protective Order',
      'JV-255': 'Juvenile Court Order',
      'MC-025': 'Miscellaneous Court Order',
      'MC-031': 'Miscellaneous Court Order',
      'MC-040': 'Miscellaneous Court Order',
      'MC-050': 'Miscellaneous Court Order',
      'POS-040': 'Proof of Service',
      'SER-001': 'Service of Process'
    };

    // Extract forms from all nodes in the user's history
    history.forEach(nodeId => {
      const node = flow?.nodes?.[nodeId];
      if (node?.text) {
        // Look for form codes in the text using regex
        const formMatches = node.text.match(/\b[A-Z]{2,3}-\d{3,4}\b/g);
        if (formMatches) {
          formMatches.forEach(form => forms.add(form));
        }
        
        // Also look for specific form patterns
        const specificForms = node.text.match(/\b(DV-\d+|CLETS-001|SER-001|POS-040|CH-\d+|FL-\d+|FW-\d+|CM-\d+|EPO-\d+|JV-\d+|MC-\d+)\b/g);
        if (specificForms) {
          specificForms.forEach(form => forms.add(form));
        }
      }
    });

    // Convert to array with descriptions
    const formsArray = Array.from(forms).map(formCode => ({
      code: formCode,
      title: formDescriptions[formCode] || `${formCode} Form`,
      description: 'Required for your case type'
    })).sort((a, b) => a.code.localeCompare(b.code));

    setAvailableForms(formsArray);
  }, [history, flow]);

  const handleFormToggle = (formCode) => {
    setSelectedForms(prev => 
      prev.includes(formCode) 
        ? prev.filter(code => code !== formCode)
        : [...prev, formCode]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Prepare admin data
    const adminData = {
      hasFilledForms: hasFilledForms === 'yes',
      filledForms: selectedForms,
      availableForms: availableForms.map(f => f.code),
      timestamp: new Date().toISOString(),
      sessionId: `K${Math.floor(Math.random() * 90000) + 10000}`
    };

    console.log('Admin Questions Data:', adminData);
    
    // Store admin data in localStorage for now (could be sent to backend)
    localStorage.setItem('adminQuestionsData', JSON.stringify(adminData));
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    onComplete(adminData);
  };

  const canProceed = hasFilledForms && (hasFilledForms === 'no' || selectedForms.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <FileText className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Form Completion Status</h1>
            </div>
            <p className="text-lg text-gray-600">
              Help us understand which forms you've already completed so our staff can assist you better.
            </p>
          </div>

          {/* Question 1: Have you filled out any forms? */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
              Have you filled out any forms?
            </h2>
            
            <div className="space-y-3">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="hasFilledForms"
                  value="yes"
                  checked={hasFilledForms === 'yes'}
                  onChange={(e) => setHasFilledForms(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="text-lg font-medium text-gray-900">Yes, I have filled out some forms</div>
                  <div className="text-sm text-gray-500">I've already completed one or more forms</div>
                </div>
              </label>
              
              <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="hasFilledForms"
                  value="no"
                  checked={hasFilledForms === 'no'}
                  onChange={(e) => setHasFilledForms(e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3">
                  <div className="text-lg font-medium text-gray-900">No, I haven't filled out any forms yet</div>
                  <div className="text-sm text-gray-500">I need help with all the forms</div>
                </div>
              </label>
            </div>
          </div>

          {/* Question 2: Which forms have you filled out? */}
          {hasFilledForms === 'yes' && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                Which forms have you already filled out?
              </h2>
              
              <p className="text-gray-600 mb-4">
                Select all the forms you have already completed. This helps our staff know which forms you still need help with.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {availableForms.map((form) => (
                  <label
                    key={form.code}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedForms.includes(form.code)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedForms.includes(form.code)}
                      onChange={() => handleFormToggle(form.code)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <span className="font-mono text-sm font-medium text-gray-900 mr-2">
                          {form.code}
                        </span>
                        {selectedForms.includes(form.code) && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {form.title}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              
              {availableForms.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No forms were identified in your flow. This information will be passed to our staff.</p>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          {hasFilledForms && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
              <div className="text-sm text-blue-800">
                {hasFilledForms === 'yes' ? (
                  <>
                    <p>You have filled out <strong>{selectedForms.length}</strong> form(s):</p>
                    <ul className="mt-2 list-disc list-inside">
                      {selectedForms.map(formCode => {
                        const form = availableForms.find(f => f.code === formCode);
                        return (
                          <li key={formCode}>
                            <span className="font-mono">{formCode}</span> - {form?.title}
                          </li>
                        );
                      })}
                    </ul>
                    <p className="mt-2">
                      Our staff will help you with the remaining <strong>{availableForms.length - selectedForms.length}</strong> form(s).
                    </p>
                  </>
                ) : (
                  <p>You need help with all <strong>{availableForms.length}</strong> forms. Our staff will assist you with each one.</p>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="flex items-center px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Flow
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!canProceed || isSubmitting}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  Continue to Summary
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuestionsPage;
