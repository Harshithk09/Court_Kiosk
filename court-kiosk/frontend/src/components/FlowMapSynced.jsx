import React from 'react';
import { useFlowSync } from './FlowSyncStore';
import FlowMap from './FlowMap';
import FlowLegend from './FlowLegend';
import FlowSearchBar from './FlowSearchBar';

const FlowMapSynced = ({ flow, FlowMapComponent }) => {
  const { currentNodeId, setCurrentNodeId } = useFlowSync();

  const handleSelectNode = (nodeId) => {
    setCurrentNodeId(nodeId);
  };

  // Use the provided FlowMapComponent or default to our FlowMap
  const MapComponent = FlowMapComponent || FlowMap;

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="mb-4">
        <FlowSearchBar flow={flow} onSelectNode={handleSelectNode} />
      </div>

      {/* Legend */}
      <div className="mb-4">
        <FlowLegend />
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapComponent
          flow={flow}
          currentNodeId={currentNodeId}
          onSelectNode={handleSelectNode}
        />
      </div>
    </div>
  );
};

export default FlowMapSynced;
