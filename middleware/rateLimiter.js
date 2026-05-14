const rateLimit = require("express-rate-limit");

// General API limiter (all routes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: {
    msg: "Too many requests from this IP, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for login/register (prevents brute force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts
  message: {
    msg: "Too many login attempts, please try again after 15 minutes"
  },
});

module.exports = { apiLimiter, authLimiter };