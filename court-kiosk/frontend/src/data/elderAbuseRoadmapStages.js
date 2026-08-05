// Stage groupings for the Elder or Dependent Adult Abuse Restraining Order
// roadmap overview. Node IDs map into frontend/public/data/elder-abuse-flow.json.
// EA_Respond and EA_Renew are orphaned in the source data (no incoming edges)
// and out of scope here regardless.

export const ELDER_ABUSE_ROADMAP_STAGES = [
  {
    id: 'get-started',
    number: 1,
    icon: 'Shield',
    label: { en: 'Get Started', es: 'Comience Aquí' },
    description: {
      en: 'This order protects someone who is elderly (65 or older) or a dependent adult (18-64 with a disability) from abuse, neglect, or abandonment. It can be requested by the elder or dependent adult themselves, or by their conservator, attorney, or a representative.',
      es: 'Esta orden protege a alguien que es mayor (65 años o más) o un adulto dependiente (18-64 años con una discapacidad) del abuso, negligencia o abandono. Puede ser solicitada por el propio adulto mayor o dependiente, o por su tutor, abogado o representante.'
    },
    nodeIds: ['EA_Start', 'EA1', 'EA2', 'EA3', 'EA4', 'EA5', 'EA6'],
    videoUrl: null,
    eligibilityNote: {
      en: "This order is specifically for elder or dependent-adult abuse — the protected person must be 65+ or a dependent adult with a disability. If that's not your situation, a different restraining order type will fit better.",
      es: 'Esta orden es específicamente para el abuso de personas mayores o adultos dependientes — la persona protegida debe tener 65 años o más, o ser un adulto dependiente con una discapacidad. Si esa no es su situación, un tipo de orden de restricción diferente se ajustará mejor.'
    }
  },
  {
    id: 'fill-out-forms',
    number: 2,
    icon: 'FileText',
    label: { en: 'Fill Out Your Forms', es: 'Complete Sus Formularios' },
    description: {
      en: 'You’ll fill out the request form along with a confidential information form for law enforcement and a notice form for the other person. There’s no court filing fee for this type of order.',
      es: 'Completará el formulario de solicitud junto con un formulario de información confidencial para la policía y un formulario de aviso para la otra persona. No hay cuota de presentación judicial para este tipo de orden.'
    },
    nodeIds: ['EA_Step1', 'EA_Forms', 'EA_NoFee'],
    videoUrl: null
  },
  {
    id: 'file-with-clerk',
    number: 3,
    icon: 'Scale',
    label: { en: 'File with the Clerk', es: 'Presente con el Secretario' },
    description: {
      en: 'Make at least two copies of everything — one for you, one for the other person, with the original for the court — then take your paperwork to the Probate Clerk’s Office.',
      es: 'Haga al menos dos copias de todo — una para usted, una para la otra persona, con el original para el tribunal — y luego lleve sus documentos a la Oficina del Secretario de Sucesiones (Probate).'
    },
    nodeIds: ['EA_Step2', 'EA_Copies', 'EA_Step3'],
    videoUrl: null
  },
  {
    id: 'temporary-order',
    number: 4,
    icon: 'Clock',
    label: { en: 'Get Your Temporary Order', es: 'Obtenga Su Orden Temporal' },
    description: {
      en: 'The clerk sends your paperwork to a judge for review. If the judge grants a temporary order, they’ll sign it and set your court hearing date.',
      es: 'El secretario envía sus documentos a un juez para su revisión. Si el juez otorga una orden temporal, la firmará y fijará la fecha de su audiencia en el tribunal.'
    },
    nodeIds: ['EA_JudgeReview'],
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
    nodeIds: ['EA_Step4', 'EA_Service'],
    videoUrl: null
  },
  {
    id: 'hearing',
    number: 6,
    icon: 'Calendar',
    label: { en: 'Your Hearing', es: 'Su Audiencia' },
    description: {
      en: 'You go to court on the hearing date listed on your notice form and explain to the judge why the order is needed.',
      es: 'Va a la corte en la fecha de audiencia indicada en su formulario de aviso y le explica al juez por qué se necesita la orden.'
    },
    nodeIds: ['EA_Step5'],
    videoUrl: null
  },
  {
    id: 'after-the-order',
    number: 7,
    icon: 'CheckCircle',
    label: { en: 'After the Order', es: 'Después de la Orden' },
    description: {
      en: 'If the judge grants the restraining order after the hearing, a signed long-term order is issued — keep a copy with you and give copies to law enforcement.',
      es: 'Si el juez otorga la orden de restricción después de la audiencia, se emite una orden firmada a largo plazo — mantenga una copia con usted y entregue copias a la policía.'
    },
    nodeIds: ['EA_AfterHearing'],
    videoUrl: null
  }
];
