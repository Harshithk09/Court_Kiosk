import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSelector = ({ className = '', size = 'md' }) => {
  const { language, setLanguage, availableLanguages, t } = useLanguage();

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <label className={`inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white shadow-sm px-2 ${className}`}>
      <Globe className="w-4 h-4 text-blue-600" aria-hidden />
      <span className="sr-only">{t('common.languageSelectorAriaLabel')}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        className={`bg-transparent focus:outline-none focus:ring-0 text-gray-700 font-medium ${sizeClasses[size] || sizeClasses.md}`}
        aria-label={t('common.languageSelectorLabel')}
      >
        {availableLanguages.map(({ code, label }) => (
          <option key={code} value={code} className="text-gray-900">
            {label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LanguageSelector;
