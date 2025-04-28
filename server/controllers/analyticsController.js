const asyncHandler = require('express-async-handler');
const StudyAnalytics = require('../models/studyAnalyticsModel');

// @desc    Get user analytics
// @route   GET /api/analytics
// @access  Private
const getUserAnalytics = asyncHandler(async (req, res) => {
  // Find analytics for the user
  let analytics = await StudyAnalytics.findOne({ user: req.user.id });
  
  // If no analytics exist for this user, create a new record
  if (!analytics) {
    analytics = await StudyAnalytics.create({
      user: req.user.id,
      totalStudyTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      studyHistory: []
    });
  }
  
  res.status(200).json(analytics);
});

// @desc    Update user analytics
// @route   PUT /api/analytics/study-time
// @access  Private
const updateStudyTime = asyncHandler(async (req, res) => {
  const { minutes, date } = req.body;
  
  if (!minutes || !date) {
    res.status(400);
    throw new Error('Please provide minutes and date');
  }
  
  // Find analytics for the user
  let analytics = await StudyAnalytics.findOne({ user: req.user.id });
  
  // If no analytics exist for this user, create a new record
  if (!analytics) {
    analytics = await StudyAnalytics.create({
      user: req.user.id,
      totalStudyTime: minutes * 60, // Convert to seconds
      currentStreak: 1, // Starting with 1 for today
      longestStreak: 1,
      studyHistory: [{ date, minutes }]
    });
    
    return res.status(201).json(analytics);
  }
  
  // Update the total study time
  analytics.totalStudyTime += minutes * 60; // Convert to seconds
  
  // Find if there's an entry for this date
  const dayIndex = analytics.studyHistory.findIndex(day => day.date === date);
  
  if (dayIndex >= 0) {
    // Update existing entry
    analytics.studyHistory[dayIndex].minutes += minutes;
  } else {
    // Add new entry
    analytics.studyHistory.push({ date, minutes });
  }
  
  // Calculate streak
  calculateStreak(analytics);
  
  // Update last updated timestamp
  analytics.lastUpdated = Date.now();
  
  // Save and return the updated analytics
  await analytics.save();
  
  res.status(200).json(analytics);
});

// Helper function to calculate streak
const calculateStreak = (analytics) => {
  if (!analytics.studyHistory || analytics.studyHistory.length === 0) {
    analytics.currentStreak = 0;
    return;
  }
  
  // Sort history by date (newest first)
  const sortedHistory = [...analytics.studyHistory].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
  
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // Check if studied today or yesterday to maintain streak
  const hasStudiedToday = sortedHistory.some(item => item.date === today);
  const hasStudiedYesterday = sortedHistory.some(item => item.date === yesterday);
  
  if (!hasStudiedToday && !hasStudiedYesterday) {
    analytics.currentStreak = 0;
    return;
  }
  
  // Calculate consecutive days
  let previousDate = hasStudiedToday ? today : yesterday;
  currentStreak = 1; // Start with 1 for today/yesterday
  
  for (let i = 0; i < sortedHistory.length; i++) {
    const currentDate = sortedHistory[i].date;
    
    // Skip if we already counted today/yesterday
    if ((hasStudiedToday && currentDate === today) || 
        (!hasStudiedToday && currentDate === yesterday)) {
      continue;
    }
    
    // Calculate the difference in days
    const prevDay = new Date(previousDate);
    const currDay = new Date(currentDate);
    const diffTime = prevDay.getTime() - currDay.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If the difference is exactly 1 day, it's consecutive
    if (diffDays === 1) {
      currentStreak++;
      previousDate = currentDate;
    } else {
      break; // Break the streak
    }
  }
  
  analytics.currentStreak = currentStreak;
  
  // Update longest streak if current streak is longer
  if (currentStreak > analytics.longestStreak) {
    analytics.longestStreak = currentStreak;
  }
};

module.exports = {
  getUserAnalytics,
  updateStudyTime
}; 