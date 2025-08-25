import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LogoAlt = ({ size = 'default', className = '', variant = 'primary' }) => {
  const { language } = useLanguage();
  
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-20 h-20'
  };

  const textSizes = {
    small: 'text-xs',
    default: 'text-sm',
    large: 'text-base',
    xlarge: 'text-lg'
  };

  const colorSchemes = {
    primary: {
      bg: '#1e40af',
      accent: '#fbbf24',
      text: '#1f2937'
    },
    secondary: {
      bg: '#374151',
      accent: '#f59e0b',
      text: '#374151'
    },
    government: {
      bg: '#dc2626',
      accent: '#fbbf24',
      text: '#1f2937'
    }
  };

  const colors = colorSchemes[variant];

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background */}
          <rect width="48" height="48" rx="8" fill={colors.bg} />
          
          {/* Building/Columns representing courthouse */}
          <g transform="translate(8, 12)">
            {/* Left Column */}
            <rect x="0" y="0" width="4" height="20" fill={colors.accent} rx="1" />
            {/* Right Column */}
            <rect x="20" y="0" width="4" height="20" fill={colors.accent} rx="1" />
            {/* Center Column */}
            <rect x="10" y="4" width="4" height="16" fill={colors.accent} rx="1" />
            
            {/* Roof/Top */}
            <path d="M 0 0 L 12 8 L 24 0" stroke={colors.accent} strokeWidth="2" fill="none" />
            
            {/* Steps */}
            <rect x="2" y="18" width="20" height="2" fill={colors.accent} rx="1" />
            <rect x="4" y="20" width="16" height="2" fill={colors.accent} rx="1" />
          </g>
          
          {/* Small decorative elements */}
          <circle cx="12" cy="12" r="1" fill={colors.accent} opacity="0.8" />
          <circle cx="36" cy="12" r="1" fill={colors.accent} opacity="0.8" />
          <circle cx="12" cy="36" r="1" fill={colors.accent} opacity="0.8" />
          <circle cx="36" cy="36" r="1" fill={colors.accent} opacity="0.8" />
        </svg>
      </div>
      
      {/* Text */}
      <div className="flex flex-col">
        <div className={`font-bold text-gray-800 ${textSizes[size]}`}>
          {language === 'es' ? 'Condado de San Mateo' : 'San Mateo County'}
        </div>
        <div className={`font-medium text-gray-600 ${textSizes[size]}`}>
          {language === 'es' ? 'Kiosko de Ayuda Legal' : 'Court Self-Help Kiosk'}
        </div>
      </div>
    </div>
  );
};

export default LogoAlt; 