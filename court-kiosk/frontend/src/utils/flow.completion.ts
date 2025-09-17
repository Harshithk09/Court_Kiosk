// flow.completion.ts - Enhanced flow engine with completion handling
import { FlowEngine } from './flow.engine.ts';
import { Graph } from './flow.graph.ts';

export interface CompletionData {
  caseType: string;
  summary: string;
  forms: string[];
  answers: Record<string, any>;
  phase: string;
  queueNumber?: string;
  timestamp: string;
}

export class EnhancedFlowEngine extends FlowEngine {
  private completionCallback?: (data: CompletionData) => Promise<string | void>;
  private apiBaseUrl: string;

  constructor(graph: Graph, apiBaseUrl = 'http://localhost:1904') {
    super(graph);
    this.apiBaseUrl = apiBaseUrl;
  }

  setCompletionCallback(callback: (data: CompletionData) => Promise<string | void>) {
    this.completionCallback = callback;
  }

  // Override next to handle completion
  next(optionLabel?: string) {
    const current = this.current();
    const wasAtEnd = current?.type === 'end';
    super.next(optionLabel);
    
    // If we just reached the end, trigger completion
    const newCurrent = this.current();
    if (!wasAtEnd && newCurrent?.type === 'end') {
      this.handleCompletion();
    }
  }

  private async handleCompletion() {
    if (!this.completionCallback) return;

    const completionData = this.generateCompletionData();
    
    try {
      const queueNumber = await this.completionCallback(completionData);
      if (queueNumber) {
        completionData.queueNumber = queueNumber;
      }
    } catch (error) {
      console.error('Completion callback failed:', error);
    }
  }

  generateCompletionData(): CompletionData {
    const summary = this.summary();
    const answers = this.generateAnswers();
    
    return {
      caseType: this.determineCaseType(),
      summary: this.generateSummaryText(),
      forms: summary.visitedForms,
      answers,
      phase: summary.phase,
      timestamp: new Date().toISOString()
    };
  }

  private generateAnswers(): Record<string, any> {
    const answers: Record<string, any> = {};
    
    // Extract answers from decisions made
    for (const decision of this.decisions) {
      if (decision.when) {
        answers[decision.from] = decision.when;
      }
    }
    
    return answers;
  }

  private determineCaseType(): string {
    const phase = this.phase();
    const answers = this.generateAnswers();
    const current = this.current();
    
    // DVRO case types
    if (current?.text.includes('Domestic Violence')) {
      switch (phase) {
        case 'new': return 'Domestic Violence Restraining Order';
        case 'respond': return 'Response to Domestic Violence Restraining Order';
        case 'modify': return 'Modification of Domestic Violence Restraining Order';
        case 'renew': return 'Renewal of Domestic Violence Restraining Order';
        default: return 'Domestic Violence Restraining Order';
      }
    }
    
    // Divorce case types
    if (current?.text.includes('Divorce')) {
      if (answers['A']?.includes('Petitioner')) {
        return 'Divorce/Dissolution Filing';
      }
      if (answers['A']?.includes('Respondent')) {
        return 'Response to Divorce';
      }
      if (answers['A']?.includes('Serving')) {
        return 'Service of Divorce Papers';
      }
      if (answers['A']?.includes('Finalize')) {
        return 'Finalizing Divorce';
      }
      return 'Divorce Process';
    }
    
    return 'Legal Process';
  }

  private generateSummaryText(): string {
    const summary = this.summary();
    const answers = this.generateAnswers();
    const caseType = this.determineCaseType();
    
    const summaryParts = [`Case Type: ${caseType}`];
    
    // Add specific details based on answers
    if (answers['DVCheck1'] === 'Yes') {
      summaryParts.push('User reported abuse requiring protection');
    }
    
    if (answers['children'] === 'yes') {
      summaryParts.push('Children involved - custody/visitation forms included');
    }
    
    if (answers['support'] && answers['support'] !== 'none') {
      summaryParts.push(`Support requested: ${answers['support']}`);
    }
    
    if (summary.visitedForms.length > 0) {
      summaryParts.push(`Forms required: ${summary.visitedForms.join(', ')}`);
    }
    
    summaryParts.push(`Process phase: ${summary.phase}`);
    summaryParts.push(`Steps completed: ${summary.trail.length}`);
    
    return summaryParts.join('. ');
  }

  // Method to generate queue number and save to backend
  async generateQueueNumber(language = 'en'): Promise<string> {
    const completionData = this.generateCompletionData();
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/generate-queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          case_type: completionData.caseType, 
          priority: 'A', 
          language 
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.queue_number;
      }
    } catch (error) {
      console.error('Error generating queue number:', error);
    }
    
    return '';
  }

  // Method to save completion data to backend
  async saveCompletionData(queueNumber: string, language = 'en'): Promise<void> {
    const completionData = this.generateCompletionData();
    
    try {
      await fetch(`${this.apiBaseUrl}/api/process-answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queue_number: queueNumber,
          answers: {
            case_type: completionData.caseType,
            current_step: 'completed',
            progress: Object.entries(completionData.answers).map(([pageId, value]) => ({ 
              pageId, 
              option: value 
            })),
            summary: completionData.summary,
            forms: completionData.forms,
            next_steps: []
          },
          language
        })
      });
    } catch (error) {
      console.error('Error saving completion data:', error);
    }
  }
}
