const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if we're using mock database mode
      if (process.env.MONGO_URI.includes('your_mongodb_username')) {
        // Provide mock user data
        req.user = {
          _id: '60d0fe4f5311236168a109ca',
          id: '60d0fe4f5311236168a109ca', // Add id property for consistency
          name: 'Test User',
          email: 'test@example.com'
        };
        console.log('Using mock user:', req.user);
        next();
        return;
      }

      // Get user from the database
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.error('User not found for ID:', decoded.id);
        res.status(401);
        throw new Error('User not found');
      }
      
      console.log('Authenticated user:', req.user._id, req.user.email);

      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401);
      throw new Error('Not authorized: ' + error.message);
    }
  } else if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

module.exports = { protect }; 