const GiveawayWinner = require('../models/GiveawayWinner');
const PrizeClaim = require('../models/PrizeClaim');
const Giveaway = require('../models/Giveaway');
const AuditLog = require('../models/AuditLog');

exports.submitClaim = async (req, res, next) => {
  try {
    const { id } = req.params; // giveawayId
    const userId = req.user.id;
    const claimData = req.body;

    // Verify user is actually a winner
    const winnerRecord = await GiveawayWinner.findOne({ giveawayId: id, userId });
    
    if (!winnerRecord) {
      return res.status(403).json({ error: 'NOT_A_WINNER', message: 'You have not won a prize in this giveaway.' });
    }

    if (winnerRecord.status === 'claimed') {
      return res.status(400).json({ error: 'ALREADY_CLAIMED', message: 'You have already claimed this prize.' });
    }

    if (winnerRecord.status === 'expired') {
      return res.status(400).json({ error: 'CLAIM_EXPIRED', message: 'The claim window for this prize has expired.' });
    }

    // Retrieve authoritative giveaway and prize data
    const giveaway = await Giveaway.findOne({ id });
    if (!giveaway) {
      return res.status(404).json({ error: 'GIVEAWAY_NOT_FOUND', message: 'Giveaway not found.' });
    }

    const prize = giveaway.prizes.find(p => p.id === winnerRecord.prizeId);
    if (!prize) {
      return res.status(400).json({ error: 'PRIZE_NOT_FOUND', message: 'Prize information not found.' });
    }

    const actualPrizeType = prize.type;

    // Validation based strictly on the backend-determined prize type
    if (actualPrizeType === 'physical') {
      const requiredFields = ['fullName', 'phoneNumber', 'address', 'city', 'state', 'pinCode'];
      for (let field of requiredFields) {
        if (!claimData[field]) {
          return res.status(400).json({ error: 'MISSING_FIELD', message: `${field} is required for physical prizes.` });
        }
      }
    } else if (actualPrizeType === 'gift_card' || actualPrizeType === 'digital') {
      if (!claimData.emailAddress) {
        return res.status(400).json({ error: 'MISSING_FIELD', message: 'emailAddress is required for digital prizes.' });
      }
    }

    // Create claim, ensuring we override claimType with authoritative actualPrizeType
    const claim = new PrizeClaim({
      winnerId: winnerRecord._id,
      giveawayId: id,
      prizeId: winnerRecord.prizeId,
      userId,
      claimType: actualPrizeType,
      fullName: claimData.fullName,
      phoneNumber: claimData.phoneNumber,
      address: claimData.address,
      city: claimData.city,
      state: claimData.state,
      pinCode: claimData.pinCode,
      emailAddress: claimData.emailAddress
    });
    
    await claim.save();

    // Update winner record
    winnerRecord.status = 'claimed';
    await winnerRecord.save();

    const auditLog = new AuditLog({
      userId,
      action: 'CLAIM_SUBMITTED',
      details: {
        giveawayId: id,
        prizeId: winnerRecord.prizeId,
        claimId: claim._id,
        claimType: actualPrizeType
      },
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown-ip'
    });
    await auditLog.save();

    res.json({ success: true, message: 'Prize claimed successfully.', claim });

  } catch (error) {
    next(error);
  }
};
