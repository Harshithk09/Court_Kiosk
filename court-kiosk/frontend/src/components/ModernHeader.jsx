import React from 'react';
import { Scale, Shield, Globe } from 'lucide-react';

const ModernHeader = ({ title, subtitle, showLanguageToggle = true, onLanguageToggle, currentLanguage = 'en' }) => {
  return (
    <header className="modern-header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo-section">
            <div className="logo-icon">
              <Scale className="logo-scale" />
            </div>
            <div className="logo-text">
              <h1 className="logo-title">San Mateo Family Court</h1>
              <p className="logo-subtitle">Self-Service Kiosk</p>
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
              <button 
                className="language-toggle"
                onClick={onLanguageToggle}
                title="Toggle Language"
              >
                <Globe className="globe-icon" />
                <span className="language-text">
                  {currentLanguage === 'en' ? 'Español' : 'English'}
                </span>
              </button>
            )}
            
            <div className="system-status">
              <div className="status-indicator">
                <Shield className="status-icon" />
                <span className="status-text">Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ModernHeader;
