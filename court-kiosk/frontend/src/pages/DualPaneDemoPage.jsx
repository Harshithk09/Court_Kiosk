import React, { useState, useEffect } from 'react';
import DualPaneDemo from '../components/DualPaneDemo';
import FlowWizardSynced from '../components/FlowWizardSynced';
import FlowMap from '../components/FlowMap';
import { loadGraph } from '../utils/loadGraph';

const DualPaneDemoPage = () => {
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadGraphData() {
      try {
        setLoading(true);
        const graphData = await loadGraph();
        setGraph(graphData);
      } catch (err) {
        console.error('Failed to load graph:', err);
        setError('Failed to load the flow data. Please check your JSON files.');
      } finally {
        setLoading(false);
      }
    }

    loadGraphData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flow data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-gray-800 mb-2">Error Loading Flow</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!graph) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">No flow data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">DVRO Process Wizard with Flow Map</h1>
          <p className="text-gray-600 mt-1">
            Interactive wizard with visual process map. Click nodes on the map to jump to different steps.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <DualPaneDemo 
          graph={graph}
          FlowWizardComponent={FlowWizardSynced}
          FlowMapComponent={FlowMap}
          className="h-[calc(100vh-120px)]"
        />
      </div>
    </div>
  );
};

export default DualPaneDemoPage;
