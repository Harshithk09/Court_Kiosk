import React, { useState, useEffect } from 'react';
import { ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import AdaptiveSidebar from './AdaptiveSidebar';

const EnhancedFlowRunnerWithSidebar = ({ 
  flowData, 
  onComplete, 
  onBack,
  queueNumber = null,
  language = 'en'
}) => {
  const [currentNode, setCurrentNode] = useState(flowData?.start || 'DVROStart');
  const [history, setHistory] = useState([flowData?.start || 'DVROStart']);
  const [progress, setProgress] = useState([]);
  const [steps, setSteps] = useState([]);

  // Initialize steps from flow data
  useEffect(() => {
    if (flowData && flowData.nodes) {
      const flowSteps = Object.keys(flowData.nodes).map((nodeId, index) => ({
        id: index + 1,
        nodeId: nodeId,
        title: flowData.nodes[nodeId]?.text?.substring(0, 50) + (flowData.nodes[nodeId]?.text?.length > 50 ? '...' : ''),
        completed: false,
        type: flowData.nodes[nodeId]?.type || 'process'
      }));
      setSteps(flowSteps);
    }
  }, [flowData]);

  // Update progress when current node changes
  useEffect(() => {
    if (currentNode && steps.length > 0) {
      const currentStepIndex = steps.findIndex(step => step.nodeId === currentNode);
      if (currentStepIndex >= 0) {
        const updatedSteps = steps.map((step, index) => ({
          ...step,
          completed: index < currentStepIndex
        }));
        setSteps(updatedSteps);
      }
    }
  }, [currentNode, steps.length]);

  const getCurrentNodeData = () => {
    return flowData?.nodes?.[currentNode];
  };

  const getNodeOptions = () => {
    if (!flowData?.edges) return [];
    
    return flowData.edges
      .filter(edge => edge.from === currentNode)
      .map(edge => ({
        target: edge.to,
        text: edge.when || 'Continue',
        when: edge.when
      }));
  };

  const handleNodeResponse = (targetNode) => {
    if (!targetNode) return;

    // Add to history
    const newHistory = [...history, targetNode];
    setHistory(newHistory);

    // Add to progress
    const currentNodeData = getCurrentNodeData();
    const newProgress = [...progress, {
      node: currentNode,
      text: currentNodeData?.text || '',
      timestamp: new Date().toISOString()
    }];
    setProgress(newProgress);

    // Update current node
    setCurrentNode(targetNode);

    // Check if this is an end node
    const targetNodeData = flowData?.nodes?.[targetNode];
    if (targetNodeData?.type === 'end') {
      if (onComplete) {
        onComplete({
          finalNode: targetNode,
          progress: newProgress,
          history: newHistory
        });
      }
    }
  };

  const handleStepChange = (stepId) => {
    const step = steps.find(s => s.id === stepId);
    if (step) {
      setCurrentNode(step.nodeId);
    }
  };

  const renderNode = () => {
    const node = getCurrentNodeData();
    if (!node) return null;

    const options = getNodeOptions();
    const isDecision = node.type === 'decision';
    const isEnd = node.type === 'end';
    const isNote = currentNode === 'Note';

    return (
      <div className="flow-node">
        <div className={`node-content ${node.type}`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">{node.text}</h3>
          
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
          {isNote && (
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
          
          {/* Decision Options */}
          {isDecision && options.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Please select an option:</h3>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 group"
                    onClick={() => handleNodeResponse(option.target)}
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
          
          {/* Continue button for process nodes */}
          {!isDecision && !isEnd && !isNote && options.length > 0 && (
            <div className="mt-8">
              <button
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                onClick={() => handleNodeResponse(options[0].target)}
              >
                Continue
              </button>
            </div>
          )}

          {/* Continue button for Note node */}
          {isNote && options.length > 0 && (
            <div className="mt-8">
              <button
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                onClick={() => handleNodeResponse(options[0].target)}
              >
                Continue
              </button>
            </div>
          )}
          
          {/* End state */}
          {isEnd && (
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                This completes this section of the DVRO process.
              </p>
              <button
                onClick={() => onComplete && onComplete({ finalNode: currentNode, progress, history })}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Complete Process
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!flowData) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading flow data...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex(step => step.nodeId === currentNode) + 1;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Adaptive Sidebar */}
      <AdaptiveSidebar
        steps={steps}
        currentStep={currentStepIndex}
        onStepChange={handleStepChange}
        onBack={onBack}
        title="Family Court Clinic"
        subtitle={queueNumber ? `Queue: ${queueNumber}` : "DVRO Process"}
      />

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Step {currentStepIndex} of {steps.length}
            </h2>
            {queueNumber && (
              <span className="text-sm text-gray-500">
                Queue: {queueNumber}
              </span>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {renderNode()}
          </div>

          {/* Progress Summary */}
          {progress.length > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-2">
                {progress.slice(-5).map((entry, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{entry.text.substring(0, 60)}...</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedFlowRunnerWithSidebar;
