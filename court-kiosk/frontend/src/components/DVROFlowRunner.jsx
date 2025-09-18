import React, { useState, useEffect, useRef } from 'react';
import './DVROFlowRunner.css';

const DVROFlowRunner = () => {
  const [currentNode, setCurrentNode] = useState('menu');
  const [flowHistory, setFlowHistory] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flowData, setFlowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const progressScrollRef = useRef(null);

  useEffect(() => {
    // Load the flow data
    const loadFlowData = async () => {
      try {
        const response = await fetch('/data/dv_flow_combined.json');
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

  const handleOptionSelect = (option) => {
    const nextNode = option.next || option;
    const stepData = {
      node: currentNode,
      answer: option,
      stepNumber: flowHistory.length + 1,
      timestamp: new Date().toISOString()
    };
    setFlowHistory(prev => [...prev, stepData]);
    setCurrentNode(nextNode);
    
    if (option.value) {
      setAnswers(prev => ({ ...prev, [currentNode]: option.value }));
    }
  };

  // Auto-scroll to current step when it changes
  useEffect(() => {
    if (progressScrollRef.current && flowHistory.length > 0) {
      // Find the current step element (last step in history)
      const currentStepElement = progressScrollRef.current.querySelector('.progress-step.current-step');
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
  }, [flowHistory, currentNode]);

  const handleBack = () => {
    if (flowHistory.length > 0) {
      const previousStep = flowHistory[flowHistory.length - 1];
      setFlowHistory(prev => prev.slice(0, -1));
      setCurrentNode(previousStep.node);
    }
  };

  // Get all steps for display
  const getAllSteps = () => {
    return flowHistory;
  };

  // Get step text for display
  const getStepText = (step) => {
    if (!flowData || !flowData.pages[step.node]) return 'Unknown step';
    
    const node = flowData.pages[step.node];
    const nodeText = node.text || node.question || node.info || 'Step completed';
    
    // Truncate long text for better display
    return nodeText.length > 60 ? nodeText.substring(0, 60) + '...' : nodeText;
  };

  const renderNode = (nodeId) => {
    if (!flowData || !flowData.pages[nodeId]) {
      return <div className="error">Node not found: {nodeId}</div>;
    }

    const node = flowData.pages[nodeId];
    const options = node.options || [];

    switch (node.type) {
      case 'question':
        return (
          <div className="node decision-node">
            <div className="node-content">
              <p className="node-info">{node.info?.en || node.info}</p>
              <h3 className="node-question">{node.question?.en || node.question}</h3>
            </div>
            <div className="node-options">
              {options.map((option, index) => (
                <button
                  key={index}
                  className="btn btn-option"
                  onClick={() => handleOptionSelect({ next: option.next, value: option.value })}
                >
                  {option.label?.en || option.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 'process':
        return (
          <div className="node process-node">
            <div className="node-content">
              <p className="node-text">{node.info?.en || node.info}</p>
            </div>
            <div className="node-actions">
              {options.length > 0 ? (
                options.map((option, index) => (
                  <button
                    key={index}
                    className="btn btn-primary"
                    onClick={() => handleOptionSelect({ next: option.next, value: option.value })}
                  >
                    {option.label?.en || 'Continue'}
                  </button>
                ))
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => handleOptionSelect('menu')}
                >
                  Back to Menu
                </button>
              )}
            </div>
          </div>
        );



      case 'end':
        return (
          <div className="node end-node">
            <div className="node-content">
              <h2 className="node-title">Process Complete</h2>
              <p className="node-text">{node.info?.en || node.info}</p>
            </div>
            <div className="node-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setCurrentNode('menu');
                  setFlowHistory([]);
                  setAnswers({});
                }}
              >
                Start Over
              </button>
            </div>
          </div>
        );

      default:
        return <div className="error">Unknown node type: {node.type}</div>;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading DVRO Flow...</p>
      </div>
    );
  }

  return (
    <div className="dvro-flow-container">
      <div className="flow-header">
        <h1>Domestic Violence Restraining Order (DVRO)</h1>
        <p>Guided assistance for filing a DVRO</p>
      </div>

      <div className="flow-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(flowHistory.length / 20) * 100}%` }}
          ></div>
        </div>
        <span className="progress-text">
          Step {flowHistory.length + 1}
        </span>
      </div>

      <div className="flow-content">
        {renderNode(currentNode)}
      </div>

      <div className="flow-navigation">
        {flowHistory.length > 0 && (
          <button className="btn btn-back" onClick={handleBack}>
            ← Back
          </button>
        )}
      </div>

      <div className="flow-summary">
        <h3>Your Progress</h3>
        <div ref={progressScrollRef} className="progress-steps">
          {getAllSteps().map((step, index) => (
            <div 
              key={`${step.stepNumber}-${step.timestamp}`} 
              className={`progress-step ${index === getAllSteps().length - 1 ? 'current-step' : ''}`}
            >
              <div className="step-number">{step.stepNumber}</div>
              <div className="step-content">
                <div className="step-text">{getStepText(step)}</div>
                {step.answer && step.answer.label && (
                  <div className="step-answer">
                    <strong>Your choice:</strong> {step.answer.label.en || step.answer.label}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DVROFlowRunner;
