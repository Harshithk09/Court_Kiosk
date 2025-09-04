// Forms Folder Structure Generator
// This utility helps you create the proper folder structure for your PDF forms

import formsDatabase from '../data/formsDatabase';

// Generate the complete folder structure
export const generateFormsFolderStructure = () => {
  const structure = {
    root: 'forms/',
    categories: {}
  };

  // Group forms by category
  Object.values(formsDatabase).forEach(form => {
    if (!structure.categories[form.category]) {
      structure.categories[form.category] = [];
    }
    structure.categories[form.category].push({
      code: Object.keys(formsDatabase).find(key => formsDatabase[key] === form),
      name: form.name,
      required: form.required,
      priority: form.priority
    });
  });

  return structure;
};

// Generate folder creation commands
export const generateFolderCommands = () => {
  const structure = generateFormsFolderStructure();
  const commands = [];
  
  // Create root directory
  commands.push(`mkdir -p ${structure.root}`);
  
  // Create category subdirectories
  Object.keys(structure.categories).forEach(category => {
    const folderName = category.toLowerCase().replace(/\s+/g, '-');
    commands.push(`mkdir -p ${structure.root}${folderName}/`);
  });
  
  return commands;
};

// Generate a list of all forms with their expected filenames
export const generateFormsFileList = () => {
  const fileList = [];
  
  Object.entries(formsDatabase).forEach(([code, form]) => {
    const category = form.category.toLowerCase().replace(/\s+/g, '-');
    const filename = `${code}-${form.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    const fullPath = `forms/${category}/${filename}`;
    
    fileList.push({
      formCode: code,
      formName: form.name,
      category: form.category,
      priority: form.priority,
      required: form.required,
      expectedFilename: filename,
      fullPath: fullPath,
      status: 'missing'
    });
  });
  
  return fileList;
};

// Generate a CSV export of the forms list
export const exportFormsListToCSV = () => {
  const fileList = generateFormsFileList();
  const headers = [
    'Form Code',
    'Form Name',
    'Category',
    'Priority',
    'Required',
    'Expected Filename',
    'Full Path',
    'Status'
  ];

  const csvContent = [
    headers.join(','),
    ...fileList.map(form => [
      `"${form.formCode}"`,
      `"${form.formName}"`,
      `"${form.category}"`,
      `"${form.priority}"`,
      `"${form.required ? 'Yes' : 'No'}"`,
      `"${form.expectedFilename}"`,
      `"${form.fullPath}"`,
      `"${form.status}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `forms_file_list_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate a markdown file with setup instructions
export const generateSetupInstructions = () => {
  const structure = generateFormsFolderStructure();
  const fileList = generateFormsFileList();
  
  let markdown = `# Court Forms Setup Instructions\n\n`;
  markdown += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
  
  markdown += `## Folder Structure\n\n`;
  markdown += `Create the following folder structure in your project:\n\n`;
  markdown += `\`\`\`\n`;
  markdown += `${structure.root}\n`;
  
  Object.keys(structure.categories).forEach(category => {
    const folderName = category.toLowerCase().replace(/\s+/g, '-');
    markdown += `├── ${folderName}/\n`;
  });
  
  markdown += `\`\`\`\n\n`;
  
  markdown += `## Forms by Category\n\n`;
  
  Object.entries(structure.categories).forEach(([category, forms]) => {
    markdown += `### ${category}\n\n`;
    markdown += `| Form Code | Form Name | Required | Priority | Expected Filename |\n`;
    markdown += `|-----------|-----------|----------|----------|-------------------|\n`;
    
    forms.forEach(form => {
      const filename = `${form.code}-${form.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      const required = form.required ? '✅ Yes' : '❌ No';
      markdown += `| ${form.code} | ${form.name} | ${required} | ${form.priority} | \`${filename}\` |\n`;
    });
    
    markdown += `\n`;
  });
  
  markdown += `## Setup Steps\n\n`;
  markdown += `1. **Create the folder structure** using the commands above\n`;
  markdown += `2. **Add your PDF files** with the exact filenames shown\n`;
  markdown += `3. **Update the forms database** to mark forms as available\n`;
  markdown += `4. **Test the forms management system**\n\n`;
  
  markdown += `## Important Notes\n\n`;
  markdown += `- **Filename format**: Use exactly: \`FormCode-Description.pdf\`\n`;
  markdown += `- **Form codes must match exactly**: DV-100, FL-100, CH-100, etc.\n`;
  markdown += `- **Required forms**: These are essential for the court process\n`;
  markdown += `- **Priority levels**: A (High) > B (Medium) > C (Normal) > D (Low)\n\n`;
  
  markdown += `## Total Forms: ${fileList.length}\n`;
  markdown += `- Required: ${fileList.filter(f => f.required).length}\n`;
  markdown += `- Optional: ${fileList.filter(f => !f.required).length}\n`;
  markdown += `- High Priority (A): ${fileList.filter(f => f.priority === 'A').length}\n`;
  markdown += `- Medium Priority (B): ${fileList.filter(f => f.priority === 'B').length}\n`;
  markdown += `- Normal Priority (C): ${fileList.filter(f => f.priority === 'C').length}\n`;
  markdown += `- Low Priority (D): ${fileList.filter(f => f.priority === 'D').length}\n`;
  
  return markdown;
};

// Export the markdown instructions
export const exportSetupInstructions = () => {
  const markdown = generateSetupInstructions();
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `forms_setup_instructions_${new Date().toISOString().split('T')[0]}.md`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Generate a simple checklist
export const generateFormsChecklist = () => {
  const fileList = generateFormsFileList();
  const checklist = fileList.map(form => ({
    ...form,
    checked: false,
    notes: ''
  }));
  
  return checklist;
};

export default {
  generateFormsFolderStructure,
  generateFolderCommands,
  generateFormsFileList,
  exportFormsListToCSV,
  generateSetupInstructions,
  exportSetupInstructions,
  generateFormsChecklist
};
