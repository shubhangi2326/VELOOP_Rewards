const mongoose = require('mongoose');

const fraudEventSchema = new mongoose.Schema({
  userId: { type: String },
  giveawayId: { type: String },
  deviceHash: { type: String },
  riskScore: { type: Number },
  reason: { type: String, required: true },
  action: { type: String, enum: ['FLAGGED', 'BLOCKED', 'IGNORED'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('FraudEvent', fraudEventSchema);
