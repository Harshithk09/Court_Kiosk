// flow.types.ts
export type NodeType = 'start' | 'process' | 'decision' | 'end';

export type FlowNode = {
  type: NodeType;
  text: string;
  options?: Array<{ text: string; to: string }>;
  // optional future-proof fields:
  forms?: string[];       // e.g., ["DV-100","CLETS-001"]
  tags?: string[];        // e.g., ["phase:new","serve","renewal"]
};

export type Edge = {
  from: string;
  to: string;
  when?: string;          // label shown on the button for decisions
};

export type FlowDoc = {
  id: string;
  version?: string;
  start: string;
  nodes: Record<string, FlowNode>;
  edges?: Edge[];
  metadata?: Record<string, unknown>;
};
