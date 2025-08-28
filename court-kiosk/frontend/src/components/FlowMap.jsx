import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { ExportFlowMapPDF, ExportDetailedFlowMapPDF } from './FlowMapPDFExport';

const FlowMap = ({ flow, currentNodeId, onSelectNode }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert flow data to ReactFlow format
  const reactFlowNodes = useMemo(() => {
    return Object.entries(flow.nodes).map(([id, node]) => ({
      id,
      position: { x: 0, y: 0 }, // Will be set by dagre
      data: { 
        label: node.title || node.text || id,
        kind: node.kind || 'process',
        isCurrent: id === currentNodeId
      },
      type: 'default',
      style: {
        padding: 12,
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 'medium',
        border: id === currentNodeId ? '3px solid #3b82f6' : '2px solid #e5e7eb',
        backgroundColor: id === currentNodeId ? '#eff6ff' : 
          node.kind === 'decision' ? '#fef3c7' :
          node.kind === 'end' ? '#dcfce7' : '#f3f4f6',
        boxShadow: id === currentNodeId ? '0 0 0 4px rgba(59, 130, 246, 0.1)' : 'none',
        minWidth: 120,
        textAlign: 'center'
      }
    }));
  }, [flow.nodes, currentNodeId]);

  const reactFlowEdges = useMemo(() => {
    const edges = [];
    Object.entries(flow.nodes).forEach(([nodeId, node]) => {
      if (node.outgoingEdges) {
        node.outgoingEdges.forEach((edge, index) => {
          if (edge.to) {
            edges.push({
              id: `${nodeId}-${index}`,
              source: nodeId,
              target: edge.to,
              label: edge.when || edge.text || '',
              type: 'smoothstep',
              style: { stroke: '#6b7280', strokeWidth: 2 },
              labelStyle: { 
                fontSize: 12, 
                fill: '#374151',
                fontWeight: 'medium'
              }
            });
          }
        });
      }
    });
    return edges;
  }, [flow.nodes]);

  // Layout with dagre
  const dagreGraph = useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 80 });

    // Add nodes
    reactFlowNodes.forEach((node) => {
      g.setNode(node.id, { width: 150, height: 60 });
    });

    // Add edges
    reactFlowEdges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    dagre.layout(g);

    // Update node positions
    const layoutedNodes = reactFlowNodes.map((node) => {
      const nodeWithPosition = g.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWithPosition.width / 2,
          y: nodeWithPosition.y - nodeWithPosition.height / 2,
        },
      };
    });

    return { nodes: layoutedNodes, edges: reactFlowEdges };
  }, [reactFlowNodes, reactFlowEdges]);

  // Update nodes and edges when layout changes
  React.useEffect(() => {
    setNodes(dagreGraph.nodes);
    setEdges(dagreGraph.edges);
  }, [dagreGraph, setNodes, setEdges]);

  const onNodeClick = useCallback((event, node) => {
    if (onSelectNode) {
      onSelectNode(node.id);
    }
  }, [onSelectNode]);

  return (
    <div className="h-full w-full border rounded-lg bg-white">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Process Map</h3>
            <p className="text-sm text-gray-600">Click any node to jump to that step</p>
          </div>
          <div className="flex space-x-2">
            <ExportFlowMapPDF flow={flow} />
            <ExportDetailedFlowMapPDF flow={flow} />
          </div>
        </div>
      </div>
      <div className="h-[calc(100%-120px)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <MiniMap 
            nodeStrokeColor={(n) => {
              if (n.data?.isCurrent) return '#3b82f6';
              if (n.data?.kind === 'decision') return '#f59e0b';
              if (n.data?.kind === 'end') return '#10b981';
              return '#6b7280';
            }}
            nodeColor={(n) => {
              if (n.data?.isCurrent) return '#eff6ff';
              if (n.data?.kind === 'decision') return '#fef3c7';
              if (n.data?.kind === 'end') return '#dcfce7';
              return '#f3f4f6';
            }}
          />
          <Background color="#f9fafb" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default FlowMap;
