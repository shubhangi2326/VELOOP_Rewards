const express = require('express');
const { getCurrentGiveaways, getGiveawayById, getPreviousGiveaways } = require('../controllers/giveawayController');
const { apiRateLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.use(apiRateLimiter);

router.get('/current', getCurrentGiveaways);
router.get('/previous', getPreviousGiveaways);
router.get('/:id', getGiveawayById);

module.exports = router;
