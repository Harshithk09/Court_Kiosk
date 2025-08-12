import React from 'react';
import FlowRunner from '../components/FlowRunner';
import flow from '../data/dv_flow_combined.json';

const DVFlowRunnerPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <FlowRunner
        flow={flow}
        locale="en"
        onFinish={({ answers, forms }) => {
          console.log('answers', answers);
          console.log('forms', forms);
        }}
      />
    </div>
  );
};

export default DVFlowRunnerPage;
