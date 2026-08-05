// Stage groupings for the GVRO "ask for a new Gun Violence Restraining Order"
// roadmap overview. Node IDs map into frontend/public/data/gvro-flow.json.
// GVRO_Respond (the "respond to a GVRO" branch) is orphaned in the source data
// (no incoming edges) and out of scope here regardless.

export const GVRO_ROADMAP_STAGES = [
  {
    id: 'get-started',
    number: 1,
    icon: 'Shield',
    label: { en: 'Get Started', es: 'Comience Aquí' },
    description: {
      en: 'A GVRO temporarily stops someone from owning, buying, or possessing firearms, ammunition, or body armor if they may be dangerous. Only certain people can request one — law enforcement, or an immediate family member.',
      es: 'Una GVRO detiene temporalmente que alguien posea, compre o tenga armas de fuego, municiones o chalecos antibalas si puede ser peligroso. Solo ciertas personas pueden solicitarla — la policía, o un familiar inmediato.'
    },
    nodeIds: ['GVRO_Start', 'GVRO_What', 'GVRO_Who', 'GVRO_Limit'],
    videoUrl: null,
    eligibilityNote: {
      en: "A GVRO only covers firearms, ammunition, and body armor — it does NOT include stay-away or no-contact orders. If you need those kinds of protection too, you may need a different restraining order in addition to this one.",
      es: 'Una GVRO solo cubre armas de fuego, municiones y chalecos antibalas — NO incluye órdenes de alejamiento o de no contacto. Si también necesita esos tipos de protección, es posible que necesite una orden de restricción diferente además de esta.'
    }
  },
  {
    id: 'fill-out-forms',
    number: 2,
    icon: 'FileText',
    label: { en: 'Fill Out Your Forms', es: 'Complete Sus Formularios' },
    description: {
      en: 'You’ll fill out the request form along with a confidential information form for law enforcement and a notice form for the other person. We’ll walk you through the full packet.',
      es: 'Completará el formulario de solicitud junto con un formulario de información confidencial para la policía y un formulario de aviso para la otra persona. Le guiaremos por todo el paquete.'
    },
    nodeIds: ['GVRO_FormsStart', 'GVRO_FormList'],
    videoUrl: null
  },
  {
    id: 'temporary-order',
    number: 3,
    icon: 'Clock',
    label: { en: 'Get Your Temporary Order', es: 'Obtenga Su Orden Temporal' },
    description: {
      en: 'In San Mateo, a judge reviews GVRO requests in person before filing, during Civil Ex Parte hours (weekdays at 2:00pm) — you must be in the courtroom by then. The judge decides whether to grant a temporary order and set a hearing date, or deny the request.',
      es: 'En San Mateo, un juez revisa las solicitudes de GVRO en persona antes de presentarlas, durante el horario de Ex Parte Civil (entre semana a las 2:00pm) — debe estar en la sala del tribunal para esa hora. El juez decide si otorga una orden temporal y fija una fecha de audiencia, o niega la solicitud.'
    },
    nodeIds: ['GVRO_SMCReview', 'GVRO_SMCReviewTime', 'GVRO_JudgeDecision'],
    videoUrl: null
  },
  {
    id: 'file-with-clerk',
    number: 4,
    icon: 'Scale',
    label: { en: 'File with the Clerk', es: 'Presente con el Secretario' },
    description: {
      en: 'After the judge reviews and signs your forms, you file them with the court clerk as directed.',
      es: 'Después de que el juez revise y firme sus formularios, los presenta con el secretario del tribunal según se le indique.'
    },
    nodeIds: ['GVRO_FileAfter'],
    videoUrl: null
  },
  {
    id: 'serve-papers',
    number: 5,
    icon: 'Send',
    label: { en: 'Serve the Other Person', es: 'Notifique a la Otra Persona' },
    description: {
      en: 'Someone else — not you, and 18 or older — must formally deliver the papers to the other person. The San Mateo County Sheriff will attempt this service for you.',
      es: 'Otra persona — no usted, y mayor de 18 años — debe entregar formalmente los documentos a la otra persona. El alguacil del condado de San Mateo intentará esta notificación por usted.'
    },
    nodeIds: ['GVRO_ServiceStart', 'GVRO_ServiceRules'],
    videoUrl: null
  },
  {
    id: 'hearing',
    number: 6,
    icon: 'Calendar',
    label: { en: 'Your Hearing', es: 'Su Audiencia' },
    description: {
      en: 'You go to court on the hearing date listed on your notice form. The judge decides whether to issue a longer GVRO, which can last up to 5 years.',
      es: 'Va a la corte en la fecha de audiencia indicada en su formulario de aviso. El juez decide si emite una GVRO más larga, que puede durar hasta 5 años.'
    },
    nodeIds: ['GVRO_Hearing', 'GVRO_LongTerm'],
    videoUrl: null
  }
];
