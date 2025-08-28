import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, FileText, Phone, Calendar, Users } from 'lucide-react';
import { ExportWhereAmIPDF } from './PDFExport';
import { FormLinksList, PendingFormLinksList, FormGlossary, FormCategoryFilter } from './FormLinks';

const WhereAmISummary = ({ flowType = 'DVRO' }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const generateSummary = async (answers) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/where-am-i-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flow_type: flowType,
          answers: answers
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSummary(data.summary);
      } else {
        setError(data.error || 'Failed to generate summary');
      }
    } catch (err) {
      setError('Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const handleFormDownload = (formCode, form) => {
    console.log(`Downloaded form: ${formCode} - ${form.name}`);
    // You can add analytics tracking here
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Generating summary...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No summary available. Generate a summary to see your current status.</p>
      </div>
    );
  }

  const categories = [
    { id: 'all', name: 'All Forms' },
    { id: 'main', name: 'Main Forms' },
    { id: 'custody', name: 'Custody & Visitation' },
    { id: 'service', name: 'Service Forms' },
    { id: 'financial', name: 'Financial Forms' },
    { id: 'modification', name: 'Modification Forms' },
    { id: 'renewal', name: 'Renewal Forms' },
    { id: 'firearms', name: 'Firearms Forms' },
    { id: 'clets', name: 'CLETS Forms' },
    { id: 'child_support', name: 'Child Support' },
    { id: 'response', name: 'Response Forms' },
    { id: 'misc', name: 'Miscellaneous' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Where Am I?</h1>
        <p className="text-gray-600">Your current status in the DVRO process with direct access to court forms</p>
        
        {/* PDF Export Button */}
        <div className="mt-4">
          <ExportWhereAmIPDF summary={summary} filename="DVRO-where-am-i-summary.pdf" />
        </div>
      </div>

      {/* You Are Here Section */}
      {summary.you_are_here && summary.you_are_here.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            You are here
          </h2>
          <div className="space-y-3">
            {summary.you_are_here.map((item, index) => (
              <div key={index} className="text-blue-800">
                {item.includes('\n') ? (
                  <div>
                    {item.split('\n').map((line, lineIndex) => (
                      <div key={lineIndex} className={lineIndex === 0 ? '' : 'ml-4'}>
                        {line}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>{item}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What to do next Section */}
      {summary.what_to_do_next && summary.what_to_do_next.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            What to do next
          </h2>
          <div className="space-y-2">
            {summary.what_to_do_next.map((action, index) => (
              <div key={index} className="text-green-800">
                {action}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forms involved Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Forms involved (from your answers)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Completed Forms */}
          {summary.forms_involved && summary.forms_involved.completed && summary.forms_involved.completed.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Completed Forms:
              </h3>
              <FormLinksList 
                forms={summary.forms_involved.completed} 
                showDescriptions={true}
                onDownload={handleFormDownload}
              />
            </div>
          )}
          
          {/* Pending Forms */}
          {summary.forms_involved && summary.forms_involved.pending && summary.forms_involved.pending.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                Pending Forms:
              </h3>
              <PendingFormLinksList 
                forms={summary.forms_involved.pending} 
                showDescriptions={true}
                onDownload={handleFormDownload}
              />
            </div>
          )}
        </div>
      </div>

      {/* Personalized checklist Section */}
      {summary.personalized_checklist && summary.personalized_checklist.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Personalized checklist (print-friendly)
          </h2>
          <div className="space-y-2">
            {summary.personalized_checklist.map((item, index) => (
              <div key={index} className="flex items-start">
                <span className="text-yellow-600 mr-3 mt-1">•</span>
                <span className="text-yellow-800">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What is this? Section */}
      {summary.glossary && Object.keys(summary.glossary).length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            "What is this?" quick reference
          </h2>
          <div className="space-y-3">
            {Object.entries(summary.glossary).map(([code, description]) => (
              <div key={code} className="flex items-start">
                <span className="font-mono font-medium text-gray-900 mr-3 flex-shrink-0">{code}:</span>
                <span className="text-gray-700">{description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Forms Reference with Category Filter */}
      <div className="mt-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Court Forms Reference</h3>
          
          {/* Category Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Forms Display */}
          {selectedCategory === 'all' ? (
            <FormGlossary onDownload={handleFormDownload} />
          ) : (
            <FormCategoryFilter 
              category={selectedCategory} 
              onDownload={handleFormDownload}
            />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedCategory('main')}
            className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left"
          >
            <h4 className="font-medium text-blue-900">Main Forms</h4>
            <p className="text-sm text-blue-700">DV-100, DV-109, DV-110, CLETS-001</p>
          </button>
          <button
            onClick={() => setSelectedCategory('custody')}
            className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left"
          >
            <h4 className="font-medium text-blue-900">Custody & Visitation</h4>
            <p className="text-sm text-blue-700">DV-105, DV-140, DV-108, DV-145</p>
          </button>
          <button
            onClick={() => setSelectedCategory('service')}
            className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left"
          >
            <h4 className="font-medium text-blue-900">Service Forms</h4>
            <p className="text-sm text-blue-700">DV-200, DV-250, SER-001</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhereAmISummary;
