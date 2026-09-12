const Giveaway = require('../models/Giveaway');

// Get current active or upcoming giveaways
const getCurrentGiveaways = async (req, res, next) => {
  try {
    const giveaways = await Giveaway.find({ status: { $in: ['active', 'upcoming'] } }).sort({ endDate: 1 });
    res.json(giveaways);
  } catch (error) {
    next(error);
  }
};

// Get a specific giveaway by ID (could be custom slug or mongo ID)
const getGiveawayById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const giveaway = await Giveaway.findOne({ id });
    
    if (!giveaway) {
      return res.status(404).json({ error: 'GIVEAWAY_NOT_FOUND', message: 'The requested giveaway could not be found.' });
    }
    
    res.json(giveaway);
  } catch (error) {
    next(error);
  }
};

// Get previous completed giveaways
const getPreviousGiveaways = async (req, res, next) => {
  try {
    const giveaways = await Giveaway.find({ status: { $in: ['ended', 'archived'] } }).sort({ endDate: -1 });
    res.json(giveaways);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentGiveaways,
  getGiveawayById,
  getPreviousGiveaways
};
