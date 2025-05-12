import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { updateStudyTime } from '../features/analytics/analyticsSlice';

function Timer({ initialMinutes = 25, onComplete }) {
  const dispatch = useDispatch();
  
  // Initialize state from localStorage or use default values
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem('studyTimer_timeLeft');
    return saved ? parseInt(saved) : initialMinutes * 60;
  });
  
  const [isRunning, setIsRunning] = useState(() => {
    return localStorage.getItem('studyTimer_isRunning') === 'true';
  });
  
  const [customMinutes, setCustomMinutes] = useState(() => {
    const saved = localStorage.getItem('studyTimer_customMinutes');
    return saved ? parseInt(saved) : initialMinutes;
  });
  
  const [isSettingTime, setIsSettingTime] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  
  // Load accumulated time from localStorage
  const accumulatedTimeRef = useRef(
    localStorage.getItem('studyTimer_accumulatedTime') 
      ? parseInt(localStorage.getItem('studyTimer_accumulatedTime')) 
      : 0
  );
  
  // Time of last db sync to prevent too frequent updates
  const lastSyncTimeRef = useRef(
    localStorage.getItem('studyTimer_lastSyncTime')
      ? parseInt(localStorage.getItem('studyTimer_lastSyncTime'))
      : 0
  );
  
  // Load last start time from localStorage if timer was running
  useEffect(() => {
    if (isRunning) {
      const savedStartTime = localStorage.getItem('studyTimer_startTime');
      if (savedStartTime) {
        startTimeRef.current = parseInt(savedStartTime);
      } else {
        startTimeRef.current = Date.now();
        localStorage.setItem('studyTimer_startTime', startTimeRef.current);
      }
    }
  }, []);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('studyTimer_timeLeft', timeLeft);
    localStorage.setItem('studyTimer_isRunning', isRunning);
    localStorage.setItem('studyTimer_customMinutes', customMinutes);
    localStorage.setItem('studyTimer_accumulatedTime', accumulatedTimeRef.current);
    
    if (startTimeRef.current) {
      localStorage.setItem('studyTimer_startTime', startTimeRef.current);
    }
  }, [timeLeft, isRunning, customMinutes]);

  // Sync study time to database when accumulating significant time (5+ minutes)
  const syncToDatabase = (minutes) => {
    if (minutes <= 0) return;
    
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];
    
    // Only sync if we have a meaningful amount of time (1 minute or more)
    // and if it's been at least 5 minutes since the last sync
    if (minutes >= 1 && (now - lastSyncTimeRef.current >= 5 * 60 * 1000)) {
      dispatch(updateStudyTime({ minutes, date: today }));
      lastSyncTimeRef.current = now;
      localStorage.setItem('studyTimer_lastSyncTime', now);
      
      // Reset accumulated time after syncing to database
      accumulatedTimeRef.current = 0;
      localStorage.setItem('studyTimer_accumulatedTime', 0);
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      // Record start time when timer begins
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
        localStorage.setItem('studyTimer_startTime', startTimeRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            
            // Calculate actual time spent
            const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const totalMinutes = Math.round((accumulatedTimeRef.current + elapsedSeconds) / 60);
            
            // Reset tracking refs
            startTimeRef.current = null;
            accumulatedTimeRef.current = 0;
            
            // Clear localStorage timer data
            localStorage.removeItem('studyTimer_startTime');
            localStorage.setItem('studyTimer_accumulatedTime', 0);
            
            // Sync to database
            syncToDatabase(totalMinutes);
            
            // Call the completion callback with actual minutes studied
            if (onComplete) onComplete(totalMinutes);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      
      // If paused, accumulate the time spent so far
      if (startTimeRef.current !== null) {
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        accumulatedTimeRef.current += elapsedSeconds;
        localStorage.setItem('studyTimer_accumulatedTime', accumulatedTimeRef.current);
        
        // If accumulated enough time (5+ minutes), sync to database
        const accumulatedMinutes = Math.floor(accumulatedTimeRef.current / 60);
        if (accumulatedMinutes >= 5) {
          syncToDatabase(accumulatedMinutes);
        }
        
        startTimeRef.current = null;
        localStorage.removeItem('studyTimer_startTime');
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        
        // If unmounting while the timer is running, save the accumulated time
        if (isRunning && startTimeRef.current) {
          const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
          accumulatedTimeRef.current += elapsedSeconds;
          localStorage.setItem('studyTimer_accumulatedTime', accumulatedTimeRef.current);
          
          // If accumulated enough time (1+ minute), sync to database
          const accumulatedMinutes = Math.floor(accumulatedTimeRef.current / 60);
          if (accumulatedMinutes >= 1) {
            syncToDatabase(accumulatedMinutes);
          }
        }
      }
    };
  }, [isRunning, onComplete, dispatch]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customMinutes * 60);
    
    // If there's accumulated time, sync it to the database before resetting
    const accumulatedMinutes = Math.floor(accumulatedTimeRef.current / 60);
    if (accumulatedMinutes >= 1) {
      syncToDatabase(accumulatedMinutes);
    }
    
    // Reset tracking refs
    startTimeRef.current = null;
    accumulatedTimeRef.current = 0;
    
    // Clear localStorage timer data
    localStorage.removeItem('studyTimer_startTime');
    localStorage.setItem('studyTimer_accumulatedTime', 0);
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
            className={`timer-display font-mono text-lg cursor-pointer px-2 py-1 rounded ${isRunning ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'}`}
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