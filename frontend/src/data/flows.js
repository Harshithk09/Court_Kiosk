// Centralized Q&A flows and form recommendations for all topics

export const topics = {
  divorce: {
    title: 'Divorce',
    icon: 'Users',
    priority: 'C',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    questions: [
      {
        id: 'filing_type',
        question: {
          en: "Are you filing for divorce or responding to a divorce petition?",
          es: "¿Está solicitando el divorcio o respondiendo a una petición de divorcio?"
        },
        type: "choice",
        options: [
          { value: "filing", label: { en: "I want to file for divorce", es: "Quiero solicitar el divorcio" }, description: { en: "You are starting the divorce process", es: "Usted está iniciando el proceso de divorcio"} },
          { value: "responding", label: { en: "I received divorce papers and need to respond", es: "Recibí los papeles de divorcio y necesito responder" }, description: { en: "Your spouse has already filed", es: "Su cónyuge ya ha presentado la solicitud" } }
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
        { number: "FL-120", name: "Response—Marriage/Domestic Partnership", description: "Your official response to the divorce petition", required: true },
        { number: "FL-105", name: "Declaration Under UCCJEA", description: "This form is required if you have minor children", required: false }
      ]
    }
  },
  custody: {
    title: 'Child Custody & Visitation',
    icon: 'Users',
    priority: 'B',
    color: 'bg-gradient-to-br from-green-500 to-green-600',
    questions: [
      {
        id: 'case_type',
        question: {
          en: "Are you starting a new custody case or modifying an existing order?",
          es: "¿Está iniciando un nuevo caso de custodia o modificando una orden existente?"
        },
        type: "choice",
        options: [
          { value: "new", label: "Starting a new custody case", description: "No existing custody order" },
          { value: "modify", label: "Modifying existing custody order", description: "There's already a custody order in place" }
        ]
      },
      {
        id: 'children',
        question: "How many children are involved?",
        type: "choice",
        options: [
          { value: "one", label: "One child", description: "Single child custody case" },
          { value: "multiple", label: "Multiple children", description: "Two or more children involved" }
        ]
      },
      {
        id: 'custody_type',
        question: "What type of custody are you seeking?",
        type: "choice",
        options: [
          { value: "joint", label: "Joint custody", description: "Both parents share decision-making" },
          { value: "sole", label: "Sole custody", description: "One parent has primary decision-making" },
          { value: "split", label: "Split custody", description: "Different children with different parents" }
        ]
      },
      {
        id: 'agreement',
        question: "Do you and the other parent agree on custody arrangements?",
        type: "choice",
        options: [
          { value: "yes", label: "Yes, we agree on custody", description: "Uncontested custody case" },
          { value: "no", label: "No, we disagree on custody", description: "Contested custody case" }
        ]
      }
    ],
    forms: {
      new: [
        { number: "FL-200", name: "Petition to Establish Parental Relationship", description: "Main petition to establish custody", required: true },
        { number: "FL-105", name: "Declaration Under UCCJEA", description: "Required when children are involved", required: true },
        { number: "FL-311", name: "Child Custody and Visitation Application Attachment", description: "Details about custody/visitation", required: false }
      ],
      modify: [
        { number: "FL-300", name: "Request for Order", description: "Request to modify existing custody order", required: true },
        { number: "FL-105", name: "Declaration Under UCCJEA", description: "Required when children are involved", required: true },
        { number: "FL-311", name: "Child Custody and Visitation Application Attachment", description: "Details about custody/visitation", required: false }
      ]
    }
  },
  restraining: {
    title: 'Domestic Violence Restraining Order',
    icon: 'Shield',
    priority: 'A',
    color: 'bg-gradient-to-br from-red-500 to-red-600',
    info: [
      {
        id: "what_is_dvro",
        title: {
          en: "What is a Domestic Violence Restraining Order (DVRO)?",
          es: "¿Qué es una Orden de Restricción por Violencia Doméstica (DVRO)?"
        },
        body: {
          en: "A DVRO is a court order that can protect you from abuse or threats from someone you have a close relationship with. It can include personal conduct orders, stay-away orders, move-out orders, and temporary custody/visitation orders.",
          es: "Una DVRO es una orden judicial que puede protegerle del abuso o las amenazas de alguien con quien tiene una relación cercana. Puede incluir órdenes de conducta personal, órdenes de alejamiento, órdenes de desalojo y órdenes temporales de custodia/visitas."
        }
      },
      {
        id: "who_can_apply",
        title: {
          en: "Who can apply?",
          es: "¿Quién puede solicitarla?"
        },
        body: {
          en: "You can apply if the person is/was your spouse/partner, someone you dated or lived with, or a close family member (parent, child, sibling, grandparent, in-law). For non-domestic relationships (neighbor, coworker), use Civil Harassment forms instead.",
          es: "Puede solicitarla si la persona es/fue su cónyuge/pareja, alguien con quien salió o vivió, o un familiar cercano (padre/madre, hijo/a, hermano/a, abuelo/a, suegro/a). Para relaciones no domésticas (vecino, compañero de trabajo), use los formularios de Acoso Civil."
        }
      },
      {
        id: "emergency_vs_permanent",
        title: {
          en: "Emergency vs. Long-Term Orders",
          es: "Órdenes de emergencia vs. a largo plazo"
        },
        body: {
          en: "An Emergency Protective Order (EPO) can be requested through police for immediate safety. A Temporary Restraining Order (TRO) can be granted by a judge after you file forms and lasts until your hearing. Longer orders may be issued at the hearing.",
          es: "Una Orden de Protección de Emergencia (EPO) se puede solicitar a través de la policía para protección inmediata. Una Orden de Restricción Temporal (TRO) puede ser otorgada por un juez después de presentar los formularios y dura hasta su audiencia. Órdenes más largas pueden emitirse en la audiencia."
        }
      },
      {
        id: "steps_overview",
        title: {
          en: "Steps Overview",
          es: "Resumen de los pasos"
        },
        body: {
          en: "1) Complete forms → 2) File with the clerk → 3) Receive TRO (if granted) → 4) Serve the other party → 5) File Proof of Service → 6) Attend hearing → 7) After the hearing, follow the court's orders or request renewals as needed.",
          es: "1) Completar formularios → 2) Presentar ante el secretario → 3) Recibir TRO (si se otorga) → 4) Notificar a la otra parte → 5) Presentar Prueba de Notificación → 6) Asistir a la audiencia → 7) Después de la audiencia, cumpla con las órdenes o solicite renovaciones si es necesario."
        }
      },
      {
        id: "service_options",
        title: {
          en: "Service Options & Deadlines",
          es: "Opciones de notificación y plazos"
        },
        body: {
          en: "A server must be 18+ and not a party. Options: Sheriff, process server, or a trusted adult. DVRO packets usually must be served at least 5 days before the hearing (check your order). The server should complete DV-200.",
          es: "Quien notifique debe tener 18+ y no ser parte del caso. Opciones: Sheriff, gestor de notificaciones o un adulto de confianza. Los paquetes de DVRO por lo general deben notificarse al menos 5 días antes de la audiencia (verifique su orden). Quien notifique debe completar el DV-200."
        }
      },
      {
        id: "guns_and_surrender",
        title: {
          en: "Firearms: Prohibitions & Surrender",
          es: "Armas de fuego: prohibiciones y entrega"
        },
        body: {
          en: "DVROs can prohibit owning or possessing firearms. If you have firearms, you may be required to surrender them by a deadline and file proof. Ask the facilitator's office if you need help.",
          es: "Las DVRO pueden prohibir poseer o tener armas de fuego. Si tiene armas, puede ser requerido entregarlas antes de una fecha límite y presentar comprobante. Pida ayuda a la oficina de facilitación si la necesita."
        }
      },
      {
        id: "children_and_custody",
        title: {
          en: "Children & Custody in DVRO",
          es: "Niños y custodia en la DVRO"
        },
        body: {
          en: "You can include children in your request. The court may issue temporary custody/visitation orders. Additional child-related forms may be required.",
          es: "Puede incluir a los niños en su solicitud. El tribunal puede emitir órdenes temporales de custodia/visitas. Pueden requerirse formularios adicionales relacionados con los niños."
        }
      },
      {
        id: "support_and_income_forms",
        title: {
          en: "Support (Child/Spousal) & Income Forms",
          es: "Manutención (de hijos/cónyuge) y formularios de ingresos"
        },
        body: {
          en: "If you are requesting financial support, you typically need to complete FL-150 (Income and Expense Declaration).",
          es: "Si solicita manutención económica, normalmente necesita completar el FL-150 (Declaración de Ingresos y Gastos)."
        }
      },
      {
        id: "hearing_and_after",
        title: {
          en: "Your Hearing & After the Hearing",
          es: "Su audiencia y después de la audiencia"
        },
        body: {
          en: "Bring copies, evidence, and witnesses. If the other party was not served, the court may continue your hearing. After the hearing, follow the orders, arrange service/renewal if needed, and keep certified copies with you.",
          es: "Lleve copias, pruebas y testigos. Si la otra parte no fue notificada, el tribunal puede aplazar su audiencia. Después de la audiencia, cumpla con las órdenes, gestione la notificación/renovación si es necesario y lleve copias certificadas consigo."
        }
      },
      {
        id: "making_copies",
        title: {
          en: "Making Copies of Your Forms",
          es: "Hacer Copias de sus Formularios"
        },
        body: {
          en: "You need to make at least 3 copies of each form: 1 original for the court, 1 copy for the other party (to be served), and 1 copy for yourself. Make sure all copies are clear and complete. You can make copies at the courthouse, a library, or a copy center.",
          es: "Necesita hacer al menos 3 copias de cada formulario: 1 original para el tribunal, 1 copia para la otra parte (para ser notificada), y 1 copia para usted. Asegúrese de que todas las copias sean claras y completas. Puede hacer copias en el tribunal, una biblioteca o un centro de copias."
        }
      }
    ],
    questions: [
      {
        id: 'immediate_danger',
        type: 'choice',
        urgent: true,
        question: {
          en: "Are you in immediate danger?",
          es: "¿Está usted en peligro inmediato?"
        },
        options: [
          {
            value: "yes",
            label: {
              en: "Yes, I am in immediate danger",
              es: "Sí, estoy en peligro inmediato"
            }
          },
          {
            value: "no",
            label: {
              en: "No, but I need protection",
              es: "No, pero necesito protección"
            }
          }
        ]
      },
      {
        id: 'relationship',
        type: 'choice',
        question: {
          en: "What is your relationship to the person you need protection from?",
          es: "¿Cuál es su relación con la persona de la que necesita protección?"
        },
        options: [
          {
            value: "spouse",
            label: {
              en: "Current or former spouse/partner",
              es: "Cónyuge/pareja actual o anterior"
            }
          },
          {
            value: "family",
            label: {
              en: "Family member",
              es: "Familiar"
            }
          },
          {
            value: "other",
            label: {
              en: "Other relationship (use Civil Harassment)",
              es: "Otra relación (use Acoso Civil)"
            }
          }
        ]
      },
      {
        id: 'protection_type',
        type: 'choice',
        question: {
          en: "What type of protection do you need?",
          es: "¿Qué tipo de protección necesita?"
        },
        options: [
          {
            value: "emergency",
            label: {
              en: "Emergency (temporary)",
              es: "Emergencia (temporal)"
            }
          },
          {
            value: "permanent",
            label: {
              en: "Long-term order",
              es: "Orden a largo plazo"
            }
          }
        ]
      },
      {
        id: 'children_involved',
        type: 'choice',
        question: {
          en: "Are there children who also need protection?",
          es: "¿Hay niños que también necesiten protección?"
        },
        options: [
          {
            value: "yes",
            label: {
              en: "Yes, include children",
              es: "Sí, incluir a los niños"
            }
          },
          {
            value: "no",
            label: {
              en: "No, just for me",
              es: "No, solo para mí"
            }
          }
        ]
      },
      {
        id: 'support_requested',
        type: 'choice',
        question: {
          en: "Are you requesting child or spousal support?",
          es: "¿Está solicitando manutención de hijos o de cónyuge?"
        },
        options: [
          {
            value: "none",
            label: {
              en: "No support requested",
              es: "No solicito manutención"
            }
          },
          {
            value: "child",
            label: {
              en: "Child support",
              es: "Manutención de hijos"
            }
          },
          {
            value: "spousal",
            label: {
              en: "Spousal support",
              es: "Manutención de cónyuge"
            }
          },
          {
            value: "both",
            label: {
              en: "Both child and spousal",
              es: "Ambas: de hijos y de cónyuge"
            }
          }
        ]
      },
      {
        id: 'other_side_custody_requested',
        type: 'choice',
        question: {
          en: "Did the other side ask for child custody or visitation?",
          es: "¿La otra parte pidió custodia o visitas?"
        },
        options: [
          {
            value: "yes",
            label: {
              en: "Yes",
              es: "Sí"
            }
          },
          {
            value: "no",
            label: {
              en: "No",
              es: "No"
            }
          }
        ]
      },
      {
        id: 'firearms_present',
        type: 'choice',
        question: {
          en: "Do you (or the restrained person) have firearms that must be surrendered?",
          es: "¿Hay armas de fuego que deban entregarse?"
        },
        options: [
          {
            value: "yes",
            label: {
              en: "Yes",
              es: "Sí"
            }
          },
          {
            value: "no",
            label: {
              en: "No",
              es: "No"
            }
          }
        ]
      },
      {
        id: 'copies_made',
        type: 'choice',
        question: {
          en: "Have you made at least 3 copies of each form? (You need: 1 for court, 1 for the other party, 1 for yourself)",
          es: "¿Ha hecho al menos 3 copias de cada formulario? (Necesita: 1 para el tribunal, 1 para la otra parte, 1 para usted)"
        },
        options: [
          {
            value: "yes",
            label: {
              en: "Yes, I have 3 copies of each form",
              es: "Sí, tengo 3 copias de cada formulario"
            }
          },
          {
            value: "no",
            label: {
              en: "No, I need to make more copies",
              es: "No, necesito hacer más copias"
            }
          }
        ]
      },
      {
        id: 'filed_with_court',
        type: 'choice',
        question: {
          en: "Have you filed the forms with the court clerk?",
          es: "¿Ha presentado los formularios ante el secretario del tribunal?"
        },
        options: [
          {
            value: "yes",
            label: {
              en: "Yes",
              es: "Sí"
            }
          },
          {
            value: "no",
            label: {
              en: "No",
              es: "No"
            }
          }
        ]
      },
      {
        id: 'received_tro',
        type: 'choice',
        question: {
          en: "Did you receive a Temporary Restraining Order (TRO)?",
          es: "¿Recibió una Orden de Restricción Temporal (TRO)?"
        },
        options: [
          {
            value: "yes",
            label: {
              en: "Yes",
              es: "Sí"
            }
          },
          {
            value: "no",
            label: {
              en: "No",
              es: "No"
            }
          }
        ]
      },
      {
        id: 'service_method',
        type: 'choice',
        question: {
          en: "How will you serve the other party?",
          es: "¿Cómo notificará a la otra parte?"
        },
        options: [
          {
            value: "sheriff",
            label: {
              en: "Sheriff",
              es: "Sheriff"
            }
          },
          {
            value: "server",
            label: {
              en: "Process server",
              es: "Gestor de notificaciones"
            }
          },
          {
            value: "adult",
            label: {
              en: "Adult (18+) not in the case",
              es: "Adulto (18+) que no es parte"
            }
          },
          {
            value: "unknown",
            label: {
              en: "I don't know yet",
              es: "Aún no sé"
            }
          }
        ]
      },
      {
        id: 'served_other_party',
        type: 'choice',
        question: {
          en: "Has the other party been served?",
          es: "¿Se ha notificado a la otra parte?"
        },
        options: [
          {
            value: "yes",
            label: {
              en: "Yes",
              es: "Sí"
            }
          },
          {
            value: "no",
            label: {
              en: "No",
              es: "No"
            }
          }
        ]
      },
      {
        id: 'proof_of_service_filed',
        type: 'choice',
        question: {
          en: "Have you filed the Proof of Service (e.g., DV-200)?",
          es: "¿Ha presentado la Prueba de Notificación (por ej., DV-200)?"
        },
        options: [
          {
            value: "yes",
            label: {
              en: "Yes",
              es: "Sí"
            }
          },
          {
            value: "no",
            label: {
              en: "No",
              es: "No"
            }
          }
        ]
      },
      {
        id: 'hearing_date_set',
        type: 'choice',
        question: {
          en: "Do you have a court hearing date?",
          es: "¿Tiene fecha de audiencia?"
        },
        options: [
          {
            value: "yes",
            label: {
              en: "Yes",
              es: "Sí"
            }
          },
          {
            value: "no",
            label: {
              en: "No",
              es: "No"
            }
          }
        ]
      },
      {
        id: 'attended_hearing',
        type: 'choice',
        question: {
          en: "Have you already attended the hearing?",
          es: "¿Ya asistió a la audiencia?"
        },
        options: [
          {
            value: "yes",
            label: {
              en: "Yes",
              es: "Sí"
            }
          },
          {
            value: "no",
            label: {
              en: "No",
              es: "No"
            }
          }
        ]
      }
    ],
    forms: {
      domestic_violence: [
        {
          number: "DV-100",
          name: "Request for Domestic Violence Restraining Order",
          description: "Main request form",
          required: true
        },
        {
          number: "DV-110",
          name: "Temporary Restraining Order",
          description: "Judge-signed temporary protection",
          required: true
        },
        {
          number: "DV-120",
          name: "Notice of Court Hearing",
          description: "Tells the other party when to appear",
          required: true
        }
      ],
      civil_harassment: [
        {
          number: "CH-100",
          name: "Request for Civil Harassment Restraining Order",
          description: "Use for non-domestic relationships",
          required: true
        },
        {
          number: "CH-110",
          name: "Temporary Restraining Order (Civil Harassment)",
          description: "Temporary protection before hearing",
          required: true
        }
      ],
      child_related: [
        {
          number: "DV-105",
          name: "Request for Child Custody and Visitation Orders",
          description: "Include children in your request",
          required: true
        },
        {
          number: "DV-140",
          name: "Child Custody and Visitation Order",
          description: "Court order for protected children",
          required: false
        }
      ],
      proof_of_service: [
        {
          number: "DV-200",
          name: "Proof of Personal Service",
          description: "Shows the other party was served",
          required: true
        }
      ],
      support_income: [
        {
          number: "FL-150",
          name: "Income and Expense Declaration",
          description: "Required if requesting support",
          required: true
        }
      ]
    }
  },
  support: {
    title: 'Child & Spousal Support',
    icon: 'DollarSign',
    priority: 'D',
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    questions: [
      {
        id: 'support_type',
        question: "What type of support are you seeking?",
        type: "choice",
        options: [
          { value: "child", label: "Child support only", description: "Financial support for children" },
          { value: "spousal", label: "Spousal support only", description: "Financial support for a former spouse" },
          { value: "both", label: "Both child and spousal support", description: "Support for both children and a former spouse" }
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
          { value: "yes", label: "Yes, paternity is established", description: "The father is legally recognized" },
          { value: "no", label: "No, paternity needs to be established", description: "Need to establish legal fatherhood" }
        ]
      }
    ],
    forms: {
      child_support: {
        new: [
          { number: "FL-300", name: "Request for Order", description: "Official request to the court for a child support order", required: true },
          { number: "FL-150", name: "Income and Expense Declaration", description: "Detailed financial information for support calculations", required: true }
        ],
        modify: [
          { number: "FL-300", name: "Request for Order", description: "Official request to change an existing support order", required: true },
          { number: "FL-150", name: "Income and Expense Declaration", description: "Updated financial information to justify the change", required: true }
        ]
      },
      spousal_support: [
        { number: "FL-300", name: "Request for Order", description: "Official request to the court for a spousal support order", required: true },
        { number: "FL-150", name: "Income and Expense Declaration", description: "Detailed financial information for support calculations", required: true }
      ]
    }
  }
};

/**
 * Helper function to get forms based on topic and answers
 * @param {string} topicId - The key for the topic (e.g., 'divorce').
 * @param {object} answers - An object of user answers to the questions.
 * @returns {Array} - An array of form objects.
 */
export const getFormsForTopic = (topicId, answers) => {
  const topic = topics[topicId];
  if (!topic || !topic.forms) return [];

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
      // Dynamically handle the requirement of the FL-105 form
      let forms = [...topic.forms.responding];
      if (answers.children === 'no') {
        // If no children, filter out the UCCJEA form
        forms = forms.filter(form => form.number !== 'FL-105');
      } else {
        // If there are children, find the UCCJEA form and mark it as required
        const uccjeaForm = forms.find(form => form.number === 'FL-105');
        if (uccjeaForm) {
          uccjeaForm.required = true;
        }
      }
      return forms;
    }
  } else if (topicId === 'custody') {
    return topic.forms[answers.case_type] || [];
  } else if (topicId === 'restraining') {
    const { relationship, protection_type, children_involved, support_requested } = answers;

    // Base form selection: domestic violence or civil harassment
    let baseForms = [];
    if (relationship === 'spouse' || relationship === 'family') {
      if (protection_type === 'emergency') {
        // Emergency protection: only include DV-110
        baseForms = [
          { number: "DV-110", name: "Temporary Restraining Order", description: "Judge-signed temporary protection", required: true }
        ];
      } else if (protection_type === 'permanent') {
        // Long-term protection: include DV-100 and DV-120
        baseForms = [
          { number: "DV-100", name: "Request for Domestic Violence Restraining Order", description: "Main request form", required: true },
          { number: "DV-120", name: "Notice of Court Hearing", description: "Tells the other party when to appear", required: true }
        ];
      } else {
        // If user doesn't specify or selects both, include full set
        baseForms = [...topic.forms.domestic_violence];
      }
    } else {
      // Civil harassment forms
      baseForms = [...topic.forms.civil_harassment];
    }

    // Add child-related forms if children are involved
    if (children_involved === 'yes') {
      const childForms = [
        { number: "DV-105", name: "Request for Child Custody and Visitation Orders", description: "Include children in your request", required: true },
        { number: "DV-140", name: "Child Custody and Visitation Order", description: "Court order for protected children", required: false }
      ];
      // Ensure no duplicates
      const combined = [...baseForms, ...childForms];
      baseForms = [...new Map(combined.map(f => [f.number, f])).values()];
    }

    // Add support/income forms if support is requested
    if (support_requested && support_requested !== 'none') {
      const supportForms = [...topic.forms.support_income];
      const combined = [...baseForms, ...supportForms];
      baseForms = [...new Map(combined.map(f => [f.number, f])).values()];
    }

    // Always include proof of service form
    const proofForms = [...topic.forms.proof_of_service];
    const combined = [...baseForms, ...proofForms];
    baseForms = [...new Map(combined.map(f => [f.number, f])).values()];

    return baseForms;
  } else if (topicId === 'support') {
    if (answers.support_type === 'child') {
      return topic.forms.child_support[answers.case_status] || [];
    } else if (answers.support_type === 'spousal') {
      return topic.forms.spousal_support;
    } else {
      // Both child and spousal support - combine lists and remove duplicates
      const childForms = topic.forms.child_support[answers.case_status] || [];
      const spousalForms = topic.forms.spousal_support || [];
      const combinedForms = [...childForms, ...spousalForms];

      // Use a Map to ensure each form is unique by its 'number' property
      const uniqueForms = [
        ...new Map(combinedForms.map(form => [form.number, form])).values()
      ];
      return uniqueForms;
    }
  }
  
  return [];
};

