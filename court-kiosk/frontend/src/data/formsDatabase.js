// Comprehensive Forms Database for Court Kiosk System
// This database tracks all forms referenced in flow files and their status

export const formsDatabase = {
  // Domestic Violence Restraining Order Forms
  "DV-100": {
    name: "Request for Domestic Violence Restraining Order",
    category: "Domestic Violence",
    priority: "A",
    description: "Main petition form for domestic violence restraining orders",
    required: true,
    pdf_available: false,
    pdf_path: null,
    instructions: "Complete all sections, especially relationship details and requested orders",
    related_forms: ["DV-109", "DV-110", "CLETS-001"],
    flow_files: ["dv_flow_combined.json", "complete_dvro.json"]
  },
  "DV-105": {
    name: "Request for Child Custody and Visitation Orders",
    category: "Domestic Violence",
    priority: "A",
    description: "Request for child custody and visitation orders within DVRO case",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Required if children are involved in the case",
    related_forms: ["DV-100", "DV-140"],
    flow_files: ["dv_flow_combined.json"]
  },
  "DV-109": {
    name: "Notice of Court Hearing",
    category: "Domestic Violence",
    priority: "A",
    description: "Notice of court hearing date and time",
    required: true,
    pdf_available: false,
    pdf_path: null,
    instructions: "Review carefully for hearing date, time, and location",
    related_forms: ["DV-100", "DV-110"],
    flow_files: ["dv_flow_combined.json", "complete_dvro.json"]
  },
  "DV-110": {
    name: "Temporary Restraining Order",
    category: "Domestic Violence",
    priority: "A",
    description: "Temporary restraining order granted by the court",
    required: true,
    pdf_available: false,
    pdf_path: null,
    instructions: "Read all terms and conditions carefully",
    related_forms: ["DV-100", "DV-109"],
    flow_files: ["dv_flow_combined.json", "complete_dvro.json"]
  },
  "DV-120": {
    name: "Response to Request for Domestic Violence Restraining Order",
    category: "Domestic Violence",
    priority: "A",
    description: "Response form for the person against whom the order is requested",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Must be filed within the response period",
    related_forms: ["DV-100", "DV-109"],
    flow_files: ["dv_flow_combined.json"]
  },
  "DV-140": {
    name: "Child Custody and Visitation Order Attachment",
    category: "Domestic Violence",
    priority: "A",
    description: "Attachment for child custody and visitation orders",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Complete items 2 & 3 if requesting custody orders",
    related_forms: ["DV-100", "DV-105"],
    flow_files: ["dv_flow_combined.json"]
  },
  "DV-250": {
    name: "Request for Order to Prevent Child Abduction",
    category: "Domestic Violence",
    priority: "A",
    description: "Request for orders to prevent child abduction",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Complete if there are concerns about child abduction",
    related_forms: ["DV-100", "DV-105"],
    flow_files: ["dv_flow_combined.json"]
  },
  "DV-700": {
    name: "Request for Renewal of Domestic Violence Restraining Order",
    category: "Domestic Violence",
    priority: "A",
    description: "Request to renew an existing restraining order",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "File before the current order expires",
    related_forms: ["DV-710", "DV-720"],
    flow_files: ["dv_flow_combined.json"]
  },
  "DV-710": {
    name: "Notice of Court Hearing for Renewal",
    category: "Domestic Violence",
    priority: "A",
    description: "Notice of court hearing for renewal request",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Check for hearing date and time",
    related_forms: ["DV-700", "DV-720"],
    flow_files: ["dv_flow_combined.json"]
  },
  "DV-720": {
    name: "Renewal of Domestic Violence Restraining Order",
    category: "Domestic Violence",
    priority: "A",
    description: "Renewal order form",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Complete with current information",
    related_forms: ["DV-700", "DV-710"],
    flow_files: ["dv_flow_combined.json"]
  },
  "DV-800": {
    name: "Request for Order to Surrender Firearms",
    category: "Domestic Violence",
    priority: "A",
    description: "Request for order to surrender firearms",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Complete if firearms are involved",
    related_forms: ["DV-100"],
    flow_files: ["dv_flow_combined.json"]
  },

  // Civil Harassment Forms
  "CH-100": {
    name: "Request for Civil Harassment Restraining Order",
    category: "Civil Harassment",
    priority: "B",
    description: "Main petition form for civil harassment restraining orders",
    required: true,
    pdf_available: false,
    pdf_path: null,
    instructions: "Use for non-domestic relationships (neighbors, coworkers, etc.)",
    related_forms: ["CH-110"],
    flow_files: ["dv_flow_combined.json"]
  },
  "CH-110": {
    name: "Civil Harassment Restraining Order",
    category: "Civil Harassment",
    priority: "B",
    description: "Civil harassment restraining order form",
    required: true,
    pdf_available: false,
    pdf_path: null,
    instructions: "Complete with harassment details",
    related_forms: ["CH-100"],
    flow_files: ["dv_flow_combined.json"]
  },

  // Law Enforcement Forms
  "CLETS-001": {
    name: "Confidential Law Enforcement Information",
    category: "Law Enforcement",
    priority: "A",
    description: "Confidential law enforcement information form",
    required: true,
    pdf_available: false,
    pdf_path: null,
    instructions: "Contains confidential information for law enforcement",
    related_forms: ["DV-100"],
    flow_files: ["dv_flow_combined.json"]
  },

  // Divorce Forms
  "FL-100": {
    name: "Petition - Marriage/Domestic Partnership",
    category: "Divorce",
    priority: "C",
    description: "Main petition form for divorce or legal separation",
    required: true,
    pdf_available: false,
    pdf_path: null,
    instructions: "Complete all sections, check box for divorce or legal separation",
    related_forms: ["FL-110", "FL-105", "FL-140"],
    flow_files: ["divorce_flow_enhanced.json"]
  },
  "FL-105": {
    name: "Declaration Under Uniform Child Custody Jurisdiction and Enforcement Act",
    category: "Divorce",
    priority: "C",
    description: "Required when children are involved",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Complete if you have children under 18",
    related_forms: ["FL-100", "FL-140"],
    flow_files: ["divorce_flow_enhanced.json"]
  },
  "FL-110": {
    name: "Summons",
    category: "Divorce",
    priority: "C",
    description: "Notifies spouse of divorce filing",
    required: true,
    pdf_available: false,
    pdf_path: null,
    instructions: "Must be served on spouse within 60 days",
    related_forms: ["FL-100"],
    flow_files: ["divorce_flow_enhanced.json"]
  },
  "FL-115": {
    name: "Response to Petition",
    category: "Divorce",
    priority: "C",
    description: "Response form for spouse",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Must be filed within 30 days of being served",
    related_forms: ["FL-100"],
    flow_files: ["divorce_flow_enhanced.json"]
  },
  "FL-120": {
    name: "Response",
    category: "Divorce",
    priority: "C",
    description: "Response form for spouse",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Alternative response form",
    related_forms: ["FL-100"],
    flow_files: ["divorce_flow_enhanced.json"]
  },
  "FL-140": {
    name: "Child Custody and Visitation Order Attachment",
    category: "Divorce",
    priority: "C",
    description: "Details custody and visitation arrangements",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Complete if requesting custody/visitation orders",
    related_forms: ["FL-100", "FL-105"],
    flow_files: ["divorce_flow_enhanced.json"]
  },
  "FL-150": {
    name: "Income and Expense Declaration",
    category: "Divorce",
    priority: "C",
    description: "Financial disclosure form",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Complete with proof of income from past two months",
    related_forms: ["FL-100"],
    flow_files: ["divorce_flow_enhanced.json"]
  },
  "FL-160": {
    name: "Declaration for Default/Uncontested",
    category: "Divorce",
    priority: "C",
    description: "Declaration for default or uncontested cases",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Complete if case is uncontested",
    related_forms: ["FL-100"],
    flow_files: ["divorce_flow_enhanced.json"]
  },
  "FL-165": {
    name: "Request to Enter Default",
    category: "Divorce",
    priority: "C",
    description: "Request to enter default judgment",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Use if spouse doesn't respond",
    related_forms: ["FL-170", "FL-180"],
    flow_files: ["divorce_flow_enhanced.json"]
  },
  "FL-170": {
    name: "Declaration for Default/Uncontested",
    category: "Divorce",
    priority: "C",
    description: "Declaration for default or uncontested cases",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Complete for default judgment",
    related_forms: ["FL-165", "FL-180"],
    flow_files: ["divorce_flow_enhanced.json"]
  },
  "FL-180": {
    name: "Judgment",
    category: "Divorce",
    priority: "C",
    description: "Final judgment of divorce",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Complete with all requested orders",
    related_forms: ["FL-165", "FL-170", "FL-190"],
    flow_files: ["divorce_flow_enhanced.json"]
  },
  "FL-190": {
    name: "Notice of Entry of Judgment",
    category: "Divorce",
    priority: "C",
    description: "Notice that judgment has been entered",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "File after judgment is entered",
    related_forms: ["FL-180"],
    flow_files: ["divorce_flow_enhanced.json"]
  },
  "FL-300": {
    name: "Request for Order",
    category: "Divorce",
    priority: "C",
    description: "Request for modification of existing orders",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Use to modify existing custody, support, or other orders",
    related_forms: ["FL-100"],
    flow_files: ["divorce_flow_enhanced.json"]
  },
  "FL-341": {
    name: "Custody and Visitation Attachment",
    category: "Divorce",
    priority: "C",
    description: "Attachment for custody and visitation orders",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Complete if requesting custody orders",
    related_forms: ["FL-100", "FL-105"],
    flow_files: ["divorce_flow_enhanced.json"]
  },
  "FL-800": {
    name: "Declaration of Disclosure",
    category: "Divorce",
    priority: "C",
    description: "Financial disclosure declaration",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Complete financial disclosure",
    related_forms: ["FL-825"],
    flow_files: ["divorce_flow_enhanced.json"]
  },
  "FL-825": {
    name: "Property Declaration",
    category: "Divorce",
    priority: "C",
    description: "Property and debt declaration",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "List all property and debts",
    related_forms: ["FL-800"],
    flow_files: ["divorce_flow_enhanced.json"]
  },

  // Fee Waiver Forms
  "FW-001": {
    name: "Request to Waive Court Fees",
    category: "Fee Waiver",
    priority: "D",
    description: "Request to waive court filing fees",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Complete if you cannot afford filing fees",
    related_forms: ["FW-003"],
    flow_files: ["divorce_flow_enhanced.json"]
  },
  "FW-003": {
    name: "Order on Request to Waive Court Fees",
    category: "Fee Waiver",
    priority: "D",
    description: "Court order granting or denying fee waiver",
    required: false,
    pdf_available: false,
    pdf_path: null,
    instructions: "Filed by court after reviewing fee waiver request",
    related_forms: ["FW-001"],
    flow_files: ["divorce_flow_enhanced.json"]
  }
};

// Helper functions for forms management
export const getFormsByCategory = (category) => {
  return Object.entries(formsDatabase)
    .filter(([_, form]) => form.category === category)
    .reduce((acc, [code, form]) => {
      acc[code] = form;
      return acc;
    }, {});
};

export const getFormsByPriority = (priority) => {
  return Object.entries(formsDatabase)
    .filter(([_, form]) => form.priority === priority)
    .reduce((acc, [code, form]) => {
      acc[code] = form;
      return acc;
    }, {});
};

export const getFormsByFlowFile = (flowFile) => {
  return Object.entries(formsDatabase)
    .filter(([_, form]) => form.flow_files.includes(flowFile))
    .reduce((acc, [code, form]) => {
      acc[code] = form;
      return acc;
    }, {});
};

export const getFormsSummary = () => {
  const summary = {
    total: Object.keys(formsDatabase).length,
    byCategory: {},
    byPriority: {},
    byAvailability: {
      available: 0,
      unavailable: 0
    }
  };

  Object.values(formsDatabase).forEach(form => {
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
  });

  return summary;
};

export default formsDatabase;
