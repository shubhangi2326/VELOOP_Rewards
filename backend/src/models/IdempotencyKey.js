const mongoose = require('mongoose');

const idempotencySchema = new mongoose.Schema({
  key: { type: String, required: true },
  userId: { type: String, required: true },
  requestPath: { type: String, required: true },
  status: { type: String, enum: ['IN_PROGRESS', 'COMPLETED', 'FAILED'], default: 'IN_PROGRESS' },
  responseCode: { type: Number },
  responseBody: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, index: { expires: 86400 } } // 24 hours TTL
}, { timestamps: true });

// Compound unique index to ensure key uniqueness per user
idempotencySchema.index({ key: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('IdempotencyKey', idempotencySchema);
