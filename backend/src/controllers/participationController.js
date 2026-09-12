const mongoose = require('mongoose');
const Giveaway = require('../models/Giveaway');
const GiveawayParticipation = require('../models/GiveawayParticipation');
const GiveawayEntryTransaction = require('../models/GiveawayEntryTransaction');
const IdempotencyKey = require('../models/IdempotencyKey');

// Note: For this mock, we assume the user balance is attached to req.user (e.g., from authMiddleware fetching it)
// If not, in a real scenario we fetch it from the Wallet/User service.

const joinGiveaway = async (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) {
    return res.status(400).json({ error: 'MISSING_IDEMPOTENCY_KEY', message: 'Idempotency key is required.' });
  }
  const userId = req.user.id;
  const requestPath = req.originalUrl;

  // Cross-user isolation: reject if this key was already issued by a different user
  const keyOwnerRecord = await IdempotencyKey.findOne({ key: idempotencyKey });
  if (keyOwnerRecord && keyOwnerRecord.userId.toString() !== userId.toString()) {
    return res.status(403).json({
      error: 'IDEMPOTENCY_KEY_OWNED_BY_ANOTHER_USER',
      message: 'This idempotency key belongs to another user and cannot be reused.'
    });
  }

  let idemRecord = await IdempotencyKey.findOne({ key: idempotencyKey, userId });
  if (idemRecord) {
    if (idemRecord.status === 'COMPLETED') {
      return res.status(idemRecord.responseCode || 200).json(idemRecord.responseBody);
    }
    if (idemRecord.status === 'IN_PROGRESS') {
      return res.status(409).json({ error: 'CONCURRENT_REQUEST', message: 'This request is currently being processed.' });
    }
    if (idemRecord.status === 'FAILED') {
      const locked = await IdempotencyKey.findOneAndUpdate(
        { _id: idemRecord._id, status: 'FAILED' },
        { $set: { status: 'IN_PROGRESS', requestPath } },
        { new: true }
      );
      if (!locked) {
        return res.status(409).json({ error: 'CONCURRENT_REQUEST', message: 'This request is currently being processed.' });
      }
    }
  } else {
    try {
      await IdempotencyKey.create({
        key: idempotencyKey,
        userId,
        requestPath,
        status: 'IN_PROGRESS'
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: 'CONCURRENT_REQUEST', message: 'This request is currently being processed.' });
      }
      return next(err);
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  
  const AuditLog = require('../models/AuditLog');

  try {
    const { id } = req.params; // giveawayId
    const { prizeId } = req.body;
    const deviceHash = req.body.deviceHash || 'unknown';

    // 1. Load Giveaway and verify status/time
    const giveaway = await Giveaway.findOne({ id }).session(session);
    if (!giveaway) {
      throw { status: 404, error: 'GIVEAWAY_NOT_FOUND', message: 'Giveaway not found.' };
    }
    if (giveaway.status !== 'active') {
      throw { status: 400, error: 'GIVEAWAY_NOT_ACTIVE', message: 'This giveaway is not currently active.' };
    }
    const now = new Date();
    if (now < giveaway.startDate || now > giveaway.endDate) {
      throw { status: 400, error: 'GIVEAWAY_ENDED', message: 'This giveaway has ended.' };
    }

    // 2. Load Prize
    const prize = giveaway.prizes.find(p => p.id === prizeId);
    if (!prize) {
      throw { status: 404, error: 'PRIZE_NOT_FOUND', message: 'The requested prize was not found in this giveaway.' };
    }

    const { entryFee, entryCurrency } = prize;

    // 3. Verify User Balance
    const User = require('../models/User');
    const userDoc = await User.findById(userId).session(session);
    if (!userDoc) {
      throw { status: 404, error: 'USER_NOT_FOUND', message: 'User not found.' };
    }

    let userBalance = userDoc.balances ? userDoc.balances[entryCurrency] : 0;

    if (userBalance < entryFee) {
      throw { status: 400, error: `INSUFFICIENT_${entryCurrency}_BALANCE`, message: `Not enough ${entryCurrency}. You need ${entryFee - userBalance} more to join.` };
    }

    // 4. Create Participation (Unique index on userId + giveawayId handles duplicates)
    // Will throw MongoServerError 11000 if duplicate, caught by catch block
    const participation = new GiveawayParticipation({
      userId,
      giveawayId: id,
      prizeId,
      entryCurrency,
      entryAmount: entryFee,
      deviceHash
    });
    await participation.save({ session });

    // 5. Deduct Balance and Create Transaction Atomically
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, [`balances.${entryCurrency}`]: { $gte: entryFee } },
      { $inc: { [`balances.${entryCurrency}`]: -entryFee } },
      { new: true, session }
    );
    
    if (!updatedUser) {
       throw { status: 400, error: `INSUFFICIENT_${entryCurrency}_BALANCE`, message: `Not enough ${entryCurrency}.` };
    }
    
    const newBalance = updatedUser.balances[entryCurrency];

    const transaction = new GiveawayEntryTransaction({
      userId,
      giveawayId: id,
      prizeId,
      currency: entryCurrency,
      amount: entryFee,
      type: 'DEDUCTION',
      status: 'SUCCESS',
      balanceBefore: userBalance,
      balanceAfter: newBalance
    });
    await transaction.save({ session });

    // Increment participants count
    giveaway.participantsCount += 1;
    await giveaway.save({ session });

    // Audit logs for Join and Deduction
    const joinLog = new AuditLog({
      userId,
      action: 'JOIN_GIVEAWAY',
      details: { giveawayId: id, prizeId, deviceHash },
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown-ip'
    });
    await joinLog.save({ session });

    const deductionLog = new AuditLog({
      userId,
      action: 'ENTRY_FEE_DEDUCTED',
      details: {
        giveawayId: id,
        transactionId: transaction._id,
        currency: entryCurrency,
        amount: entryFee
      },
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown-ip'
    });
    await deductionLog.save({ session });

    await session.commitTransaction();
    session.endSession();

    const responsePayload = {
      success: true,
      message: 'Successfully joined giveaway.',
      participationId: participation._id,
      newBalance
    };

    // Safely mark as COMPLETED outside the transaction
    await IdempotencyKey.findOneAndUpdate(
      { key: idempotencyKey, userId },
      { $set: { status: 'COMPLETED', responseCode: 200, responseBody: responsePayload } }
    ).catch(() => {}); // Ignore error, transaction is already committed

    return res.json(responsePayload);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    // Mark as FAILED so it can be retried safely
    await IdempotencyKey.findOneAndUpdate(
      { key: idempotencyKey, userId },
      { $set: { status: 'FAILED' } }
    ).catch(() => {}); // Ignore error during failure marking

    // Log specific failed flows before returning
    if (error.code === 11000) {
      await AuditLog.create({
        userId: req.user.id,
        action: 'DUPLICATE_ATTEMPT',
        details: { giveawayId: req.params.id, prizeId: req.body.prizeId },
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown-ip'
      });
      return next(error);
    }
    
    if (error.status) {
      await AuditLog.create({
        userId: req.user.id,
        action: 'JOIN_REJECTED',
        details: { 
          giveawayId: req.params.id, 
          error: error.error, 
          message: error.message 
        },
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown-ip'
      });
      return res.status(error.status).json({ error: error.error, message: error.message });
    }
    
    return next(error);
  }
};

const getMyStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const participation = await GiveawayParticipation.findOne({ userId, giveawayId: id });
    
    res.json({
      isParticipating: !!participation,
      participation: participation || null
    });
  } catch (error) {
    next(error);
  }
};

const getMyParticipations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Fetch user's participations
    const participations = await GiveawayParticipation.find({ userId }).sort({ createdAt: -1 }).lean();
    
    if (!participations.length) {
      return res.json([]);
    }
    
    // Fetch corresponding giveaways
    const giveawayIds = [...new Set(participations.map(p => p.giveawayId))];
    const giveaways = await Giveaway.find({ id: { $in: giveawayIds } }).lean();
    
    // Fetch winner records for this user
    const GiveawayWinner = require('../models/GiveawayWinner');
    const winners = await GiveawayWinner.find({ userId, giveawayId: { $in: giveawayIds } }).lean();
    
    // Map data, keeping orphaned participations so users retain their history (handled gracefully by frontend UI)
    const result = participations.map(p => {
      const giveaway = giveaways.find(g => g.id === p.giveawayId) || {};
      const prize = (giveaway.prizes || []).find(pz => pz.id === p.prizeId) || {};
      const winnerRecord = winners.find(w => w.giveawayId === p.giveawayId && w.prizeId === p.prizeId);
      
      return {
        ...p,
        giveawayName: giveaway.title || 'Unknown Giveaway',
        prizeName: prize.name || 'Unknown Prize',
        prizeType: prize.type || 'digital',
        giveawayStatus: giveaway.status || 'unknown',
        isWinner: !!winnerRecord,
        winnerStatus: winnerRecord ? winnerRecord.status : null
      };
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  joinGiveaway,
  getMyStatus,
  getMyParticipations
};
