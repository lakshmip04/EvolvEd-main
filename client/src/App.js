import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Notes from './pages/Notes';
import NotePage from './pages/NotePage';
import Flashcards from './pages/Flashcards';
import FlashcardDeck from './pages/FlashcardDeck';
import Tasks from './pages/Tasks';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow bg-gray-50 dark:bg-gray-900">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<PrivateRoute />}>
                  <Route path="/" element={<Dashboard />} />
                </Route>
                <Route path="/notes" element={<PrivateRoute />}>
                  <Route path="/notes" element={<Notes />} />
                </Route>
                <Route path="/notes/:id" element={<PrivateRoute />}>
                  <Route path="/notes/:id" element={<NotePage />} />
                </Route>
                <Route path="/flashcards" element={<PrivateRoute />}>
                  <Route path="/flashcards" element={<Flashcards />} />
                </Route>
                <Route path="/flashcards/:id" element={<PrivateRoute />}>
                  <Route path="/flashcards/:id" element={<FlashcardDeck />} />
                </Route>
                <Route path="/tasks" element={<PrivateRoute />}>
                  <Route path="/tasks" element={<Tasks />} />
                </Route>
              </Routes>
            </div>
          </main>
          <Footer />
        </div>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App; 