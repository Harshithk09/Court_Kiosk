import React from 'react';

const ModernCard = ({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'large',
  shadow = 'medium',
  border = true,
  ...props 
}) => {
  const baseClasses = 'modern-card';
  const variantClasses = {
    default: 'card-default',
    elevated: 'card-elevated',
    outlined: 'card-outlined',
    gradient: 'card-gradient'
  };
  
  const paddingClasses = {
    small: 'card-padding-small',
    medium: 'card-padding-medium',
    large: 'card-padding-large',
    xlarge: 'card-padding-xlarge'
  };
  
  const shadowClasses = {
    none: 'card-shadow-none',
    small: 'card-shadow-small',
    medium: 'card-shadow-medium',
    large: 'card-shadow-large'
  };
  
  const borderClasses = border ? 'card-border' : 'card-no-border';
  
  const cardClasses = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    shadowClasses[shadow],
    borderClasses,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default ModernCard;
