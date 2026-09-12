require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Giveaway = require('./src/models/Giveaway');
const { finalizeGiveawayService } = require('./src/services/giveawayService');

async function testActions() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Let's finalize a giveaway to trigger the log
  try {
    const activeGW = await Giveaway.findOne({ status: 'ended' });
    if (activeGW) {
      console.log('Finalizing:', activeGW.id);
      const res = await finalizeGiveawayService(activeGW.id, { triggeredBy: 'TEST_SCRIPT', ipAddress: '127.0.0.1' });
      console.log(res);
    } else {
      console.log('No ended giveaways to finalize.');
    }
  } catch(e) {
    console.error(e.message);
  }

  process.exit(0);
}

testActions().catch(console.error);
