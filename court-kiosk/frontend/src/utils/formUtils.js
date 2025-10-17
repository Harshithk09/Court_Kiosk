/**
 * Utility functions for handling court forms and hyperlinks
 */

/**
 * Get the URL for a court form
 * @param {string} formCode - The form code (e.g., 'DV-100', 'CLETS-001')
 * @returns {string} The URL to the form PDF or search page
 */
export function getFormUrl(formCode) {
  if (!formCode) {
    return "https://www.courts.ca.gov/forms.htm";
  }

  const normalized = formCode.trim().toUpperCase();
  
  // Comprehensive mapping of all California Judicial Council forms
  // Using official California Courts website URLs
  const knownForms = {
    // Domestic Violence Forms
    "DV-100": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv100.pdf",
    "DV-101": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv101.pdf",
    "DV-105": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv105.pdf",
    "DV-105A": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv105a.pdf",
    "DV-108": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv108.pdf",
    "DV-109": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv109.pdf",
    "DV-110": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv110.pdf",
    "DV-112": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv112.pdf",
    "DV-116": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv116.pdf",
    "DV-120": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv120.pdf",
    "DV-120INFO": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv120info.pdf",
    "DV-125": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv125.pdf",
    "DV-130": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv130.pdf",
    "DV-140": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv140.pdf",
    "DV-145": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv145.pdf",
    "DV-200": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv200.pdf",
    "DV-200INFO": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv200info.pdf",
    "DV-250": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv250.pdf",
    "DV-300": "https://courts.ca.gov/sites/default/files/courts/default/2024-12/dv300.pdf",
    "DV-305": "https://courts.ca.gov/sites/default/files/courts/default/2024-12/dv305.pdf",
    "DV-310": "https://courts.ca.gov/sites/default/files/courts/default/2024-12/dv310.pdf",
    "DV-330": "https://courts.ca.gov/sites/default/files/courts/default/2024-12/dv330.pdf",
    "DV-700": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv700.pdf",
    "DV-710": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv710.pdf",
    "DV-720": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv720.pdf",
    "DV-730": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv730.pdf",
    "DV-800": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/dv800.pdf",
    
    // Family Law Forms
    "FL-100": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl100.pdf",
    "FL-105": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl105.pdf",
    "FL-110": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl110.pdf",
    "FL-115": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl115.pdf",
    "FL-117": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl117.pdf",
    "FL-120": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl120.pdf",
    "FL-130": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl130.pdf",
    "FL-140": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl140.pdf",
    "FL-141": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl141.pdf",
    "FL-142": "https://courts.ca.gov/system/files?file=2025-07/fl142.pdf",
    "FL-144": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl144.pdf",
    "FL-150": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl150.pdf",
    "FL-157": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl157.pdf",
    "FL-160": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl160.pdf",
    "FL-165": "https://courts.ca.gov/system/files?file=2025-07/fl165.pdf",
    "FL-170": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl170.pdf",
    "FL-180": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl180.pdf",
    "FL-190": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl190.pdf",
    "FL-191": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl191.pdf",
    "FL-192": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl192.pdf",
    "FL-195": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl195.pdf",
    "FL-300": "https://courts.ca.gov/system/files?file=2025-07/fl300.pdf",
    "FL-305": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl305.pdf",
    "FL-320": "https://courts.ca.gov/system/files?file=2025-07/fl320.pdf",
    "FL-326": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl326.pdf",
    "FL-330": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl330.pdf",
    "FL-334": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl334.pdf",
    "FL-335": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl335.pdf",
    "FL-341": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl341.pdf",
    "FL-342": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl342.pdf",
    "FL-343": "https://courts.ca.gov/system/files?file=2025-07/fl343.pdf",
    "FL-345": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl345.pdf",
    "FL-435": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl435.pdf",
    "FL-800": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl800.pdf",
    "FL-810": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl810.pdf",
    "FL-825": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl825.pdf",
    "FL-830": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fl830.pdf",
    
    // Child Custody Forms
    "CH-100": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch100.pdf",
    "CH-109": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch109.pdf",
    "CH-110": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch110.pdf",
    "CH-120": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch120.pdf",
    "CH-120INFO": "https://courts.ca.gov/system/files?file=2025-07/ch120info.pdf",
    "CH-130": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch130.pdf",
    "CH-200": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch200.pdf",
    "CH-250": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch250.pdf",
    "CH-700": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch700.pdf",
    "CH-710": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch710.pdf",
    "CH-720": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch720.pdf",
    "CH-730": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch730.pdf",
    "CH-800": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ch800.pdf",
    
    // Fee Waiver Forms
    "FW-001": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fw001.pdf",
    "FW-002": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fw002.pdf",
    "FW-003": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fw003.pdf",
    "FW-005": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/fw005.pdf",
    
    // Other Forms
    "CLETS-001": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/clets001.pdf",
    "CM-010": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/cm010.pdf",
    "EPO-001": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/epo001.pdf",
    "JV-255": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/jv255.pdf",
    "MC-025": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/mc025.pdf",
    "MC-031": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/mc031.pdf",
    "MC-040": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/mc040.pdf",
    "MC-050": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/mc050.pdf",
    "POS-040": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/pos040.pdf",
    "SER-001": "https://courts.ca.gov/sites/default/files/courts/default/2024-11/ser001.pdf"
  };
  
  // Return the official URL if we have it, otherwise fall back to search
  return knownForms[normalized] || `https://www.google.com/search?q=${encodeURIComponent(formCode + ' form pdf california court')}`;
}

