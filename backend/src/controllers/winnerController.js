const GiveawayWinner = require('../models/GiveawayWinner');
const Giveaway = require('../models/Giveaway');

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
      }
    ]);

    const enriched = winners.map(w => {
      const g = w.giveaway && w.giveaway[0];
      let prizeInfo = null;
      if (g && Array.isArray(g.prizes) && g.prizes.length > 0) {
        prizeInfo = g.prizes.find(p => p.id === w.prizeId);
        if (!prizeInfo && g.prizes.length === 1) {
          prizeInfo = g.prizes[0];
        }
      }
      const { giveaway, ...rest } = w;
      return {
        ...rest,
        giveawayTitle: g?.title || null,
        prizeName: prizeInfo?.name || null,
        prizeImage: prizeInfo?.image || null
      };
    });

    res.json(enriched);
  } catch (error) {
    next(error);
  }
};

// Get winners for a specific giveaway — enriched with prize details
exports.getGiveawayWinners = async (req, res, next) => {
  try {
    const winners = await GiveawayWinner.find({ giveawayId: req.params.id }).lean();

    if (winners.length === 0) {
      return res.json([]);
    }

    // Fetch the giveaway to resolve prize details
    const giveaway = await Giveaway.findOne({ id: req.params.id }).lean();
    const prizesMap = {};
    if (giveaway && Array.isArray(giveaway.prizes)) {
      giveaway.prizes.forEach(p => {
        prizesMap[p.id] = { name: p.name, image: p.image || null };
      });
    }

    const fallbackPrize = (giveaway && Array.isArray(giveaway.prizes) && giveaway.prizes.length === 1)
      ? { name: giveaway.prizes[0].name, image: giveaway.prizes[0].image || null }
      : {};

    // Attach prize name and image to each winner record
    const enriched = winners.map(w => {
      const prizeInfo = prizesMap[w.prizeId] || fallbackPrize;
      return {
        ...w,
        prizeName: prizeInfo.name || null,
        prizeImage: prizeInfo.image || null
      };
    });

    res.json(enriched);
  } catch (error) {
    next(error);
  }
};

