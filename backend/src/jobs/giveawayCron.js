const cron = require('node-cron');
const Giveaway = require('../models/Giveaway');
const { finalizeGiveawayService } = require('../services/giveawayService');

const startGiveawayCron = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    console.log('[CRON] Checking for expired giveaways...');
    try {
      const now = new Date();
      
      // Find all giveaways that are active or ended but not yet archived, and endDate has passed
      const expiredGiveaways = await Giveaway.find({
        status: { $in: ['active', 'upcoming', 'ended'] },
        endDate: { $lte: now }
      });

      if (expiredGiveaways.length === 0) {
        return;
      }

      console.log(`[CRON] Found ${expiredGiveaways.length} expired giveaways. Beginning finalization...`);

      for (const giveaway of expiredGiveaways) {
        try {
          console.log(`[CRON] Finalizing giveaway: ${giveaway.id}`);
          const result = await finalizeGiveawayService(giveaway.id);
          console.log(`[CRON] Success finalizing ${giveaway.id}: ${result.winnersSelected} winners selected.`);
        } catch (error) {
          console.error(`[CRON] Error finalizing giveaway ${giveaway.id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('[CRON] Error running giveaway cron job:', error.message);
    }
  });
  
  console.log('[CRON] Giveaway finalization cron job scheduled.');
};

module.exports = startGiveawayCron;
