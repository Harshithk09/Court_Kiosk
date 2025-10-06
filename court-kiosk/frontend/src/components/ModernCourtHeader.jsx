import React from 'react';
import { Scale, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';

const ModernCourtHeader = ({ showLanguageSelector = true }) => {
  const { t } = useLanguage();

  return (
    <header className="relative z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground">
                {t('common.appName')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('common.appSubtitle')}
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            {showLanguageSelector && <LanguageSelector size="sm" />}

            {/* Security Status */}
            <div className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-sm font-medium text-green-600">
              <Shield className="w-4 h-4" />
              <span>{t('common.secureSessionLabel')}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ModernCourtHeader;
