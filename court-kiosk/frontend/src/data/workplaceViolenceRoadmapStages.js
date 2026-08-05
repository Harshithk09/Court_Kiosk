// Stage groupings for the Workplace Violence Restraining Order roadmap overview.
// Node IDs map into frontend/public/data/workplace-violence-flow.json.
// WV1-WV7 are only reachable after fixing a reversed edge in that file
// (WV_Start -> WV1 ... WV7 -> WV_Step1) — see the flow JSON edge fix.
// WV_Respond is orphaned in the source data (no incoming edges) and out of
// scope here regardless.

export const WORKPLACE_VIOLENCE_ROADMAP_STAGES = [
  {
    id: 'get-started',
    number: 1,
    icon: 'Shield',
    label: { en: 'Get Started', es: 'Comience Aquí' },
    description: {
      en: 'Only an employer — not an individual employee — can ask for this order, to protect one or more employees from someone who has stalked, harassed, threatened, or been violent at the workplace.',
      es: 'Solo un empleador — no un empleado individual — puede solicitar esta orden, para proteger a uno o más empleados de alguien que ha acosado, amenazado o sido violento en el lugar de trabajo.'
    },
    nodeIds: ['WV_Start', 'WV1', 'WV2', 'WV3', 'WV4', 'WV5', 'WV6', 'WV7'],
    videoUrl: null,
    eligibilityNote: {
      en: 'This order can only be requested by an employer, not by an employee on their own behalf. If you\'re an employee looking for protection yourself, a different restraining order type will fit better.',
      es: 'Esta orden solo puede ser solicitada por un empleador, no por un empleado en su propio nombre. Si usted es un empleado que busca protección para sí mismo, un tipo de orden de restricción diferente se ajustará mejor.'
    }
  },
  {
    id: 'fill-out-forms',
    number: 2,
    icon: 'FileText',
    label: { en: 'Fill Out Your Forms', es: 'Complete Sus Formularios' },
    description: {
      en: 'You’ll fill out the required San Mateo County packet, including a notice sheet, information sheet, civil case cover sheet, and a confidential information form for law enforcement.',
      es: 'Completará el paquete requerido del condado de San Mateo, incluyendo una hoja de aviso, hoja de información, portada de caso civil, y un formulario de información confidencial para la policía.'
    },
    nodeIds: ['WV_Step1', 'WV_Forms'],
    videoUrl: null
  },
  {
    id: 'temporary-order',
    number: 3,
    icon: 'Clock',
    label: { en: 'Get Your Temporary Order', es: 'Obtenga Su Orden Temporal' },
    description: {
      en: 'In San Mateo, a judge reviews these requests in person before filing, during Civil Ex Parte hours (weekdays at 2:00pm) — you must be in the courtroom by then. The judge decides whether to grant a temporary order and set a hearing date, or deny the request.',
      es: 'En San Mateo, un juez revisa estas solicitudes en persona antes de presentarlas, durante el horario de Ex Parte Civil (entre semana a las 2:00pm) — debe estar en la sala del tribunal para esa hora. El juez decide si otorga una orden temporal y fija una fecha de audiencia, o niega la solicitud.'
    },
    nodeIds: ['WV_Step2', 'WV_ExParteRules', 'WV_JudgeDecision'],
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
    nodeIds: ['WV_FileAfter'],
    videoUrl: null
  },
  {
    id: 'serve-papers',
    number: 5,
    icon: 'Send',
    label: { en: 'Serve the Other Person', es: 'Notifique a la Otra Persona' },
    description: {
      en: 'Someone else — not you, and 18 or older — must formally deliver the papers to the other person. The San Mateo County Sheriff will attempt this service free of charge.',
      es: 'Otra persona — no usted, y mayor de 18 años — debe entregar formalmente los documentos a la otra persona. El alguacil del condado de San Mateo intentará esta notificación sin costo.'
    },
    nodeIds: ['WV_Step4', 'WV_Service'],
    videoUrl: null
  },
  {
    id: 'hearing',
    number: 6,
    icon: 'Calendar',
    label: { en: 'Your Hearing', es: 'Su Audiencia' },
    description: {
      en: 'You go to court on the hearing date listed on your notice form. If granted, the order can include no-contact, stay-away, and firearm-surrender terms.',
      es: 'Va a la corte en la fecha de audiencia indicada en su formulario de aviso. Si se otorga, la orden puede incluir términos de no contacto, alejamiento y entrega de armas de fuego.'
    },
    nodeIds: ['WV_Step5', 'WV_AfterHearing'],
    videoUrl: null
  }
];
