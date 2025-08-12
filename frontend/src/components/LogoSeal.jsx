import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LogoSeal = ({ size = 'default', className = '' }) => {
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
          {/* Outer Ring */}
          <circle cx="24" cy="24" r="24" fill="#1e40af" />
          <circle cx="24" cy="24" r="22" fill="#1e3a8a" />
          
          {/* Inner Ring */}
          <circle cx="24" cy="24" r="20" fill="#1e40af" />
          
          {/* Scales of Justice */}
          <g transform="translate(14, 10)">
            {/* Central Column */}
            <rect x="9" y="2" width="2" height="20" fill="#fbbf24" rx="1" />
            
            {/* Top Bar */}
            <rect x="4" y="2" width="12" height="2" fill="#fbbf24" rx="1" />
            
            {/* Left Scale */}
            <circle cx="6" cy="12" r="3" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
            <path d="M 6 15 L 6 22" stroke="#fbbf24" strokeWidth="1.5" />
            <circle cx="6" cy="22" r="1.5" fill="#fbbf24" />
            
            {/* Right Scale */}
            <circle cx="14" cy="12" r="3" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
            <path d="M 14 15 L 14 22" stroke="#fbbf24" strokeWidth="1.5" />
            <circle cx="14" cy="22" r="1.5" fill="#fbbf24" />
            
            {/* Connecting Lines */}
            <path d="M 6 12 L 10 8" stroke="#fbbf24" strokeWidth="1" />
            <path d="M 14 12 L 10 8" stroke="#fbbf24" strokeWidth="1" />
          </g>
          
          {/* Text Ring */}
          <path
            d="M 24 4 A 20 20 0 0 1 44 24"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="0.5"
          />
          <path
            d="M 44 24 A 20 20 0 0 1 24 44"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="0.5"
          />
          <path
            d="M 24 44 A 20 20 0 0 1 4 24"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="0.5"
          />
          <path
            d="M 4 24 A 20 20 0 0 1 24 4"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="0.5"
          />
          
          {/* Decorative dots */}
          <circle cx="24" cy="4" r="1" fill="#fbbf24" />
          <circle cx="44" cy="24" r="1" fill="#fbbf24" />
          <circle cx="24" cy="44" r="1" fill="#fbbf24" />
          <circle cx="4" cy="24" r="1" fill="#fbbf24" />
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

export default LogoSeal; 