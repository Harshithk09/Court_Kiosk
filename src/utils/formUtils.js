/**
 * Utility functions for handling court forms and hyperlinks
 */

/**
 * Get the URL for a court form
 * @param {string} formCode - The form code (e.g., 'DV-100', 'CLETS-001')
 * @returns {string} The URL to the form PDF or search page
 */
export function getFormUrl(formCode) {
  const standardized = formCode.toUpperCase();
  
  // Judicial Council forms follow pattern: https://www.courts.ca.gov/documents/formcode.pdf
  if (isJudicialCouncilForm(standardized)) {
    return `https://www.courts.ca.gov/documents/${standardized.toLowerCase()}.pdf`;
  }
  
  // County/local forms - fall back to search
  return `https://www.google.com/search?q=${encodeURIComponent(formCode + ' form pdf california court')}`;
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
