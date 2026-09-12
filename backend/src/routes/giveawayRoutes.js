const express = require('express');
const { getCurrentGiveaways, getGiveawayById, getPreviousGiveaways, getGiveawayStats } = require('../controllers/giveawayController');
const { apiRateLimiter } = require('../middleware/rateLimitMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(apiRateLimiter);

// Optional auth wrapper: applies auth only if token is present, ignores errors to allow public access
const optionalAuth = (req, res, next) => {
  if (!req.headers.authorization) return next();
  authMiddleware(req, res, (err) => next());
};

router.get('/stats', optionalAuth, getGiveawayStats);
router.get('/current', getCurrentGiveaways);
router.get('/previous', getPreviousGiveaways);
router.get('/:id', getGiveawayById);

module.exports = router;
