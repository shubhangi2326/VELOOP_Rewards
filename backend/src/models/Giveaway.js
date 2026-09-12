const mongoose = require('mongoose');

const prizeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  position: { type: Number, required: true },
  type: { type: String, enum: ['physical', 'gift_card', 'digital'], required: true },
  winnerCount: { type: Number, required: true },
  entryFee: { type: Number, required: true },
  entryCurrency: { type: String, enum: ['VEs', 'SVEs', 'Tokens'], required: true },
  image: { type: String } // URL or path
});

const giveawaySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['upcoming', 'active', 'ended', 'archived'], default: 'upcoming' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  prizes: [prizeSchema],
  participantsCount: { type: Number, default: 0 },
  eligibility: { type: String },
  rules: [{ type: String }],
  termsAndConditions: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Giveaway', giveawaySchema);
