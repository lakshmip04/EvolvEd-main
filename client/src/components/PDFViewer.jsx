import React from 'react';

function PDFViewer({ pdfUrl }) {
  if (!pdfUrl) {
    return (
      <div className="border border-gray-300 rounded p-4 h-96 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">No PDF selected. Please upload or select a PDF to view.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded p-4 h-96 overflow-y-auto">
      <embed src={pdfUrl} type="application/pdf" width="100%" height="100%" />
    </div>
  );
}

export default PDFViewer;
