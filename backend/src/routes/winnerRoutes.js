const express = require('express');
const { getPreviousWinners, getGiveawayWinners } = require('../controllers/winnerController');

const router = express.Router();

// Get previous winners across all ended giveaways
router.get('/previous/winners', getPreviousWinners);

// Get winners for a specific giveaway
router.get('/:id/winners', getGiveawayWinners);

module.exports = router;
