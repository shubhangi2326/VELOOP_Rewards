const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
  giveawayId: { type: String, required: true },
  prizeId: { type: String, required: true },
  userId: { type: String, required: true },
  maskedUserId: { type: String, required: true }, // E.g., VE****42
  selectionMethod: { type: String, default: 'random' },
  status: { type: String, enum: ['pending_claim', 'claimed', 'expired'], default: 'pending_claim' }
}, { timestamps: true });

// Prevent duplicate winners for the same user per prize
winnerSchema.index({ giveawayId: 1, prizeId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('GiveawayWinner', winnerSchema);
