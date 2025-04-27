import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import PDFViewer from "./PDFViewer";
import { createNote, getNotes, updateNote } from "../features/notes/noteSlice";

function PDFStudyLayout({
  pdfUrl,
  pdfTitle = "",
  initialNotes = "",
  noteId: externalNoteId = null,
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [noteId, setNoteId] = useState(externalNoteId);
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    notes: userNotes,
    isLoading,
    isError,
    message,
    isSuccess,
  } = useSelector((state) => state.notes);

  useEffect(() => {
    console.log("PDFStudyLayout props:", {
      pdfUrl,
      pdfTitle,
      initialNotes,
      externalNoteId,
    });
  }, [pdfUrl, pdfTitle, initialNotes, externalNoteId]);

  // Update local state when props change
  useEffect(() => {
    if (initialNotes) {
      console.log("Setting notes from initialNotes:", initialNotes);
      setNotes(initialNotes);
    }
    if (externalNoteId) {
      console.log("Setting noteId from externalNoteId:", externalNoteId);
      setNoteId(externalNoteId);
    }
  }, [initialNotes, externalNoteId]);

  // Load existing notes for this PDF if available
  useEffect(() => {
    if (user && pdfUrl && !noteId) {
      console.log("Fetching user notes to find matching PDF note");
      // Fetch all user notes if not already loaded
      if (!userNotes.length) {
        dispatch(getNotes());
      }
    }
  }, [user, pdfUrl, noteId, dispatch, userNotes.length]);

  // Find note for this PDF
  useEffect(() => {
    if (userNotes && userNotes.length > 0 && pdfUrl && !noteId) {
      console.log("Searching for existing note matching PDF:", pdfUrl);
      // Extract the PDF ID from the pdfUrl object or string
      let pdfId;
      if (typeof pdfUrl === "string") {
        pdfId = pdfUrl;
      } else if (pdfUrl.id) {
        pdfId = pdfUrl.id;
      } else if (pdfUrl.url) {
        // Extract filename from URL
        const urlParts = pdfUrl.url.split("/");
        pdfId = urlParts[urlParts.length - 1];
      }

      console.log("Searching for notes with pdfId:", pdfId);
      console.log("Available notes:", userNotes);

      const existingNote = userNotes.find((note) => {
        // Check if the note is linked to this PDF
        if (note.pdfFile === pdfId) return true;

        // Check if note title matches the PDF filename
        if (pdfUrl.filename && note.title === `Notes: ${pdfUrl.filename}`)
          return true;

        // Check if note pdfFile contains the filename part
        if (note.pdfFile && pdfId && note.pdfFile.includes(pdfId)) return true;

        return false;
      });

      if (existingNote) {
        console.log("Found existing note:", existingNote);
        setNotes(existingNote.content);
        setNoteId(existingNote._id);
      } else {
        console.log("No existing note found for this PDF");
      }
    }
  }, [userNotes, pdfUrl, noteId]);

  // Log Redux state changes for debugging
  useEffect(() => {
    console.log("Redux notes state:", {
      userNotes,
      isLoading,
      isError,
      message,
      isSuccess,
    });
  }, [userNotes, isLoading, isError, message, isSuccess]);

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleSaveNotes = async () => {
    if (!notes.trim()) {
      toast.info("Please enter some notes to save");
      return;
    }

    try {
      setIsSaving(true);

      // Get PDF identifier and URL
      let pdfId;
      let fileUrl;

      if (typeof pdfUrl === "string") {
        pdfId = pdfUrl;
        fileUrl = pdfUrl;
      } else if (pdfUrl.id) {
        pdfId = pdfUrl.id;
        fileUrl = pdfUrl.url;
      } else if (pdfUrl.url) {
        // Extract filename from URL if it's a URL
        const urlParts = pdfUrl.url.split("/");
        pdfId = urlParts[urlParts.length - 1];
        fileUrl = pdfUrl.url;
      }

      const noteTitle = `Notes: ${
        pdfUrl.filename || pdfTitle || "PDF Document"
      }`;

      console.log("Saving note with pdfId:", pdfId);
      console.log("Note data:", {
        title: noteTitle,
        content: notes.substring(0, 50) + "...",
        pdfId,
        url: fileUrl,
      });

      const noteData = {
        title: noteTitle,
        content: notes,
        tags: ["pdf-notes"],
        pdfFile: pdfId,
        url: fileUrl,
      };

      if (noteId) {
        // Update existing note
        console.log("Updating existing note with ID:", noteId);
        const updated = await dispatch(
          updateNote({ noteId, noteData })
        ).unwrap();
        console.log("Note updated:", updated);
        toast.success("Notes updated successfully");
      } else {
        // Create new note
        console.log("Creating new note");
        const result = await dispatch(createNote(noteData)).unwrap();
        console.log("New note created:", result);
        setNoteId(result._id);
        toast.success("Notes saved successfully");
      }

      // Refresh notes list
      dispatch(getNotes());
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error(
        "Failed to save notes: " + (error.message || "Unknown error")
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100vh-200px)]">
      {/* Left side: PDF Viewer */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold">
            {pdfTitle ? `Document: ${pdfTitle}` : "Document Viewer"}
          </h3>
        </div>
        <div className="h-[calc(100%-60px)]">
          <PDFViewer pdfUrl={pdfUrl} />
        </div>
      </div>

      {/* Right side: Notes */}
      <div className="border rounded-lg shadow-sm overflow-hidden bg-white">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Notes</h3>
          <button
            onClick={handleSaveNotes}
            disabled={isSaving}
            className={`px-4 py-2 rounded text-white ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSaving ? "Saving..." : noteId ? "Update Notes" : "Save Notes"}
          </button>
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
