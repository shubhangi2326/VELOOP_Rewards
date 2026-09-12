const { finalizeGiveawayService } = require('../services/giveawayService');

const finalizeGiveaway = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await finalizeGiveawayService(id, {
      triggeredBy: req.user ? req.user.id : 'ADMIN_API',
      ipAddress: req.ip || req.connection.remoteAddress
    });
    res.json(result);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: 'GIVEAWAY_NOT_FOUND', message: error.message });
    }
    if (error.message.includes('not ended')) {
      return res.status(400).json({ error: 'NOT_ENDED', message: error.message });
    }
    next(error);
  }
};

module.exports = {
  finalizeGiveaway
};
