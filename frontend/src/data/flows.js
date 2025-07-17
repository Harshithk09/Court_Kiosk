// Centralized Q&A flows and form recommendations for all topics

export const topics = {
  divorce: {
    title: 'Divorce',
    icon: 'Users',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    questions: [
      {
        id: 'filing_type',
        question: "Are you filing for divorce or responding to a divorce petition?",
        type: "choice",
        options: [
          { value: "filing", label: "I want to file for divorce", description: "You are starting the divorce process" },
          { value: "responding", label: "I received divorce papers and need to respond", description: "Your spouse has already filed" }
        ]
      },
      {
        id: 'children',
        question: "Do you have minor children with your spouse?",
        type: "choice",
        options: [
          { value: "yes", label: "Yes, we have minor children together", description: "Children under 18 from this marriage" },
          { value: "no", label: "No, we don't have minor children together", description: "No children under 18 from this marriage" }
        ]
      },
      {
        id: 'agreement',
        question: "Do you and your spouse agree on all major issues?",
        type: "choice",
        subtitle: "This includes property division, child custody, and support",
        options: [
          { value: "yes", label: "Yes, we agree on everything (uncontested)", description: "No disputes about major issues" },
          { value: "no", label: "No, we disagree on some or all issues (contested)", description: "There are disagreements that need court resolution" }
        ]
      },
      {
        id: 'property',
        question: "Do you own significant assets together?",
        type: "choice",
        subtitle: "Such as real estate, businesses, retirement accounts, or valuable personal property",
        options: [
          { value: "yes", label: "Yes, we have significant shared assets", description: "Property division will be complex" },
          { value: "no", label: "No, we have minimal shared assets", description: "Simple property division" }
        ]
      }
    ],
    forms: {
      filing: {
        withChildren: {
          contested: [
            { number: "FL-100", name: "Petition—Marriage/Domestic Partnership", description: "Initial petition to start divorce proceedings", required: true },
            { number: "FL-110", name: "Summons", description: "Legal notice to your spouse about the divorce filing", required: true },
            { number: "FL-105", name: "Declaration Under UCCJEA", description: "Required when children are involved", required: true },
            { number: "FL-150", name: "Income and Expense Declaration", description: "Financial information for support calculations", required: true },
            { number: "FL-311", name: "Child Custody and Visitation Application Attachment", description: "Details about custody/visitation", required: false }
          ],
          uncontested: [
            { number: "FL-100", name: "Petition—Marriage/Domestic Partnership", description: "Initial petition to start divorce proceedings", required: true },
            { number: "FL-110", name: "Summons", description: "Legal notice to your spouse about the divorce filing", required: true },
            { number: "FL-105", name: "Declaration Under UCCJEA", description: "Required when children are involved", required: true }
          ]
        },
        withoutChildren: {
          contested: [
            { number: "FL-100", name: "Petition—Marriage/Domestic Partnership", description: "Initial petition to start divorce proceedings", required: true },
            { number: "FL-110", name: "Summons", description: "Legal notice to your spouse about the divorce filing", required: true },
            { number: "FL-150", name: "Income and Expense Declaration", description: "Financial information for support calculations", required: true }
          ],
          uncontested: [
            { number: "FL-100", name: "Petition—Marriage/Domestic Partnership", description: "Initial petition to start divorce proceedings", required: true },
            { number: "FL-110", name: "Summons", description: "Legal notice to your spouse about the divorce filing", required: true }
          ]
        }
      },
      responding: [
        { number: "FL-120", name: "Response—Marriage/Domestic Partnership", description: "Response to divorce petition", required: true },
        { number: "FL-105", name: "Declaration Under UCCJEA", description: "If children are involved", required: false }
      ]
    }
  },
  custody: {
    title: 'Child Custody & Visitation',
    icon: 'Users',
    color: 'bg-gradient-to-br from-green-500 to-green-600',
    questions: [
      {
        id: 'case_type',
        question: "Are you starting a new custody case or modifying an existing order?",
        type: "choice",
        options: [
          { value: "new", label: "Starting a new custody case", description: "No existing custody order" },
          { value: "modify", label: "Modifying an existing custody order", description: "There's already a court order in place" }
        ]
      },
      {
        id: 'custody_type',
        question: "What type of custody arrangement are you seeking?",
        type: "choice",
        options: [
          { value: "joint", label: "Joint custody (shared decision-making)", description: "Both parents make major decisions together" },
          { value: "sole", label: "Sole custody (one parent has primary custody)", description: "One parent has primary physical and legal custody" },
          { value: "visitation", label: "Visitation rights only", description: "Regular time with the child but not primary custody" }
        ]
      },
      {
        id: 'safety',
        question: "Are there any safety concerns involving the children?",
        type: "choice",
        options: [
          { value: "yes", label: "Yes, there are safety concerns", description: "Domestic violence, substance abuse, or other safety issues" },
          { value: "no", label: "No safety concerns", description: "No immediate safety issues" }
        ]
      },
      {
        id: 'location',
        question: "Do both parents live in the same state?",
        type: "choice",
        options: [
          { value: "yes", label: "Yes, we both live in this state", description: "Both parents are local residents" },
          { value: "no", label: "No, one parent lives in another state", description: "Interstate custody considerations apply" }
        ]
      }
    ],
    forms: {
      new: [
        { number: "FL-200", name: "Petition for Custody and Support of Minor Children", description: "Main custody petition", required: true },
        { number: "FL-105", name: "Declaration Under UCCJEA", description: "Required for custody cases", required: true },
        { number: "FL-150", name: "Income and Expense Declaration", description: "Financial information for support", required: true }
      ],
      modify: [
        { number: "FL-300", name: "Request for Order", description: "Request to modify custody order", required: true },
        { number: "FL-305", name: "Declaration", description: "Supporting declaration", required: true }
      ]
    }
  },
  restraining: {
    title: 'Domestic Violence Restraining Order',
    icon: 'Shield',
    color: 'bg-gradient-to-br from-red-500 to-red-600',
    questions: [
      {
        id: 'immediate_danger',
        question: "Are you in immediate danger?",
        type: "choice",
        urgent: true,
        options: [
          { value: "yes", label: "Yes, I am in immediate danger", description: "Call 911 or go to police station immediately" },
          { value: "no", label: "No, but I need protection", description: "Seeking preventive protection" }
        ]
      },
      {
        id: 'relationship',
        question: "What is your relationship to the person you need protection from?",
        type: "choice",
        options: [
          { value: "spouse", label: "Current or former spouse/partner", description: "Married, divorced, dating, or lived together" },
          { value: "family", label: "Family member", description: "Parent, child, sibling, or other relative" },
          { value: "other", label: "Other relationship", description: "Friend, acquaintance, or other connection" }
        ]
      },
      {
        id: 'protection_type',
        question: "What type of protection do you need?",
        type: "choice",
        options: [
          { value: "emergency", label: "Emergency protection (temporary)", description: "Immediate temporary protection" },
          { value: "permanent", label: "Long-term protection order", description: "Extended protection order" }
        ]
      },
      {
        id: 'children_involved',
        question: "Are there children who need protection?",
        type: "choice",
        options: [
          { value: "yes", label: "Yes, children need protection too", description: "Include children in the protection order" },
          { value: "no", label: "No, just protection for myself", description: "Protection order for adult only" }
        ]
      }
    ],
    forms: {
      domestic_violence: [
        { number: "DV-100", name: "Request for Domestic Violence Restraining Order", description: "Main restraining order form", required: true },
        { number: "DV-110", name: "Temporary Restraining Order", description: "Emergency protection", required: true },
        { number: "DV-120", name: "Notice of Court Hearing", description: "Hearing notice", required: true }
      ],
      civil_harassment: [
        { number: "CH-100", name: "Request for Civil Harassment Restraining Order", description: "Main civil harassment form", required: true },
        { number: "CH-110", name: "Temporary Restraining Order", description: "Emergency protection", required: true }
      ]
    }
  },
  support: {
    title: 'Child & Spousal Support',
    icon: 'DollarSign',
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    questions: [
      {
        id: 'support_type',
        question: "What type of support are you seeking?",
        type: "choice",
        options: [
          { value: "child", label: "Child support only", description: "Support for children" },
          { value: "spousal", label: "Spousal support only", description: "Support for former spouse" },
          { value: "both", label: "Both child and spousal support", description: "Support for both children and spouse" }
        ]
      },
      {
        id: 'case_status',
        question: "Are you starting a new support case or modifying existing support?",
        type: "choice",
        options: [
          { value: "new", label: "Starting a new support case", description: "No existing support order" },
          { value: "modify", label: "Modifying existing support order", description: "There's already a support order in place" }
        ]
      },
      {
        id: 'income_info',
        question: "Do you have current income information for both parties?",
        type: "choice",
        options: [
          { value: "yes", label: "Yes, I have recent income information", description: "Recent pay stubs, tax returns, etc." },
          { value: "no", label: "No, I need help gathering income information", description: "Need assistance obtaining financial documents" }
        ]
      },
      {
        id: 'paternity',
        question: "Has paternity been legally established?",
        type: "choice",
        condition: (answers) => answers.support_type === 'child' || answers.support_type === 'both',
        options: [
          { value: "yes", label: "Yes, paternity is established", description: "Father is legally recognized" },
          { value: "no", label: "No, paternity needs to be established", description: "Need to establish legal fatherhood" }
        ]
      }
    ],
    forms: {
      child_support: {
        new: [
          { number: "FL-150", name: "Property Declaration", description: "Financial information", required: true },
          { number: "FL-155", name: "Income and Expense Declaration", description: "Detailed financial information", required: true },
          { number: "FL-300", name: "Request for Order", description: "Request for child support order", required: true }
        ],
        modify: [
          { number: "FL-300", name: "Request for Order", description: "Request to modify support", required: true },
          { number: "FL-155", name: "Income and Expense Declaration", description: "Updated financial information", required: true }
        ]
      },
      spousal_support: [
        { number: "FL-150", name: "Property Declaration", description: "Financial information", required: true },
        { number: "FL-155", name: "Income and Expense Declaration", description: "Detailed financial information", required: true },
        { number: "FL-300", name: "Request for Order", description: "Request for spousal support order", required: true }
      ]
    }
  }
};

