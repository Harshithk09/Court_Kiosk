import React, { useState } from 'react';
import CompletionPage from './CompletionPage';

const SimpleFlowRunner = ({ flow, onFinish, onBack, onHome }) => {
  const [currentNodeId, setCurrentNodeId] = useState(flow?.start || 'DVROStart');
  const [answers] = useState({});
  const [history, setHistory] = useState([flow?.start || 'DVROStart']);
  const [showSummary, setShowSummary] = useState(false);

  const currentNode = flow?.nodes?.[currentNodeId];
  const outgoingEdges = flow?.edges?.filter(edge => edge.from === currentNodeId) || [];
  const nodeOptions = currentNode?.options || [];

  // Debug logging
  console.log('Current node:', currentNodeId, currentNode);
  console.log('Outgoing edges:', outgoingEdges);

  const handleNext = (nextNodeId) => {
    setCurrentNodeId(nextNodeId);
    setHistory(prev => [...prev, nextNodeId]);
  };

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      const previousNode = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentNodeId(previousNode);
    } else {
      onBack?.();
    }
  };

  // Removed unused handleAnswer function

  const handleChoice = (optionIndex) => {
    const option = availableOptions[optionIndex];
    console.log('Handling choice:', optionIndex, option);
    if (option) {
      const nextNodeId = option.to || option.target;
      if (nextNodeId) {
        handleNext(nextNodeId);
      }
    }
  };

  const handleHistoryClick = (nodeId) => {
    const nodeIndex = history.indexOf(nodeId);
    if (nodeIndex !== -1) {
      const newHistory = history.slice(0, nodeIndex + 1);
      setHistory(newHistory);
      setCurrentNodeId(nodeId);
    }
  };

  const handleComplete = () => {
    setShowSummary(true);
  };

  const handleSummaryBack = () => {
    setShowSummary(false);
  };



  if (showSummary) {
    return (
      <CompletionPage
        answers={answers}
        history={history}
        flow={flow}
        onBack={handleSummaryBack}
        onHome={onHome}
      />
    );
  }

  if (!currentNode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Node not found: {currentNodeId}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isEndNode = currentNode.type === 'end';
  // Removed unused isDecisionNode variable
  const hasMultipleChoices = nodeOptions.length > 1 || outgoingEdges.length > 1;
  const availableOptions = nodeOptions.length > 0 ? nodeOptions : outgoingEdges;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold text-gray-900">Family Court Clinic</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onHome}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Home
            </button>
            <div className="text-sm text-gray-600">
              Step {history.length}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
              
              <div className="space-y-2">
                {history.map((nodeId, index) => {
                  const node = flow?.nodes?.[nodeId];
                  const isCurrent = nodeId === currentNodeId;
                  const isClickable = index < history.length - 1; // Can't click current node
                  
                  return (
                    <div
                      key={nodeId}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        isCurrent 
                          ? 'bg-blue-100 border-blue-300 text-blue-900' 
                          : isClickable
                            ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            : 'bg-gray-50 border-gray-200'
                      }`}
                      onClick={isClickable ? () => handleHistoryClick(nodeId) : undefined}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          isCurrent ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${
                            isCurrent ? 'font-medium' : ''
                          }`}>
                            {node?.text?.substring(0, 40)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Progress:</span>
                    <span>{history.length} steps</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Node Content */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {currentNode.text}
                </h2>
              </div>

              {/* Navigation Options */}
              {!isEndNode && (
                <div className="space-y-4">
                  {currentNode.type === 'process' ? (
                    // Informational/process nodes - show as non-interactive info box
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="font-medium text-gray-900 text-lg">
                        {currentNode.text}
                      </div>
                      {availableOptions.length > 0 && (
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              const option = availableOptions[0];
                              const nextNodeId = option.to || option.target;
                              if (nextNodeId) handleNext(nextNodeId);
                            }}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Continue
                          </button>
                        </div>
                      )}
                    </div>
                  ) : hasMultipleChoices ? (
                    // Multiple choices - show all available options as buttons
                    <div className="space-y-3">
                      {availableOptions.map((option, index) => {
                        const buttonText = option.text || option.when || `Option ${index + 1}`;
                        const targetNodeId = option.to || option.target;
                        const targetNode = flow?.nodes?.[targetNodeId];
                        const description = option.when ? targetNode?.text : null;
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handleChoice(index)}
                            className="w-full text-left p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                          >
                            <div className="font-medium text-gray-900 text-lg">
                              {buttonText}
                            </div>
                            {description && (
                              <div className="text-sm text-gray-600 mt-2">
                                {description}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : availableOptions.length === 1 ? (
                    // Single next step
                    <button
                      onClick={() => {
                        const option = availableOptions[0];
                        const nextNodeId = option.to || option.target;
                        if (nextNodeId) handleNext(nextNodeId);
                      }}
                      className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                    >
                      Continue
                    </button>
                  ) : availableOptions.length === 0 ? (
                    // No outgoing edges - end of flow
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">You've reached the end of this flow.</p>
                      <button
                        onClick={handleComplete}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        View Next Steps
                      </button>
                    </div>
                  ) : null}
                </div>
              )}

              {/* End node */}
              {isEndNode && (
                <div className="text-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-medium text-green-800 mb-2">
                      Process Complete
                    </h3>
                    <p className="text-green-700">
                      {currentNode.text}
                    </p>
                  </div>
                  
                  <div className="space-x-4">
                    <button
                      onClick={handleBack}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={handleComplete}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Next Steps
                    </button>
                  </div>
                </div>
                             )}
             </div>
           </div>
         </div>
       </div>
    </div>
  );
};

export default SimpleFlowRunner;
