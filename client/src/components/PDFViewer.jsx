import React from 'react';

function PDFViewer({ pdfUrl }) {
  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 border rounded-lg p-6">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500 font-medium">No PDF selected</p>
          <p className="text-gray-400 text-sm mt-1">Please upload or select a PDF to view</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-800 rounded-lg overflow-hidden">
      <div className="flex-1 min-h-[600px]">
        <embed 
          src={pdfUrl}
          type="application/pdf"
          width="100%"
          height="100%"
          className="h-full"
          style={{ minHeight: '600px', height: '100%' }}
        />
      </div>
    </div>
  );
}

export default PDFViewer;
