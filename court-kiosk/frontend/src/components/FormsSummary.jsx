import React from 'react';
import { FileText, CheckCircle, XCircle, Info } from 'lucide-react';
import { getFormsSummary } from '../data/formsDatabase';

const FormsSummary = () => {
  const summary = getFormsSummary();

  const summaryCards = [
    {
      title: 'Total Forms',
      value: summary.total,
      icon: FileText,
      color: 'blue',
      description: 'All forms in the system'
    },
    {
      title: 'PDFs Available',
      value: summary.byAvailability.available,
      icon: CheckCircle,
      color: 'green',
      description: 'Forms with PDF files'
    },
    {
      title: 'PDFs Missing',
      value: summary.byAvailability.unavailable,
      icon: XCircle,
      color: 'red',
      description: 'Forms needing PDF files'
    },
    {
      title: 'Categories',
      value: Object.keys(summary.byCategory).length,
      icon: Info,
      color: 'purple',
      description: 'Different form categories'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      red: 'bg-red-50 border-red-200 text-red-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
      orange: 'bg-orange-50 border-orange-200 text-orange-900'
    };
    return colorMap[color] || 'bg-gray-50 border-gray-200 text-gray-900';
  };

  const getIconColor = (color) => {
    const colorMap = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      red: 'text-red-600',
      purple: 'text-purple-600',
      yellow: 'text-yellow-600',
      orange: 'text-orange-600'
    };
    return colorMap[color] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Forms Overview</h3>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {summaryCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div key={index} className={`border rounded-lg p-4 ${getColorClasses(card.color)}`}>
                <div className="flex items-center">
                  <IconComponent className={`w-8 h-8 mr-3 ${getIconColor(card.color)}`} />
                  <div>
                    <p className="text-sm font-medium opacity-75">{card.title}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                    <p className="text-xs opacity-75">{card.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">Forms by Category</h4>
            <div className="space-y-2">
              {Object.entries(summary.byCategory).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">{category}</span>
                  <span className="text-sm text-gray-500">{count} forms</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 mb-3">Forms by Priority</h4>
            <div className="space-y-2">
              {Object.entries(summary.byPriority).map(([priority, count]) => (
                <div key={priority} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium text-gray-700">Priority {priority}</span>
                  <span className="text-sm text-gray-500">{count} forms</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            View All Forms
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Manage PDFs
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Forms Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormsSummary;
