import React from 'react';

// Court form database using actual documents from court_documents folder
const COURT_FORMS = {
  // Main DVRO Forms
  'DV-100': {
    name: 'Request for Domestic Violence Restraining Order',
    filename: 'DV-100.pdf',
    description: 'Main application form for domestic violence restraining order',
    category: 'main',
    required: true
  },
  'DV-109': {
    name: 'Notice of Court Hearing',
    filename: 'DV-109.pdf',
    description: 'Notice of court hearing for restraining order',
    category: 'main',
    required: true
  },
  'DV-110': {
    name: 'Temporary Restraining Order',
    filename: 'DV-110.pdf',
    description: 'Temporary restraining order form',
    category: 'main',
    required: true
  },
  'DV-120': {
    name: 'Response to Request for Domestic Violence Restraining Order',
    filename: 'dv120.pdf',
    description: 'Response form for the person against whom the restraining order is requested',
    category: 'response',
    required: false
  },
  'DV-125': {
    name: 'Response to Request for Child Custody & Visitation Orders',
    filename: 'dv125.pdf',
    description: 'Response form for child custody and visitation orders',
    category: 'custody',
    required: false
  },
  'DV-200': {
    name: 'Proof of Service',
    filename: 'dv200.pdf',
    description: 'Proof that the other person was served with papers',
    category: 'service',
    required: true
  },
  'DV-250': {
    name: 'Proof of Service by Mail',
    filename: 'dv250.pdf',
    description: 'Proof of service when papers are mailed',
    category: 'service',
    required: false
  },
  'DV-300': {
    name: 'Request to Change or End Restraining Order',
    filename: 'dv300.pdf',
    description: 'Form to request changes to an existing restraining order',
    category: 'modification',
    required: false
  },
  'DV-305': {
    name: 'Request to Change Child Custody and Visitation Orders',
    filename: 'dv305.pdf',
    description: 'Form to request changes to child custody and visitation orders',
    category: 'custody',
    required: false
  },
  'DV-310': {
    name: 'Notice of Court Hearing and Temporary Order to Change or End Restraining Order',
    filename: 'dv310.pdf',
    description: 'Notice of hearing for restraining order modification',
    category: 'modification',
    required: false
  },
  'DV-330': {
    name: 'Order to Change or End Restraining Order',
    filename: 'dv330.pdf',
    description: 'Court order changing or ending a restraining order',
    category: 'modification',
    required: false
  },
  'DV-700': {
    name: 'Request to Renew Restraining Order',
    filename: 'dv700.pdf',
    description: 'Form to request renewal of an expiring restraining order',
    category: 'renewal',
    required: false
  },
  'DV-710': {
    name: 'Notice of Hearing to Renew Restraining Order',
    filename: 'dv710.pdf',
    description: 'Notice of hearing for restraining order renewal',
    category: 'renewal',
    required: false
  },
  'DV-720': {
    name: 'Proof of Service for Renewal',
    filename: 'dv720.pdf',
    description: 'Proof of service for renewal papers',
    category: 'renewal',
    required: false
  },
  'DV-730': {
    name: 'Order to Renew Restraining Order',
    filename: 'dv730.pdf',
    description: 'Court order renewing a restraining order',
    category: 'renewal',
    required: false
  },
  'DV-800': {
    name: 'Receipt for Firearms, Firearm Parts, and Ammunition',
    filename: 'dv800.pdf',
    description: 'Receipt for surrendered firearms and ammunition',
    category: 'firearms',
    required: false
  },
  'DV-105': {
    name: 'Request for Child Custody and Visitation Orders',
    filename: 'dv105.pdf',
    description: 'Form to request child custody and visitation orders',
    category: 'custody',
    required: false
  },
  'DV-105a': {
    name: 'Request for Child Custody and Visitation Orders (Alternative)',
    filename: 'dv105a.pdf',
    description: 'Alternative form for child custody and visitation orders',
    category: 'custody',
    required: false
  },
  'DV-108': {
    name: 'Request for Orders to Prevent Child Abduction',
    filename: 'dv108.pdf',
    description: 'Form to request orders preventing child abduction',
    category: 'custody',
    required: false
  },
  'DV-140': {
    name: 'Child Custody and Visitation Order Attachment',
    filename: 'dv140.pdf',
    description: 'Attachment for child custody and visitation order',
    category: 'custody',
    required: false
  },
  'DV-145': {
    name: 'Order to Prevent Child Abduction',
    filename: 'DV-145.pdf',
    description: 'Court order to prevent child abduction',
    category: 'custody',
    required: false
  },
  
  // Financial Forms
  'FL-150': {
    name: 'Income and Expense Declaration',
    filename: 'fl150.pdf',
    description: 'Income and expense declaration for child support and spousal support',
    category: 'financial',
    required: false
  },
  
  // Service Forms
  'SER-001': {
    name: 'Request for Sheriff to Serve Court Papers',
    filename: 'ser001.pdf',
    description: 'Request for sheriff to serve court papers',
    category: 'service',
    required: false
  },
  
  // CLETS Forms
  'CLETS-001': {
    name: 'Confidential CLETS Information',
    filename: 'clets001.pdf',
    description: 'Confidential CLETS information form',
    category: 'clets',
    required: true
  },
  
  // Miscellaneous Forms
  'MC-025': {
    name: 'Attachment Form',
    filename: 'mc025.pdf',
    description: 'Attachment form for additional information',
    category: 'misc',
    required: false
  },
  'FW-001': {
    name: 'Fee Waiver Request',
    filename: 'fw001.pdf',
    description: 'Request for fee waiver',
    category: 'financial',
    required: false
  },
  'FW-003': {
    name: 'Order on Court Fee Waiver',
    filename: 'fw003.pdf',
    description: 'Court order on fee waiver request',
    category: 'financial',
    required: false
  },
  
  // Child Support Forms
  'CH-100': {
    name: 'Child Support Information and Order Attachment',
    filename: 'ch100.pdf',
    description: 'Child support information and order attachment',
    category: 'child_support',
    required: false
  },
  'CH-109': {
    name: 'Notice of Hearing on Child Support',
    filename: 'ch109.pdf',
    description: 'Notice of hearing on child support',
    category: 'child_support',
    required: false
  },
  'CH-110': {
    name: 'Child Support Information and Order Attachment',
    filename: 'ch110.pdf',
    description: 'Child support information and order attachment',
    category: 'child_support',
    required: false
  },
  'CH-120': {
    name: 'Child Support Information and Order Attachment',
    filename: 'ch120.pdf',
    description: 'Child support information and order attachment',
    category: 'child_support',
    required: false
  },
  'CH-130': {
    name: 'Child Support Information and Order Attachment',
    filename: 'ch130.pdf',
    description: 'Child support information and order attachment',
    category: 'child_support',
    required: false
  },
  'CH-250': {
    name: 'Child Support Information and Order Attachment',
    filename: 'ch250.pdf',
    description: 'Child support information and order attachment',
    category: 'child_support',
    required: false
  },
  'CH-700': {
    name: 'Child Support Information and Order Attachment',
    filename: 'ch700.pdf',
    description: 'Child support information and order attachment',
    category: 'child_support',
    required: false
  },
  'CH-710': {
    name: 'Child Support Information and Order Attachment',
    filename: 'ch710.pdf',
    description: 'Child support information and order attachment',
    category: 'child_support',
    required: false
  },
  'CH-720': {
    name: 'Child Support Information and Order Attachment',
    filename: 'ch720.pdf',
    description: 'Child support information and order attachment',
    category: 'child_support',
    required: false
  },
  'CH-730': {
    name: 'Child Support Information and Order Attachment',
    filename: 'ch730.pdf',
    description: 'Child support information and order attachment',
    category: 'child_support',
    required: false
  },
  'CH-800': {
    name: 'Child Support Information and Order Attachment',
    filename: 'ch800.pdf',
    description: 'Child support information and order attachment',
    category: 'child_support',
    required: false
  }
};

