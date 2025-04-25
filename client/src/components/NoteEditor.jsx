import React, { useState } from 'react';
import PDFUploader from '../components/PDFUploader';

function NoteEditor({ onPDFSelect }) {
  const [noteContent, setNoteContent] = useState('');

  const handleNoteChange = (e) => {
    setNoteContent(e.target.value);
  };

  return (
    <div>
      <PDFUploader onPDFSelect={onPDFSelect} />
      <textarea
        value={noteContent}
        onChange={handleNoteChange}
        className="w-full h-96 p-3 border border-gray-300 rounded mt-4"
        placeholder="Write your notes here..."
      />
    </div>
  );
}

export default NoteEditor;
