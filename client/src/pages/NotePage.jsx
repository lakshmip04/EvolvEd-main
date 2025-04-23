import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

function NotePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  
  // Placeholder state for a note - would be fetched from Redux in a complete implementation
  const [note, setNote] = useState({
    title: "React Fundamentals",
    content: "# React Fundamentals\n\nReact is a JavaScript library for building user interfaces. It is maintained by Facebook and a community of individual developers and companies.\n\n## Key Concepts\n\n### Components\nComponents are the building blocks of any React application. A component is a JavaScript function or class that optionally accepts inputs, called props, and returns a React element that describes how a section of the UI should appear.\n\n### JSX\nJSX is a syntax extension to JavaScript that looks similar to HTML. React uses JSX for templating instead of regular JavaScript.\n\n### State and Props\nState is a built-in React object that is used to contain data or information about the component. Props are properties passed to a component from its parent.\n\n### Hooks\nHooks are functions that let you \"hook into\" React state and lifecycle features from function components. Examples include useState, useEffect, and useContext.",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    // In a complete implementation, we would fetch the note by ID from the Redux store or API
  }, [user, navigate, id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/notes')}
          className="inline-flex items-center text-gray-700 dark:text-gray-300 hover:text-custom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Notes
        </button>
        <div className="flex space-x-2">
          <button className="inline-flex items-center bg-custom text-white rounded-md px-4 py-2 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit
          </button>
          <button className="inline-flex items-center bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{note.title}</h1>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
            <span>Created: {new Date(note.createdAt).toLocaleString()}</span>
            <span>Updated: {new Date(note.updatedAt).toLocaleString()}</span>
          </div>
        </div>
        
        {/* Note content - would use a Markdown renderer in a complete implementation */}
        <div className="prose dark:prose-invert max-w-none">
          {note.content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('# ')) {
              return <h1 key={idx} className="text-2xl font-bold mt-6 mb-4">{paragraph.substring(2)}</h1>;
            } else if (paragraph.startsWith('## ')) {
              return <h2 key={idx} className="text-xl font-bold mt-5 mb-3">{paragraph.substring(3)}</h2>;
            } else if (paragraph.startsWith('### ')) {
              return <h3 key={idx} className="text-lg font-bold mt-4 mb-2">{paragraph.substring(4)}</h3>;
            } else {
              return <p key={idx} className="mb-4">{paragraph}</p>;
            }
          })}
        </div>
      </div>
    </div>
  );
}

export default NotePage; 