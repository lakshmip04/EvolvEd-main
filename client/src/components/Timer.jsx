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
            <i className="fas fa-check text-xs"></i>
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => setIsSettingTime(true)}
            className="font-mono text-lg cursor-pointer hover:text-custom"
          >
            {formatTime(timeLeft)}
          </button>
          <button
            onClick={toggleTimer}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={isRunning ? "Pause timer" : "Start timer"}
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
            aria-label="Reset timer"
          >
            <i className="fas fa-redo-alt text-gray-600"></i>
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