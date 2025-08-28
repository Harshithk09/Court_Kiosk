// Utility function to load and build the graph from flow JSON files
export async function loadGraph() {
  try {
    // Load the main flow data
    const flowResponse = await fetch('/dvro_flow.json');
    const flowData = await flowResponse.json();
    
    // Load the nodes data
    const nodesResponse = await fetch('/dvro_nodes.updated.json');
    const nodesData = await nodesResponse.json();
    
    // Build the graph structure
    const graph = {
      start: flowData.start || 'start',
      nodes: {},
      metadata: flowData.metadata || {}
    };
    
    // Merge flow and nodes data
    Object.entries(nodesData).forEach(([nodeId, nodeData]) => {
      graph.nodes[nodeId] = {
        ...nodeData,
        id: nodeId,
        // Ensure outgoingEdges is properly structured
        outgoingEdges: nodeData.outgoingEdges || []
      };
    });
    
    return graph;
  } catch (error) {
    console.error('Error loading graph:', error);
    
    // Return a minimal graph structure if loading fails
    return {
      start: 'start',
      nodes: {
        start: {
          id: 'start',
          title: 'Start',
          text: 'Welcome to the DVRO process',
          kind: 'process',
          outgoingEdges: []
        }
      },
      metadata: {}
    };
  }
}

// Alternative function that accepts flow data directly
export function buildGraph(flowData, nodesData) {
  const graph = {
    start: flowData.start || 'start',
    nodes: {},
    metadata: flowData.metadata || {}
  };
  
  // Merge flow and nodes data
  Object.entries(nodesData).forEach(([nodeId, nodeData]) => {
    graph.nodes[nodeId] = {
      ...nodeData,
      id: nodeId,
      outgoingEdges: nodeData.outgoingEdges || []
    };
  });
  
  return graph;
}
