import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import config from "../config";

function FlashcardUploader({ onPDFSelect, onClose }) {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewURL, setPreviewURL] = useState(null);
  const [deckTitle, setDeckTitle] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewURL(url);
    } else {
      toast.error("Please select a valid PDF file");
      e.target.value = null;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      const url = URL.createObjectURL(droppedFile);
      setPreviewURL(url);
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (!deckTitle.trim()) {
      toast.error("Please enter a deck title");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to upload PDFs");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("title", deckTitle);
    formData.append("description", deckDescription);

    try {
      const token = user.token;
      console.log("uploading to Supabase via backend...");

      const response = await axios.post(
        `${config.API_URL}/api/flashcards/with-pdf`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      console.log("Upload response from server:", response.data);

      toast.success("PDF uploaded and flashcard deck created successfully");

      // Notify parent component with the complete data
      if (onPDFSelect) {
        const pdfData = {
          url: response.data.url,
          filename: response.data.title || file.name,
          id: response.data._id,
          _id: response.data._id,
          isServer: true,
          deckId: response.data.deckId,
        };
        onPDFSelect(pdfData);
      }

      // Close the uploader if we have a close function
      if (onClose) {
        onClose();
      }

      // Clear form
      setFile(null);
      setPreviewURL(null);
      setProgress(0);
      setDeckTitle("");
      setDeckDescription("");
      fileInputRef.current.value = null;
    } catch (error) {
      console.error("Error uploading PDF:", error);
      toast.error(
        error.response?.data?.message ||
          "Error processing PDF: " + error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            value={deckTitle}
            onChange={(e) => setDeckTitle(e.target.value)}
            placeholder="Deck Title"
            className="w-full p-2 border border-gray-300 rounded mb-2"
            required
          />
          <textarea
            value={deckDescription}
            onChange={(e) => setDeckDescription(e.target.value)}
            placeholder="Deck Description (optional)"
            className="w-full p-2 border border-gray-300 rounded"
            rows="2"
          />
        </div>
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
              className="text-blue-500 underline ml-1"
            >
              select a file
            </button>
          </label>
          {previewURL && (
            <div className="mt-4">
              <embed
                src={previewURL}
                type="application/pdf"
                width="100%"
                height="400px"
              />
            </div>
          )}
        </div>
        {isLoading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="block text-center text-sm text-gray-600 mt-1">
              {progress}%
            </span>
          </div>
        )}
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded font-bold ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          disabled={isLoading || !file}
        >
          {isLoading ? "Creating Deck..." : "Create Flashcard Deck"}
        </button>
      </form>
    </div>
  );
}

export default FlashcardUploader;
