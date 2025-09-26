import React, { useState, useEffect, useRef } from 'react';
import CompletionPage from './CompletionPage';
import ErrorBoundary from './ErrorBoundary';

const SimpleFlowRunner = ({ flow, onFinish, onBack, onHome }) => {
  const [currentNodeId, setCurrentNodeId] = useState(flow?.start || 'DVROStart');
  const [history, setHistory] = useState([flow?.start || 'DVROStart']);
  const [showSummary, setShowSummary] = useState(false);
  const progressScrollRef = useRef(null);

  const currentNode = flow?.nodes?.[currentNodeId];
  const outgoingEdges = flow?.edges?.filter(edge => edge.from === currentNodeId) || [];

  // Debug logging
  console.log('Current node:', currentNodeId, currentNode);
  console.log('Outgoing edges:', outgoingEdges);

  const handleNext = (nextNodeId) => {
    setCurrentNodeId(nextNodeId);
    setHistory(prev => [...prev, nextNodeId]);
  };

  // Auto-scroll to current step when it changes
  useEffect(() => {
    if (progressScrollRef.current) {
      // Find the current step element
      const currentStepElement = progressScrollRef.current.querySelector('.progress-step.current');
      if (currentStepElement) {
        // Scroll only within the sidebar container
        const container = progressScrollRef.current;
        const containerRect = container.getBoundingClientRect();
        const elementRect = currentStepElement.getBoundingClientRect();
        
        // Calculate if element is outside the visible area
        const isAbove = elementRect.top < containerRect.top;
        const isBelow = elementRect.bottom > containerRect.bottom;
        
        if (isAbove || isBelow) {
          // Scroll the container, not the whole page
          const scrollTop = currentStepElement.offsetTop - container.offsetTop - (container.clientHeight / 2) + (currentStepElement.clientHeight / 2);
          container.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
        }
      }
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      // Any cleanup needed when component unmounts or dependencies change
    };
  }, [currentNodeId, history]);

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

  const handleChoice = (edgeIndex) => {
    const edge = outgoingEdges[edgeIndex];
    console.log('Handling choice:', edgeIndex, edge);
    if (edge) {
      handleNext(edge.to);
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

  // Get all steps for display
  const getAllSteps = () => {
    return history;
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
        answers={{}}
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
  const hasMultipleChoices = outgoingEdges.length > 1;

  return (
    <ErrorBoundary>
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
              
              <div ref={progressScrollRef} className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg overflow-hidden">
                {getAllSteps().map((nodeId, index) => {
                  const node = flow?.nodes?.[nodeId];
                  const isCurrent = nodeId === currentNodeId;
                  const isClickable = index < history.length - 1; // Can't click current node
                  const isLast = index === getAllSteps().length - 1;
                  
                  return (
                    <div
                      key={nodeId}
                      className={`p-4 cursor-pointer transition-colors progress-step ${
                        isCurrent 
                          ? 'bg-blue-100 text-blue-900 current' 
                          : isClickable
                            ? 'bg-white hover:bg-gray-50'
                            : 'bg-gray-50'
                      } ${!isLast ? 'border-b border-gray-200' : ''}`}
                      onClick={isClickable ? () => handleHistoryClick(nodeId) : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                          isCurrent 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${
                            isCurrent ? 'font-medium' : ''
                          }`}>
                            {node?.text?.substring(0, 45)}...
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
                  {hasMultipleChoices ? (
                    // Multiple choices - show all outgoing edges as buttons with clear dividers
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      {outgoingEdges.map((edge, index) => {
                        const targetNode = flow?.nodes?.[edge.to];
                        const buttonText = edge.when || targetNode?.text || `Option ${index + 1}`;
                        const description = edge.when ? targetNode?.text : null;
                        const isLast = index === outgoingEdges.length - 1;
                        
                        // Check if this is an informational message that shouldn't be a button
                        const isQualificationMessage = edge.to === 'DVStart' || targetNode?.text?.includes('You may qualify for a Domestic Violence');
                        const isTimingInfo = edge.to === 'DVTiming' || targetNode?.text?.includes('Important Information: If you file for a Domestic Violence Restraining Order before noon');
                        const isInformationalNode = isQualificationMessage || isTimingInfo;
                        
                        if (isInformationalNode) {
                          // Render as plain text/info box instead of button
                          const isTimingMessage = isTimingInfo;
                          return (
                            <div
                              key={index}
                              className={`w-full p-5 ${
                                isTimingMessage 
                                  ? 'bg-yellow-50 border-l-4 border-yellow-400' 
                                  : 'bg-blue-50 border-l-4 border-blue-400'
                              } ${
                                !isLast ? 'border-b border-gray-200' : ''
                              }`}
                            >
                              <div className={`font-medium text-lg mb-1 ${
                                isTimingMessage ? 'text-yellow-900' : 'text-blue-900'
                              }`}>
                                {buttonText}
                              </div>
                              {description && (
                                <div className={`text-sm ${
                                  isTimingMessage ? 'text-yellow-700' : 'text-blue-700'
                                }`}>
                                  {description}
                                </div>
                              )}
                              <div className="mt-3">
                                <button
                                  onClick={() => handleChoice(index)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                  Continue
                                </button>
                              </div>
                            </div>
                          );
                        }
                        
                        return (
                          <button
                            key={index}
                            onClick={() => handleChoice(index)}
                            className={`w-full text-left p-5 border-none bg-white hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
                              !isLast ? 'border-b border-gray-200' : ''
                            }`}
                          >
                            <div className="font-medium text-gray-900 text-lg mb-1">
                              {buttonText}
                            </div>
                            {description && (
                              <div className="text-sm text-gray-600">
                                {description}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : outgoingEdges.length === 1 ? (
                    // Single next step
                    <button
                      onClick={() => handleNext(outgoingEdges[0].to)}
                      className="w-full p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                    >
                      Continue
                    </button>
                  ) : outgoingEdges.length === 0 ? (
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
    </ErrorBoundary>
  );
};

export default SimpleFlowRunner;
