const GiveawayWinner = require('../models/GiveawayWinner');

// Get previous winners across all ended giveaways
exports.getPreviousWinners = async (req, res, next) => {
  try {
    const winners = await GiveawayWinner.aggregate([
      {
        $lookup: {
          from: 'giveaways',
          localField: 'giveawayId',
          foreignField: 'id',
          as: 'giveaway'
        }
      },
      {
        $match: { 'giveaway.0': { $exists: true } }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 50
      },
      {
        $project: {
          giveaway: 0 // Remove the joined giveaway array to keep response identical to before
        }
      }
    ]);
    res.json(winners);
  } catch (error) {
    next(error);
  }
};

// Get winners for a specific giveaway
exports.getGiveawayWinners = async (req, res, next) => {
  try {
    const winners = await GiveawayWinner.find({ giveawayId: req.params.id });
    res.json(winners);
  } catch (error) {
    next(error);
  }
};
