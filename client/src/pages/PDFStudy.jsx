import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import PDFUploader from '../components/PDFUploader';
import PDFSelector from '../components/PDFSelector';
import PDFStudyLayout from '../components/PDFStudyLayout';
import { reset as resetNotes, getNotes, getNote } from '../features/notes/noteSlice';
import config from '../config';

function PDFStudy() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notes: userNotes, note: selectedNote } = useSelector((state) => state.notes);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [showPDFSelector, setShowPDFSelector] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      // Load user's notes
      dispatch(getNotes());
      
      // Check if we have a specific note to load
      const state = location.state;
      if (state && state.noteId) {
        dispatch(getNote(state.noteId));
      } else if (state && state.pdfId) {
        // If we have a pdfId but no noteId, try to load the PDF directly
        setSelectedPDF({
          url: `${config.API_URL}/uploads/${state.pdfId}`,
          filename: state.pdfId.split('-').slice(1).join('-'),
          id: state.pdfId
        });
      }
    }
    
    // Clean up when component unmounts
    return () => {
      dispatch(resetNotes());
    };
  }, [user, navigate, dispatch, location]);

  // Load PDF from note when note is selected
  useEffect(() => {
    const loadPDFFromNote = async () => {
      // If we have a selected note with PDF file
      if (selectedNote && selectedNote.pdfFile && !selectedPDF) {
        setLoading(true);
        try {
          // If the pdfFile is a full URL
          if (selectedNote.pdfFile.startsWith('http')) {
            setSelectedPDF({
              url: selectedNote.pdfFile,
              filename: selectedNote.title.replace('Notes: ', ''),
              id: selectedNote._id
            });
          } 
          // If it's just an ID
          else {
            // Try to find matching PDF in userNotes
            const pdfNotes = userNotes.filter(note => note.tags.includes('pdf'));
            const matchingPDF = pdfNotes.find(note => note._id === selectedNote.pdfFile);
            
            if (matchingPDF) {
              setSelectedPDF({
                url: `${config.API_URL}/uploads/${matchingPDF.title}.pdf`,
                filename: matchingPDF.title,
                id: matchingPDF._id
              });
            } else {
              // If can't find matching note, try to load directly
              setSelectedPDF({
                url: `${config.API_URL}/uploads/${selectedNote.pdfFile}`,
                filename: selectedNote.title.replace('Notes: ', ''),
                id: selectedNote.pdfFile
              });
            }
          }
        } catch (error) {
          console.error('Error loading PDF from note:', error);
          toast.error('Error loading the PDF file');
        } finally {
          setLoading(false);
        }
      }
    };

    loadPDFFromNote();
  }, [selectedNote, userNotes, selectedPDF]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PDF and notes...</p>
        </div>
      </div>
    );
  }

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
              initialNotes={selectedNote?.content || ''}
              noteId={selectedNote?._id}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default PDFStudy; 