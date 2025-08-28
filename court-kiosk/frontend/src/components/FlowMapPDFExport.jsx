import React from 'react';
import jsPDF from 'jspdf';

// High-resolution PDF export for flow map
export function ExportFlowMapPDF({ flow, filename = "DVRO-flow-map.pdf" }) {
  async function handleExport() {
    try {
      // Create a high-resolution PDF
      const pdf = new jsPDF({ 
        orientation: "landscape", 
        unit: "pt", 
        format: "a4" 
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      let yPosition = margin;

      // Title
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text("DVRO Process Flow Map", pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 40;

      // Subtitle
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'normal');
      pdf.text("High-Resolution Process Flow for Domestic Violence Restraining Orders", pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 30;

      // Legend
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text("Legend:", margin, yPosition);
      yPosition += 20;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      
      // Legend items
      const legendItems = [
        { type: 'Decision', description: 'Questions that guide the process' },
        { type: 'Process', description: 'Information and actions' },
        { type: 'End', description: 'Completion points' },
        { type: 'Forms', description: 'Required documents and filings' }
      ];

      legendItems.forEach((item, index) => {
        const x = margin + (index * (contentWidth / 4));
        pdf.text(`${item.type}: ${item.description}`, x, yPosition);
      });
      yPosition += 30;

      // Process Flow
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text("Process Flow:", margin, yPosition);
      yPosition += 25;

      // Create a visual flow representation
      const nodes = Object.entries(flow.nodes);
      const maxNodesPerRow = 3;
      const nodeHeight = 60;
      const nodeSpacing = 20;
      const rowSpacing = 40;

      let currentRow = 0;
      let currentCol = 0;

      nodes.forEach(([nodeId, nodeData], index) => {
        const x = margin + (currentCol * (contentWidth / maxNodesPerRow));
        const y = yPosition + (currentRow * (nodeHeight + rowSpacing));

        // Check if we need a new row
        if (currentCol >= maxNodesPerRow) {
          currentRow++;
          currentCol = 0;
        }

        // Draw node box
        const nodeWidth = (contentWidth / maxNodesPerRow) - 20;
        pdf.setDrawColor(100, 100, 100);
        pdf.setFillColor(240, 240, 240);
        pdf.rect(x, y, nodeWidth, nodeHeight, 'FD');

        // Node title
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        const title = nodeData.title || nodeId;
        const titleLines = pdf.splitTextToSize(title, nodeWidth - 10);
        pdf.text(titleLines, x + 5, y + 15);

        // Node type indicator
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'normal');
        const nodeType = nodeData.kind || 'process';
        pdf.text(`Type: ${nodeType}`, x + 5, y + nodeHeight - 10);

        // Node ID
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'italic');
        pdf.text(`ID: ${nodeId}`, x + 5, y + nodeHeight - 25);

        currentCol++;
      });

      // Add page numbers
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 60, pageHeight - 20);
      }

      pdf.save(filename);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    }
  }

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
    >
      Export Flow Map PDF
    </button>
  );
}

// Enhanced PDF export with detailed node information
export function ExportDetailedFlowMapPDF({ flow, filename = "DVRO-detailed-flow-map.pdf" }) {
  async function handleExport() {
    try {
      const pdf = new jsPDF({ 
        orientation: "portrait", 
        unit: "pt", 
        format: "a4" 
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Title
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text("DVRO Process Flow - Detailed Map", pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 40;

      // Process each node in detail
      Object.entries(flow.nodes).forEach(([nodeId, nodeData], index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 200) {
          pdf.addPage();
          yPosition = margin;
        }

        // Node header
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${index + 1}. ${nodeData.title || nodeId}`, margin, yPosition);
        yPosition += 20;

        // Node ID
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'italic');
        pdf.text(`Node ID: ${nodeId}`, margin, yPosition);
        yPosition += 15;

        // Node type
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Type: ${nodeData.kind || 'process'}`, margin, yPosition);
        yPosition += 15;

        // Node text/description
        if (nodeData.text) {
          pdf.setFontSize(10);
          const textLines = pdf.splitTextToSize(nodeData.text, contentWidth);
          textLines.forEach(line => {
            pdf.text(line, margin, yPosition);
            yPosition += 15;
          });
          yPosition += 10;
        }

        // Outgoing edges
        if (nodeData.outgoingEdges && nodeData.outgoingEdges.length > 0) {
          pdf.setFontSize(10);
          pdf.setFont(undefined, 'bold');
          pdf.text("Next Steps:", margin, yPosition);
          yPosition += 15;

          nodeData.outgoingEdges.forEach((edge, edgeIndex) => {
            pdf.setFontSize(9);
            pdf.setFont(undefined, 'normal');
            const edgeText = edge.when || edge.text || `Option ${edgeIndex + 1}`;
            const targetNode = edge.to ? flow.nodes[edge.to] : null;
            const targetTitle = targetNode ? targetNode.title || edge.to : 'End';
            
            const edgeLine = `• ${edgeText} → ${targetTitle}`;
            const edgeLines = pdf.splitTextToSize(edgeLine, contentWidth - 20);
            edgeLines.forEach(line => {
              pdf.text(line, margin + 20, yPosition);
              yPosition += 12;
            });
          });
        }

        yPosition += 20;
      });

      // Add page numbers
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 60, pageHeight - 20);
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Detailed PDF export failed:', error);
      alert('Failed to export detailed PDF. Please try again.');
    }
  }

  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
    >
      Export Detailed Flow PDF
    </button>
  );
}
