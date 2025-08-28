import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Summary component for PDF export
export function SummaryPrintable({ progress, nodes }) {
  if (!progress || progress.length === 0) {
    return <div className="text-sm text-gray-600">No steps recorded yet.</div>;
  }
  
  return (
    <div className="text-sm">
      <h3 className="text-lg font-semibold mb-2">Your DVRO Journey</h3>
      <ol className="list-decimal ml-6 space-y-1">
        {progress.map((p, i) => (
          <li key={i}>
            <span className="font-medium">
              {nodes[p.nodeId]?.title || p.nodeId}
            </span>
            {p.optionId && (
              <span className="ml-2 text-gray-600">
                Answer: {p.optionId}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

// PDF Export Button Component
export function ExportPDFButton({ targetId, filename = "DVRO-summary.pdf" }) {
  async function handleExport() {
    const el = document.getElementById(targetId);
    if (!el) {
      console.error('Target element not found:', targetId);
      return;
    }

    try {
      const canvas = await html2canvas(el, { 
        scale: 2, 
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ 
        orientation: "p", 
        unit: "pt", 
        format: "a4" 
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 40; // margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pageHeight - 40) {
        // Single page
        pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight);
      } else {
        // Paginate tall content
        let position = 0;
        const sliceHeight = (canvas.width * (pageHeight - 40)) / imgWidth;
        
        while (position < canvas.height) {
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.min(sliceHeight, canvas.height - position);
          
          const ctx = pageCanvas.getContext("2d");
          ctx.drawImage(
            canvas,
            0, position, canvas.width, pageCanvas.height,
            0, 0, canvas.width, pageCanvas.height
          );
          
          const pageImg = pageCanvas.toDataURL("image/png");
          if (position > 0) pdf.addPage();
          
          const pageImgHeight = (pageCanvas.height * imgWidth) / canvas.width;
          pdf.addImage(pageImg, "PNG", 20, 20, imgWidth, pageImgHeight);
          position += sliceHeight;
        }
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
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Export PDF
    </button>
  );
}

// Enhanced PDF Export for Where Am I Summary
export function ExportWhereAmIPDF({ summary, filename = "DVRO-where-am-i.pdf" }) {
  async function handleExport() {
    try {
      const pdf = new jsPDF({ 
        orientation: "p", 
        unit: "pt", 
        format: "a4" 
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Title
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text("Where Am I? - DVRO Process Summary", pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 40;

      // You are here section
      if (summary.you_are_here && summary.you_are_here.length > 0) {
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text("You are here", margin, yPosition);
        yPosition += 25;

        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        summary.you_are_here.forEach(item => {
          const lines = pdf.splitTextToSize(item, contentWidth);
          lines.forEach(line => {
            if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(line, margin, yPosition);
            yPosition += 18;
          });
          yPosition += 10;
        });
      }

      // What to do next section
      if (summary.what_to_do_next && summary.what_to_do_next.length > 0) {
        yPosition += 20;
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text("What to do next", margin, yPosition);
        yPosition += 25;

        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        summary.what_to_do_next.forEach(action => {
          const lines = pdf.splitTextToSize(`• ${action}`, contentWidth);
          lines.forEach(line => {
            if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(line, margin, yPosition);
            yPosition += 18;
          });
          yPosition += 5;
        });
      }

      // Forms section
      if (summary.forms_completed || summary.forms_pending) {
        yPosition += 20;
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text("Forms involved", margin, yPosition);
        yPosition += 25;

        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        
        if (summary.forms_completed && summary.forms_completed.length > 0) {
          pdf.text("Completed Forms:", margin, yPosition);
          yPosition += 20;
          summary.forms_completed.forEach(form => {
            if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(`✅ ${form}`, margin + 20, yPosition);
            yPosition += 18;
          });
        }

        if (summary.forms_pending && summary.forms_pending.length > 0) {
          yPosition += 10;
          pdf.text("Pending Forms:", margin, yPosition);
          yPosition += 20;
          summary.forms_pending.forEach(form => {
            if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(`☐ ${form} — still pending`, margin + 20, yPosition);
            yPosition += 18;
          });
        }
      }

      // Personalized checklist
      if (summary.personalized_checklist && summary.personalized_checklist.length > 0) {
        yPosition += 20;
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text("Personalized checklist", margin, yPosition);
        yPosition += 25;

        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        summary.personalized_checklist.forEach(item => {
          const lines = pdf.splitTextToSize(`• ${item}`, contentWidth);
          lines.forEach(line => {
            if (yPosition > pdf.internal.pageSize.getHeight() - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(line, margin, yPosition);
            yPosition += 18;
          });
          yPosition += 5;
        });
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
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      Export Summary PDF
    </button>
  );
}
