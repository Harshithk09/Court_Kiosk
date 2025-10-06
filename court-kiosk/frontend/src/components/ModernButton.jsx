import React from 'react';

const ModernButton = ({ 
  children, 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'modern-button';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    success: 'btn-success',
    warning: 'btn-warning',
    error: 'btn-error',
    gradient: 'btn-gradient'
  };
  
  const sizeClasses = {
    small: 'btn-small',
    medium: 'btn-medium',
    large: 'btn-large',
    xlarge: 'btn-xlarge'
  };
  
  const stateClasses = [
    disabled ? 'btn-disabled' : '',
    loading ? 'btn-loading' : ''
  ].filter(Boolean).join(' ');
  
  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    stateClasses,
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="button-spinner">
          <div className="spinner"></div>
        </div>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="button-icon-left">{icon}</span>
      )}
      
      <span className="button-text">{children}</span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="button-icon-right">{icon}</span>
      )}
    </button>
  );
};

export default ModernButton;
