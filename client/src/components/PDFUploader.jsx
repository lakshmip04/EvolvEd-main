import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { createNote } from '../features/notes/noteSlice';
import config from '../config';

function PDFUploader({ onPDFSelect }) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewURL, setPreviewURL] = useState(null);
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewURL(url);
      
      // Call the onPDFSelect callback with consistent format
      if (onPDFSelect) {
        onPDFSelect({
          url: url,
          filename: selectedFile.name,
          isLocal: true
        });
      }
    } else {
      toast.error('Please select a valid PDF file');
      e.target.value = null;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      const url = URL.createObjectURL(droppedFile);
      setPreviewURL(url);
      
      // Call the onPDFSelect callback with consistent format
      if (onPDFSelect) {
        onPDFSelect({
          url: url,
          filename: droppedFile.name,
          isLocal: true
        });
      }
    } else {
      toast.error('Please select a valid PDF file');
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
      const token = user.token;

      const response = await axios.post(`${config.API_URL}/api/pdf/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      toast.success('PDF processed and note created successfully');
      
      // If parent component wants to know about the uploaded PDF
      if (onPDFSelect) {
        // Pass the uploaded file URL
        onPDFSelect({
          url: `${config.API_URL}/uploads/${response.data.title}.pdf`,
          filename: response.data.title,
          id: response.data._id,
          isServer: true
        });
      }
      
      dispatch(createNote(response.data));
      setFile(null);
      setPreviewURL(null);
      setProgress(0);
      fileInputRef.current.value = null;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      toast.error(error.response?.data?.message || 'Error processing PDF: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">Upload PDF</h2>
      <form onSubmit={handleSubmit}>
        <div
          className="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <label className="block text-gray-700 mb-2">
            Drag & drop a PDF file here or
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="text-blue-500 underline"
            >
              select a file
            </button>
          </label>
          {previewURL && (
            <div className="mt-4">
              <embed src={previewURL} type="application/pdf" width="100%" height="400px" />
            </div>
          )}
        </div>
        {isLoading && (
          <div className="mb-4">
            <progress value={progress} max="100" className="w-full h-4 bg-blue-500"></progress>
            <span className="block text-center text-sm text-gray-600">{progress}%</span>
          </div>
        )}
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