// Component to render form links
export function FormLink({ formCode, showDescription = false, className = "", onDownload }) {
  const form = COURT_FORMS[formCode];
  
  if (!form) {
    return <span className={className}>{formCode}</span>;
  }

  const handleView = () => {
    // Open the PDF in a new tab
    window.open(`/court_documents/${form.filename}`, '_blank');
  };

  const handleDownload = () => {
    // Create a download link
    const link = document.createElement('a');
    link.href = `/court_documents/${form.filename}`;
    link.download = form.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (onDownload) {
      onDownload(formCode, form);
    }
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <span className="font-mono font-medium text-blue-600">{formCode}</span>
      <span className="text-gray-500 ml-1">({form.name})</span>
      {showDescription && (
        <span className="text-gray-600 text-sm ml-2">- {form.description}</span>
      )}
      <div className="ml-2 flex space-x-1">
        <button
          onClick={handleView}
          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          title="View form"
        >
          View
        </button>
        <button
          onClick={handleDownload}
          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
          title="Download form"
        >
          Download
        </button>
      </div>
    </div>
  );
}

// Component to render a list of form links
export function FormLinksList({ forms, showDescriptions = false, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {forms.map((formCode, index) => (
        <div key={index} className="flex items-center">
          <span className="text-green-600 mr-2">✅</span>
          <FormLink formCode={formCode} showDescription={showDescriptions} />
        </div>
      ))}
    </div>
  );
}

