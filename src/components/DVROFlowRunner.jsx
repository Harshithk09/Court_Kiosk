import React, { useState, useEffect } from 'react';
import './DVROFlowRunner.css';

const DVROFlowRunner = () => {
  const [currentNode, setCurrentNode] = useState('');
  const [flowHistory, setFlowHistory] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flowData, setFlowData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the flow data
    const loadFlowData = async () => {
      try {
        const response = await fetch('/data/dv_flow_combined.json');
        const data = await response.json();
        setFlowData(data);
        setCurrentNode(data.start);
        setLoading(false);
      } catch (error) {
        console.error('Error loading flow data:', error);
        setLoading(false);
      }
    };

    loadFlowData();
  }, []);

  const handleOptionSelect = (option) => {
    const nextNode = option.to || option.next || option;
    setFlowHistory(prev => [...prev, { node: currentNode, answer: option }]);
    setCurrentNode(nextNode);

    if (option.value) {
      setAnswers(prev => ({ ...prev, [currentNode]: option.value }));
    } else if (option.text) {
      setAnswers(prev => ({ ...prev, [currentNode]: option.text }));
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
    if (!flowData || !flowData.nodes[nodeId]) {
      return <div className="error">Node not found: {nodeId}</div>;
    }

    const node = flowData.nodes[nodeId];
    const options = node.options || [];

    switch (node.type) {
      case 'decision':
      case 'question':
        return (
          <div className="node decision-node">
            <div className="node-content">
              <h3 className="node-question">{node.text}</h3>
            </div>
            <div className="node-options">
              {options.map((option, index) => (
                <button
                  key={index}
                  className="btn btn-option"
                  onClick={() => handleOptionSelect(option)}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        );

      case 'process':
      case 'start':
        return (
          <div className="node process-node">
            <div className="node-content">
              <p className="node-text">{node.text}</p>
            </div>
            <div className="node-actions">
              {options.length > 0 ? (
                options.map((option, index) => (
                  <button
                    key={index}
                    className="btn btn-primary"
                    onClick={() => handleOptionSelect(option)}
                  >
                    {option.text || 'Continue'}
                  </button>
                ))
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentNode(flowData.start)}
                >
                  Back to Start
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
              <p className="node-text">{node.text}</p>
            </div>
            <div className="node-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setCurrentNode(flowData.start);
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
