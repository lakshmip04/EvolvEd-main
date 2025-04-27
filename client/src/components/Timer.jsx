import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function Timer({ initialMinutes = 25, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let intervalId;
    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalId);
            setIsRunning(false);
            if (onComplete) onComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning, onComplete]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialMinutes * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="inline-flex items-center space-x-2">
      <span className={`font-mono text-lg ${isRunning ? 'text-custom' : 'text-gray-600'}`}>
        {formatTime(timeLeft)}
      </span>
      <button
        onClick={toggleTimer}
        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        {isRunning ? (
          <i className="fas fa-pause text-custom"></i>
        ) : (
          <i className="fas fa-play text-custom"></i>
        )}
      </button>
      <button
        onClick={resetTimer}
        className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <i className="fas fa-redo-alt text-gray-600"></i>
      </button>
    </div>
  );
}

Timer.propTypes = {
  initialMinutes: PropTypes.number,
  onComplete: PropTypes.func,
};

export default Timer; 