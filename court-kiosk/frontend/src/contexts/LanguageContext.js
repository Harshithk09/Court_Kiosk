import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import translations, { supportedLanguages, fallbackLanguage } from '../i18n/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(fallbackLanguage);

  const toggleLanguage = useCallback(() => {
    setLanguage((current) => {
      const currentIndex = supportedLanguages.findIndex(({ code }) => code === current);
      const nextIndex = (currentIndex + 1) % supportedLanguages.length;
      return supportedLanguages[nextIndex]?.code ?? fallbackLanguage;
    });
  }, []);

  const activeTranslations = translations[language] || translations[fallbackLanguage];

  const translate = useCallback((path, options = {}) => {
    const segments = Array.isArray(path) ? path : String(path).split('.');
    let result = activeTranslations;

    for (const segment of segments) {
      if (result && Object.prototype.hasOwnProperty.call(result, segment)) {
        result = result[segment];
      } else {
        result = null;
        break;
      }
    }

    if (typeof result === 'string') {
      if (options?.values) {
        return Object.entries(options.values).reduce((acc, [key, value]) => (
          acc.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value)
        ), result);
      }
      return result;
    }

    if (Array.isArray(result)) {
      return result;
    }

    return options?.fallback ?? path;
  }, [activeTranslations]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage,
    availableLanguages: supportedLanguages,
    t: translate,
    translations: activeTranslations
  }), [language, translate, activeTranslations, toggleLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};