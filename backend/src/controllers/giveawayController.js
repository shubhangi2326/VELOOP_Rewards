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

// Get global statistics
const getGiveawayStats = async (req, res, next) => {
  try {
    const GiveawayParticipation = require('../models/GiveawayParticipation');
    const GiveawayWinner = require('../models/GiveawayWinner');

    const now = new Date();

    // Total active/upcoming giveaways
    const totalGiveaways = await Giveaway.countDocuments({ status: { $ne: 'deleted' } });
    
    // Total unique participants
    const uniqueParticipants = await GiveawayParticipation.distinct('userId');
    const participants = uniqueParticipants.length;

    // Live Now: active and within date range
    const liveNowCount = await Giveaway.countDocuments({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gt: now }
    });

    // Next Ends In: nearest end date
    const nextEnding = await Giveaway.findOne({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gt: now }
    }).sort({ endDate: 1 }).select('endDate');

    const nextEndsIn = nextEnding ? nextEnding.endDate : null;

    // Prizes Won: if user is authenticated via middleware
    let prizesWon = 0;
    if (req.user && req.user.id) {
      prizesWon = await GiveawayWinner.countDocuments({ userId: req.user.id });
    }

    res.json({
      totalGiveaways,
      participants,
      prizesWon,
      liveNow: liveNowCount,
      nextEndsIn
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentGiveaways,
  getGiveawayById,
  getPreviousGiveaways,
  getGiveawayStats
};
