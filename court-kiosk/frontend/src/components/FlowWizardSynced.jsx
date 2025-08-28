import React, { useState, useEffect } from 'react';
import { useFlowSync } from './FlowSyncStore';
import { SummaryPrintable, ExportPDFButton } from './PDFExport';

const FlowWizardSynced = ({ flow, FlowWizardComponent }) => {
  const { currentNodeId, setCurrentNodeId, progress, addToProgress, clearProgress } = useFlowSync();
  const [currentNode, setCurrentNode] = useState(null);

  useEffect(() => {
    if (currentNodeId && flow.nodes[currentNodeId]) {
      setCurrentNode(flow.nodes[currentNodeId]);
    }
  }, [currentNodeId, flow.nodes]);

  const handleChoice = (choiceIndex) => {
    if (!currentNode || !currentNode.outgoingEdges) return;

    const selectedEdge = currentNode.outgoingEdges[choiceIndex];
    if (selectedEdge && selectedEdge.to) {
      // Add to progress
      addToProgress(currentNodeId, selectedEdge.when || selectedEdge.text);
      
      // Move to next node
      setCurrentNodeId(selectedEdge.to);
    }
  };

  const handleRestart = () => {
    clearProgress();
    setCurrentNodeId(flow.start);
  };

  // If using the original FlowWizard component, pass the necessary props
  if (FlowWizardComponent) {
    return (
      <FlowWizardComponent
        flow={flow}
        currentNodeId={currentNodeId}
        onChoice={handleChoice}
        onRestart={handleRestart}
        progress={progress}
      />
    );
  }

  // Default wizard implementation
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">DVRO Process Wizard</h2>
        <p className="text-gray-600">Follow the steps to complete your DVRO application</p>
      </div>

      {currentNode && (
        <div className="space-y-6">
          {/* Node Content */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {currentNode.title || currentNodeId}
            </h3>
            {currentNode.text && (
              <p className="text-gray-700 mb-4">{currentNode.text}</p>
            )}
          </div>

          {/* Choices */}
          {currentNode.outgoingEdges && currentNode.outgoingEdges.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Choose an option:</h4>
              {currentNode.outgoingEdges.map((edge, index) => {
                const buttonText = edge.when || edge.text || `Option ${index + 1}`;
                const description = edge.when ? null : edge.text;
                
                // Check if this is informational text
                const isInformational = buttonText.toLowerCase().includes('qualify') || 
                                      buttonText.toLowerCase().includes('note') ||
                                      buttonText.toLowerCase().includes('information') ||
                                      buttonText.toLowerCase().includes('may') ||
                                      !edge.when;

                if (isInformational) {
                  return (
                    <div
                      key={index}
                      className="w-full text-left p-4 border border-blue-200 rounded-lg bg-blue-50"
                    >
                      <div className="font-medium text-blue-900 text-lg">
                        {buttonText}
                      </div>
                      {description && (
                        <div className="text-sm text-blue-700 mt-2">
                          {description}
                        </div>
                      )}
                    </div>
                  );
                } else {
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
                }
              })}
            </div>
          )}

          {/* End State */}
          {currentNode.kind === 'end' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Process Complete!</h3>
                <p className="text-green-700">You've reached the end of this flow.</p>
              </div>

              {/* Printable content */}
              <div id="dvro-print-area" className="border rounded-xl p-3 bg-white">
                <SummaryPrintable progress={progress} nodes={flow.nodes} />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <ExportPDFButton targetId="dvro-print-area" filename="DVRO-summary.pdf" />
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Restart
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Indicator */}
      {progress.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Your Progress</h4>
          <div className="text-sm text-gray-600">
            {progress.length} step{progress.length !== 1 ? 's' : ''} completed
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowWizardSynced;
