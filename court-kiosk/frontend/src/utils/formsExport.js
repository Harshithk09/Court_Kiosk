// Forms Export Utilities
import formsDatabase from '../data/formsDatabase';

export const exportFormsToCSV = () => {
  const headers = [
    'Form Code',
    'Form Name',
    'Category',
    'Priority',
    'Required',
    'PDF Available',
    'Description',
    'Instructions',
    'Related Forms',
    'Flow Files'
  ];

  const csvContent = [
    headers.join(','),
    ...Object.entries(formsDatabase).map(([code, form]) => [
      `"${code}"`,
      `"${form.name}"`,
      `"${form.category}"`,
      `"${form.priority}"`,
      `"${form.required ? 'Yes' : 'No'}"`,
      `"${form.pdf_available ? 'Yes' : 'No'}"`,
      `"${form.description}"`,
      `"${form.instructions}"`,
      `"${form.related_forms.join(', ')}"`,
      `"${form.flow_files.join(', ')}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `court_forms_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportFormsToJSON = () => {
  const data = {
    exportDate: new Date().toISOString(),
    totalForms: Object.keys(formsDatabase).length,
    forms: formsDatabase
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `court_forms_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportFormsByCategory = (category) => {
  const filteredForms = Object.entries(formsDatabase)
    .filter(([_, form]) => form.category === category)
    .reduce((acc, [code, form]) => {
      acc[code] = form;
      return acc;
    }, {});

  const data = {
    exportDate: new Date().toISOString(),
    category,
    totalForms: Object.keys(filteredForms).length,
    forms: filteredForms
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${category.toLowerCase().replace(/\s+/g, '_')}_forms_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportFormsByPriority = (priority) => {
  const filteredForms = Object.entries(formsDatabase)
    .filter(([_, form]) => form.priority === priority)
    .reduce((acc, [code, form]) => {
      acc[code] = form;
      return acc;
    }, {});

  const data = {
    exportDate: new Date().toISOString(),
    priority,
    totalForms: Object.keys(filteredForms).length,
    forms: filteredForms
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `priority_${priority}_forms_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateFormsReport = () => {
  const summary = {
    total: Object.keys(formsDatabase).length,
    byCategory: {},
    byPriority: {},
    byAvailability: {
      available: 0,
      unavailable: 0
    },
    requiredForms: [],
    optionalForms: []
  };

  Object.entries(formsDatabase).forEach(([code, form]) => {
    // Count by category
    if (!summary.byCategory[form.category]) {
      summary.byCategory[form.category] = 0;
    }
    summary.byCategory[form.category]++;

    // Count by priority
    if (!summary.byPriority[form.priority]) {
      summary.byPriority[form.priority] = 0;
    }
    summary.byPriority[form.priority]++;

    // Count by availability
    if (form.pdf_available) {
      summary.byAvailability.available++;
    } else {
      summary.byAvailability.unavailable++;
    }

    // Categorize by required status
    if (form.required) {
      summary.requiredForms.push(code);
    } else {
      summary.optionalForms.push(code);
    }
  });

  return summary;
};

const formsExportUtils = {
  exportFormsToCSV,
  exportFormsToJSON,
  exportFormsByCategory,
  exportFormsByPriority,
  generateFormsReport
};

export default formsExportUtils;
