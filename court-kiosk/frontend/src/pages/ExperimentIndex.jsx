import React from 'react';
import { Shield, Heart, FileText, Users, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import ModernCourtHeader from '../components/ModernCourtHeader';
import ModernCaseTypeCard from '../components/ModernCaseTypeCard';
import '../components/ExperimentUI.css';

const caseTypes = [
  {
    title: { en: "Domestic Violence", es: "Violencia Doméstica" },
    description: { 
      en: "Restraining orders, protection orders, emergency cases. Immediate assistance for safety and legal protection.",
      es: "Órdenes de restricción, órdenes de protección, casos de emergencia. Asistencia inmediata para seguridad y protección legal."
    },
    icon: Shield,
    priority: "PRIORITY A",
    colorScheme: "domestic-violence",
    path: "/dvro",
  },
  {
    title: { en: "Child Custody & Support", es: "Custodia y Manutención" },
    description: { 
      en: "Child custody arrangements, support calculations, and visitation rights. Protecting children's best interests.",
      es: "Arreglos de custodia de menores, cálculos de manutención y derechos de visita. Protegiendo el mejor interés de los niños."
    },
    icon: Heart,
    priority: "PRIORITY B",
    colorScheme: "child-custody",
    path: "/custody",
  },
  {
    title: { en: "Divorce & Separation", es: "Divorcio y Separación" },
    description: { 
      en: "Divorce proceedings, legal separation, serving papers, and next steps. Guided process for life transitions.",
      es: "Procedimientos de divorcio, separación legal, entrega de documentos y próximos pasos. Proceso guiado para transiciones de vida."
    },
    icon: FileText,
    priority: "PRIORITY C",
    colorScheme: "divorce",
    path: "/divorce",
  },
  {
    title: { en: "Other Family Law", es: "Otro Derecho de Familia" },
    description: { 
      en: "Parentage, guardianship, name changes, adoption, and other family legal matters. Comprehensive support.",
      es: "Paternidad, tutela, cambios de nombre, adopción y otros asuntos legales familiares. Apoyo integral."
    },
    icon: Users,
    priority: "PRIORITY D",
    colorScheme: "other-family",
    path: "/other",
  },
];

const ExperimentIndex = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();

  const handleCaseTypeClick = (path) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-other-family/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-divorce/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <ModernCourtHeader onLanguageToggle={toggleLanguage} currentLanguage={language} />
      
      <main className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {language === 'en' ? 'Professional Legal Assistance' : 'Asistencia Legal Profesional'}
            </span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
            {language === 'en' ? 'Family Law' : 'Derecho de Familia'}
            <span className="block bg-gradient-to-r from-primary via-primary to-other-family bg-clip-text text-transparent">
              {language === 'en' ? 'Self-Help Kiosk' : 'Quiosco de Autoayuda'}
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-4">
            {language === 'en' ? 'Select Your Case Type to Begin' : 'Seleccione su Tipo de Caso para Comenzar'}
          </p>
          
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === 'en' 
              ? 'Choose the option that best describes your legal need. Our guided system will walk you through each step with clear instructions and professional support.'
              : 'Elija la opción que mejor describa su necesidad legal. Nuestro sistema guiado lo llevará a través de cada paso con instrucciones claras y apoyo profesional.'
            }
          </p>
        </div>

        {/* Case Type Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {caseTypes.map((caseType, index) => (
            <ModernCaseTypeCard
              key={caseType.title[language]}
              title={caseType.title[language]}
              description={caseType.description[language]}
              icon={caseType.icon}
              priority={caseType.priority}
              colorScheme={caseType.colorScheme}
              onClick={() => handleCaseTypeClick(caseType.path)}
              index={index}
            />
          ))}
        </div>

        {/* Help Section */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '800ms' }}>
          <div className="relative max-w-2xl mx-auto">
            {/* Background with glassmorphism */}
            <div className="absolute inset-0 bg-gradient-to-br from-card/40 to-card/20 backdrop-blur-xl border border-border/50 rounded-2xl"></div>
            
            <div className="relative p-8">
              <h3 className="font-display font-semibold text-foreground mb-3">
                {language === 'en' ? 'Need Assistance?' : '¿Necesita Asistencia?'}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {language === 'en' 
                  ? 'Court staff are available to assist you with using this kiosk. Please visit the information desk if you need help navigating the system or have questions about your case.'
                  : 'El personal del tribunal está disponible para ayudarlo con el uso de este quiosco. Por favor visite el mostrador de información si necesita ayuda navegando el sistema o tiene preguntas sobre su caso.'
                }
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExperimentIndex;