/**
 * Helper function to get next steps based on topic and answers
 * @param {string} topicId - The key for the topic (e.g., 'divorce').
 * @param {object} answers - An object of user answers to the questions.
 * @returns {Array} - An array of step objects.
 */
export const getNextStepsForTopic = (topicId, answers) => {
  // Special case for immediate danger takes priority
  if (topicId === 'restraining' && answers.immediate_danger === 'yes') {
    return [
      { title: 'Call 911 immediately', description: 'If you are in immediate danger, your first priority is safety. Call 911 for emergency assistance.' },
      { title: 'Go to a safe location', description: 'Leave the area if you can. Go to a police station, a friend\'s house, or a domestic violence shelter.' },
      { title: 'Request an Emergency Protective Order (EPO)', description: 'The police can request an EPO from a judge on your behalf, which provides immediate, temporary protection.' },
      { title: 'Complete restraining order forms', description: 'Once you are safe, fill out the DV-100 (Request for Domestic Violence Restraining Order) to get a longer-lasting order.' },
      { title: 'File with the court clerk immediately', description: 'Take the completed forms to the courthouse clerk\'s office for immediate filing to get a Temporary Restraining Order (TRO).' }
    ];
  }

  const stepsByTopic = {
    restraining: [
      { title: 'Complete restraining order forms', description: 'Fill out the DV-100 (Request for Domestic Violence Restraining Order) or CH-100 (Civil Harassment) completely and accurately.' },
      { title: 'Make copies of all forms', description: 'Make at least 3 copies of each form: 1 original for the court, 1 copy for the other party, and 1 copy for yourself. Ensure all copies are clear and complete.' },
      { title: 'File forms with the court clerk', description: 'Take the completed forms to the courthouse clerk\'s office. There is no fee to file a DVRO.' },
      { title: 'Get your Temporary Restraining Order (TRO)', description: 'The clerk will give your forms to a judge. If approved, you will get a TRO that is valid until your court hearing.' },
      { title: 'Serve the other party', description: 'Have someone who is 18 or older (NOT you) serve the other party with copies of all filed documents at least 5 days before the hearing.' },
      { title: 'File proof of service', description: 'The server must fill out a Proof of Service form (like DV-200) and you must file it with the court before your hearing.' },
      { title: 'Attend your court hearing', description: 'Attend the scheduled hearing with all your evidence and witnesses. A judge will decide whether to grant a long-term order.' }
    ],
    divorce: [
      { title: 'Complete initial divorce forms', description: 'Fill out the FL-100 (Petition) and FL-110 (Summons) completely. If you have children, also complete the FL-105 (UCCJEA).' },
      { title: 'File with the court clerk', description: 'Submit original forms to the family law clerk\'s office with filing fee.' },
      { title: 'Serve your spouse', description: 'Have someone (18+ years) serve your spouse with copies of all filed documents.' },
      { title: 'File proof of service', description: 'Submit proof of service within 60 days of filing.' },
      { title: 'Complete financial disclosures', description: 'Fill out FL-150 (Income and Expense) and FL-142 (Assets and Debts) forms.' },
      { title: 'Attend court hearings', description: 'Attend all scheduled hearings and mediation sessions.' }
    ],
    custody: [
      { title: 'Complete custody petition', description: 'Fill out FL-200 (Petition to Establish Parental Relationship) form completely.' },
      { title: 'File with court clerk', description: 'Submit original forms to the family law clerk\'s office.' },
      { title: 'Serve the other parent', description: 'Have someone (18 years) serve the other parent with copies of all documents.' },
      { title: 'File proof of service', description: 'Submit proof of service within 60 days of filing.' },
      { title: 'Attend mediation', description: 'Attend court-ordered mediation to try to resolve custody disputes.' },
      { title: 'Attend court hearings', description: 'Attend all scheduled hearings and follow court orders.' }
    ],
    support: [
      { title: 'Complete support petition', description: 'Fill out FL-300 (Request for Order) form completely.' },
      { title: 'File with court clerk', description: 'Submit original forms to the family law clerk\'s office.' },
      { title: 'Serve the other party', description: 'Have someone (18+ years) serve the other party with copies of all documents.' },
      { title: 'File proof of service', description: 'Submit proof of service within 60 days of filing.' },
      { title: 'Complete financial disclosures', description: 'Fill out FL-150 (Income and Expense Declaration) with current financial information.' },
      { title: 'Attend court hearings', description: 'Attend all scheduled hearings and follow court orders.' }
    ]
  };

  return stepsByTopic[topicId] || [];
};

/**
 * Helper function to get information sections for a topic
 * @param {string} topicId - The key for the topic (e.g., 'restraining').
 * @returns {Array} - An array of information objects.
 */
export const getInfoForTopic = (topicId) => {
  const topic = topics[topicId];
  return topic?.info || [];
}; 