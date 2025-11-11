import React from 'react';
import { ChevronRight } from 'lucide-react';

const ModernCaseTypeCard = ({ 
  title, 
  description, 
  icon: Icon, 
  priority, 
  colorScheme, 
  onClick, 
  index = 0 
}) => {
  const colorSchemes = {
    'domestic-violence': {
      gradient: 'from-red-500 to-red-600',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-600',
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-600',
      hover: 'hover:shadow-red-500/25'
    },
    'child-custody': {
      gradient: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-600',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-600',
      hover: 'hover:shadow-amber-500/25'
    },
    'divorce': {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-600',
      iconBg: 'bg-blue-500/20',
      iconColor: 'text-blue-600',
      hover: 'hover:shadow-blue-500/25'
    },
    'other-family': {
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-600',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-600',
      hover: 'hover:shadow-emerald-500/25'
    }
  };

  const scheme = colorSchemes[colorScheme] || colorSchemes['divorce'];

  return (
    <div 
      className={`group relative overflow-hidden rounded-2xl border ${scheme.border} ${scheme.bg} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${scheme.hover} cursor-pointer animate-fade-in-up`}
      style={{ animationDelay: `${index * 150}ms` }}
      onClick={onClick}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${scheme.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      {/* Content */}
      <div className="relative p-8">
        {/* Header with icon (priority hidden per feedback) */}
        <div className="flex items-start justify-between mb-6">
          <div className={`w-16 h-16 rounded-xl ${scheme.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-8 h-8 ${scheme.iconColor}`} />
          </div>
          {/* priority badge removed */}
        </div>

        {/* Title and description */}
        <div className="mb-6">
          <h3 className="text-3xl font-display font-extrabold text-foreground mb-4 group-hover:text-foreground/90 transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed text-lg">
            {description}
          </p>
        </div>

        {/* Action indicator */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            Click to begin
          </span>
          <ChevronRight className={`w-5 h-5 ${scheme.text} group-hover:translate-x-1 transition-transform duration-300`} />
        </div>
      </div>

      {/* Hover effect border */}
      <div className={`absolute inset-0 rounded-2xl border-2 ${scheme.border} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
    </div>
  );
};

export default ModernCaseTypeCard;
