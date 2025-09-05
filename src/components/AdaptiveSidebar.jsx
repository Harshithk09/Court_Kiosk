import React, { useState } from 'react';
import { ChevronLeft, MoreHorizontal, Check, Circle } from 'lucide-react';

const AdaptiveSidebar = ({ 
  steps = [], 
  currentStep = 1, 
  onStepChange, 
  onBack,
  title = "Family Court Clinic",
  subtitle = "Case Processing"
}) => {
  const [showAllSteps, setShowAllSteps] = useState(false);

  const getVisibleSteps = () => {
    if (currentStep <= 7) {
      // Show all steps if we're early in the process
      return steps;
    }

    if (showAllSteps) {
      // Show all completed steps when expanded
      return steps;
    }

    // Smart compressed view
    const visibleSteps = [];
    
    // Always show step 1
    if (steps.length > 0) {
      visibleSteps.push(steps[0]);
    }
    
    // Add ellipsis indicator if there are hidden steps
    if (currentStep > 6) {
      visibleSteps.push({ 
        id: 'ellipsis', 
        title: '...', 
        isEllipsis: true,
        hiddenCount: currentStep - 6
      });
    }
    
    // Show last 5 completed steps + current step + next few steps
    const startIndex = Math.max(1, currentStep - 5);
    const endIndex = Math.min(steps.length, currentStep + 2);
    
    for (let i = startIndex; i < endIndex; i++) {
      if (steps[i] && steps[i].id !== 1) { // Don't duplicate step 1
        visibleSteps.push(steps[i]);
      }
    }
    
    return visibleSteps;
  };

  const StepItem = ({ step, isActive }) => {
    if (step.isEllipsis) {
      return (
        <div 
          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => setShowAllSteps(true)}
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </div>
          <div className="flex-1">
            <span className="text-sm text-gray-500 font-medium">
              {step.hiddenCount} more steps
            </span>
          </div>
        </div>
      );
    }

    return (
      <div 
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
          isActive 
            ? 'bg-blue-50 border-l-4 border-blue-500' 
            : 'hover:bg-gray-50'
        }`}
        onClick={() => {
          onStepChange(step.id);
          if (showAllSteps) setShowAllSteps(false);
        }}
      >
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          {step.completed ? (
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          ) : isActive ? (
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{step.id}</span>
            </div>
          ) : (
            <Circle className="w-5 h-5 text-gray-300" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <span className={`text-sm block truncate ${
            isActive ? 'font-semibold text-blue-700' : 
            step.completed ? 'text-gray-700' : 'text-gray-500'
          }`}>
            {step.title}
          </span>
        </div>
        {isActive && (
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
        )}
      </div>
    );
  };

  return (
    <div className="w-80 bg-white shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
        </div>
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      {/* Progress Section */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-900 mb-3">Your Progress</h2>
        {showAllSteps && (
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-gray-500">All Steps</span>
            <button 
              onClick={() => setShowAllSteps(false)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Collapse
            </button>
          </div>
        )}
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {getVisibleSteps().map((step) => (
          <StepItem 
            key={step.id} 
            step={step} 
            isActive={step.id === currentStep}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Step {currentStep} of {steps.length}</span>
          <span>{steps.filter(s => s.completed).length} completed</span>
        </div>
      </div>
    </div>
  );
};

export default AdaptiveSidebar;
