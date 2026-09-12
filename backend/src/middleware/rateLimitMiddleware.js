const rateLimit = require('express-rate-limit');

// Rate limiting to prevent rapid, successive requests to sensitive endpoints like /join
const joinRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 5, // start blocking after 5 requests
  message: {
    error: 'RATE_LIMITED',
    message: 'Too many requests from this IP, please try again after a minute.'
  }
});

// General API rate limiting
const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'RATE_LIMITED',
    message: 'Too many requests, please try again later.'
  }
});

module.exports = {
  joinRateLimiter,
  apiRateLimiter
};
