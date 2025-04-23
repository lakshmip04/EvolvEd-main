import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

function FlashcardDeck() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useSelector((state) => state.auth);
  
  // State for the current flashcard being shown
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  // State to track if the card is flipped to show the answer
  const [isFlipped, setIsFlipped] = useState(false);
  // State for tracking study progress
  const [progress, setProgress] = useState(0);
  
  // Sample flashcard deck - would be fetched from Redux in a complete implementation
  const [deck, setDeck] = useState({
    title: "JavaScript Basics",
    description: "Core concepts of JavaScript including variables, data types, functions, and control flow.",
    cards: [
      { 
        id: 1, 
        question: "What is a closure in JavaScript?", 
        answer: "A closure is the combination of a function bundled together with references to its surrounding state (lexical environment). In other words, a closure gives you access to an outer function's scope from an inner function."
      },
      { 
        id: 2, 
        question: "What is the difference between let, const, and var?", 
        answer: "var is function scoped and can be redeclared and updated. let is block scoped and can be updated but not redeclared. const is block scoped and cannot be updated or redeclared."
      },
      { 
        id: 3, 
        question: "What is a Promise in JavaScript?", 
        answer: "A Promise is an object representing the eventual completion or failure of an asynchronous operation. It allows you to associate handlers with an asynchronous action's eventual success or failure."
      },
      { 
        id: 4, 
        question: "What is the event loop in JavaScript?", 
        answer: "The event loop is a programming construct that waits for and dispatches events in a program. It works by making a request to some internal or external 'event provider' then calls the relevant event handler."
      },
      { 
        id: 5, 
        question: "What is destructuring in JavaScript?", 
        answer: "Destructuring is a JavaScript expression that allows you to extract data from arrays or objects into distinct variables."
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 168).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
    // In a complete implementation, we would fetch the deck by ID from the Redux store or API
  }, [user, navigate, id]);

  useEffect(() => {
    // Update progress based on current card index
    setProgress(Math.floor((currentCardIndex / deck.cards.length) * 100));
  }, [currentCardIndex, deck.cards.length]);

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    if (currentCardIndex < deck.cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const markCorrect = () => {
    // In a complete implementation, this would update the card's study status
    nextCard();
  };

  const markIncorrect = () => {
    // In a complete implementation, this would update the card's study status
    nextCard();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate('/flashcards')}
          className="inline-flex items-center text-gray-700 dark:text-gray-300 hover:text-custom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Decks
        </button>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Card {currentCardIndex + 1} of {deck.cards.length}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{deck.title}</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{deck.description}</p>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-8">
          <div 
            className="bg-custom h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Flashcard */}
        <div 
          className={`w-full aspect-[3/2] bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm p-8 mb-8 flex items-center justify-center cursor-pointer transition-all duration-300 ${isFlipped ? 'bg-blue-50 dark:bg-blue-900' : ''}`} 
          onClick={flipCard}
        >
          <div className="text-center">
            <div className="absolute top-4 right-4 text-xs font-medium text-gray-400">
              {isFlipped ? 'Answer' : 'Question'}
            </div>
            <p className="text-xl md:text-2xl font-medium text-gray-900 dark:text-white">
              {isFlipped 
                ? deck.cards[currentCardIndex].answer 
                : deck.cards[currentCardIndex].question}
            </p>
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              Click to {isFlipped ? 'see question' : 'reveal answer'}
            </div>
          </div>
        </div>
        
        {/* Navigation and feedback buttons */}
        <div className="flex justify-between items-center">
          <button 
            onClick={prevCard}
            disabled={currentCardIndex === 0}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium ${currentCardIndex === 0 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Previous
          </button>
          
          {isFlipped && (
            <div className="flex space-x-3">
              <button 
                onClick={markIncorrect}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Incorrect
              </button>
              
              <button 
                onClick={markCorrect}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Correct
              </button>
            </div>
          )}
          
          <button 
            onClick={nextCard}
            disabled={currentCardIndex === deck.cards.length - 1}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium ${currentCardIndex === deck.cards.length - 1 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default FlashcardDeck; 