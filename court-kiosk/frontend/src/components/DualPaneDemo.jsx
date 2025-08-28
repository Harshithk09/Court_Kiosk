import React from 'react';
import { FlowSyncProvider } from './FlowSyncStore';
import FlowWizardSynced from './FlowWizardSynced';
import FlowMapSynced from './FlowMapSynced';

const DualPaneDemo = ({ 
  graph, 
  FlowWizardComponent, 
  FlowMapComponent,
  className = "h-screen"
}) => {
  return (
    <FlowSyncProvider initialNodeId={graph.start}>
      <div className={`grid grid-cols-5 gap-4 p-6 ${className}`}>
        {/* Wizard Pane */}
        <div className="col-span-3 overflow-y-auto">
          <FlowWizardSynced 
            flow={graph} 
            FlowWizardComponent={FlowWizardComponent}
          />
        </div>
        
        {/* Map Pane */}
        <div className="col-span-2 overflow-y-auto">
          <FlowMapSynced 
            flow={graph} 
            FlowMapComponent={FlowMapComponent}
          />
        </div>
      </div>
    </FlowSyncProvider>
  );
};

export default DualPaneDemo;
