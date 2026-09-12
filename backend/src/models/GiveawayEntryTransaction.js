const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  giveawayId: { type: String, required: true },
  prizeId: { type: String, required: true },
  currency: { type: String, enum: ['VEs', 'SVEs', 'Tokens'], required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['DEDUCTION', 'REVERSAL'], default: 'DEDUCTION' },
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
  balanceBefore: { type: Number },
  balanceAfter: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('GiveawayEntryTransaction', transactionSchema);
