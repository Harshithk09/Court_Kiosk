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
        establish: [
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
    'Complete all required forms',
    'Make 2 copies of each form',
    'File original forms with the court clerk',
    'Pay filing fee (check with clerk for current amount)',
    'Serve the other party with copies of all forms',
    'File proof of service with the court'
  ];

  if (topicId === 'restraining' && answers.immediate_danger === 'yes') {
    return [
      'Call 911 immediately if in danger',
      'Go to police station for emergency protection',
      'Complete restraining order forms',
      'File with court clerk immediately',
      'Attend court hearing (usually within 21 days)'
    ];
  }

  return baseSteps;
}; 