import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PDFUploader from '../components/PDFUploader';

function Notes() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Notes</h1>
          <button className="bg-custom text-white rounded-md px-4 py-2 text-base font-medium inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Note
          </button>
        </div>
        
        <div className="mb-8">
          <PDFUploader />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample note cards - these would be dynamically generated from Redux state */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">React Fundamentals</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
              Components, props, state, hooks, and more. Essential concepts for React development.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Updated 2 days ago</span>
              <Link to="/notes/1" className="text-custom text-sm font-medium">View Note</Link>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">JavaScript ES6+</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
              Modern JavaScript features: arrow functions, destructuring, spread operator, async/await.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Updated 5 days ago</span>
              <Link to="/notes/2" className="text-custom text-sm font-medium">View Note</Link>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">MongoDB Basics</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
              NoSQL database concepts, CRUD operations, and integration with Node.js.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">Updated 1 week ago</span>
              <Link to="/notes/3" className="text-custom text-sm font-medium">View Note</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notes; 