/**
 * Check if a form is a standard Judicial Council form
 * @param {string} formCode - The form code to check
 * @returns {boolean} True if it's a Judicial Council form
 */
export function isJudicialCouncilForm(formCode) {
  // Common Judicial Council form patterns
  const patterns = [
    /^(DV|CH|FL|CM|FW|JV|MC|POS|SC|SUM|UD|WC)-\d+$/i,  // Standard patterns
    /^CLETS-001$/i,  // Special cases
    /^SER-001$/i,    // Sheriff service
  ];
  
  return patterns.some(pattern => pattern.test(formCode));
}

/**
 * Get form explanation text
 * @param {string} formCode - The form code
 * @returns {string} Explanation of what the form is for
 */
export function getFormExplanation(formCode) {
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
    'MC-025': 'Attachment Form. Use when you need more space on other forms.',
    'CH-100': 'Request for Civil Harassment Restraining Order. Use for non-domestic relationships.',
    'CH-110': 'Temporary Restraining Order (Civil Harassment). Temporary protection before hearing.',
    'CH-120': 'Response to Civil Harassment Restraining Order.',
    'CH-130': 'Civil Harassment Restraining Order.',
    'CH-250': 'Proof of Service by Mail (Civil Harassment).',
    'FW-001': 'Request to Waive Court Fees.',
    'FW-003': 'Order on Request to Waive Court Fees.',
    'CM-010': 'Civil Case Cover Sheet.'
  };
  
  return explanations[formCode] || `Form ${formCode} - Please consult court staff for details.`;
}

/**
 * Render a form as a clickable link
 * @param {string} formCode - The form code
 * @param {Object} options - Rendering options
 * @param {string} options.className - CSS class for the link
 * @param {boolean} options.showExplanation - Whether to show explanation on hover
 * @returns {JSX.Element} A clickable form link
 */
export function renderFormLink(formCode, options = {}) {
  const { className = '', showExplanation = false } = options;
  const url = getFormUrl(formCode);
  const explanation = showExplanation ? getFormExplanation(formCode) : '';
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-blue-600 hover:text-blue-800 underline ${className}`}
      title={explanation}
    >
      {formCode}
    </a>
  );
}

/**
 * Render a list of forms as clickable links
 * @param {Array} forms - Array of form codes or form objects
 * @param {Object} options - Rendering options
 * @returns {Array} Array of JSX elements
 */
export function renderFormLinks(forms, options = {}) {
  return forms.map((form, index) => {
    const formCode = typeof form === 'string' ? form : form.number;
    return (
      <span key={index}>
        {renderFormLink(formCode, options)}
        {index < forms.length - 1 && ', '}
      </span>
    );
  });
}
