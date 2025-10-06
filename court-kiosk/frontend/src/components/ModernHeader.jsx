import React from 'react';
import { Scale, Shield } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';

const ModernHeader = ({ title, subtitle, showLanguageToggle = true }) => {
  const { t } = useLanguage();

  return (
    <header className="modern-header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo-section">
            <div className="logo-icon">
              <Scale className="logo-scale" />
            </div>
            <div className="logo-text">
              <h1 className="logo-title">{t('common.appName')}</h1>
              <p className="logo-subtitle">{t('common.appSubtitle')}</p>
            </div>
          </div>
        </div>

        <div className="header-center">
          <div className="title-section">
            <h2 className="page-title">{title}</h2>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
        </div>

        <div className="header-right">
          <div className="header-actions">
            {showLanguageToggle && (
              <LanguageSelector className="language-selector-control" size="sm" />
            )}

            <div className="system-status">
              <div className="status-indicator">
                <Shield className="status-icon" />
                <span className="status-text">{t('common.secureLabel')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ModernHeader;