// Component to render pending forms
export function PendingFormLinksList({ forms, showDescriptions = false, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {forms.map((formCode, index) => (
        <div key={index} className="flex items-center">
          <span className="text-gray-400 mr-2">☐</span>
          <FormLink formCode={formCode} showDescription={showDescriptions} />
          <span className="text-gray-500 text-xs ml-2">— still pending</span>
        </div>
      ))}
    </div>
  );
}

// Enhanced form display with download buttons
export function FormDisplay({ formCode, status = 'completed', onDownload }) {
  const form = COURT_FORMS[formCode];
  
  if (!form) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <span className="font-mono">{formCode}</span>
        <span className="text-gray-500">Form not found</span>
      </div>
    );
  }

  const statusColors = {
    completed: 'bg-green-50 border-green-200 text-green-800',
    pending: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    required: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const handleView = () => {
    window.open(`/court_documents/${form.filename}`, '_blank');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `/court_documents/${form.filename}`;
    link.download = form.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (onDownload) {
      onDownload(formCode, form);
    }
  };

  return (
    <div className={`flex items-center justify-between p-3 border rounded-lg ${statusColors[status]}`}>
      <div className="flex-1">
        <div className="flex items-center">
          <span className="font-mono font-medium mr-2">{formCode}</span>
          <span className="text-sm">{form.name}</span>
        </div>
        <p className="text-xs mt-1 opacity-75">{form.description}</p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleView}
          className="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
        >
          View
        </button>
        <button
          onClick={handleDownload}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Download
        </button>
      </div>
    </div>
  );
}

// Form glossary component
export function FormGlossary({ forms = Object.keys(COURT_FORMS), className = "" }) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Court Forms Reference</h3>
      {forms.map((formCode) => (
        <FormDisplay key={formCode} formCode={formCode} status="required" />
      ))}
    </div>
  );
}

// Form category filter
export function FormCategoryFilter({ category, forms = Object.keys(COURT_FORMS), className = "" }) {
  const filteredForms = forms.filter(formCode => {
    const form = COURT_FORMS[formCode];
    return form && form.category === category;
  });

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')} Forms
      </h3>
      {filteredForms.map((formCode) => (
        <FormDisplay key={formCode} formCode={formCode} status="required" />
      ))}
    </div>
  );
}

// Utility function to get form information
export function getFormInfo(formCode) {
  return COURT_FORMS[formCode] || null;
}

// Utility function to get all available forms
export function getAllForms() {
  return Object.keys(COURT_FORMS);
}

// Utility function to get forms by category
export function getFormsByCategory(category) {
  return Object.keys(COURT_FORMS).filter(formCode => 
    COURT_FORMS[formCode]?.category === category
  );
}

// Utility function to get required forms
export function getRequiredForms() {
  return Object.keys(COURT_FORMS).filter(formCode => 
    COURT_FORMS[formCode]?.required === true
  );
}
