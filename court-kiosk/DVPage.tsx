import React from 'react';
import FlowRunner from './FlowRunner';
import flow from './dv_flow_combined.json';

export default function DVPage() {
  const handleFinish = ({ answers, forms }: { answers: Record<string, string>; forms: string[] }) => {
    // This is where you would send the data to your backend
    // to create a Priority A ticket and include answers/forms/summary
    console.log('User completed the flow with:', { answers, forms });
    
    // Example of what you might send to your backend:
    const payload = {
      caseType: 'DVRO',
      priority: 'A',
      answers,
      recommendedForms: forms,
      summary: generateSummary(answers, forms),
      timestamp: new Date().toISOString()
    };
    
    // fetch('/api/intake/finish', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // });
  };

  const generateSummary = (answers: Record<string, string>, forms: string[]): string => {
    const summary: string[] = [];
    
    if (answers['immediate_danger'] === 'yes') {
      summary.push('User reported immediate danger - emergency protocols activated');
    }
    
    if (answers['relationship'] === 'domestic') {
      summary.push('Domestic relationship - using DVRO forms');
    } else if (answers['relationship'] === 'non_domestic') {
      summary.push('Non-domestic relationship - using Civil Harassment forms');
    }
    
    if (answers['children'] === 'yes') {
      summary.push('Children involved - child custody/visitation forms included');
    }
    
    if (answers['support'] && answers['support'] !== 'none') {
      summary.push(`Support requested: ${answers['support']} - income forms included`);
    }
    
    summary.push(`Total forms recommended: ${forms.length}`);
    
    return summary.join('. ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <FlowRunner
        flow={flow as any}
        locale="en"
        onFinish={handleFinish}
      />
    </div>
  );
} 