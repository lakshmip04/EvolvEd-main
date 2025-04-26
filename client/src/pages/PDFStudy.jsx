import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PDFUploader from '../components/PDFUploader';
import PDFSelector from '../components/PDFSelector';
import PDFStudyLayout from '../components/PDFStudyLayout';

function PDFStudy() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [showPDFSelector, setShowPDFSelector] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handlePDFSelect = (pdfData) => {
    setSelectedPDF(pdfData);
    setShowPDFSelector(false);
  };

  const handleChangePDF = () => {
    setSelectedPDF(null);
  };

  const togglePDFSelector = () => {
    setShowPDFSelector(!showPDFSelector);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">PDF Study</h1>

        {!selectedPDF ? (
          <div className="mb-8">
            <div className="flex flex-col space-y-6">
              <PDFUploader onPDFSelect={handlePDFSelect} />
              
              <div className="text-center">
                <p className="mb-2 text-gray-600">- OR -</p>
                <button
                  onClick={togglePDFSelector}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium"
                >
                  {showPDFSelector ? 'Hide PDF Selector' : 'Select Existing PDF'}
                </button>
              </div>
              
              {showPDFSelector && (
                <div className="mt-4">
                  <PDFSelector onSelect={handlePDFSelect} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Study Mode</h2>
              <button 
                onClick={handleChangePDF}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-800 text-sm font-medium"
              >
                Upload Different PDF
              </button>
            </div>
            <PDFStudyLayout 
              pdfUrl={selectedPDF} 
              pdfTitle={selectedPDF.filename || 'PDF Document'}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default PDFStudy; 