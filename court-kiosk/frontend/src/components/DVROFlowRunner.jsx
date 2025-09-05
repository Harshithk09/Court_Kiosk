import React, { useState, useEffect } from 'react';
import './DVROFlowRunner.css';

const DVROFlowRunner = () => {
  const [currentNode, setCurrentNode] = useState('menu');
  const [flowHistory, setFlowHistory] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flowData, setFlowData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the flow data
    const loadFlowData = async () => {
      try {
        const response = await fetch('/data/dvro_flow.json');
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
    setFlowHistory(prev => [...prev, { node: currentNode, answer: option }]);
    setCurrentNode(nextNode);
    
    if (option.value) {
      setAnswers(prev => ({ ...prev, [currentNode]: option.value }));
    }
  };

  const handleBack = () => {
    if (flowHistory.length > 0) {
      const previousStep = flowHistory[flowHistory.length - 1];
      setFlowHistory(prev => prev.slice(0, -1));
      setCurrentNode(previousStep.node);
    }
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
        <div className="answers-summary">
          {Object.entries(answers).map(([question, answer]) => (
            <div key={question} className="answer-item">
              <strong>{question}:</strong> {answer}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DVROFlowRunner;
