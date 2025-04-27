import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

function Timer({ initialMinutes = 25, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(initialMinutes);
  const [isSettingTime, setIsSettingTime] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            if (onComplete) onComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onComplete]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customMinutes * 60);
  };

  const handleMinutesChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setCustomMinutes(value);
    }
  };

  const applyCustomTime = () => {
    setTimeLeft(customMinutes * 60);
    setIsSettingTime(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="inline-flex items-center space-x-2">
      {isSettingTime ? (
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="1"
            max="120"
            value={customMinutes}
            onChange={handleMinutesChange}
            className="w-16 text-center border border-gray-300 rounded p-1 text-sm"
          />
          <button
            onClick={applyCustomTime}
            className="p-1 rounded-full bg-green-100 hover:bg-green-200 text-green-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ) : (
        <>
          <div 
            onClick={() => setIsSettingTime(true)}
            className={`font-mono text-lg cursor-pointer px-2 py-1 rounded ${isRunning ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}
            data-minutes={customMinutes}
          >
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={toggleTimer}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600"
            aria-label={isRunning ? "Pause timer" : "Start timer"}
          >
            {isRunning ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <button
            onClick={resetTimer}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600"
            aria-label="Reset timer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

Timer.propTypes = {
  initialMinutes: PropTypes.number,
  onComplete: PropTypes.func,
};

export default Timer; 