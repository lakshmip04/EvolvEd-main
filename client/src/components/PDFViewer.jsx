import React from 'react';

function PDFViewer({ pdfUrl }) {
  return (
    <div className="border border-gray-300 rounded p-4 h-96 overflow-y-auto">
      <embed src={pdfUrl} type="application/pdf" width="100%" height="100%" />
    </div>
  );
}

export default PDFViewer;