// Helper function to get forms based on topic and answers
export const getFormsForTopic = (topicId, answers) => {
  const topic = topics[topicId];
  if (!topic || !topic.forms) return [];

  // Handle different topic structures
  if (topicId === 'divorce') {
    if (answers.filing_type === 'filing') {
      const hasChildren = answers.children === 'yes';
      const isContested = answers.agreement === 'no';
      
      if (hasChildren) {
        return isContested ? topic.forms.filing.withChildren.contested : topic.forms.filing.withChildren.uncontested;
      } else {
        return isContested ? topic.forms.filing.withoutChildren.contested : topic.forms.filing.withoutChildren.uncontested;
      }
    } else if (answers.filing_type === 'responding') {
      return topic.forms.responding;
    }
  } else if (topicId === 'custody') {
    return topic.forms[answers.case_type] || [];
  } else if (topicId === 'restraining') {
    if (answers.relationship === 'spouse') {
      return topic.forms.domestic_violence;
    } else {
      return topic.forms.civil_harassment;
    }
  } else if (topicId === 'support') {
    if (answers.support_type === 'child') {
      // Map 'new' toestablish' and 'modify' to 'modify     const formKey = answers.case_status === new' ? establish' : 'modify';
      return topic.forms.child_support[answers.case_status] || [];
    } else if (answers.support_type === 'spousal') {
      return topic.forms.spousal_support;
    } else {
      // Both child and spousal support
      const childForms = topic.forms.child_support[answers.case_status] || [];
      const spousalForms = topic.forms.spousal_support;
      return [...childForms, ...spousalForms];
    }
  }
  
  return [];
};

