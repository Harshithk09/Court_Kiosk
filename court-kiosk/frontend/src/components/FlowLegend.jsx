import React from 'react';

const FlowLegend = () => {
  const legendItems = [
    {
      type: 'Decision',
      color: '#fef3c7',
      borderColor: '#f59e0b',
      description: 'Questions that guide the process'
    },
    {
      type: 'Process',
      color: '#f3f4f6',
      borderColor: '#6b7280',
      description: 'Information and actions'
    },
    {
      type: 'End',
      color: '#dcfce7',
      borderColor: '#10b981',
      description: 'Completion points'
    },
    {
      type: 'Current',
      color: '#eff6ff',
      borderColor: '#3b82f6',
      description: 'Your current step'
    }
  ];

  return (
    <div className="bg-white border rounded-lg p-4 mb-4">
      <h4 className="text-sm font-semibold text-gray-900 mb-3">Legend</h4>
      <div className="grid grid-cols-2 gap-3">
        {legendItems.map((item) => (
          <div key={item.type} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded border-2"
              style={{
                backgroundColor: item.color,
                borderColor: item.borderColor
              }}
            />
            <div>
              <div className="text-xs font-medium text-gray-900">{item.type}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlowLegend;
