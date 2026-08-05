// Stage groupings for the DVRO "ask for a new restraining order" roadmap overview.
// Node IDs map into frontend/public/data/dv_flow_combined.json (the DV1 branch only —
// Respond/Modify/Renew are separate journeys in that file and are not covered here).
// videoUrl stays null until a real video exists for that stage; the UI hides the
// "Watch video" action while it's null rather than shipping a dead button.

export const DVRO_ROADMAP_STAGES = [
  {
    id: 'get-started',
    number: 1,
    icon: 'Shield',
    label: { en: 'Get Started', es: 'Comience Aquí' },
    description: {
      en: 'First, we check that a restraining order is the right fit for your situation — for example, that you have the kind of relationship with the other person (spouse, partner, co-parent, close relative) that this type of order covers. If it turns out a different type fits better, we’ll point you to it.',
      es: 'Primero, verificamos que una orden de restricción sea adecuada para su situación — por ejemplo, que tenga el tipo de relación con la otra persona (cónyuge, pareja, co-padre, familiar cercano) que cubre este tipo de orden. Si otro tipo se ajusta mejor, le mostraremos cuál.'
    },
    nodeIds: ['DVROStart', 'Note', 'DV0', 'DV1', 'DVCheck1', 'DVCheck2', 'DVCheck3', 'DVStart', 'DVTiming'],
    videoUrl: null,
    eligibilityNote: {
      en: "If this doesn't fit your situation (for example, you don't qualify, or your case fits a different order type better), we'll point you to other options before you continue.",
      es: 'Si esto no se ajusta a su situación (por ejemplo, no califica, o su caso encaja mejor en otro tipo de orden), le mostraremos otras opciones antes de continuar.'
    }
  },
  {
    id: 'fill-out-forms',
    number: 2,
    icon: 'FileText',
    label: { en: 'Fill Out Your Forms', es: 'Complete Sus Formularios' },
    description: {
      en: 'You’ll fill out a core set of court forms describing what happened and what protection you’re asking for. We’ll walk you through each one and generate a guide to help you fill them out.',
      es: 'Completará un conjunto básico de formularios judiciales que describen lo que pasó y qué protección está solicitando. Le guiaremos por cada uno y generaremos una guía para ayudarle a completarlos.'
    },
    nodeIds: ['DVForms', 'DVFormOverview', 'DVInstructionGuide', 'DVPacketStep'],
    videoUrl: null
  },
  {
    id: 'file-with-clerk',
    number: 3,
    icon: 'Scale',
    label: { en: 'File with the Clerk', es: 'Presente con el Secretario' },
    description: {
      en: 'You can also ask for extra protections here, like child custody, child support, or spousal support, if they apply. Once your forms are ready, you take them to the court clerk to officially file your case — this starts your case with the court.',
      es: 'También puede solicitar protecciones adicionales aquí, como custodia de menores, manutención infantil o manutención conyugal, si corresponden. Una vez que sus formularios estén listos, los lleva al secretario del tribunal para presentar oficialmente su caso — esto inicia su caso con el tribunal.'
    },
    nodeIds: [
      'DVOptional', 'DVCustody', 'AbductionCheck', 'AbductionCheck2', 'Abd3',
      'DVCustodyInfo', 'DVCustodyHelp', 'DVChildSupport', 'DVChildSupportInfo',
      'DVChildSupportExplain', 'DVSpousalSupport', 'DVSpousalSupportForms',
      'DVSpousalSupportExplain', 'DVReview', 'DVPickup'
    ],
    videoUrl: null
  },
  {
    id: 'temporary-order',
    number: 4,
    icon: 'Clock',
    label: { en: 'Get Your Temporary Order', es: 'Obtenga Su Orden Temporal' },
    description: {
      en: 'A judge reviews your request, often within about a business day, and decides whether to grant a temporary restraining order right away while your case is pending. This gives you protection before your full hearing.',
      es: 'Un juez revisa su solicitud, a menudo dentro de aproximadamente un día hábil, y decide si otorga una orden de restricción temporal de inmediato mientras su caso está pendiente. Esto le brinda protección antes de su audiencia completa.'
    },
    nodeIds: ['DVRead', 'DVCheckOrders', 'DVTROYes', 'DVTRONo'],
    videoUrl: null
  },
  {
    id: 'serve-papers',
    number: 5,
    icon: 'Send',
    label: { en: 'Serve the Other Person', es: 'Notifique a la Otra Persona' },
    description: {
      en: 'The other person has to be formally given a copy of your papers by someone else — not you — either the sheriff or another adult. We’ll help you figure out which option fits your situation and what to do next.',
      es: 'La otra persona debe recibir formalmente una copia de sus documentos por otra persona — no usted — ya sea el alguacil u otro adulto. Le ayudaremos a determinar qué opción se ajusta a su situación y qué hacer después.'
    },
    nodeIds: [
      'DVServePrep', 'ServeWho', 'SERStart', 'SER1', 'SER2', 'SER3', 'SER4',
      'SERSoon', 'SERGather', 'SERPacket', 'SERDeliver', 'SERConfirm',
      'SheriffReturn', 'SheriffServed', 'SheriffFailed', 'SheriffCheck',
      'SheriffFiling', 'SheriffCopy',
      'AltStart', 'AltSafety', 'AltDeadline', 'AltPapers', 'AltDV200',
      'AltServe', 'AltRefuse', 'AltReturn', 'AltFile', 'AltTRO'
    ],
    videoUrl: null
  },
  {
    id: 'hearing',
    number: 6,
    icon: 'Calendar',
    label: { en: 'Your Hearing', es: 'Su Audiencia' },
    description: {
      en: 'Both you and the other person go before a judge, who listens to both sides and decides whether to grant a long-term restraining order. Bring any evidence and be ready to explain what happened in your own words.',
      es: 'Tanto usted como la otra persona se presentan ante un juez, quien escucha a ambas partes y decide si otorga una orden de restricción a largo plazo. Traiga cualquier evidencia y esté listo para explicar lo que pasó con sus propias palabras.'
    },
    nodeIds: ['Attendhearing'],
    videoUrl: null
  },
  {
    id: 'after-the-order',
    number: 7,
    icon: 'CheckCircle',
    label: { en: 'After the Order', es: 'Después de la Orden' },
    description: {
      en: 'If the judge grants your order, keep a copy with you at all times and give copies to local police. Your order can later be renewed before it expires, or changed if your situation changes.',
      es: 'Si el juez otorga su orden, mantenga una copia con usted en todo momento y entregue copias a la policía local. Su orden puede renovarse más tarde antes de que expire, o cambiarse si su situación cambia.'
    },
    nodeIds: ['DVEnd'],
    videoUrl: null
  }
];

// Node IDs that are eligibility "exits" out of the New DVRO path rather than forward
// progress — surfaced as a short note on Stage 1, not as their own stages.
export const DVRO_ROADMAP_EXIT_NODE_IDS = ['DVNotQual', 'DVAlt', 'DVMinor'];
