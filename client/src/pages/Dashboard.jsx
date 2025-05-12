import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { format } from "date-fns";
import { getTasks } from "../features/tasks/taskSlice";
import {
  getUserAnalytics,
  updateStudyTime,
} from "../features/analytics/analyticsSlice";
import Timer from "../components/Timer";
import FeedbackForm from "../components/FeedbackForm";

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { tasks } = useSelector((state) => state.tasks);
  const { analytics } = useSelector((state) => state.analytics);

  const [studyTime, setStudyTime] = useState(0);
  const [studyHistory, setStudyHistory] = useState([]);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [taskStats, setTaskStats] = useState({
    completed: 0,
    total: 0,
    rate: 0,
  });
  const [dailyStudyTime, setDailyStudyTime] = useState([]);
  const [dataMigrated, setDataMigrated] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      dispatch(getTasks());
      dispatch(getUserAnalytics());
    }
  }, [user, navigate, dispatch]);

  // Set up a refresh interval to update analytics data every 2 hours
  useEffect(() => {
    // Initial data fetch
    dispatch(getUserAnalytics());
    
    // Set up an interval to refresh data every 2 hours (7,200,000 ms)
    const refreshInterval = setInterval(() => {
      dispatch(getUserAnalytics());
      console.log('Analytics data refreshed automatically');
    }, 2 * 60 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [dispatch]);

  // Migrate localStorage data to the backend once
  useEffect(() => {
    if (user && analytics && !dataMigrated) {
      migrateLocalStorageData();
    }
  }, [user, analytics, dataMigrated, dispatch]);

  // Update local state when analytics data is loaded
  useEffect(() => {
    if (analytics) {
      setStudyTime(analytics.totalStudyTime);
      setStudyHistory(analytics.studyHistory || []);
      setStreak(analytics.currentStreak);
      setLongestStreak(analytics.longestStreak);

      // Generate data for the past 30 days
      const generatePastMonthData = () => {
        const today = new Date();
        const pastMonth = [];
        
        // Create entries for the past 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          // Find if there's study data for this date
          const dayData = analytics.studyHistory?.find(day => day.date === dateStr);
          
          // Add the data point (with 0 minutes if no activity)
          pastMonth.push({
            date: dateStr,
            minutes: dayData ? dayData.minutes : 0
          });
        }
        
        return pastMonth;
      };
      
      // Set the daily study time with all days included
      setDailyStudyTime(generatePastMonthData());
    }
  }, [analytics]);

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const completed = tasks?.filter?.((task) => task.status === "completed").length;
      setTaskStats({
        completed,
        total: tasks.length,
        rate: Math.round((completed / tasks.length) * 100),
      });
    }
  }, [tasks]);

  // Function to migrate localStorage data to the backend
  const migrateLocalStorageData = () => {
    // Only migrate if we have localStorage data and backend analytics is empty
    const savedHistory = localStorage.getItem("studyHistory");
    const savedTime = localStorage.getItem("totalStudyTime");

    if (
      (savedHistory || savedTime) &&
      analytics &&
      (!analytics.studyHistory || analytics.studyHistory.length === 0)
    ) {
      console.log("Migrating analytics data from localStorage to backend...");

      // Process study history
      if (savedHistory) {
        try {
          const parsedHistory = JSON.parse(savedHistory);

          // For each day in history, update the backend
          parsedHistory.forEach((day) => {
            dispatch(
              updateStudyTime({
                minutes: day.minutes,
                date: day.date,
              })
            );
          });

          // Clean up localStorage after migration
          localStorage.removeItem("studyHistory");
          localStorage.removeItem("totalStudyTime");

          console.log("Analytics data migration complete");
        } catch (error) {
          console.error("Failed to migrate analytics data:", error);
        }
      }
    }

    setDataMigrated(true);
  };

  const handleTimerComplete = (minutes) => {
    // You can add notification or sound here
    alert("Timer completed!");

    // If no minutes provided, use the default timer value
    const actualMinutes = minutes || 25;

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Update study time with API and refresh analytics data
    dispatch(updateStudyTime({ minutes: actualMinutes, date: today }))
      .then(() => {
        // Refresh analytics data to update the graph
        dispatch(getUserAnalytics());
      });
  };

  const formatStudyTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM d");
    } catch (error) {
      return dateString;
    }
  };

  const startTodaysSession = () => {
    navigate("/tasks");
  };

  // Get today's study time
  const todayStudyTime =
    studyHistory.find(
      (day) => day.date === new Date().toISOString().split("T")[0]
    )?.minutes || 0;

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
              "Success is not final, failure is not fatal: it is the courage to
              continue that counts."
            </p>
            <button
              className="bg-custom text-white rounded-md px-6 py-3 text-base font-medium inline-flex items-center"
              onClick={startTodaysSession}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
              Start Today's Session
            </button>
          </div>
          <div className="hidden lg:block">
            <svg
              width="250"
              height="250"
              viewBox="0 0 2050 2050"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <style>{`
      .cls-1{fill:#4d4c78;}
      .cls-11,.cls-2{fill:#323150;}
      .cls-3{fill:#67baeb;}
      .cls-4{fill:#f44533;}
      .cls-5{fill:#de3226;}
      .cls-6{fill:#f4c23f;}
      .cls-7{fill:#f4a93f;}
      .cls-8{fill:#c8c2e9;}
      .cls-9{fill:#b9b1e0;}
      .cls-10{fill:#b11a31;}
      .cls-11{opacity:0.1;}
      .cls-12{fill:#83d0fb;}
      .cls-13{opacity:0.2;}
      .cls-14{fill:#ffffff;}
      .cls-15{fill:#231f20;}
      .cls-16{fill:#fad564;}
      .cls-17{fill:#dfdafd;}
      .cls-18{fill:#f46253;}
    `}</style>
              </defs>

              <rect
                className="cls-1"
                height="120.02"
                rx="60"
                ry="60"
                width="1911.2"
                x="69.4"
                y="1589.3"
              />
              <path
                className="cls-2"
                d="M1920.6,1589.3H154.9c-.1,1.3-.1,2.6-.1,3.9h0a60,60,0,0,0,60,60.1H1980.4c.1-1.4.2-2.7.2-4h0A60,60,0,0,0,1920.6,1589.3Z"
              />
              <rect
                className="cls-3"
                height="1158.16"
                transform="translate(-147.9 290.1) rotate(-10)"
                width="273.3"
                x="1440.7"
                y="408"
              />
              <rect
                className="cls-3"
                height="1252.55"
                width="295.6"
                x="237.1"
                y="340.7"
              />
              <rect
                className="cls-4"
                height="1252.55"
                width="295.6"
                x="1017.2"
                y="340.7"
              />
              <polygon
                className="cls-5"
                points="1017.2 1593.2 1312.8 1593.2 1312.8 340.7 1262.8 340.7 1262.8 1536.4 1017.2 1536.4 1017.2 1593.2"
              />
              <rect
                className="cls-6"
                height="1166.42"
                width="242.6"
                x="532.7"
                y="426.8"
              />
              <path
                className="cls-7"
                d="M711.9,426.8V1371c0,98.9-80.2,179.2-179.2,179.2h0v43H775.3V426.8Z"
              />
              <rect
                className="cls-8"
                height="1089.46"
                width="242.6"
                x="774.6"
                y="503.8"
              />
              <path
                className="cls-9"
                d="M970.7,503.8v854.9c0,108.3-87.8,196.1-196.1,196.1h0v38.4h242.6V503.8Z"
              />
              <rect
                className="cls-1"
                height="87.09"
                width="295.6"
                x="237.1"
                y="538.2"
              />
              <rect
                className="cls-1"
                height="87.09"
                width="295.6"
                x="237.1"
                y="1308.7"
              />
              <rect
                className="cls-7"
                height="847.15"
                width="60.7"
                x="618.1"
                y="600.4"
              />
              <path
                className="cls-1"
                d="M950.7,678.9H841.1a20,20,0,0,1,0-40H950.7a20,20,0,0,1,0,40Z"
              />
              <path
                className="cls-1"
                d="M950.7,780.2H841.1a20,20,0,0,1,0-40H950.7a20,20,0,0,1,0,40Z"
              />
              <path
                className="cls-1"
                d="M950.7,881.4H841.1a20,20,0,0,1,0-40H950.7a20,20,0,0,1,0,40Z"
              />
              <path
                className="cls-1"
                d="M931.9,1488.6h-72a20,20,0,0,1,0-40h72a20,20,0,1,1,0,40Z"
              />
              <path
                className="cls-10"
                d="M1110.3,1401.7a20.1,20.1,0,0,1-20-20V552.3a20,20,0,0,1,40,0v829.4A20,20,0,0,1,1110.3,1401.7Z"
              />
              <path
                className="cls-10"
                d="M1219.6,1401.7a20,20,0,0,1-20-20V552.3a20,20,0,0,1,40,0v829.4A20.1,20.1,0,0,1,1219.6,1401.7Z"
              />
              <polygon
                className="cls-1"
                points="1786.1 1382.3 1786.1 1382.3 1517 1430 1524 1469.4 1793.1 1421.7 1786.1 1382.3"
              />
              <rect
                className="cls-1"
                height="40"
                transform="translate(-72.6 269.8) rotate(-10)"
                width="273.3"
                x="1363"
                y="528.3"
              />
              <polygon
                className="cls-1"
                points="1682.1 794.6 1682.1 794.6 1675.1 755.3 1675.1 755.3 1406 802.9 1406 802.9 1413 842.3 1413 842.3 1682.1 794.6"
              />
              <polygon
                className="cls-1"
                points="1748.8 1171.2 1741.8 1131.8 1472.6 1179.5 1479.6 1218.9 1479.6 1218.9 1748.8 1171.2"
              />
              <path
                className="cls-11"
                d="M447.3,1319.3V340.7h85.4V1593.2H237.1v-63.7h0C353.2,1529.5,447.3,1435.4,447.3,1319.3Z"
              />
              <path
                className="cls-11"
                d="M1611,393l-68.5,12.2L1701.2,1302c18.8,106-51.9,207.2-158,225.9l-8.6,1.6,9.1,51.6,269.2-47.6Z"
              />
              <rect
                className="cls-12"
                height="524.76"
                rx="32.4"
                ry="32.4"
                width="64.8"
                x="237.1"
                y="720.7"
              />
              <g className="cls-13">
                <rect
                  className="cls-14"
                  height="584.09"
                  rx="36.1"
                  ry="36.1"
                  transform="translate(-143.8 271.3) rotate(-10)"
                  width="72.2"
                  x="1436.6"
                  y="662.2"
                />
                <path
                  className="cls-15"
                  d="M1517.2,1242.9a36.6,36.6,0,0,1-36-30.3L1392,708.5a36.6,36.6,0,0,1,29.6-42.4,36.7,36.7,0,0,1,42.5,29.7l89.2,504.1a36.6,36.6,0,0,1-29.6,42.4v0A35.7,35.7,0,0,1,1517.2,1242.9Z"
                />
              </g>
              <rect
                className="cls-12"
                height="133.95"
                rx="32.4"
                ry="32.4"
                width="64.8"
                x="237.1"
                y="370.8"
              />
              <rect
                className="cls-16"
                height="586.49"
                rx="24.3"
                ry="24.3"
                width="48.6"
                x="532.7"
                y="446.9"
              />
              <rect
                className="cls-17"
                height="331.71"
                rx="23.2"
                ry="23.2"
                width="46.5"
                x="774.6"
                y="947.6"
              />
              <rect
                className="cls-17"
                height="57.13"
                rx="19.2"
                ry="19.2"
                width="121.3"
                x="774.6"
                y="503.8"
              />
              <rect
                className="cls-18"
                height="755.16"
                rx="19.4"
                ry="19.4"
                width="38.9"
                x="1017.2"
                y="503.8"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notes */}
        <Link
          to="/notes"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-transform transform hover:scale-105"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Notes
            </h2>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-custom"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Create, edit and organize your notes with AI assistance.
          </p>
          <div className="mt-4 flex justify-end">
            <span className="text-custom text-sm font-medium">
              View Notes &rarr;
            </span>
          </div>
        </Link>

        {/* Flashcards */}
        <Link
          to="/flashcards"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-transform transform hover:scale-105"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Flashcards
            </h2>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-custom"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Create and study flashcards with spaced repetition.
          </p>
          <div className="mt-4 flex justify-end">
            <span className="text-custom text-sm font-medium">
              View Flashcards &rarr;
            </span>
          </div>
        </Link>

        {/* Tasks */}
        <Link
          to="/tasks"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-transform transform hover:scale-105"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tasks & To-Do
            </h2>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-custom"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Manage your study schedule and track your progress.
          </p>
          <div className="mt-4 flex justify-end">
            <span className="text-custom text-sm font-medium">
              View Tasks &rarr;
            </span>
          </div>
        </Link>

        {/* Take Notes */}
        <Link
          to="/paint"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-transform transform hover:scale-105"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Take Notes
            </h2>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-custom"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Draw diagrams, create sketches, and take handwritten notes.
          </p>
          <div className="mt-4 flex justify-end">
            <span className="text-custom text-sm font-medium">
              Open Canvas &rarr;
            </span>
          </div>
        </Link>

        {/* AI Chatbot */}
        <Link
          to="/chatbot"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-transform transform hover:scale-105"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Chatbot
            </h2>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-custom"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Chat with an AI assistant to help with your studies and questions.
          </p>
          <div className="mt-4 flex justify-end">
            <span className="text-custom text-sm font-medium">
              Start Chatting &rarr;
            </span>
          </div>
        </Link>

        {/* Feedback Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-transform transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Give Feedback
            </h2>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-custom"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Share your thoughts and help us improve the platform for everyone.
          </p>
          <div className="mt-4">
            <button 
              onClick={() => document.getElementById('feedback-section').scrollIntoView({ behavior: 'smooth' })}
              className="text-custom text-sm font-medium hover:underline flex items-center justify-end w-full"
            >
              <span>Submit Feedback &rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            My Analytics
          </h2>
          <div className="text-sm text-gray-500">
            <span className="font-medium text-green-600">Today:</span>{" "}
            {todayStudyTime} minutes studied
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Total Study Time
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatStudyTime(studyTime)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Lifetime tracked study time
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Streak
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {streak} {streak === 1 ? 'day' : 'days'}
            </p>
            <p className="text-sm text-gray-500 mt-2">Consecutive study days</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Longest Streak
            </h3>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
            </p>
            <p className="text-sm text-gray-500 mt-2">Best study consistency</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tasks Completed
            </h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {taskStats.completed}/{taskStats.total}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {taskStats.rate}% completion rate
            </p>
          </div>
        </div>

        {/* Daily Study Chart */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
            Daily Study Time (Last 30 Days)
          </h3>
          <div className="w-full h-64 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            {dailyStudyTime.length > 0 ? (
              <div className="relative h-48 w-full">
                {/* Line Graph */}
                <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
                  {/* Y-axis grid lines */}
                  <line x1="40" y1="0" x2="40" y2="180" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="40" y1="0" x2="700" y2="0" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="40" y1="36" x2="700" y2="36" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                  <line x1="40" y1="72" x2="700" y2="72" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                  <line x1="40" y1="108" x2="700" y2="108" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                  <line x1="40" y1="144" x2="700" y2="144" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                  <line x1="40" y1="180" x2="700" y2="180" stroke="#e5e7eb" strokeWidth="1" />
                  
                  {/* Y-axis labels */}
                  <text x="30" y="5" textAnchor="end" fontSize="10" fill="#6b7280">480m</text>
                  <text x="30" y="40" textAnchor="end" fontSize="10" fill="#6b7280">384m</text>
                  <text x="30" y="76" textAnchor="end" fontSize="10" fill="#6b7280">288m</text>
                  <text x="30" y="112" textAnchor="end" fontSize="10" fill="#6b7280">192m</text>
                  <text x="30" y="148" textAnchor="end" fontSize="10" fill="#6b7280">96m</text>
                  <text x="30" y="185" textAnchor="end" fontSize="10" fill="#6b7280">0m</text>
                  
                  {/* Line area gradient */}
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area beneath the line */}
                  <polygon
                    points={`40,180 ${dailyStudyTime.map((day, index) => {
                      const xPos = 40 + ((700 - 40) / (dailyStudyTime.length - 1 || 1)) * index;
                      const yPos = 180 - (day.minutes / 480) * 180;
                      return `${xPos},${yPos}`;
                    }).join(' ')} ${40 + ((700 - 40) / (dailyStudyTime.length - 1 || 1)) * (dailyStudyTime.length - 1)},180`}
                    fill="url(#areaGradient)"
                  />
                  
                  {/* Line for the study minutes */}
                  <polyline
                    points={dailyStudyTime.map((day, index) => {
                      const xPos = 40 + ((700 - 40) / (dailyStudyTime.length - 1 || 1)) * index;
                      const yPos = 180 - (day.minutes / 480) * 180;
                      return `${xPos},${yPos}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="2"
                  />
                  
                  {/* Data points with tooltips */}
                  {dailyStudyTime.map((day, index) => {
                    const xPos = 40 + ((700 - 40) / (dailyStudyTime.length - 1 || 1)) * index;
                    const yPos = 180 - (day.minutes / 480) * 180;
                    return (
                      <g key={index} className="chart-point-group">
                        {/* Only show data points for days with activity */}
                        {day.minutes > 0 && (
                          <circle 
                            cx={xPos} 
                            cy={yPos} 
                            r="4" 
                            fill="#818cf8" 
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            className="chart-point"
                          />
                        )}
                        
                        {/* Data value tooltip */}
                        <g className="chart-tooltip" style={{ opacity: 0 }}>
                          <rect
                            x={xPos - 20}
                            y={yPos - 30}
                            width="40"
                            height="20"
                            rx="4"
                            fill="#4f46e5"
                          />
                          <text
                            x={xPos}
                            y={yPos - 16}
                            textAnchor="middle"
                            fontSize="10"
                            fill="white"
                            fontWeight="bold"
                          >
                            {day.minutes}m
                          </text>
                        </g>
                        
                        {/* Interactive overlay (larger than the point for easier interaction) */}
                        <circle 
                          cx={xPos} 
                          cy={yPos} 
                          r="10" 
                          fill="transparent"
                          onMouseOver={(e) => {
                            const tooltip = e.target.parentNode.querySelector('.chart-tooltip');
                            if (tooltip) tooltip.style.opacity = 1;
                          }}
                          onMouseOut={(e) => {
                            const tooltip = e.target.parentNode.querySelector('.chart-tooltip');
                            if (tooltip) tooltip.style.opacity = 0;
                          }}
                        />
                        
                        {/* Only show date labels for every 5 days to prevent crowding */}
                        {(index % 5 === 0 || index === dailyStudyTime.length - 1) && (
                          <text 
                            x={xPos} 
                            y="195" 
                            textAnchor="middle" 
                            fontSize="10" 
                            fill="#6b7280"
                          >
                            {formatDate(day.date)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
                
                {/* Graph legend */}
                <div className="absolute top-0 right-0 bg-white dark:bg-gray-600 rounded p-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-indigo-400 mr-1"></div>
                    <span className="text-gray-600 dark:text-gray-300">Minutes studied</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No study data available yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
          <button className="text-sm text-custom hover:text-custom-dark font-medium">
            View All
          </button>
        </div>
        <div className="space-y-4">
          {tasks && tasks.length > 0 ? (
            tasks.slice(0, 3)?.map?.((task, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md"
              >
                <div className="flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-custom"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.status === "completed" ? "Completed task: " : "Added task: "}
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2> */}
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
        
        {/* Feedback component */}
        <div id="feedback-section" className="md:col-span-2">
          <FeedbackForm />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
