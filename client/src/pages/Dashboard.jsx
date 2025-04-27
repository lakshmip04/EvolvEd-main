import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Timer from '../components/Timer';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [studyTime, setStudyTime] = useState(0);
  const [studyHistory, setStudyHistory] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }

    // Load study history from localStorage
    const savedHistory = localStorage.getItem('studyHistory');
    if (savedHistory) {
      setStudyHistory(JSON.parse(savedHistory));
    }

    const savedTime = localStorage.getItem('totalStudyTime');
    if (savedTime) {
      setStudyTime(parseInt(savedTime));
    }
  }, [user, navigate]);

  const handleTimerComplete = () => {
    // You can add notification or sound here
    alert('Timer completed!');
    
    // Get the actual time that was set (in case user changed it)
    const timerElement = document.querySelector('.timer-container');
    const minutes = timerElement && timerElement.dataset.minutes ? 
      parseInt(timerElement.dataset.minutes) : 25;
    
    // Update study time
    const newTotalTime = studyTime + minutes * 60; // Add the minutes in seconds
    setStudyTime(newTotalTime);
    localStorage.setItem('totalStudyTime', newTotalTime.toString());
    
    // Update study history
    const today = new Date().toISOString().split('T')[0];
    const updatedHistory = [...studyHistory];
    const todayIndex = updatedHistory.findIndex(item => item.date === today);
    
    if (todayIndex >= 0) {
      updatedHistory[todayIndex].minutes += minutes;
    } else {
      updatedHistory.push({ date: today, minutes: minutes });
    }
    
    setStudyHistory(updatedHistory);
    localStorage.setItem('studyHistory', JSON.stringify(updatedHistory));
  };

  const formatStudyTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const startTodaysSession = () => {
    navigate('/tasks');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              "Success is not final, failure is not fatal: it is the courage to continue that counts."
            </p>
            <button 
              className="bg-custom text-white rounded-md px-6 py-3 text-base font-medium inline-flex items-center"
              onClick={startTodaysSession}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Today's Session
            </button>
          </div>
          <div className="hidden lg:block">
            <svg className="w-full h-64 text-custom" fill="currentColor" viewBox="0 0 1000 1000">
              <path d="M500,10C229.4,10,10,229.4,10,500c0,270.6,219.4,490,490,490c270.6,0,490-219.4,490-490C990,229.4,770.6,10,500,10z M500,881.8C288.5,881.8,118.2,711.5,118.2,500C118.2,288.5,288.5,118.2,500,118.2c211.5,0,381.8,170.3,381.8,381.8C881.8,711.5,711.5,881.8,500,881.8z M672.1,486.1h-145V341.1c0-14.9-12.1-27-27-27c-14.9,0-27,12.1-27,27v145H328c-14.9,0-27,12.1-27,27c0,14.9,12.1,27,27,27h145.1v145.1c0,14.9,12.1,27,27,27c14.9,0,27-12.1,27-27V540.1h145c14.9,0,27-12.1,27-27C699.1,498.2,687,486.1,672.1,486.1z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notes */}
        <Link to="/notes" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-transform transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Notes</h2>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-custom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Create, edit and organize your notes with AI assistance.</p>
          <div className="mt-4 flex justify-end">
            <span className="text-custom text-sm font-medium">View Notes &rarr;</span>
          </div>
        </Link>

        {/* Flashcards */}
        <Link to="/flashcards" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-transform transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Flashcards</h2>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-custom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Create and study flashcards with spaced repetition.</p>
          <div className="mt-4 flex justify-end">
            <span className="text-custom text-sm font-medium">View Flashcards &rarr;</span>
          </div>
        </Link>

        {/* Tasks */}
        <Link to="/tasks" className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-transform transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks & To-Do</h2>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-custom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Manage your study schedule and track your progress.</p>
          <div className="mt-4 flex justify-end">
            <span className="text-custom text-sm font-medium">View Tasks &rarr;</span>
          </div>
        </Link>
      </div>

      {/* Analytics Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Analytics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Total Study Time</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{formatStudyTime(studyTime)}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Current Streak</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{studyHistory.length} days</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Tasks Completed</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">15</p>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          <button className="text-sm text-custom hover:text-custom-dark font-medium">View All</button>
        </div>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-custom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Created a new note: "Introduction to React"</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Today at 9:42 AM</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-custom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Studied "JavaScript Basics" flashcards</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Yesterday at 6:30 PM</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
            <div className="flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-custom" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Completed task: "Finish homework assignment"</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">2 days ago</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Study Timer</span>
              <div className="timer-container timer-display" data-minutes="25">
                <Timer initialMinutes={25} onComplete={handleTimerComplete} />
              </div>
            </div>
            {/* Add other quick actions here */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 