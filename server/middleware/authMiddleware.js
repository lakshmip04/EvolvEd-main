const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.error("User not found for ID:", decoded.id);
        res.status(401);
        throw new Error("User not found");
      }

      console.log("Authenticated user:", req.user._id, req.user.email);

      next();
    } catch (error) {
      console.error("Auth error:", error);
      res.status(401);
      throw new Error("Not authorized: " + error.message);
    }
  } else if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };
