import React, { useState, useMemo } from 'react';
import { Search, ArrowRight } from 'lucide-react';

const FlowSearchBar = ({ flow, onSelectNode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Create searchable nodes
  const searchableNodes = useMemo(() => {
    return Object.entries(flow.nodes).map(([id, node]) => ({
      id,
      title: node.title || '',
      text: node.text || '',
      kind: node.kind || 'process',
      searchText: `${id} ${node.title || ''} ${node.text || ''}`.toLowerCase()
    }));
  }, [flow.nodes]);

  // Filter nodes based on search term
  const filteredNodes = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    return searchableNodes
      .filter(node => node.searchText.includes(term))
      .slice(0, 10); // Limit to 10 results
  }, [searchableNodes, searchTerm]);

  const handleSelectNode = (nodeId) => {
    onSelectNode(nodeId);
    setSearchTerm('');
    setIsOpen(false);
  };

  const getNodeColor = (kind) => {
    switch (kind) {
      case 'decision': return 'bg-yellow-100 border-yellow-300';
      case 'end': return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search nodes by ID, title, or text..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Dropdown results */}
      {isOpen && filteredNodes.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredNodes.map((node) => (
            <button
              key={node.id}
              onClick={() => handleSelectNode(node.id)}
              className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center justify-between ${getNodeColor(node.kind)}`}
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{node.title || node.id}</div>
                {node.text && (
                  <div className="text-sm text-gray-600 truncate">{node.text}</div>
                )}
                <div className="text-xs text-gray-500 capitalize">{node.kind}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FlowSearchBar;
