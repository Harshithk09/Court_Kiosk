import React, { useState } from 'react';
import DivorceFlow from '../components/DivorceFlow';

const DivorcePage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  const steps = [
    "Welcome to Divorce Process",
    "Choose Divorce Type", 
    "Gather Information",
    "Complete Forms",
    "Submit Application"
  ];

  const onNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <DivorceFlow 
      currentStep={currentStep}
      steps={steps}
      onNext={onNext}
    />
  );
};

export default DivorcePage;


