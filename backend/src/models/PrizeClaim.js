const mongoose = require('mongoose');

const prizeClaimSchema = new mongoose.Schema({
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'GiveawayWinner', required: true },
  giveawayId: { type: String, required: true },
  prizeId: { type: String, required: true },
  userId: { type: String, required: true },
  claimType: { type: String, enum: ['physical', 'digital', 'gift_card'], required: true },
  
  // For physical prizes
  fullName: { type: String },
  phoneNumber: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pinCode: { type: String },
  
  // For digital/gift cards
  emailAddress: { type: String },
  
  status: { type: String, enum: ['submitted', 'processing', 'completed'], default: 'submitted' }
}, { timestamps: true });

module.exports = mongoose.model('PrizeClaim', prizeClaimSchema);
