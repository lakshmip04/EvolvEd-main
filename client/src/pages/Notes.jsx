import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PDFUploader from "../components/PDFUploader";
import PDFViewer from "../components/PDFViewer";
import PDFSelector from "../components/PDFSelector";
import NoteEditor from "../components/NoteEditor";
import PDFSummarizer from "../components/PDFSummarizer";
import { getNotes, createNote } from "../features/notes/noteSlice";
import axios from "axios";
import config from "../config";

function Notes() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notes: userNotes, isLoading: notesLoading } = useSelector(
    (state) => state.notes
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [showSummarizer, setShowSummarizer] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
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
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(criteria);
      setSortOrder("asc");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setSelectedPDF({
        file,
        previewUrl: url,
        filename: file.name,
      });
    } else if (file) {
      toast.error("Please select a valid PDF file");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setSelectedPDF({
        file,
        previewUrl: url,
        filename: file.name,
      });
    } else if (file) {
      toast.error("Please select a valid PDF file");
    }
  };

  const handleSummaryGenerated = (summary) => {
    // Add the generated summary to the note content
    setNoteContent((prevContent) => {
      if (prevContent.trim()) {
        return `${prevContent}\n\n## AI-Generated Summary\n\n${summary}`;
      }
      return `## AI-Generated Summary\n\n${summary}`;
    });
    
    setGeneratedSummary(summary);
    toast.success("Summary added to note content");
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim()) {
      toast.error("Please add a title for your note");
      return;
    }

    if (!noteContent.trim()) {
      toast.error("Please add some content to your note");
      return;
    }

    try {
      setIsSaving(true);
      let noteData = {
        title: noteTitle,
        content: noteContent,
        tags: [],
      };

      // If there's a PDF file to upload
      if (selectedPDF?.file) {
        const formData = new FormData();
        formData.append("pdf", selectedPDF.file);
        formData.append("title", noteTitle);
        formData.append("content", noteContent);
        formData.append("tags", JSON.stringify(["pdf-notes"]));

        console.log("Uploading PDF and creating note...");
        const response = await axios.post(
          `${config.API_URL}/api/notes/with-pdf`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        console.log("Note created with PDF:", response.data);
        toast.success("PDF uploaded and note created successfully");
      } else {
        // Regular note without PDF
        noteData.url = "none";
        console.log("Creating regular note:", noteData);
        await dispatch(createNote(noteData)).unwrap();
        toast.success("Note saved successfully");
      }

      // Refresh notes list
      dispatch(getNotes());

      // Close editor and reset form
      setIsEditorOpen(false);
      setNoteContent("");
      setNoteTitle("");
      setSelectedPDF(null);
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error(`Failed to save note: ${error.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter notes based on search term
  const filteredNotes = userNotes
    .filter(
      (note) =>
        !note.tags?.includes("pdf-notes") &&
        (note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });

  // Filter notes that have PDF attachments
  const getPDFNotes = () => {
    if (!userNotes || !Array.isArray(userNotes)) return [];

    return userNotes.filter(
      (note) => note.tags?.includes("pdf-notes") || note.pdfFile
    );
  };

  if (notesLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Notes
          </h1>
          <button
            onClick={() => {
              setIsEditorOpen(true);
              setSelectedPDF(null);
              setNoteContent("");
              setNoteTitle("");
            }}
            className="bg-blue-600 text-white rounded-md px-4 py-2 text-base font-medium inline-flex items-center hover:bg-blue-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
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
              {getPDFNotes().map((note) => (
                <div
                  key={note._id}
                  className="bg-blue-50 dark:bg-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow border border-blue-100"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {note.title}
                  </h3>
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
              onClick={() => handleSort("title")}
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 ${
                sortBy === "title" ? "font-bold" : ""
              }`}
            >
              Title {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => handleSort("updatedAt")}
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 ${
                sortBy === "updatedAt" ? "font-bold" : ""
              }`}
            >
              Updated{" "}
              {sortBy === "updatedAt" && (sortOrder === "asc" ? "↑" : "↓")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <div
                key={note._id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {note.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  {note.content}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Updated {new Date(note.updatedAt).toLocaleString()}
                  </span>
                  <Link
                    to={`/notes/${note._id}`}
                    className="text-blue-600 text-sm font-medium"
                  >
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold dark:text-white">
                {noteTitle ? noteTitle : "New Note"}
              </h2>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label
                  htmlFor="noteTitle"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Title
                </label>
                <input
                  id="noteTitle"
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Note title"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <div className="border rounded-md p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Attach PDF (Optional)
                    </label>
                    {selectedPDF && (
                      <button
                        onClick={() => {
                          setSelectedPDF(null);
                          setShowSummarizer(false);
                          setGeneratedSummary("");
                        }}
                        className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove PDF
                      </button>
                    )}
                  </div>
                  
                  {!selectedPDF ? (
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-md px-6 pt-5 pb-6 flex justify-center"
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <div className="mt-1 flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 hover:text-blue-500"
                          >
                            <span>Upload a PDF file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={handleFileSelect}
                              accept="application/pdf"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF up to 10MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-md p-3 mb-3 flex items-center">
                        <svg
                          className="h-8 w-8 text-blue-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">
                            {selectedPDF.filename}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between space-x-2">
                        <button
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-medium"
                          onClick={() => window.open(selectedPDF.previewUrl, '_blank')}
                        >
                          View PDF
                        </button>
                        <button
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm font-medium"
                          onClick={() => setShowSummarizer(!showSummarizer)}
                        >
                          {showSummarizer ? "Hide Summarizer" : "Summarize with AI"}
                        </button>
                      </div>
                      
                      {showSummarizer && (
                        <PDFSummarizer 
                          pdfFile={selectedPDF.file || selectedPDF.previewUrl}
                          onSummaryGenerated={handleSummaryGenerated}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col h-full">
                <label
                  htmlFor="noteContent"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Note Content
                </label>
                <textarea
                  id="noteContent"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write your note here..."
                  className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[300px]"
                />
              </div>
            </div>

            <div className="flex justify-end p-4 border-t">
              <button
                onClick={() => setIsEditorOpen(false)}
                className="mr-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                disabled={isSaving}
                className={`px-4 py-2 rounded text-white font-medium ${
                  isSaving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSaving ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notes;
