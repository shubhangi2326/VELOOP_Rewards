const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { finalizeGiveaway } = require('../controllers/adminController');

const router = express.Router();

// Apply auth and admin middleware to all routes in this file
router.use(authMiddleware);
router.use(adminMiddleware);

// Admin giveaway operations
router.post('/giveaways/:id/finalize', finalizeGiveaway);

module.exports = router;
