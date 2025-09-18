import React from 'react';

const SanMateoCourtLogo = ({ size = 32, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer golden border */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="#D4AF37" strokeWidth="3"/>
      
      {/* Inner blue ring */}
      <circle cx="50" cy="50" r="42" fill="none" stroke="#1e3a8a" strokeWidth="2"/>
      
      {/* Background */}
      <circle cx="50" cy="50" r="40" fill="#f8fafc"/>
      
      {/* Simplified Scales of Justice - clean and visible at small sizes */}
      <g stroke="#1e3a8a" strokeWidth="2" fill="none">
        {/* Central pillar */}
        <line x1="50" y1="25" x2="50" y2="75"/>
        
        {/* Top finial */}
        <circle cx="50" cy="22" r="4" fill="#1e3a8a"/>
        
        {/* Horizontal beam */}
        <line x1="30" y1="45" x2="70" y2="45"/>
        
        {/* Left scale pan */}
        <circle cx="30" cy="45" r="6" fill="none"/>
        <line x1="30" y1="39" x2="30" y2="45"/>
        
        {/* Right scale pan */}
        <circle cx="70" cy="45" r="6" fill="none"/>
        <line x1="70" y1="39" x2="70" y2="45"/>
      </g>
      
      {/* Simple text - only visible at larger sizes */}
      {size > 40 && (
        <text x="50" y="90" textAnchor="middle" fill="#1e3a8a" fontSize="6" fontFamily="serif" fontWeight="bold">
          SAN MATEO
        </text>
      )}
    </svg>
  );
};

export default SanMateoCourtLogo;
