import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Home, HelpCircle, AlertTriangle, Shield, Clock, FileText, Phone, MapPin } from 'lucide-react';

const DVROFlowchart = () => {
  const [currentNode, setCurrentNode] = useState('DVROStart');
  const [history, setHistory] = useState(['DVROStart']);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [flowData, setFlowData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load flow data from JSON file
  useEffect(() => {
    const loadFlowData = async () => {
      try {
        const response = await fetch('/data/dvro/dvro_complete_flow.json');
        const data = await response.json();
        setFlowData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading flow data:', error);
        setLoading(false);
      }
    };

    loadFlowData();
  }, []);

  if (loading || !flowData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading DVRO Flow...</p>
        </div>
      </div>
    );
  }

  // Get available options for current node
  const getAvailableOptions = (nodeId) => {
    const edges = flowData.edges.filter(edge => edge.from === nodeId);
    const node = flowData.nodes[nodeId];
    
    if (node?.type === 'decision') {
      const options = edges.map(edge => ({
        text: edge.option || edge.when || `Continue`,
        target: edge.to
      }));
      return options;
    }
    
    if (edges.length > 0) {
      return edges.map(edge => ({
        text: edge.option || 'Continue',
        target: edge.to
      }));
    }
    
    return [];
  };

  const handleOptionSelect = (target) => {
    setCurrentNode(target);
    setHistory([...history, target]);
    setSelectedAnswer('');
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setCurrentNode(newHistory[newHistory.length - 1]);
      setSelectedAnswer('');
    }
  };

  const goHome = () => {
    setCurrentNode('DVROStart');
    setHistory(['DVROStart']);
    setSelectedAnswer('');
  };

  const currentNodeData = flowData.nodes[currentNode];
  const options = getAvailableOptions(currentNode);

  const getNodeIcon = (type) => {
    switch (type) {
      case 'start':
        return <Shield className="w-6 h-6" />;
      case 'decision':
        return <HelpCircle className="w-6 h-6" />;
      case 'process':
        return <FileText className="w-6 h-6" />;
      case 'end':
        return <Shield className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getNodeColor = (type) => {
    switch (type) {
      case 'start':
        return 'bg-gradient-to-br from-blue-600 to-blue-700 text-white';
      case 'decision':
        return 'bg-gradient-to-br from-amber-500 to-amber-600 text-white';
      case 'process':
        return 'bg-gradient-to-br from-green-600 to-green-700 text-white';
      case 'end':
        return 'bg-gradient-to-br from-purple-600 to-purple-700 text-white';
      default:
        return 'bg-gradient-to-br from-gray-600 to-gray-700 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-10 h-10 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">San Mateo County Family Court</h1>
                <p className="text-blue-600 font-medium">Self-Help Legal Assistance Center</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>400 County Center, Redwood City</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span>(650) 261-5000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={goHome}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              <span>Start Over</span>
            </button>
            {history.length > 1 && (
              <button
                onClick={goBack}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Step {history.length} of your DVRO process
          </div>
        </div>

        {/* Current Node Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className={`p-6 ${getNodeColor(currentNodeData?.type)}`}>
            <div className="flex items-center space-x-3">
              {getNodeIcon(currentNodeData?.type)}
              <div>
                <h2 className="text-xl font-semibold">
                  {currentNodeData?.type === 'start' && 'Getting Started'}
                  {currentNodeData?.type === 'decision' && 'Question'}
                  {currentNodeData?.type === 'process' && 'Information'}
                  {currentNodeData?.type === 'end' && 'Complete'}
                </h2>
                <p className="text-sm opacity-90">
                  Domestic Violence Restraining Order Process
                </p>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-8">
            <div className="prose max-w-none">
              <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
                {currentNodeData?.text}
              </p>
            </div>

            {/* Emergency Notice */}
            {currentNode === 'DVROStart' && (
              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold text-red-800">Emergency Situation?</h3>
                </div>
                <p className="text-red-700 text-sm mt-2">
                  If you are in immediate danger, call 911. For 24/7 domestic violence support, 
                  call the National Domestic Violence Hotline at 1-800-799-7233.
                </p>
              </div>
            )}

            {/* Office Hours Notice */}
            {currentNode === 'Note' && (
              <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-blue-800">Self-Help Office Hours</h3>
                </div>
                <p className="text-blue-700 text-sm mt-2">
                  <strong>Mondays:</strong> 8:00 AM - 12:00 PM & 1:30 PM - 3:00 PM<br />
                  <strong>Location:</strong> 6th Floor, Self-Help Office<br />
                  <strong>Address:</strong> 400 County Center, Redwood City, CA 94063
                </p>
              </div>
            )}

            {/* Options - Only show if not a Note node */}
            {options.length > 0 && currentNode !== 'Note' && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {currentNodeData?.type === 'decision' ? 'Please select an option:' : 'Next steps:'}
                </h3>
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option.target)}
                      className="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-800 group-hover:text-blue-800 font-medium">
                          {option.text}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Continue button for Note node */}
            {currentNode === 'Note' && options.length > 0 && (
              <div className="mt-8">
                <button
                  onClick={() => handleOptionSelect(options[0].target)}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Continue
                </button>
              </div>
            )}

            {/* End state */}
            {options.length === 0 && currentNodeData?.type !== 'start' && (
              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">
                  This completes this section of the DVRO process.
                </p>
                <button
                  onClick={goHome}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Return to Main Menu
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        {history.length > 1 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Your Path:</h4>
            <div className="flex flex-wrap gap-2">
              {history.map((nodeId, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                >
                  {flowData.nodes[nodeId]?.text?.substring(0, 30)}
                  {flowData.nodes[nodeId]?.text?.length > 30 ? '...' : ''}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-3">Important Resources</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• National Domestic Violence Hotline: 1-800-799-7233</li>
                <li>• California Courts Self-Help: courts.ca.gov</li>
                <li>• Legal Aid Society of San Mateo County</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Court Information</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Family Court: (650) 261-5000</li>
                <li>• Self-Help Center: 6th Floor</li>
                <li>• Online Filing: Available</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Disclaimer</h3>
              <p className="text-sm text-gray-300">
                This tool provides general information only and does not constitute legal advice. 
                For specific legal questions, consult with an attorney or visit the Self-Help Center.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DVROFlowchart;
