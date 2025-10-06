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
      <div className={`${sizeClasses[size]} relative flex-shrink-0 bg-blue-900 rounded-lg flex items-center justify-center`}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="logo-scale"
        >
          <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
          <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"></path>
          <path d="M7 21h10"></path>
          <path d="M12 3v18"></path>
          <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"></path>
        </svg>
      </div>
      
      {/* Text */}
      <div className="flex flex-col">
        <div className={`font-bold text-gray-800 ${textSizes[size]}`}>
          {language === 'es' ? 'Tribunal de Familia de San Mateo' : 'San Mateo Family Court'}
        </div>
        <div className={`font-medium text-gray-600 ${textSizes[size]}`}>
          {language === 'es' ? 'Quiosco de Autoayuda' : 'Self-Service Kiosk'}
        </div>
      </div>
    </div>
  );
};

export default LogoSeal; 