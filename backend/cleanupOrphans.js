const mongoose = require('mongoose');
require('dotenv').config();

const Giveaway = require('./src/models/Giveaway');
const GiveawayWinner = require('./src/models/GiveawayWinner');
const GiveawayParticipation = require('./src/models/GiveawayParticipation');
const GiveawayEntryTransaction = require('./src/models/GiveawayEntryTransaction');
const AuditLog = require('./src/models/AuditLog');
const PrizeClaim = require('./src/models/PrizeClaim');
const FraudEvent = require('./src/models/FraudEvent');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const filter = { giveawayId: { $regex: /^e2e-test-gw-/ } };

    const w = await GiveawayWinner.deleteMany(filter);
    const p = await GiveawayParticipation.deleteMany(filter);
    const t = await GiveawayEntryTransaction.deleteMany(filter);
    const c = await PrizeClaim.deleteMany(filter);
    
    // For AuditLog and FraudEvent, it might be in details.giveawayId
    const a = await AuditLog.deleteMany({ 'details.giveawayId': { $regex: /^e2e-test-gw-/ } });
    const f = await FraudEvent.deleteMany({ giveawayId: { $regex: /^e2e-test-gw-/ } });
    
    const g = await Giveaway.deleteMany({ id: { $regex: /^e2e-test-gw-/ } });

    console.log('Deleted orphaned E2E records:', {
      winners: w.deletedCount,
      participations: p.deletedCount,
      transactions: t.deletedCount,
      claims: c.deletedCount,
      auditLogs: a.deletedCount,
      fraudEvents: f.deletedCount,
      giveaways: g.deletedCount
    });

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

cleanup();
