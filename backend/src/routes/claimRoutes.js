const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { joinRateLimiter } = require('../middleware/rateLimitMiddleware');
const { submitClaim } = require('../controllers/claimController');

const router = express.Router();

router.post('/:id/claim', joinRateLimiter, authMiddleware, submitClaim);

module.exports = router;
