// Forms Update Utility - Automatically updates forms database when PDFs are added
import formsDatabase from '../data/formsDatabase';

// Function to scan a directory for PDF files and update forms database
export const scanAndUpdateForms = async (directoryPath) => {
  try {
    // This would typically use the File System Access API or similar
    // For now, we'll simulate the process
    console.log(`Scanning directory: ${directoryPath}`);
    
    // Simulate finding PDF files
    const foundPDFs = await scanDirectoryForPDFs(directoryPath);
    
    // Update forms database
    const updatedForms = updateFormsDatabase(foundPDFs);
    
    return {
      success: true,
      message: `Found ${foundPDFs.length} PDF files, updated ${updatedForms.updatedCount} forms`,
      foundPDFs,
      updatedForms
    };
  } catch (error) {
    console.error('Error scanning and updating forms:', error);
    return {
      success: false,
      message: `Error: ${error.message}`,
      error
    };
  }
};

// Function to scan directory for PDF files
const scanDirectoryForPDFs = async (directoryPath) => {
  // This is a placeholder - in a real implementation, you'd use:
  // - File System Access API (browser)
  // - Node.js fs module (server-side)
  // - Vercel/Netlify file system APIs
  
  const mockPDFs = [
    'DV-100-Request-for-DVRO.pdf',
    'DV-109-Notice-of-Hearing.pdf',
    'DV-110-Temporary-RO.pdf',
    'FL-100-Petition.pdf',
    'FL-110-Summons.pdf',
    'CH-100-Civil-Harassment.pdf'
  ];
  
  return mockPDFs.map(filename => ({
    filename,
    formCode: extractFormCode(filename),
    filePath: `${directoryPath}/${filename}`,
    size: Math.floor(Math.random() * 5000000) + 100000, // Random size between 100KB-5MB
    lastModified: new Date().toISOString()
  }));
};

// Extract form code from filename
export const extractFormCode = (filename) => {
  // Pattern: DV-100, FL-100, CH-100, etc.
  const formCodePattern = /([A-Z]{2}-\d+)/;
  const match = filename.match(formCodePattern);
  return match ? match[1] : null;
};

// Update forms database based on found PDFs
const updateFormsDatabase = (foundPDFs) => {
  let updatedCount = 0;
  const updates = [];
  
  foundPDFs.forEach(pdfFile => {
    if (pdfFile.formCode && formsDatabase[pdfFile.formCode]) {
      // Update the form in the database
      formsDatabase[pdfFile.formCode].pdf_available = true;
      formsDatabase[pdfFile.formCode].pdf_path = pdfFile.filePath;
      formsDatabase[pdfFile.formCode].last_updated = new Date().toISOString();
      
      updates.push({
        formCode: pdfFile.formCode,
        formName: formsDatabase[pdfFile.formCode].name,
        status: 'updated',
        pdfPath: pdfFile.filePath
      });
      
      updatedCount++;
    } else if (pdfFile.formCode) {
      // Form code found but not in database
      updates.push({
        formCode: pdfFile.formCode,
        status: 'unknown_form',
        message: 'Form code not found in database'
      });
    } else {
      // No form code detected
      updates.push({
        filename: pdfFile.filename,
        status: 'no_form_code',
        message: 'Could not extract form code from filename'
      });
    }
  });
  
  return {
    updatedCount,
    updates,
    summary: generateUpdateSummary(updates)
  };
};

// Generate summary of updates
const generateUpdateSummary = (updates) => {
  const summary = {
    total: updates.length,
    updated: updates.filter(u => u.status === 'updated').length,
    unknownForms: updates.filter(u => u.status === 'unknown_form').length,
    noFormCode: updates.filter(u => u.status === 'no_form_code').length
  };
  
  return summary;
};

// Function to manually update a specific form
export const updateFormPDFStatus = (formCode, pdfPath, isAvailable = true) => {
  if (!formsDatabase[formCode]) {
    throw new Error(`Form ${formCode} not found in database`);
  }
  
  formsDatabase[formCode].pdf_available = isAvailable;
  formsDatabase[formCode].pdf_path = isAvailable ? pdfPath : null;
  formsDatabase[formCode].last_updated = new Date().toISOString();
  
  return {
    success: true,
    formCode,
    formName: formsDatabase[formCode].name,
    pdf_available: isAvailable,
    pdf_path: formsDatabase[formCode].pdf_path
  };
};

// Function to get forms that need PDFs
export const getFormsNeedingPDFs = () => {
  return Object.entries(formsDatabase)
    .filter(([_, form]) => !form.pdf_available)
    .reduce((acc, [code, form]) => {
      acc[code] = form;
      return acc;
    }, {});
};

// Function to get forms with PDFs
export const getFormsWithPDFs = () => {
  return Object.entries(formsDatabase)
    .filter(([_, form]) => form.pdf_available)
    .reduce((acc, [code, form]) => {
      acc[code] = form;
      return acc;
    }, {});
};

// Function to validate PDF filenames
export const validatePDFFilenames = (filenames) => {
  const validationResults = filenames.map(filename => {
    const formCode = extractFormCode(filename);
    const isValid = formCode && formsDatabase[formCode];
    
    return {
      filename,
      formCode,
      isValid,
      formName: isValid ? formsDatabase[formCode].name : null,
      suggestions: isValid ? [] : generateFilenameSuggestions(filename)
    };
  });
  
  return validationResults;
};

// Generate filename suggestions for invalid filenames
const generateFilenameSuggestions = (filename) => {
  const suggestions = [];
  
  // Try to extract any potential form codes
  const potentialCodes = filename.match(/[A-Z]{2,3}[-_]\d+/g);
  if (potentialCodes) {
    suggestions.push(`Potential form codes found: ${potentialCodes.join(', ')}`);
  }
  
  // Suggest common patterns
  suggestions.push('Use format: FormCode-Description.pdf (e.g., DV-100-Request.pdf)');
  suggestions.push('Ensure form code matches exactly: DV-100, FL-100, CH-100, etc.');
  
  return suggestions;
};

// Export the updated forms database
export const exportUpdatedFormsDatabase = () => {
  const updatedDatabase = {
    exportDate: new Date().toISOString(),
    totalForms: Object.keys(formsDatabase).length,
    formsWithPDFs: Object.keys(getFormsWithPDFs()).length,
    formsNeedingPDFs: Object.keys(getFormsNeedingPDFs()).length,
    forms: formsDatabase
  };
  
  return updatedDatabase;
};

const formsUpdateUtils = {
  scanAndUpdateForms,
  updateFormPDFStatus,
  getFormsNeedingPDFs,
  getFormsWithPDFs,
  validatePDFFilenames,
  exportUpdatedFormsDatabase,
  extractFormCode
};

export default formsUpdateUtils;
