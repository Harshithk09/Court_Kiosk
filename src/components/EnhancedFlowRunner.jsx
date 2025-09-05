import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './EnhancedFlowRunner.css';

const EnhancedFlowRunner = ({ queueNumber, caseType, onComplete }) => {
  const { language } = useLanguage();
  const [flowData, setFlowData] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [userResponse, setUserResponse] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatMode, setIsChatMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState([]);
  const [showAllProgress, setShowAllProgress] = useState(false);

  // Use the same API base URL as the existing system
  const API_BASE_URL = 'http://localhost:1904';

  useEffect(() => {
    loadFlowData();
  }, [caseType]);

  const loadFlowData = async () => {
    try {
      // Load the appropriate flowchart based on case type
      let flowFile = 'dvro/dv_flow_combined.json'; // Default to DV
      
      if (caseType?.flowchart_file) {
        flowFile = caseType.flowchart_file;
      }
      
      const response = await fetch(`/data/${flowFile}`);
      const data = await response.json();
      setFlowData(data);
      setCurrentNode(data.start);
    } catch (error) {
      console.error('Error loading flow data:', error);
    }
  };

  const updateProgress = async (nodeId, nodeText, response = null) => {
    if (!queueNumber) {
      console.log('No queue number available for progress update');
      return;
    }

    try {
      console.log(`Updating progress for queue ${queueNumber}:`, { nodeId, nodeText, response });
      const result = await fetch(`${API_BASE_URL}/api/queue/${queueNumber}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          node_id: nodeId,
          node_text: nodeText,
          user_response: response
        }),
      });
      
      if (!result.ok) {
        console.error('Failed to update progress:', result.status, result.statusText);
      } else {
        console.log('Progress updated successfully');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleNodeResponse = async (response) => {
    if (!currentNode || !flowData) return;

    const node = flowData.nodes[currentNode];
    const nodeText = node.text;
    
    // Update progress
    await updateProgress(currentNode, nodeText, response);
    
    // Add to local progress
    setProgress(prev => [...prev, {
      node: currentNode,
      text: nodeText,
      response: response,
      timestamp: new Date()
    }]);

    // Find next node based on response
    const edges = flowData.edges.filter(edge => edge.from === currentNode);
    
    if (edges.length === 1) {
      // Single path
      setCurrentNode(edges[0].to);
    } else if (edges.length > 1) {
      // Multiple paths - find matching edge
      const matchingEdge = edges.find(edge => 
        edge.when && response === edge.when
      );
      
      if (matchingEdge) {
        setCurrentNode(matchingEdge.to);
      } else {
        // Default to first edge without 'when' condition
        const defaultEdge = edges.find(edge => !edge.when);
        if (defaultEdge) {
          setCurrentNode(defaultEdge.to);
        }
      }
    }

    setUserResponse('');
  };

  const handleChatMessage = async (message) => {
    if (!message.trim()) return;

    setLoading(true);
    
    // Add user message to chat
    const newChatHistory = [...chatHistory, { role: 'user', content: message }];
    setChatHistory(newChatHistory);

    try {
      const response = await fetch(`${API_BASE_URL}/api/llm/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          queue_number: queueNumber,
          language: language,
          flowchart_data: flowData,
          current_node: currentNode
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setChatHistory([...newChatHistory, { role: 'assistant', content: data.response }]);
      } else {
        setChatHistory([...newChatHistory, { 
          role: 'assistant', 
          content: language === 'es' ? 'Lo siento, hubo un error. Inténtalo de nuevo.' : 'Sorry, there was an error. Please try again.' 
        }]);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      setChatHistory([...newChatHistory, { 
        role: 'assistant', 
        content: language === 'es' ? 'Error de conexión. Inténtalo de nuevo.' : 'Connection error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentNodeData = () => {
    if (!currentNode || !flowData) return null;
    return flowData.nodes[currentNode];
  };

  const getNodeOptions = () => {
    if (!currentNode || !flowData) return [];
    
    const edges = flowData.edges.filter(edge => edge.from === currentNode);
    return edges.map(edge => ({
      to: edge.to,
      when: edge.when,
      text: flowData.nodes[edge.to]?.text || edge.to
    }));
  };

  // Smart progress logic for EnhancedFlowRunner
  const getSmartProgressSteps = () => {
    const totalSteps = progress.length;
    
    // If showing all steps or less than 8 steps, show everything
    if (showAllProgress || totalSteps <= 8) {
      return progress.map((step, index) => ({
        ...step,
        originalIndex: index
      }));
    }
    
    // Smart compression: current + past 5 + first step + collapsed
    const pastSteps = 5;
    const startIndex = Math.max(0, totalSteps - pastSteps - 1);
    
    const steps = [];
    
    // Add first step
    if (progress.length > 0) {
      steps.push({
        ...progress[0],
        originalIndex: 0
      });
    }
    
    // Add collapsed indicator if there are steps between first and startIndex
    if (startIndex > 1) {
      steps.push({ 
        type: 'collapsed', 
        count: startIndex - 1,
        text: `${startIndex - 1} more steps`,
        onClick: () => setShowAllProgress(true)
      });
    }
    
    // Add recent steps (past 5)
    for (let i = startIndex; i < totalSteps; i++) {
      steps.push({
        ...progress[i],
        originalIndex: i
      });
    }
    
    return steps;
  };

  const handleStepClick = (step, index) => {
    if (step.type === 'collapsed') {
      step.onClick();
      return;
    }
    
    // Navigate to the clicked step
    if (step.originalIndex !== undefined && flowData) {
      // Find the node that corresponds to this step
      const stepNode = step.node;
      if (stepNode && flowData.nodes[stepNode]) {
        setCurrentNode(stepNode);
        console.log(`Navigated to step ${step.originalIndex}: ${stepNode}`);
      }
    }
  };

  const renderNode = () => {
    const node = getCurrentNodeData();
    if (!node) return null;

    const options = getNodeOptions();
    const isDecision = node.type === 'decision';
    const isEnd = node.type === 'end';

    return (
      <div className="flow-node">
        <div className={`node-content ${node.type}`}>
          <h3>{node.text}</h3>
          
          {isDecision && options.length > 0 && (
            <div className="node-options">
              {options.map((option, index) => (
                <button
                  key={index}
                  className="option-btn"
                  onClick={() => handleNodeResponse(option.when || option.text)}
                >
                  {option.when || option.text}
                </button>
              ))}
            </div>
          )}
          
          {!isDecision && !isEnd && (
            <div className="node-actions">
              <button
                className="btn btn-primary"
                onClick={() => handleNodeResponse('Continue')}
              >
                {language === 'es' ? 'Continuar' : 'Continue'}
              </button>
            </div>
          )}
          
          {isEnd && (
            <div className="node-actions">
              <button
                className="btn btn-success"
                onClick={async () => {
                  // Mark the case as completed in the backend
                  if (queueNumber) {
                    try {
                      await fetch(`${API_BASE_URL}/api/queue/${queueNumber}/complete`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          queue_number: queueNumber
                        }),
                      });
                      console.log('Case marked as completed');
                    } catch (error) {
                      console.error('Error completing case:', error);
                    }
                  }
                  
                  // Call the original onComplete callback
                  if (onComplete) {
                    onComplete();
                  }
                }}
              >
                {language === 'es' ? 'Completar Proceso' : 'Complete Process'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return (
      <div className="chat-interface">
        <div className="chat-header">
          <h3>{language === 'es' ? 'Chat con Asistente' : 'Chat with Assistant'}</h3>
          <button
            className="btn btn-secondary"
            onClick={() => setIsChatMode(false)}
          >
            {language === 'es' ? 'Volver al Flujo' : 'Back to Flow'}
          </button>
        </div>
        
        <div className="chat-messages">
          {chatHistory.map((message, index) => (
            <div key={index} className={`chat-message ${message.role}`}>
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="chat-input">
          <input
            type="text"
            placeholder={language === 'es' ? 'Escribe tu pregunta...' : 'Type your question...'}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleChatMessage(e.target.value);
                e.target.value = '';
              }
            }}
          />
          <button
            className="btn btn-primary"
            onClick={(e) => {
              const input = e.target.previousSibling;
              if (!loading && input.value.trim()) {
                handleChatMessage(input.value);
                input.value = '';
              }
            }}
            disabled={loading}
          >
            {language === 'es' ? 'Enviar' : 'Send'}
          </button>
        </div>
      </div>
    );
  };

  if (!flowData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{language === 'es' ? 'Cargando...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="enhanced-flow-runner">
      <div className="flow-header">
        <div className="flow-branding">
          <div className="court-seal-mini">
            <span>SM</span>
          </div>
          <div className="flow-title">
            <h2>San Mateo Family Court Clinic</h2>
            <p>{caseType?.name || 'Case Processing'}</p>
          </div>
        </div>
        
        <div className="queue-info">
          {queueNumber && (
            <div className="queue-number-display">
              {language === 'es' ? 'Número de cola:' : 'Queue number:'} {queueNumber}
            </div>
          )}
        </div>
        
        <div className="flow-controls">
          <button
            className="btn btn-secondary"
            onClick={() => setIsChatMode(!isChatMode)}
          >
            {isChatMode 
              ? (language === 'es' ? 'Ver Flujo' : 'View Flow')
              : (language === 'es' ? 'Chat con IA' : 'AI Chat')
            }
          </button>
        </div>
      </div>

      <div className="flow-content">
        {isChatMode ? renderChat() : renderNode()}
      </div>

      {!isChatMode && progress.length > 0 && (
        <div className="progress-sidebar">
          <div className="progress-header">
            <h4>{language === 'es' ? 'Progreso' : 'Progress'}</h4>
            <div className="progress-indicator">
              {language === 'es' ? 'Paso' : 'Step'} {progress.length + 1} {language === 'es' ? 'de' : 'of'} {progress.length + 1}
            </div>
          </div>
          <div className="progress-list">
            {getSmartProgressSteps().map((step, index) => {
              if (step.type === 'collapsed') {
                return (
                  <div
                    key={`collapsed-${index}`}
                    className="progress-step collapsed-step"
                    onClick={() => handleStepClick(step, index)}
                  >
                    <div className="step-content">
                      <div className="step-text">
                        <span className="collapsed-icon">⋯</span>
                        {step.text}
                      </div>
                    </div>
                  </div>
                );
              }
              
              const isCurrentStep = step.node === currentNode;
              return (
                <div 
                  key={index} 
                  className={`progress-step ${isCurrentStep ? 'current-step' : ''}`}
                  onClick={() => handleStepClick(step, index)}
                >
                  <div className="step-number">{step.originalIndex + 1}</div>
                  <div className="step-content">
                    <div className="step-text">{step.text}</div>
                    {step.response && (
                      <div className="step-response">{step.response}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {showAllProgress && progress.length > 8 && (
            <div className="progress-actions">
              <button
                onClick={() => setShowAllProgress(false)}
                className="show-less-btn"
              >
                {language === 'es' ? 'Mostrar Menos' : 'Show Less'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedFlowRunner;
