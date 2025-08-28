import React, { createContext, useContext, useState } from 'react';

const FlowSyncContext = createContext();

export const useFlowSync = () => {
  const context = useContext(FlowSyncContext);
  if (!context) {
    throw new Error('useFlowSync must be used within a FlowSyncProvider');
  }
  return context;
};

export const FlowSyncProvider = ({ children, initialNodeId }) => {
  const [currentNodeId, setCurrentNodeId] = useState(initialNodeId);
  const [progress, setProgress] = useState([]);

  const value = {
    currentNodeId,
    setCurrentNodeId,
    progress,
    setProgress,
    addToProgress: (nodeId, optionId = null) => {
      setProgress(prev => [...prev, { nodeId, optionId, timestamp: Date.now() }]);
    },
    clearProgress: () => setProgress([])
  };

  return (
    <FlowSyncContext.Provider value={value}>
      {children}
    </FlowSyncContext.Provider>
  );
};
