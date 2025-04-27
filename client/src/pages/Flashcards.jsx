import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import FlashcardUploader from "../components/FlashcardUploader";
import { getDecks } from "../features/flashcards/flashcardSlice";
import Timer from '../components/Timer';

function Flashcards() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { decks, isLoading, isError, message } = useSelector(
    (state) => state.flashcards
  );
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      dispatch(getDecks());
    }

    if (isError) {
      toast.error(message);
    }
  }, [user, navigate, dispatch, isError, message]);

  const handleTimerComplete = () => {
    alert('Study session completed!');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcard decks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Flashcard Decks
          </h1>
          <button
            onClick={() => setIsUploaderOpen(true)}
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
            Create New Deck
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Session Timer:</span>
          <Timer initialMinutes={15} onComplete={handleTimerComplete} />
        </div>

        {/* Flashcard Uploader Modal */}
        {isUploaderOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold">
                  Create New Flashcard Deck
                </h2>
                <button
                  onClick={() => setIsUploaderOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
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
              <div className="p-4">
                <FlashcardUploader
                  onClose={() => {
                    setIsUploaderOpen(false);
                    dispatch(getDecks()); // Refresh decks after upload
                  }}
                  onPDFSelect={() => {
                    setIsUploaderOpen(false);
                    dispatch(getDecks()); // Refresh decks after upload
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.length > 0 ? (
            decks.map((deck) => (
              <div
                key={deck._id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {deck.title}
                  </h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    {deck.cards?.length || 0} cards
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {deck.description || "No description provided."}
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex space-x-1">
                    {/* Progress indicators - you can customize based on study progress */}
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`flex h-2 w-2 rounded-full ${
                          i < (deck.studyCount || 0)
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      ></span>
                    ))}
                  </div>
                  <Link
                    to={`/flashcards/${deck._id}`}
                    className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700"
                  >
                    Study Now
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No flashcard decks found. Create your first deck!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Flashcards;
