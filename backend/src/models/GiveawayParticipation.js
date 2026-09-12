const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  giveawayId: { type: String, required: true },
  prizeId: { type: String, required: true },
  entryCurrency: { type: String, enum: ['VEs', 'SVEs', 'Tokens'], required: true },
  entryAmount: { type: Number, required: true },
  deviceHash: { type: String }, // For basic fraud prevention tracking
  status: { type: String, enum: ['active', 'completed', 'flagged'], default: 'active' },
  transactionId: { type: String }
}, { timestamps: true });

// CRITICAL REQUIREMENT: One participation per user per giveaway event
participationSchema.index({ userId: 1, giveawayId: 1 }, { unique: true });

module.exports = mongoose.model('GiveawayParticipation', participationSchema);
