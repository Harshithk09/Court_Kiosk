import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CompletionPage from './CompletionPage';

const KioskFlow = ({ flowType = 'divorce' }) => {
  const [flowData, setFlowData] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [flowHistory, setFlowHistory] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadFlowData = async () => {
      try {
        let dataFile;
        if (flowType === 'divorce') {
          dataFile = '/data/divorce/divorce_flow.json';
        } else {
          dataFile = '/data/dvro/dv_flow_combined.json';
        }

        const response = await fetch(dataFile);
        const data = await response.json();
        setFlowData(data);
        
        // Set initial node
        const startNode = data.nodes[data.start];
        setCurrentNode(startNode);
        setFlowHistory([data.start]);
      } catch (error) {
        console.error('Error loading flow data:', error);
      }
    };

    loadFlowData();
  }, [flowType]);

  const getFlowTitle = () => {
    if (flowType === 'divorce') {
      return 'Divorce Process';
    } else {
      return 'Domestic Violence Restraining Order (DVRO)';
    }
  };

  const getFlowDescription = () => {
    if (flowType === 'divorce') {
      return 'Guide through divorce proceedings and legal separation';
    } else {
      return 'Guide through domestic violence restraining order process';
    }
  };

  const handleChoice = (option) => {
    if (option.to) {
      const nextNode = flowData.nodes[option.to];
      if (nextNode) {
        setCurrentNode(nextNode);
        setFlowHistory(prev => [...prev, option.to]);
        
        // Store the answer
        setAnswers(prev => ({
          ...prev,
          [currentNode.id]: option.text
        }));
      }
    }
  };

  const handleBack = () => {
    if (flowHistory.length > 1) {
      const newHistory = flowHistory.slice(0, -1);
      const previousNodeId = newHistory[newHistory.length - 1];
      const previousNode = flowData.nodes[previousNodeId];
      
      setFlowHistory(newHistory);
      setCurrentNode(previousNode);
      
      // Remove the last answer
      const newAnswers = { ...answers };
      delete newAnswers[previousNodeId];
      setAnswers(newAnswers);
    }
  };

  const handleStartOver = () => {
    const startNode = flowData.nodes[flowData.start];
    setCurrentNode(startNode);
    setFlowHistory([flowData.start]);
    setAnswers({});
  };

  const handleComplete = () => {
    setShowSummary(true);
  };

  const handleSummaryBack = () => {
    setShowSummary(false);
  };

  const onHome = () => {
    navigate('/');
  };

  if (showSummary) {
    return (
      <CompletionPage
        answers={answers}
        flowHistory={flowHistory}
        flowData={flowData}
        onBack={handleSummaryBack}
        onHome={onHome}
      />
    );
  }

  if (!flowData || !currentNode) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {getFlowTitle()}...</p>
        </div>
      </div>
    );
  }

  // Render both flows with the same sidebar progress layout
  const steps = flowHistory.map((nodeId, index) => {
    const node = flowData.nodes[nodeId];
    return node?.text?.split('\n')[0] || `Step ${index + 1}`;
  });

  return (
    <div className="flex h-screen">
      {/* Sidebar Progress */}
      <aside className="w-1/4 bg-gray-50 border-r p-6">
        <h2 className="text-lg font-semibold mb-6">Your Progress</h2>
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li
              key={index}
              className={`p-3 rounded-lg ${
                index === steps.length - 1
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600'
              }`}
            >
              {step}
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-gray-500">Progress: {steps.length} of {Object.keys(flowData.nodes).length} steps</p>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-10">
        <div className="max-w-xl text-center">
          <h1 className="text-xl font-semibold mb-4">{currentNode.text?.split('\n')[0] || `${getFlowTitle()} Process`}</h1>
          
          {/* Show additional text if node has multiple lines */}
          {currentNode.text && currentNode.text.includes('\n') && (
            <p className="text-gray-700 mb-8">
              {currentNode.text.split('\n').slice(1).join(' ')}
            </p>
          )}

          {/* Show options if available */}
          {currentNode.options && currentNode.options.length > 0 && (
            <div className="space-y-4 mb-8">
              {currentNode.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleChoice(option)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
                >
                  {option.text}
                </button>
              ))}
            </div>
          )}

          {/* Show continue button if no options */}
          {(!currentNode.options || currentNode.options.length === 0) && (
            <button
              onClick={handleComplete}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
            >
              Continue
            </button>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {flowHistory.length > 1 && (
              <button
                onClick={handleBack}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleStartOver}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              Start Over
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KioskFlow;
