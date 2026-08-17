// Stage groupings for the CHRO "ask for a new civil harassment restraining order"
// roadmap overview. Node IDs map into
// frontend/public/data/civil-harassment-flow.json (CH1 / new-request branch).
// Respond (CH2), Change/End (CH3), and Renew (CH5) are separate guided branches
// in that same file with their own end nodes.

export const CHRO_ROADMAP_STAGES = [
  {
    id: 'get-started',
    number: 1,
    icon: 'Shield',
    label: { en: 'Get Started', es: 'Comience Aquí' },
    description: {
      en: 'First, we check that a civil harassment restraining order is the right fit — this type is for people who are NOT closely related to you, like a neighbor, coworker, or stranger. If your situation is closer to home, we’ll point you to the right order type instead.',
      es: 'Primero, verificamos que una orden de restricción por acoso civil sea adecuada — este tipo es para personas que NO tienen una relación cercana con usted, como un vecino, compañero de trabajo o desconocido. Si su situación es más cercana, le mostraremos el tipo de orden correcto.'
    },
    nodeIds: ['CHROStart', 'Note', 'CH0', 'CH1', 'CHCheck1', 'CHCheck2', 'CHCheck3', 'CHStart', 'CHTiming'],
    videoUrl: null,
    eligibilityNote: {
      en: "This order is only for harassment from someone you're NOT closely related to (not a spouse, partner, or close family member). If that's not your situation, we'll point you to a different order type before you continue.",
      es: 'Esta orden es solo para acoso de alguien con quien NO tiene una relación cercana (no un cónyuge, pareja o familiar cercano). Si esa no es su situación, le mostraremos un tipo de orden diferente antes de continuar.'
    }
  },
  {
    id: 'fill-out-forms',
    number: 2,
    icon: 'FileText',
    label: { en: 'Fill Out Your Forms', es: 'Complete Sus Formularios' },
    description: {
      en: 'You’ll describe the harassment in detail — dates, times, and what happened — across a core set of court forms, plus a confidential information form for law enforcement. We’ll walk you through each one and help you review everything for completeness before you file.',
      es: 'Describirá el acoso en detalle — fechas, horas y lo que sucedió — en un conjunto básico de formularios judiciales, además de un formulario de información confidencial para la policía. Le guiaremos por cada uno y le ayudaremos a revisar todo antes de presentar.'
    },
    nodeIds: [
      'CHForms', 'CH100a', 'CH100b', 'CH100c', 'CH109a', 'CH110a', 'CM010a',
      'CHReview', 'CHOptional', 'CHPickup', 'CHRead'
    ],
    videoUrl: null
  },
  {
    id: 'temporary-order',
    number: 3,
    icon: 'Clock',
    label: { en: 'Get Your Temporary Order', es: 'Obtenga Su Orden Temporal' },
    description: {
      en: 'You can ask a judge for a temporary restraining order that takes effect right away, while you wait for your full hearing. If you don’t ask for one, you’ll get a hearing date and the order won’t take effect until after the hearing.',
      es: 'Puede pedirle a un juez una orden de restricción temporal que entre en vigor de inmediato, mientras espera su audiencia completa. Si no la solicita, recibirá una fecha de audiencia y la orden no entrará en vigor hasta después de la audiencia.'
    },
    nodeIds: ['CHCheckOrders', 'CHTROYes', 'CHTRONo'],
    videoUrl: null
  },
  {
    id: 'prepare-to-serve',
    number: 4,
    icon: 'Send',
    label: { en: 'Prepare to Serve', es: 'Prepárese Para Notificar' },
    description: {
      en: 'After filing, someone else — not you — has to formally give the other person a copy of your papers. We’ll help you figure out who can do this for you before you get to the clerk’s window.',
      es: 'Después de presentar, otra persona — no usted — debe entregar formalmente una copia de sus documentos a la otra persona. Le ayudaremos a determinar quién puede hacer esto por usted antes de llegar a la ventanilla del secretario.'
    },
    nodeIds: ['CHServePrep', 'ServeWho', 'SERStart', 'SER1', 'SER2', 'SER3', 'SERSoon', 'SERGather', 'AltStart'],
    videoUrl: null
  },
  {
    id: 'file-with-clerk',
    number: 5,
    icon: 'Scale',
    label: { en: 'File with the Clerk', es: 'Presente con el Secretario' },
    description: {
      en: 'You take your completed forms to the court clerk to officially file your case. There’s a filing fee, but you can ask for a fee waiver if paying it would be a financial hardship.',
      es: 'Lleva sus formularios completados al secretario del tribunal para presentar oficialmente su caso. Hay una cuota de presentación, pero puede solicitar una exención si pagarla sería una dificultad financiera.'
    },
    nodeIds: ['CHFiling', 'CHFeeWaiver', 'CHFeeWaiverYes', 'CHFeeWaiverNo'],
    videoUrl: null
  },
  {
    id: 'hearing',
    number: 6,
    icon: 'Calendar',
    label: { en: 'Your Hearing', es: 'Su Audiencia' },
    description: {
      en: 'You attend your hearing and explain to the judge why you need the restraining order — bring any evidence you have. If the judge grants it, get copies for yourself and for local law enforcement.',
      es: 'Asiste a su audiencia y le explica al juez por qué necesita la orden de restricción — traiga cualquier evidencia que tenga. Si el juez la otorga, obtenga copias para usted y para la policía local.'
    },
    nodeIds: ['CHHearing', 'CHOrder'],
    videoUrl: null
  },
  {
    id: 'after-the-order',
    number: 7,
    icon: 'CheckCircle',
    label: { en: 'After the Order', es: 'Después de la Orden' },
    description: {
      en: 'The signed order still needs to be served on the other person, with proof filed with the court. If they violate the order afterward, call 911 right away and keep a record of every violation.',
      es: 'La orden firmada todavía debe notificarse a la otra persona, con prueba presentada ante el tribunal. Si la viola después, llame al 911 de inmediato y mantenga un registro de cada violación.'
    },
    nodeIds: ['CHServeOrder', 'CHViolation', 'CHNewEnd'],
    videoUrl: null
  }
];
