# Informational Nodes Detection

## Current Detection Patterns

The system automatically detects informational nodes based on these patterns:

1. **Starts with "Note:"** - `currentNode?.text?.startsWith('Note:')`
2. **Contains "information"** - `currentNode?.text?.toLowerCase().includes('information')`
3. **Contains "help"** - `currentNode?.text?.toLowerCase().includes('help')`
4. **Contains "explain"** - `currentNode?.text?.toLowerCase().includes('explain')`
5. **Contains "description"** - `currentNode?.text?.toLowerCase().includes('description')`

## Known Informational Nodes

### Nodes Starting with "Note:"
- `DVTiming`: "Note: If you file for a Domestic Violence Restraining Order before noon, you should get a response from the court that same day."

### Nodes Containing "information"
- `CLETSa`: "Step 2: Fill out CLETS-001 (Confidential CLETS Information). Only the court and law enforcement see this. The other party does NOT get a copy."
- `DVRCLETS`: "Step 3: Fill out CLETS-001 (Confidential CLETS Information). Only law enforcement will see this"

### Nodes Containing "help"
- `Note`: "If you'd like specialized in-person help, San Mateo County offers in-person help for restraining orders Mondays from 8am to 12 noon and 1:30 to 3pm at the Self-Help office on the 6th floor"
- `DVMinor`: "If you're under 12, a trusted adult must help you file. Please contact the Self-Help Center in-person or online via LiveChat for assistance."
- `DVA5`: "Yes, if you're 12 or older, you can file on your own. The court may ask for a trusted adult to help. If you're under 12, an adult must file for you."

### Nodes Containing "explain"
- `DV100f`: "If you don't remember the exact date, estimate and explain (e.g., 'Around August 2020')"
- `DV300Start`: "Step 1: Fill out DV-300 (Request to Change or End Restraining Order). Explain what you want to change or end, and why"
- `DVR700Start`: "Step 1: Fill out DV-700 (Request to Renew Restraining Order). Explain why you want the protection extended"

## How Informational Nodes Work

1. **Detection**: The system automatically identifies informational nodes based on the patterns above
2. **Rendering**: Informational nodes show:
   - An "Information" badge with an info icon
   - The informational text prominently displayed
   - A "Continue" button if there's only one next step
   - Multiple choice buttons if there are multiple next steps
   - "View Next Steps" if it's the end of the flow

3. **User Experience**: 
   - Users see the information clearly
   - No confusing buttons that might lead to wrong actions
   - Clear indication that this is informational content
   - Easy navigation to the next step

## Adding More Patterns

To add more detection patterns, modify the `isInformationalNode` logic in `SimpleFlowRunner.jsx`:

```javascript
const isInformationalNode = currentNode?.text?.startsWith('Note:') || 
                           currentNode?.text?.toLowerCase().includes('information') ||
                           currentNode?.text?.toLowerCase().includes('help') ||
                           currentNode?.text?.toLowerCase().includes('explain') ||
                           currentNode?.text?.toLowerCase().includes('description') ||
                           // Add more patterns here
                           currentNode?.text?.toLowerCase().includes('guidance') ||
                           currentNode?.text?.toLowerCase().includes('instruction');
```

## Manual Override

If you need to manually mark specific nodes as informational, you can add a `type: "informational"` to the node definition in the JSON file:

```json
"DVTiming": { 
  "type": "informational", 
  "text": "Note: If you file for a Domestic Violence Restraining Order before noon, you should get a response from the court that same day." 
}
```

Then update the detection logic to include:
```javascript
const isInformationalNode = currentNode.type === 'informational' ||
                           currentNode?.text?.startsWith('Note:') ||
                           // ... other patterns
```
