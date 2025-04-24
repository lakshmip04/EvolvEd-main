import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateNote } from '../features/notes/noteSlice';
import { toast } from 'react-toastify';

function PDFEditor({ note, onClose }) {
  const [content, setContent] = useState(note.content || '');
  const [title, setTitle] = useState(note.title || '');
  const [selectedText, setSelectedText] = useState('');
  const [highlights, setHighlights] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Split content into summary and full text sections
  const [summary, fullText] = useMemo(() => {
    const summaryMatch = content.match(/# Summary\n([\s\S]*?)(?=\n# Full Text|\n# |\n$)/);
    const fullTextMatch = content.match(/# Full Text\n([\s\S]*?)(?=\n# |\n$)/);
    return [
      summaryMatch ? summaryMatch[1] : '',
      fullTextMatch ? fullTextMatch[1] : content
    ];
  }, [content]);

  // Handle text selection for highlighting
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      setSelectedText(selection.toString());
    }
  };

  // Add a highlight
  const addHighlight = () => {
    if (selectedText) {
      setHighlights([...highlights, selectedText]);
      toast.success('Highlight added!');
      setSelectedText('');
    }
  };

  // Generate notes from highlights
  const generateNotes = () => {
    if (highlights.length === 0) {
      toast.error('Please add some highlights first');
      return;
    }

    const highlightsText = highlights.map(h => `- ${h}`).join('\n');
    const newContent = `# Summary\n${summary}\n\n# Highlights\n${highlightsText}\n\n# Full Text\n${fullText}`;
    setContent(newContent);
    toast.success('Notes generated from highlights');
  };

  // Regenerate summary
  const regenerateSummary = async () => {
    try {
      toast.info('Regenerating summary...');
      
      // This would ideally call your backend API to regenerate the summary
      // For now we'll just update with a mock message
      const newSummary = 'Regenerated summary would appear here. In a full implementation, this would call your backend API.';
      
      const newContent = `# Summary\n${newSummary}\n\n# Highlights\n${highlights.map(h => `- ${h}`).join('\n')}\n\n# Full Text\n${fullText}`;
      setContent(newContent);
      
      toast.success('Summary regenerated');
    } catch (error) {
      toast.error('Failed to regenerate summary');
    }
  };

  // Save the note
  const saveNote = () => {
    dispatch(updateNote({
      noteId: note._id,
      noteData: {
        title,
        content,
        tags: [...note.tags, 'edited']
      }
    }));
    toast.success('Note saved successfully');
    onClose();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl mx-auto my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Edit PDF Notes</h2>
        <div className="space-x-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button 
            onClick={saveNote}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Text Panel */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Original PDF Text</h3>
          <div 
            className="border border-gray-300 rounded p-4 h-96 overflow-y-auto"
            onMouseUp={handleTextSelection}
          >
            <pre className="whitespace-pre-wrap">{fullText}</pre>
          </div>
          {selectedText && (
            <div className="mt-2 flex justify-between items-center">
              <div className="italic text-gray-600">"{selectedText.substring(0, 50)}..."</div>
              <button 
                onClick={addHighlight}
                className="px-3 py-1 bg-yellow-400 rounded hover:bg-yellow-500"
              >
                Highlight
              </button>
            </div>
          )}
        </div>

        {/* Notes Panel */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Summary & Notes</h3>
            <button 
              onClick={regenerateSummary}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              Regenerate Summary
            </button>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium mb-1">Summary</h4>
            <div className="border border-gray-300 rounded p-3 h-32 overflow-y-auto bg-gray-50">
              <p>{summary}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-medium">Highlights ({highlights.length})</h4>
              <button 
                onClick={generateNotes}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={highlights.length === 0}
              >
                Generate Notes
              </button>
            </div>
            <div className="border border-gray-300 rounded p-3 h-40 overflow-y-auto">
              {highlights.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {highlights.map((highlight, index) => (
                    <li key={index} className="text-sm">
                      <div className="flex justify-between">
                        <span>{highlight.substring(0, 100)}{highlight.length > 100 ? '...' : ''}</span>
                        <button 
                          onClick={() => setHighlights(highlights.filter((_, i) => i !== index))}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">Select text from the PDF to add highlights</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-1">Final Note Content</h4>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PDFEditor;
