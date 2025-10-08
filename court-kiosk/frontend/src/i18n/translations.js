export const supportedLanguages = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'es', label: 'Español', shortLabel: 'ES' },
  { code: 'zh', label: '中文', shortLabel: '中文' }
];

export const fallbackLanguage = 'en';

const translations = {
  en: {
    common: {
      appName: 'San Mateo Family Court',
      appSubtitle: 'Self-Service Kiosk',
      secureLabel: 'Secure',
      secureSessionLabel: 'Secure Session',
      languageSelectorLabel: 'Language',
      languageSelectorAriaLabel: 'Select language'
    },
    navigation: {
      home: 'Home',
      homeDescription: 'Main kiosk interface',
      dvroFlow: 'DVRO Flow',
      dvroDescription: 'Domestic Violence Restraining Order guide',
      divorceFlow: 'Divorce Flow',
      divorceDescription: 'Divorce process guide',
      admin: 'Admin',
      adminDescription: 'Administrative dashboard',
      attorney: 'Attorney',
      attorneyDescription: 'Attorney tools',
      footerTagline: 'Enhanced DVRO System'
    },
    userKiosk: {
      headerTitle: 'Family Law Self-Help Kiosk',
      headerSubtitle: 'Select Your Case Type',
      heroTitle: 'Select Your Case Type',
      heroDescription: 'Choose the category that best describes your legal matter.',
      caseTypes: {
        A: {
          title: 'Domestic Violence',
          description: 'Restraining orders, protection orders, emergency cases.'
        },
        B: {
          title: 'Child Custody & Support',
          description: 'Child custody, support, visitation rights.'
        },
        C: {
          title: 'Divorce & Separation',
          description: 'Divorce, legal separation, serving papers, next steps.'
        },
        D: {
          title: 'Other Family Law',
          description: 'Parentage, guardianship, name change, and more.'
        }
      },
      queueAssignedTitle: 'Queue Number Assigned',
      queueAssignedSubtitle: 'Please wait to be called',
      queueNumberLabel: 'YOUR QUEUE NUMBER',
      priorityLevel: 'Priority {{value}}',
      caseSummaryLabel: 'Case Summary',
      nextStepsLabel: 'Next Steps',
      waitMessageHeading: 'Please wait to be called',
      waitMessageBody: "A facilitator will call your number when it's your turn. Please have a seat and wait.",
      startOver: 'Start Over',
      tileCallToAction: 'Tap to choose',
      emergencyTitle: 'Emergency Help',
      emergencyMessage: 'If you are in immediate danger, call 911. For same-day DVRO assistance, visit the Self-Help Center.',
      locationLine1: 'Hall of Justice, 400 County Center, 6th Floor',
      locationLine2: 'Mon–Fri · 8:00–12:00, 1:30–3:00',
      locationLine3: 'Self-Help Center',
      footer: 'San Mateo Superior Court © {{year}} · Family Law Self-Help Center',
      processing: 'Processing...'
    },
    dvro: {
      loading: 'Loading application...',
      loadError: 'Failed to load application data',
      tryAgain: 'Try Again',
      backToHome: 'Back to Home',
      clinicName: 'Family Court Clinic',
      heroTitle: 'Domestic Violence Restraining Orders',
      heroDescription: "Get help applying for a restraining order. We'll guide you step by step with information and specific forms.",
      emergencyNotice: 'If you are in immediate danger, call 911.',
      emergencyAction: 'You can now begin your application.',
      startApplication: 'Start Application',
      startDetails: 'Free and confidential • 15-20 minutes',
      quickInfo: [
        {
          title: 'Information',
          description: 'Learn about the legal process, your rights, and the options available for your specific situation.'
        },
        {
          title: 'Questions',
          description: 'Answer simple questions about your situation to receive personalized and specific guidance.'
        },
        {
          title: 'Forms',
          description: 'Get the specific forms you need for your case, with detailed instructions.'
        }
      ],
      whyTitle: 'Why use this system?',
      whyCards: [
        {
          title: 'Complete Information',
          description: 'Every question includes contextual information so you understand completely before making decisions.'
        },
        {
          title: 'Specific Forms',
          description: 'Receive only the forms you need for your specific situation, without confusion.'
        }
      ]
    },
    divorce: {
      backToHome: 'Back to Home',
      clinicName: 'Family Court Clinic',
      heroTitle: 'Divorce & Legal Separation',
      heroDescription: "Get help with divorce proceedings, legal separation, and property division. We'll guide you step by step with information and specific forms needed for your case.",
      infoBanner: 'Understanding your rights and the divorce process is crucial. This guide will help you navigate the legal requirements and prepare the necessary documentation.',
      startGuide: 'Start Divorce Guide',
      startDetails: 'Free and confidential · 20-30 minutes · Step-by-step guidance',
      learnTitle: "What You'll Learn",
      learnCards: [
        {
          title: 'Residency Requirements',
          description: "Understand California's residency requirements and eligibility for filing divorce proceedings."
        },
        {
          title: 'Required Forms',
          description: 'Learn about essential forms like FL-100 (Petition), FL-110 (Summons), and child custody forms if applicable.'
        },
        {
          title: 'Service Requirements',
          description: 'Understand how to properly serve divorce papers to your spouse within the required timeframe.'
        },
        {
          title: 'Next Steps',
          description: 'Get guidance on what happens after filing, including response periods and court procedures.'
        }
      ],
      notesTitle: 'Important Information',
      notes: [
        'This guide provides general information and is not legal advice.',
        'For complex cases or legal advice, consult with an attorney.',
        'Court staff can help with procedural questions but cannot provide legal advice.',
        'All forms and procedures must comply with California family law requirements.'
      ]
    },
    experiment: {
      heroTitle: 'Professional Legal Assistance',
      heroSubtitle: 'Family Law',
      heroTagline: 'Self-Help Kiosk',
      intro: 'Select Your Case Type to Begin',
      description: 'Choose a program to start a guided experience tailored to your legal needs.',
      supportTitle: 'Need Assistance?',
      supportDescription: 'Court facilitators are available to answer questions and provide additional guidance.',
      caseTypes: {
        dvro: {
          title: 'Domestic Violence',
          description: 'Restraining orders, protection orders, emergency cases. Immediate assistance for safety and legal protection.',
          priority: 'PRIORITY A'
        },
        custody: {
          title: 'Child Custody & Support',
          description: "Child custody arrangements, support calculations, and visitation rights. Protecting children's best interests.",
          priority: 'PRIORITY B'
        },
        divorce: {
          title: 'Divorce & Separation',
          description: 'Divorce proceedings, legal separation, serving papers, and next steps. Guided process for life transitions.',
          priority: 'PRIORITY C'
        },
        other: {
          title: 'Other Family Law',
          description: 'Parentage, guardianship, name changes, adoption, and other family legal matters. Comprehensive support.',
          priority: 'PRIORITY D'
        }
      }
    }
  },
  es: {
    common: {
      appName: 'Tribunal de Familia de San Mateo',
      appSubtitle: 'Quiosco de Autoservicio',
      secureLabel: 'Seguro',
      secureSessionLabel: 'Sesión Segura',
      languageSelectorLabel: 'Idioma',
      languageSelectorAriaLabel: 'Seleccionar idioma'
    },
    navigation: {
      home: 'Inicio',
      homeDescription: 'Interfaz principal del quiosco',
      dvroFlow: 'Proceso DVRO',
      dvroDescription: 'Guía de órdenes de restricción por violencia doméstica',
      divorceFlow: 'Proceso de Divorcio',
      divorceDescription: 'Guía del proceso de divorcio',
      admin: 'Administración',
      adminDescription: 'Panel administrativo',
      attorney: 'Abogado',
      attorneyDescription: 'Herramientas para abogados',
      footerTagline: 'Sistema DVRO Mejorado'
    },
    userKiosk: {
      headerTitle: 'Quiosco de Autoayuda de Derecho de Familia',
      headerSubtitle: 'Seleccione su Tipo de Caso',
      heroTitle: 'Seleccione su Tipo de Caso',
      heroDescription: 'Elija la categoría que mejor describa su asunto legal.',
      caseTypes: {
        A: {
          title: 'Violencia Doméstica',
          description: 'Órdenes de restricción, órdenes de protección, casos de emergencia.'
        },
        B: {
          title: 'Custodia y Manutención Infantil',
          description: 'Custodia de menores, manutención infantil, derechos de visita.'
        },
        C: {
          title: 'Divorcio y Separación',
          description: 'Divorcio, separación legal, entrega de documentos, próximos pasos.'
        },
        D: {
          title: 'Otros Asuntos de Familia',
          description: 'Paternidad, tutela, cambio de nombre y más.'
        }
      },
      queueAssignedTitle: 'Número de Cola Asignado',
      queueAssignedSubtitle: 'Por favor espera a ser llamado',
      queueNumberLabel: 'TU NÚMERO DE COLA',
      priorityLevel: 'Prioridad {{value}}',
      caseSummaryLabel: 'Resumen del Caso',
      nextStepsLabel: 'Próximos Pasos',
      waitMessageHeading: 'Por favor espera a ser llamado',
      waitMessageBody: 'Un facilitador llamará su número cuando sea su turno. Por favor tome asiento y espere.',
      startOver: 'Comenzar de Nuevo',
      tileCallToAction: 'Toque para elegir',
      emergencyTitle: 'Ayuda de Emergencia',
      emergencyMessage: 'Si está en peligro inmediato, llame al 911. Para asistencia de DVRO el mismo día, visite el Centro de Autoayuda.',
      locationLine1: 'Palacio de Justicia, 400 County Center, 6.º piso',
      locationLine2: 'Lun–Vie · 8:00–12:00, 1:30–3:00',
      locationLine3: 'Centro de Autoayuda',
      footer: 'Tribunal Superior de San Mateo © {{year}} · Centro de Autoayuda de Derecho de Familia',
      processing: 'Procesando...'
    },
    dvro: {
      loading: 'Cargando la aplicación...',
      loadError: 'No se pudieron cargar los datos',
      tryAgain: 'Intentar de Nuevo',
      backToHome: 'Volver al Inicio',
      clinicName: 'Clínica del Tribunal de Familia',
      heroTitle: 'Órdenes de Restricción por Violencia Doméstica',
      heroDescription: 'Obtenga ayuda para solicitar una orden de restricción. Le guiaremos paso a paso con información y formularios específicos.',
      emergencyNotice: 'Si está en peligro inmediato, llame al 911.',
      emergencyAction: 'Ahora puede comenzar su solicitud.',
      startApplication: 'Comenzar Solicitud',
      startDetails: 'Gratis y confidencial • 15-20 minutos',
      quickInfo: [
        {
          title: 'Información',
          description: 'Aprenda sobre el proceso legal, sus derechos y las opciones disponibles para su situación específica.'
        },
        {
          title: 'Preguntas',
          description: 'Responda preguntas simples sobre su situación para recibir orientación personalizada y específica.'
        },
        {
          title: 'Formularios',
          description: 'Obtenga los formularios específicos que necesita para su caso, con instrucciones detalladas.'
        }
      ],
      whyTitle: '¿Por qué usar este sistema?',
      whyCards: [
        {
          title: 'Información Completa',
          description: 'Cada pregunta incluye información contextual para que comprenda completamente antes de tomar decisiones.'
        },
        {
          title: 'Formularios Específicos',
          description: 'Reciba solo los formularios que necesita para su situación específica, sin confusión.'
        }
      ]
    },
    divorce: {
      backToHome: 'Volver al Inicio',
      clinicName: 'Clínica del Tribunal de Familia',
      heroTitle: 'Divorcio y Separación Legal',
      heroDescription: 'Obtenga ayuda con los procedimientos de divorcio, separación legal y división de bienes. Le guiaremos paso a paso con la información y los formularios específicos que necesita para su caso.',
      infoBanner: 'Comprender sus derechos y el proceso de divorcio es fundamental. Esta guía le ayudará a navegar los requisitos legales y preparar la documentación necesaria.',
      startGuide: 'Iniciar Guía de Divorcio',
      startDetails: 'Gratis y confidencial · 20-30 minutos · Guía paso a paso',
      learnTitle: 'Lo que aprenderá',
      learnCards: [
        {
          title: 'Requisitos de Residencia',
          description: 'Comprenda los requisitos de residencia de California y la elegibilidad para presentar un divorcio.'
        },
        {
          title: 'Formularios Requeridos',
          description: 'Conozca los formularios esenciales como FL-100 (Petición), FL-110 (Citatorio) y formularios de custodia infantil si aplica.'
        },
        {
          title: 'Requisitos de Notificación',
          description: 'Aprenda cómo notificar legalmente a su cónyuge dentro del plazo requerido.'
        },
        {
          title: 'Próximos Pasos',
          description: 'Obtenga orientación sobre lo que sucede después de presentar, incluidos los plazos de respuesta y los procedimientos judiciales.'
        }
      ],
      notesTitle: 'Información Importante',
      notes: [
        'Esta guía ofrece información general y no constituye asesoría legal.',
        'Para casos complejos o asesoría legal, consulte con un abogado.',
        'El personal del tribunal puede responder preguntas de procedimiento pero no brindar asesoría legal.',
        'Todos los formularios y procedimientos deben cumplir con los requisitos del derecho de familia de California.'
      ]
    },
    experiment: {
      heroTitle: 'Asistencia Legal Profesional',
      heroSubtitle: 'Derecho de Familia',
      heroTagline: 'Quiosco de Autoayuda',
      intro: 'Seleccione su Tipo de Caso para Comenzar',
      description: 'Elija un programa para iniciar una experiencia guiada adaptada a sus necesidades legales.',
      supportTitle: '¿Necesita Asistencia?',
      supportDescription: 'Los facilitadores del tribunal están disponibles para responder preguntas y brindar orientación adicional.',
      caseTypes: {
        dvro: {
          title: 'Violencia Doméstica',
          description: 'Órdenes de restricción, órdenes de protección y casos de emergencia. Asistencia inmediata para su seguridad y protección legal.',
          priority: 'PRIORIDAD A'
        },
        custody: {
          title: 'Custodia y Manutención',
          description: 'Acuerdos de custodia, cálculos de manutención y derechos de visita. Protegiendo el interés superior de los menores.',
          priority: 'PRIORIDAD B'
        },
        divorce: {
          title: 'Divorcio y Separación',
          description: 'Procedimientos de divorcio, separación legal, entrega de documentos y próximos pasos. Proceso guiado para transiciones de vida.',
          priority: 'PRIORIDAD C'
        },
        other: {
          title: 'Otros Asuntos de Familia',
          description: 'Paternidad, tutela, cambios de nombre, adopción y otros asuntos legales familiares. Apoyo integral.',
          priority: 'PRIORIDAD D'
        }
      }
    }
  },
  zh: {
    common: {
      appName: '圣马特奥家庭法院',
      appSubtitle: '自助服务终端',
      secureLabel: '安全',
      secureSessionLabel: '安全会话',
      languageSelectorLabel: '语言',
      languageSelectorAriaLabel: '选择语言'
    },
    navigation: {
      home: '主页',
      homeDescription: '终端主界面',
      dvroFlow: '家庭暴力限制流程',
      dvroDescription: '家庭暴力限制令指南',
      divorceFlow: '离婚流程',
      divorceDescription: '离婚流程指南',
      admin: '管理',
      adminDescription: '管理控制台',
      attorney: '律师',
      attorneyDescription: '律师工具',
      footerTagline: '增强的 DVRO 系统'
    },
    userKiosk: {
      headerTitle: '家庭法律自助服务终端',
      headerSubtitle: '请选择您的案件类型',
      heroTitle: '请选择您的案件类型',
      heroDescription: '请选择最符合您法律事务的类别。',
      caseTypes: {
        A: {
          title: '家庭暴力',
          description: '限制令、保护令、紧急案件。'
        },
        B: {
          title: '子女监护与抚养',
          description: '子女监护、抚养、探视权。'
        },
        C: {
          title: '离婚与分居',
          description: '离婚、法律分居、送达文件、下一步。'
        },
        D: {
          title: '其他家庭法律事务',
          description: '亲子关系、监护、改名等。'
        }
      },
      queueAssignedTitle: '已分配排队号码',
      queueAssignedSubtitle: '请等待叫号',
      queueNumberLabel: '您的排队号码',
      priorityLevel: '优先级 {{value}}',
      caseSummaryLabel: '案件摘要',
      nextStepsLabel: '下一步',
      waitMessageHeading: '请等待叫号',
      waitMessageBody: '到您服务时，工作人员会叫号。请就座等候。',
      startOver: '重新开始',
      tileCallToAction: '点击选择',
      emergencyTitle: '紧急协助',
      emergencyMessage: '如有紧急危险，请拨打 911。若需当日的家庭暴力限制令协助，请前往自助服务中心。',
      locationLine1: '司法大楼，County Center 400 号，6 楼',
      locationLine2: '周一至周五 · 8:00–12:00，13:30–15:00',
      locationLine3: '自助服务中心',
      footer: '圣马特奥高等法院 © {{year}} · 家庭法律自助服务中心',
      processing: '处理中…'
    },
    dvro: {
      loading: '正在加载应用…',
      loadError: '无法加载应用数据',
      tryAgain: '重试',
      backToHome: '返回首页',
      clinicName: '家庭法院服务中心',
      heroTitle: '家庭暴力限制令',
      heroDescription: '获取申请限制令的帮助。我们将为您提供逐步指导及所需的具体表格。',
      emergencyNotice: '如有紧急危险，请拨打 911。',
      emergencyAction: '现在可以开始填写申请。',
      startApplication: '开始申请',
      startDetails: '免费且保密 • 15-20 分钟',
      quickInfo: [
        {
          title: '信息',
          description: '了解法律程序、您的权利，以及适用于您情况的可选方案。'
        },
        {
          title: '问题',
          description: '回答几个关于您情况的问题，以获得个性化的指导。'
        },
        {
          title: '表格',
          description: '获取适用于您案件的具体表格和详细说明。'
        }
      ],
      whyTitle: '为什么使用本系统？',
      whyCards: [
        {
          title: '完整信息',
          description: '每个问题都附带背景说明，帮助您在做决定前充分了解情况。'
        },
        {
          title: '专属表格',
          description: '只提供您所需的表格，避免混淆。'
        }
      ]
    },
    divorce: {
      backToHome: '返回首页',
      clinicName: '家庭法院服务中心',
      heroTitle: '离婚与法律分居',
      heroDescription: '获取有关离婚程序、法律分居和财产分割的帮助。我们将提供逐步指导以及您案件所需的具体表格。',
      infoBanner: '了解您的权利和离婚流程至关重要。本指南将帮助您掌握法律要求并准备必要的文件。',
      startGuide: '开始离婚指南',
      startDetails: '免费且保密 · 20-30 分钟 · 分步指导',
      learnTitle: '您将了解',
      learnCards: [
        {
          title: '居住要求',
          description: '了解加州的居住要求以及申请离婚的资格。'
        },
        {
          title: '必备表格',
          description: '了解关键表格，如 FL-100（申请书）、FL-110（传票）以及适用的儿童监护表格。'
        },
        {
          title: '送达要求',
          description: '了解如何在规定时间内向配偶送达离婚文件。'
        },
        {
          title: '下一步',
          description: '了解提交申请后的流程，包括答复期限和法院程序。'
        }
      ],
      notesTitle: '重要信息',
      notes: [
        '本指南仅提供一般信息，不构成法律意见。',
        '复杂案件或需法律意见时，请咨询律师。',
        '法院工作人员可解答程序性问题，但不能提供法律意见。',
        '所有表格与程序必须符合加州家庭法要求。'
      ]
    },
    experiment: {
      heroTitle: '专业法律协助',
      heroSubtitle: '家庭法',
      heroTagline: '自助服务终端',
      intro: '请选择您的案件类型开始',
      description: '选择一个项目，开始为您的法律需求量身定制的引导式体验。',
      supportTitle: '需要帮助吗？',
      supportDescription: '法院辅导员可提供答疑与额外指导。',
      caseTypes: {
        dvro: {
          title: '家庭暴力',
          description: '限制令、保护令、紧急案件。为安全与法律保护提供即时协助。',
          priority: '优先级 A'
        },
        custody: {
          title: '子女监护与抚养',
          description: '子女监护安排、抚养费计算与探视权。保障儿童的最佳利益。',
          priority: '优先级 B'
        },
        divorce: {
          title: '离婚与分居',
          description: '离婚程序、法律分居、送达文件及后续步骤。为人生转变提供引导流程。',
          priority: '优先级 C'
        },
        other: {
          title: '其他家庭法律事务',
          description: '亲子关系、监护、改名、收养等家庭法律事务。提供全方位支持。',
          priority: '优先级 D'
        }
      }
    }
  }
};

export default translations;
