import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { createNote } from '../features/notes/noteSlice';

function PDFUploader() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid PDF file');
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a PDF file');
      return;
    }
    
    if (!user) {
      toast.error('You must be logged in to upload PDFs');
      return;
    }
    
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('pdf', file);
    
    try {
      // Get token from user object
      const token = user.token;
      
      const response = await axios.post('/api/pdf/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Note has been created in the backend, now update Redux state
      dispatch(createNote(response.data));
      
      toast.success('PDF processed and note created successfully');
      setFile(null);
      // Reset file input
      e.target.reset();
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error(error.response?.data?.message || 'Error processing PDF');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Upload PDF</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Select PDF file:
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded font-bold ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Upload & Process PDF'}
        </button>
      </form>
    </div>
  );
}

export default PDFUploader;
