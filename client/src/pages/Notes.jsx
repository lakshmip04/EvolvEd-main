import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PDFUploader from '../components/PDFUploader';
import PDFViewer from '../components/PDFViewer';
import PDFSelector from '../components/PDFSelector';
import NoteEditor from '../components/NoteEditor';
import { getNotes } from '../features/notes/noteSlice';

function Notes() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notes: userNotes = [], isLoading } = useSelector((state) => state.notes);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      // Load user's notes
      dispatch(getNotes());
    }
  }, [user, navigate, dispatch]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (criteria) => {
    if (sortBy === criteria) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      setSortOrder('asc');
    }
  };

  const handleCreateNote = () => {
    setIsEditorOpen(true);
    setSelectedPDF(null);
    setNoteContent('');
    setNoteTitle('');
  };

  const handlePDFSelect = (pdfData) => {
    setSelectedPDF(pdfData);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedPDF(null);
  };

  const handleNoteContentChange = (e) => {
    setNoteContent(e.target.value);
  };

  const handleNoteTitleChange = (e) => {
    setNoteTitle(e.target.value);
  };

  const handleSaveNote = () => {
    // Save note logic to be implemented
    console.log('Saving note:', { title: noteTitle, content: noteContent, pdfUrl: selectedPDF });
    // Close editor after saving
    setIsEditorOpen(false);
  };

  // Filter notes based on search term
  const filteredNotes = userNotes
    .filter(note => 
      !note.tags?.includes('pdf-notes') &&
      (note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       note.content.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });

  // Filter notes that have PDF attachments
  const getPDFNotes = () => {
    if (!userNotes || !Array.isArray(userNotes)) return [];
    
    return userNotes.filter(note => 
      note.tags?.includes('pdf-notes') || note.pdfFile
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Notes</h1>
          <button
            onClick={handleCreateNote}
            className="bg-blue-600 text-white rounded-md px-4 py-2 text-base font-medium inline-flex items-center hover:bg-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Note
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
        </div>

        {/* PDF Notes Section */}
        {getPDFNotes().length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">PDF Study Notes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getPDFNotes().map(note => (
                <div key={note._id} className="bg-blue-50 dark:bg-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow border border-blue-100">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{note.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {note.content}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Updated {new Date(note.updatedAt).toLocaleString()}
                    </span>
                    <div className="flex space-x-2">
                      <Link 
                        to={`/notes/${note._id}`} 
                        className="text-blue-600 text-sm font-medium"
                      >
                        View
                      </Link>
                      {note.pdfFile && (
                        <Link 
                          to="/pdfstudy" 
                          state={{ pdfId: note.pdfFile, noteId: note._id }}
                          className="text-green-600 text-sm font-medium"
                        >
                          Study PDF
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Notes Section */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All Notes</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => handleSort('title')}
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 ${sortBy === 'title' ? 'font-bold' : ''}`}
            >
              Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('updatedAt')}
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 ${sortBy === 'updatedAt' ? 'font-bold' : ''}`}
            >
              Updated {sortBy === 'updatedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.length > 0 ? (
            filteredNotes.map(note => (
              <div key={note._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{note.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  {note.content}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Updated {new Date(note.updatedAt).toLocaleString()}
                  </span>
                  <Link to={`/notes/${note._id}`} className="text-blue-600 text-sm font-medium">
                    View Note
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-8 text-center text-gray-500">
              No notes found. Create your first note!
            </div>
          )}
        </div>
      </div>

      {/* Note Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex-1">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={handleNoteTitleChange}
                  placeholder="Note Title"
                  className="w-full text-xl font-bold border-none focus:outline-none focus:ring-0"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Note
                </button>
                <button
                  onClick={handleCloseEditor}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              {/* PDF Section */}
              <div className="w-full md:w-1/2 border-r border-gray-200 flex flex-col">
                <div className="p-3 bg-gray-100 border-b flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {selectedPDF ? (selectedPDF.filename || 'PDF Viewer') : 'Choose a PDF'}
                  </h3>
                  {selectedPDF && (
                    <button 
                      onClick={() => setSelectedPDF(null)} 
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Change PDF
                    </button>
                  )}
                </div>
                
                <div className="flex-1 overflow-auto">
                  {!selectedPDF ? (
                    <div className="p-4 flex flex-col space-y-4">
                      <PDFSelector onSelect={handlePDFSelect} />
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-4">Or Upload a New PDF</h3>
                        <PDFUploader onPDFSelect={handlePDFSelect} />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full">
                      <PDFViewer pdfUrl={selectedPDF} />
                    </div>
                  )}
                </div>
              </div>

              {/* Note Editor Section */}
              <div className="w-full md:w-1/2 flex flex-col">
                <div className="p-3 bg-gray-100 border-b">
                  <h3 className="text-lg font-semibold">Take Notes</h3>
                </div>
                <div className="flex-1 p-4 overflow-auto">
                  <textarea
                    value={noteContent}
                    onChange={handleNoteContentChange}
                    className="w-full h-full p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Write your notes here..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notes;
