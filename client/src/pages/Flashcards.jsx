import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function Flashcards() {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Flashcard Decks</h1>
          <button className="bg-custom text-white rounded-md px-4 py-2 text-base font-medium inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create New Deck
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample flashcard decks - these would be dynamically generated from Redux state */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">JavaScript Basics</h3>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">20 cards</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Core concepts of JavaScript including variables, data types, functions, and control flow.
            </p>
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                <span className="flex h-2 w-2 bg-green-500 rounded-full"></span>
                <span className="flex h-2 w-2 bg-green-500 rounded-full"></span>
                <span className="flex h-2 w-2 bg-green-500 rounded-full"></span>
                <span className="flex h-2 w-2 bg-green-500 rounded-full"></span>
                <span className="flex h-2 w-2 bg-green-300 rounded-full"></span>
              </div>
              <Link to="/flashcards/1" className="bg-custom text-white rounded-md px-4 py-2 text-sm font-medium">
                Study Now
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">React Hooks</h3>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">15 cards</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Essential React hooks: useState, useEffect, useContext, useReducer, and custom hooks.
            </p>
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                <span className="flex h-2 w-2 bg-green-500 rounded-full"></span>
                <span className="flex h-2 w-2 bg-green-500 rounded-full"></span>
                <span className="flex h-2 w-2 bg-green-300 rounded-full"></span>
                <span className="flex h-2 w-2 bg-gray-300 rounded-full"></span>
                <span className="flex h-2 w-2 bg-gray-300 rounded-full"></span>
              </div>
              <Link to="/flashcards/2" className="bg-custom text-white rounded-md px-4 py-2 text-sm font-medium">
                Study Now
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">MongoDB Commands</h3>
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">10 cards</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Common MongoDB commands for CRUD operations and database management.
            </p>
            <div className="flex justify-between items-center">
              <div className="flex space-x-1">
                <span className="flex h-2 w-2 bg-green-500 rounded-full"></span>
                <span className="flex h-2 w-2 bg-yellow-500 rounded-full"></span>
                <span className="flex h-2 w-2 bg-yellow-500 rounded-full"></span>
                <span className="flex h-2 w-2 bg-gray-300 rounded-full"></span>
                <span className="flex h-2 w-2 bg-gray-300 rounded-full"></span>
              </div>
              <Link to="/flashcards/3" className="bg-custom text-white rounded-md px-4 py-2 text-sm font-medium">
                Study Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Flashcards; 