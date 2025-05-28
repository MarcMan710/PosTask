const rateLimit = require('express-rate-limit');
const { AppError } = require('../utils/errorHandler');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
  handler: (req, res, next, options) => {
    throw new AppError(options.message, 429);
  }
});

// Specific limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again after an hour',
  handler: (req, res, next, options) => {
    throw new AppError(options.message, 429);
  }
});

module.exports = {
  limiter,
  authLimiter
}; 