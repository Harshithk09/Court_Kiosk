import React, { useMemo } from 'react';
import { Shield, Heart, FileText, Users, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import ModernCourtHeader from '../components/ModernCourtHeader';
import ModernCaseTypeCard from '../components/ModernCaseTypeCard';
import '../components/ExperimentUI.css';

const CASE_TYPES = [
  {
    key: 'dvro',
    icon: Shield,
    colorScheme: 'domestic-violence',
    path: '/dvro'
  },
  {
    key: 'custody',
    icon: Heart,
    colorScheme: 'child-custody',
    path: '/',
    preselect: 'B'
  },
  {
    key: 'divorce',
    icon: FileText,
    colorScheme: 'divorce',
    path: '/divorce'
  },
  {
    key: 'other',
    icon: Users,
    colorScheme: 'other-family',
    path: '/',
    preselect: 'D'
  }
];

const ExperimentIndex = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const localizedCaseTypes = useMemo(() => (
    CASE_TYPES.map((caseType) => ({
      ...caseType,
      title: t(`experiment.caseTypes.${caseType.key}.title`),
      description: t(`experiment.caseTypes.${caseType.key}.description`),
      priority: t(`experiment.caseTypes.${caseType.key}.priority`)
    }))
  ), [t]);

  const handleCaseTypeClick = (caseType) => {
    if (caseType.preselect) {
      navigate(caseType.path, { state: { preselectCaseId: caseType.preselect } });
      return;
    }
    navigate(caseType.path);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-other-family/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-divorce/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <ModernCourtHeader />

      <main className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {t('experiment.heroTitle')}
            </span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
            {t('experiment.heroSubtitle')}
            <span className="block bg-gradient-to-r from-primary via-primary to-other-family bg-clip-text text-transparent">
              {t('experiment.heroTagline')}
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-4">
            {t('experiment.intro')}
          </p>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('experiment.description')}
          </p>
        </div>

        {/* Case Type Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {localizedCaseTypes.map((caseType, index) => (
            <ModernCaseTypeCard
              key={caseType.key}
              title={caseType.title}
              description={caseType.description}
              icon={caseType.icon}
              priority={caseType.priority}
              colorScheme={caseType.colorScheme}
              onClick={() => handleCaseTypeClick(caseType)}
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
                {t('experiment.supportTitle')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t('experiment.supportDescription')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExperimentIndex;
