import React from 'react';

const Logo = ({ size = 60, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Simple, clean design */}
      <defs>
        <linearGradient id="pillarGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: '#1f2937', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#374151', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      
      {/* Background circle - clean and simple */}
      <circle cx="100" cy="100" r="90" fill="#ffffff" stroke="#d1d5db" strokeWidth="2"/>
      
      {/* Scale of Justice - clean, professional design */}
      <g stroke="#1f2937" strokeWidth="3" fill="none">
        {/* Central pillar */}
        <line x1="100" y1="50" x2="100" y2="150"/>
        
        {/* Top finial */}
        <circle cx="100" cy="45" r="8" fill="#1f2937"/>
        
        {/* Horizontal beam */}
        <line x1="60" y1="85" x2="140" y2="85"/>
        
        {/* Left scale pan */}
        <circle cx="60" cy="85" r="12" fill="none"/>
        <line x1="60" y1="73" x2="60" y2="85"/>
        
        {/* Right scale pan */}
        <circle cx="140" cy="85" r="12" fill="none"/>
        <line x1="140" y1="73" x2="140" y2="85"/>
      </g>
      
      {/* Simple text elements */}
      <text x="100" y="175" textAnchor="middle" fill="#6b7280" fontSize="12" fontFamily="Arial, sans-serif" fontWeight="bold">
        JUSTICE
      </text>
    </svg>
  );
};

export default Logo; 