// High-level divorce journey stages for ProcessJourneyBar.
// Node IDs map into public/data/divorce_flow.json.

export const DIVORCE_ROADMAP_STAGES = [
  {
    id: 'get-started',
    number: 1,
    icon: 'Shield',
    label: { en: 'Get Started', es: 'Comience Aquí' },
    description: {
      en: 'Choose what you need help with — starting a case, responding, or another divorce-related step.',
      es: 'Elija en qué necesita ayuda: iniciar un caso, responder u otro paso relacionado con el divorcio.'
    },
    nodeIds: ['A', 'A1', 'A2', 'A3', 'Pet_Start'],
    videoUrl: null
  },
  {
    id: 'petition-forms',
    number: 2,
    icon: 'FileText',
    label: { en: 'Petition & Forms', es: 'Petición y Formularios' },
    description: {
      en: 'Prepare FL-100, FL-110, and related starter forms. Children or fee waivers may add more forms.',
      es: 'Prepare FL-100, FL-110 y formularios iniciales. Hijos o exención de cuotas pueden agregar más.'
    },
    nodeIds: ['LS_STEPS', 'B1', 'B4', 'FL2', 'BRV1', 'B5'],
    videoUrl: null
  },
  {
    id: 'file-serve',
    number: 3,
    icon: 'Scale',
    label: { en: 'File & Serve', es: 'Presente y Notifique' },
    description: {
      en: 'File with the clerk, then have the other party properly served. Deadlines matter.',
      es: 'Presente ante el secretario y notifique correctamente a la otra parte. Los plazos importan.'
    },
    nodeIds: ['S0a', 'P1', 'P6', 'P7', 'P10', 'MAIL_NAR', 'Submit', 'SD30', 'SD33'],
    videoUrl: null
  },
  {
    id: 'disclosures',
    number: 4,
    icon: 'ClipboardList',
    label: { en: 'Disclosures', es: 'Divulgaciones' },
    description: {
      en: 'Exchange financial disclosures (FL-140 / FL-150 and related) as required.',
      es: 'Intercambie divulgaciones financieras (FL-140 / FL-150 y relacionados) según se requiera.'
    },
    nodeIds: ['PDD', 'PDD2', 'PDD5', 'PDD6', 'PDD7', 'SD12', 'SD13', 'RPDD'],
    videoUrl: null
  },
  {
    id: 'finish',
    number: 5,
    icon: 'CheckCircle',
    label: { en: 'Finish Your Case', es: 'Termine Su Caso' },
    description: {
      en: 'Complete judgment paperwork and remaining steps with Self-Help review as needed.',
      es: 'Complete los documentos de sentencia y pasos restantes con revisión de Autoayuda si es necesario.'
    },
    nodeIds: ['ReviewJudgment', 'DCoreForms', 'DefaultCheck', 'F9', 'F10', 'E4', 'E5'],
    videoUrl: null
  }
];
