const mongoose = require('mongoose');
const Giveaway = require('../models/Giveaway');
const GiveawayParticipation = require('../models/GiveawayParticipation');
const GiveawayWinner = require('../models/GiveawayWinner');

/**
 * Safely finalize a giveaway, picking winners and updating status to archived.
 * Can be called by Admin API or Cron Jobs safely.
 */
const finalizeGiveawayService = async (giveawayId, options = {}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const giveaway = await Giveaway.findOne({ id: giveawayId }).session(session);
    if (!giveaway) {
      throw new Error(`Giveaway ${giveawayId} not found.`);
    }

    if (giveaway.status === 'archived') {
      // Already finalized safely, just return early for idempotency
      await session.abortTransaction();
      session.endSession();
      return { success: true, message: 'Already finalized', winnersSelected: 0 };
    }

    // Check if end date is reached
    const now = new Date();
    if (giveaway.endDate > now && giveaway.status !== 'ended') {
      throw new Error(`Giveaway ${giveawayId} has not ended yet.`);
    }

    const newWinners = [];

    for (const prize of giveaway.prizes) {
      // Find all participations for this prize in this giveaway
      const participations = await GiveawayParticipation.find({
        giveawayId: giveawayId,
        prizeId: prize.id,
        status: 'active'
      }).session(session);

      if (participations.length > 0) {
        // Shuffle participations (Fisher-Yates)
        for (let i = participations.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [participations[i], participations[j]] = [participations[j], participations[i]];
        }

        // Pick winners up to winnerCount
        const winnersCount = Math.min(prize.winnerCount, participations.length);
        const selectedWinners = participations.slice(0, winnersCount);

        for (const winner of selectedWinners) {
          const userIdStr = winner.userId.toString();
          const maskedUserId = `VE****${userIdStr.slice(-2)}`;

          const winnerRecord = new GiveawayWinner({
            giveawayId: giveawayId,
            prizeId: prize.id,
            userId: winner.userId,
            maskedUserId,
            selectionMethod: 'random',
            status: 'pending_claim'
          });
          
          await winnerRecord.save({ session });
          newWinners.push(winnerRecord);
        }
      }
    }

    // Mark giveaway as archived
    giveaway.status = 'archived';
    await giveaway.save({ session });

    const AuditLog = require('../models/AuditLog');
    const auditLog = new AuditLog({
      userId: options.triggeredBy || 'SYSTEM_CRON',
      action: 'GIVEAWAY_FINALIZED',
      details: {
        giveawayId: giveawayId,
        winnersSelected: newWinners.length,
        prizeWinners: newWinners.map(w => ({ prizeId: w.prizeId, userId: w.userId }))
      },
      ipAddress: options.ipAddress || '127.0.0.1'
    });
    await auditLog.save({ session });

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      message: 'Giveaway finalized and winners selected successfully.',
      winnersSelected: newWinners.length,
      winners: newWinners
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  finalizeGiveawayService
};