// Helper function to get next steps based on topic and answers
export const getNextStepsForTopic = (topicId, answers) => {
  const baseSteps = [
    { title: 'Complete all required forms', description: 'Fill out all forms completely and accurately. Don\'t leave any blanks.' },
    { title: 'Make 2 copies of each form', description: 'Keep one copy for yourself and prepare one for the other party.' },
    { title: 'File original forms with the court clerk', description: 'Take the original forms to the San Mateo County courthouse clerk\'s office.' },
    { title: 'Pay filing fee (check with clerk for current amount)', description: 'Filing fees vary by case type. Ask about fee waiver if you cannot afford it.' },
    { title: 'Serve the other party with copies of all forms', description: 'Have someone (not you) serve the other party with copies of all filed documents.' },
    { title: 'File proof of service with the court', description: 'Submit the completed proof of service form to show the other party was served.' }
  ];

  if (topicId === 'restraining' && answers.immediate_danger === 'yes') {
    return [
      { title: 'Call 911 immediately if in danger', description: 'If you are in immediate danger, call 911 away for emergency assistance.' },
      { title: 'Go to police station for emergency protection', description: 'Visit your local police station to request emergency protection while waiting for court order.' },
      { title: 'Complete restraining order forms', description: 'Fill out the DV-100 (Request for Domestic Violence Restraining Order) form completely.' },
      { title: 'File with court clerk immediately', description: 'Take completed forms to the courthouse clerk\'s office for immediate filing.' },
      { title: 'Attend court hearing (usually within 21 days)', description: 'You will receive a hearing date. Attend court on that date with all evidence and witnesses.' }
    ];
  }

  if (topicId === 'restraining') {
    return [
      { title: 'Complete restraining order forms', description: 'Fill out the DV-100 (Request for Domestic Violence Restraining Order) form completely.' },
      { title: 'File forms with court clerk', description: 'Take completed forms to the San Mateo County courthouse clerk\'s office.' },
      { title: 'Request temporary restraining order', description: 'Ask the clerk about getting a temporary restraining order for immediate protection.' },
      { title: 'Serve the other party', description: 'Have someone (18 years or older) serve the other party with copies of all filed documents.' },
      { title: 'File proof of service', description: 'Submit proof of service form to show the other party was served.' },
      { title: 'Attend court hearing', description: 'Attend the scheduled hearing with all evidence, witnesses, and documentation.' }
    ];
  }

  if (topicId === 'divorce') {
    return [
      { title: 'Complete divorce petition forms', description: 'Fill out FL-100 (Petition) and FL-110 (Summons) completely.' },
      { title: 'File with court clerk', description: 'Submit original forms to the family law clerk\'s office with filing fee.' },
      { title: 'Serve your spouse', description: 'Have someone (18+ years) serve your spouse with copies of all filed documents.' },
      { title: 'File proof of service', description: 'Submit proof of service within 60 days of filing.' },
      { title: 'Complete financial disclosures', description: 'Fill out FL-150 (Income and Expense) and FL-142 (Assets and Debts) forms.' },
      { title: 'Attend court hearings', description: 'Attend all scheduled hearings and mediation sessions.' }
    ];
  }

  if (topicId === 'custody') {
    return [
      { title: 'Complete custody petition', description: 'Fill out FL-200(Petition for Custody) form completely.' },
      { title: 'File with court clerk', description: 'Submit original forms to the family law clerk\'s office.' },
      { title: 'Serve the other parent', description: 'Have someone (18 years) serve the other parent with copies of all documents.' },
      { title: 'Attend mediation (if required)', description: 'Many courts require mediation before custody hearings.' },
      { title: 'Prepare for court hearing', description: 'Gather evidence, witnesses, and prepare your case presentation.' },
      { title: 'Attend court hearing', description: 'Attend the scheduled custody hearing with all documentation.' }
    ];
  }

  if (topicId === 'support') {
    return [
      { title: 'Complete support request forms', description: 'Fill out FL-300 (Request for Order) and FL-150 (Income and Expense) forms.' },
      { title: 'Gather financial documents', description: 'Collect pay stubs, tax returns, and other income documentation.' },
      { title: 'File with court clerk', description: 'Submit original forms to the family law clerk\'s office.' },
      { title: 'Serve the other party', description: 'Have someone (18 years) serve the other party with copies of all documents.' },
      { title: 'Attend support hearing', description: 'Attend the scheduled support hearing with all financial documentation.' },
      { title: 'Follow up on order', description: 'Once order is issued, ensure payments are made according to the court order.' }
    ];
  }

  return baseSteps;
}; 