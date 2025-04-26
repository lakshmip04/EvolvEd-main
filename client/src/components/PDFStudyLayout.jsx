import React, { useState } from 'react';
import PDFViewer from './PDFViewer';

function PDFStudyLayout({ pdfUrl, pdfTitle = '', initialNotes = '' }) {
  const [notes, setNotes] = useState(initialNotes);

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
      {/* Left side: PDF Viewer */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">
            {pdfTitle ? `Document: ${pdfTitle}` : 'Document Viewer'}
          </h3>
        </div>
        <div className="h-[calc(100%-60px)]">
          <PDFViewer pdfUrl={pdfUrl} />
        </div>
      </div>
      
      {/* Right side: Notes */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">Notes</h3>
        </div>
        <div className="p-4 h-[calc(100%-60px)] overflow-y-auto">
          <textarea
            className="w-full h-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={notes}
            onChange={handleNotesChange}
            placeholder="Take notes here..."
          ></textarea>
        </div>
      </div>
    </div>
  );
}

export default PDFStudyLayout; 