// flow.engine.ts
import { Graph, Edge } from './flow.graph.ts';
import { FlowNode } from './flow.types.ts';

export type Step = { id: string; node: FlowNode };
export type Answer = { from: string; when?: string; to: string };

export class FlowEngine {
  private g: Graph;
  currentId: string;
  path: Step[] = [];        // visited nodes (for summary)
  decisions: Answer[] = []; // chosen edges

  constructor(graph: Graph) {
    this.g = graph;
    this.currentId = graph.start;
    
    const startNode = this.g.nodes[this.currentId];
    if (!startNode) {
      console.error(`Start node '${this.currentId}' not found in graph`);
      throw new Error(`Start node '${this.currentId}' not found in graph`);
    }
    
    this.path.push({ id: this.currentId, node: startNode });
  }

  current(): FlowNode | undefined { 
    return this.g.nodes[this.currentId]; 
  }

  outgoing(id = this.currentId): Edge[] {
    return this.g.outByFrom[id] ?? [];
  }

  // return the visible options (labels) for a decision node
  options() {
    const node = this.current();
    if (!node) {
      console.error(`Current node '${this.currentId}' not found in graph`);
      return [];
    }
    
    const outs = this.outgoing();
    
    // For nodes with explicit options array, use those
    if (node.options && node.options.length > 0) {
      return node.options.map(opt => ({
        label: opt.text,
        to: opt.to,
        edge: outs.find(e => e.to === opt.to) || { from: this.currentId, to: opt.to }
      }));
    }
    
    // decision: show labeled options; process/start: single "Continue"
    if (node.type === 'decision') {
      return outs.map(e => ({ 
        label: e.when ?? 'Continue', 
        to: e.to, 
        edge: e 
      }));
    }
    return outs.length ? [{ 
      label: 'Continue', 
      to: outs[0].to, 
      edge: outs[0] 
    }] : [];
  }

  // advance by either picking an option label (for decisions) or continuing
  next(optionLabel?: string) {
    const outs = this.outgoing();
    const node = this.current();
    
    if (!node) {
      console.error(`Current node '${this.currentId}' not found in graph`);
      return;
    }

    let edge: Edge | undefined;

    console.log(node.options)
    console.log(outs);
    
    // Check explicit options first
    if (node.options && node.options.length > 0) {
      const selectedOption = node.options.find(opt => opt.text === optionLabel);
      if (selectedOption) {
        edge = outs.find(e => e.to === selectedOption.to) || { 
          from: this.currentId, 
          to: selectedOption.to 
        };
      }
    } else if (node.type === 'decision') {
      edge = outs.find(e => (e.when ?? 'Continue') === optionLabel);
      if (!edge) throw new Error(`No edge for choice: ${optionLabel}`);
    } else {
      edge = outs[0];
    }
    
    if (!edge) return; // end

    this.currentId = edge.to;
    const nextNode = this.g.nodes[this.currentId];
    if (!nextNode) {
      console.error(`Next node '${this.currentId}' not found in graph`);
      return;
    }
    this.path.push({ id: this.currentId, node: nextNode });
    this.decisions.push({ from: edge.from, when: edge.when, to: edge.to });
  }

  back() {
    if (this.path.length <= 1) return;
    this.path.pop();
    this.currentId = this.path[this.path.length - 1].id;
    // also pop last decision if we stepped back over it
    const lastFrom = this.path[this.path.length - 1].id;
    this.decisions = this.decisions.filter(d => d.from !== lastFrom);
  }

  // lightweight phase detection (DVRO has clear entry points)
  phase(): 'new' | 'respond' | 'modify' | 'renew' | 'faq' | 'unknown' {
    const ids = this.path.map(p => p.id);
    if (ids.includes('DV1')) return 'new';
    if (ids.includes('DV2')) return 'respond';
    if (ids.includes('DV3')) return 'modify';
    if (ids.includes('DV5')) return 'renew';
    if (ids.includes('DVFAQ')) return 'faq';
    return 'unknown';
  }

  // "Where am I / What's next?" summary
  summary() {
    const current = this.current();
    if (!current) {
      console.error(`Current node '${this.currentId}' not found in graph`);
      return {
        phase: 'error',
        current: { id: this.currentId, type: 'error', text: 'Node not found' },
        choices: [],
        nextSteps: [],
        visitedForms: [],
        trail: this.path.map(p => p.id)
      };
    }
    
    const nexts = this.outgoing().map(e => ({
      nextId: e.to,
      nextText: this.g.nodes[e.to]?.text,
      when: e.when
    }));

    // gather forms explicitly if you add `forms: []` to nodes; otherwise naive scrape:
    const formRegex = /\b([A-Z]{2,}-?\d{2,3})\b/g;
    const visitedForms = new Set<string>();
    for (const s of this.path) {
      const n = s.node;
      if (n.forms) n.forms.forEach(f => visitedForms.add(f));
      const matches = n.text.matchAll(formRegex);
      for (const m of matches) visitedForms.add(m[1]);
    }

    return {
      phase: this.phase(),
      current: { id: this.currentId, type: current.type, text: current.text },
      choices: current.type === 'decision' ? nexts.map(n => ({ 
        label: n.when, 
        to: n.nextId, 
        text: n.nextText 
      })) : [],
      nextSteps: current.type !== 'decision' ? nexts.map(n => ({ 
        to: n.nextId, 
        text: n.nextText 
      })) : [],
      visitedForms: Array.from(visitedForms).sort(),
      trail: this.path.map(p => p.id)
    };
  }

  // Save state to sessionStorage
  saveState() {
    const state = {
      currentId: this.currentId,
      path: this.path,
      decisions: this.decisions
    };
    sessionStorage.setItem('flowEngineState', JSON.stringify(state));
  }

  // Load state from sessionStorage
  loadState(): boolean {
    try {
      const saved = sessionStorage.getItem('flowEngineState');
      if (!saved) return false;
      
      const state = JSON.parse(saved);
      
      // Validate that the saved currentId exists in the current graph
      if (!this.g.nodes[state.currentId]) {
        console.warn(`Saved state references invalid node '${state.currentId}', resetting to start`);
        return false;
      }
      
      this.currentId = state.currentId;
      this.path = state.path;
      this.decisions = state.decisions;
      return true;
    } catch {
      return false;
    }
  }

  // Reset to start
  reset() {
    this.currentId = this.g.start;
    this.path = [{ id: this.currentId, node: this.g.nodes[this.currentId] }];
    this.decisions = [];
    sessionStorage.removeItem('flowEngineState');
  }
}
