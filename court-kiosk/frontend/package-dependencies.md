# Required Dependencies for Graph UI and PDF Export

## Install Dependencies

Run this command in your frontend directory:

```bash
npm install reactflow dagre jspdf html2canvas lucide-react
```

## Dependencies Explained

### Core Graph UI
- **reactflow**: React library for building node-based editors and interactive diagrams
- **dagre**: Directed graph layout library for automatic node positioning

### PDF Export
- **jspdf**: Client-side JavaScript PDF generation library
- **html2canvas**: Converts HTML elements to canvas for PDF export

### Icons
- **lucide-react**: Beautiful, customizable SVG icons for React

## Optional Dependencies

If you want to use the existing SimpleFlowRunner component with the new features:

```bash
npm install @headlessui/react
```

## Usage

After installing dependencies, you can use the components like this:

```jsx
import DualPaneDemo from './components/DualPaneDemo';
import FlowWizardSynced from './components/FlowWizardSynced';
import FlowMap from './components/FlowMap';
import { loadGraph } from './utils/loadGraph';

// In your component
const graph = await loadGraph();
return (
  <DualPaneDemo 
    graph={graph}
    FlowWizardComponent={FlowWizardSynced}
    FlowMapComponent={FlowMap}
  />
);
```

## Features Included

✅ **Interactive Flow Map**: Visual representation of the DVRO process
✅ **Node Highlighting**: Current step is highlighted with blue outline
✅ **Click Navigation**: Click any node to jump to that step
✅ **Search Functionality**: Search nodes by ID, title, or text
✅ **Legend**: Visual guide for different node types
✅ **PDF Export**: Export summaries and progress as PDF
✅ **Sync Store**: Keeps wizard and map in sync
✅ **Responsive Design**: Works on different screen sizes
