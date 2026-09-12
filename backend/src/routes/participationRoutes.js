const express = require('express');
const { joinGiveaway, getMyStatus, getMyParticipations } = require('../controllers/participationController');
const authMiddleware = require('../middleware/authMiddleware');
const fraudMiddleware = require('../middleware/fraudMiddleware');
const { joinRateLimiter, apiRateLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

// Get all participations for the user
router.get('/my-participations', apiRateLimiter, authMiddleware, getMyParticipations);

// Get status uses standard limit
router.get('/:id/my-status', apiRateLimiter, authMiddleware, getMyStatus);

// Join uses strict limit, auth, and fraud checks
router.post('/:id/join', joinRateLimiter, authMiddleware, fraudMiddleware, joinGiveaway);

module.exports = router;
