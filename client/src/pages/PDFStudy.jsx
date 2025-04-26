import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PDFUploader from '../components/PDFUploader';
import PDFStudyLayout from '../components/PDFStudyLayout';

function PDFStudy() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [selectedPDF, setSelectedPDF] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handlePDFSelect = (url) => {
    setSelectedPDF(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">PDF Study</h1>

        {!selectedPDF && (
          <div className="mb-8">
            <PDFUploader onPDFSelect={handlePDFSelect} />
          </div>
        )}

        {selectedPDF && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Study Mode</h2>
              <button 
                onClick={() => setSelectedPDF(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 text-sm font-medium"
              >
                Upload Different PDF
              </button>
            </div>
            <PDFStudyLayout pdfUrl={selectedPDF} />
          </>
        )}
      </div>
    </div>
  );
}

export default PDFStudy; 