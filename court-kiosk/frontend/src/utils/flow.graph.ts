// flow.graph.ts
import { FlowDoc, FlowNode, Edge } from './flow.types.ts';

export type { Edge };

export type Graph = {
  nodes: Record<string, FlowNode>;
  outByFrom: Record<string, Edge[]>;
  inByTo: Record<string, Edge[]>;
  start: string;
};

export function buildGraph(doc: FlowDoc): Graph {
  const outByFrom: Record<string, Edge[]> = {};
  const inByTo: Record<string, Edge[]> = {};
  
  // Build edge indexes (handle case where edges might be undefined or empty)
  if (doc.edges && Array.isArray(doc.edges)) {
    for (const e of doc.edges) {
      (outByFrom[e.from] ||= []).push(e);
      (inByTo[e.to] ||= []).push(e);
    }
  }
  
  return { 
    nodes: doc.nodes, 
    outByFrom, 
    inByTo, 
    start: doc.start 
  };
}

// Validation function to check for common issues
export function validateGraph(doc: FlowDoc): string[] {
  const errors: string[] = [];
  
  // Check if start node exists
  if (!doc.nodes[doc.start]) {
    errors.push(`Start node '${doc.start}' not found in nodes`);
  }
  
  // Check if all edge references exist (handle case where edges might be undefined or empty)
  if (doc.edges && Array.isArray(doc.edges)) {
    for (const edge of doc.edges) {
      if (!doc.nodes[edge.from]) {
        errors.push(`Edge from '${edge.from}' references non-existent node`);
      }
      if (!doc.nodes[edge.to]) {
        errors.push(`Edge to '${edge.to}' references non-existent node`);
      }
    }
  }
  
  // Check if all node option references exist
  for (const [nodeId, node] of Object.entries(doc.nodes)) {
    if (node.options) {
      for (const option of node.options) {
        if (!doc.nodes[option.to]) {
          errors.push(`Node '${nodeId}' option '${option.text}' references non-existent node '${option.to}'`);
        }
      }
    }
  }
  
  // Check for orphaned nodes (nodes not referenced by edges, options, or start)
  const referencedNodes = new Set<string>();
  referencedNodes.add(doc.start);
  
  // Add nodes referenced by edges (handle case where edges might be undefined or empty)
  if (doc.edges && Array.isArray(doc.edges)) {
    for (const edge of doc.edges) {
      referencedNodes.add(edge.from);
      referencedNodes.add(edge.to);
    }
  }
  
  // Add nodes referenced by options
  for (const node of Object.values(doc.nodes)) {
    if (node.options) {
      for (const option of node.options) {
        referencedNodes.add(option.to);
      }
    }
  }
  
  for (const nodeId of Object.keys(doc.nodes)) {
    if (!referencedNodes.has(nodeId)) {
      errors.push(`Node '${nodeId}' is not referenced by any edge, option, or start`);
    }
  }
  
  return errors;
}
