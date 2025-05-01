import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { useState, useEffect } from 'react';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Apply dark mode on theme change
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Close mobile menu when navigating to a new page
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/">
                  <img className="h-10 w-auto" src="/logo.png" alt="StudyMind" />
                </Link>
              </div>
              {user && (
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link 
                    to="/" 
                    className={`${
                      window.location.pathname === '/' 
                        ? 'border-custom text-gray-900 dark:text-white' 
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/notes" 
                    className={`${
                      window.location.pathname === '/notes' 
                        ? 'border-custom text-gray-900 dark:text-white' 
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    AI Notes
                  </Link>
                  <Link 
                    to="/flashcards" 
                    className={`${
                      window.location.pathname === '/flashcards' 
                        ? 'border-custom text-gray-900 dark:text-white' 
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Flashcards
                  </Link>
                  <Link 
                    to="/tasks" 
                    className={`${
                      window.location.pathname === '/tasks' 
                        ? 'border-custom text-gray-900 dark:text-white' 
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Tasks &amp; To-Do
                  </Link>
                  <Link
                    to="/paint"
                    className={`${
                        window.location.pathname === '/paint'
                            ? 'border-custom text-gray-900 dark:text-white'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Take Notes
                  </Link>
                  <Link
                    to="/chatbot"
                    className={`${
                        window.location.pathname === '/chatbot'
                            ? 'border-custom text-gray-900 dark:text-white'
                            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    AI Chatbot
                  </Link>
                  
                  {/* <Link 
                    to="/pdfstudy" 
                    className={`${
                      window.location.pathname === '/pdfstudy' 
                        ? 'border-custom text-gray-900 dark:text-white' 
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    PDF Study
                  </Link> */}
                </div>
              )}
            </div>
            <div className="flex items-center">
              {user && (
                <div className="sm:hidden">
                  <button
                    onClick={toggleMobileMenu}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 focus:outline-none"
                  >
                    <span className="sr-only">Open main menu</span>
                    {!isMobileMenuOpen ? (
                      <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    ) : (
                      <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
              {user ? (
                <div className="ml-4 flex items-center space-x-4">
                  <button 
                    onClick={toggleDarkMode} 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    {isDarkMode ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path 
                          fillRule="evenodd" 
                          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    )}
                  </button>
                  <button 
                    onClick={onLogout} 
                    className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="ml-4 flex items-center space-x-4">
                  <button 
                    onClick={toggleDarkMode} 
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    {isDarkMode ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path 
                          fillRule="evenodd" 
                          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    )}
                  </button>
                  <Link 
                    to="/login" 
                    className="text-gray-800 hover:text-black dark:text-gray-300 dark:hover:text-white font-medium"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile menu, show/hide based on menu state */}
        {user && (
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
            <div className="fixed inset-0 z-40 bg-gray-800 bg-opacity-75" onClick={toggleMobileMenu}></div>
            <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto pb-12" 
                style={{ transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
              <div className="px-4 pt-5 pb-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <img className="h-8 w-auto" src="/logo.png" alt="StudyMind" />
                  </div>
                  <button
                    onClick={toggleMobileMenu}
                    className="rounded-md p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                  >
                    <span className="sr-only">Close menu</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-6">
                  <nav className="space-y-3">
                    <Link 
                      to="/" 
                      className={`${
                        window.location.pathname === '/' 
                          ? 'bg-gray-100 dark:bg-gray-800 text-custom' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      } block px-3 py-2 rounded-md text-base font-medium`}
                      onClick={toggleMobileMenu}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/notes" 
                      className={`${
                        window.location.pathname === '/notes' 
                          ? 'bg-gray-100 dark:bg-gray-800 text-custom' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      } block px-3 py-2 rounded-md text-base font-medium`}
                      onClick={toggleMobileMenu}
                    >
                      AI Notes
                    </Link>
                    <Link 
                      to="/flashcards" 
                      className={`${
                        window.location.pathname === '/flashcards' 
                          ? 'bg-gray-100 dark:bg-gray-800 text-custom' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      } block px-3 py-2 rounded-md text-base font-medium`}
                      onClick={toggleMobileMenu}
                    >
                      Flashcards
                    </Link>
                    <Link 
                      to="/tasks" 
                      className={`${
                        window.location.pathname === '/tasks' 
                          ? 'bg-gray-100 dark:bg-gray-800 text-custom' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      } block px-3 py-2 rounded-md text-base font-medium`}
                      onClick={toggleMobileMenu}
                    >
                      Tasks &amp; To-Do
                    </Link>
                    <Link
                      to="/paint"
                      className={`${
                        window.location.pathname === '/paint'
                            ? 'bg-gray-100 dark:bg-gray-800 text-custom'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      } block px-3 py-2 rounded-md text-base font-medium`}
                      onClick={toggleMobileMenu}
                    >
                      Take Notes
                    </Link>
                    <Link
                      to="/chatbot"
                      className={`${
                        window.location.pathname === '/chatbot'
                            ? 'bg-gray-100 dark:bg-gray-800 text-custom'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      } block px-3 py-2 rounded-md text-base font-medium`}
                      onClick={toggleMobileMenu}
                    >
                      AI Chatbot
                    </Link>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => {
                          onLogout();
                          toggleMobileMenu();
                        }} 
                        className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Logout
                      </button>
                    </div>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default Header; 