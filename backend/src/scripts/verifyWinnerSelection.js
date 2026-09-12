const mongoose = require('mongoose');
const User = require('../models/User');
const Giveaway = require('../models/Giveaway');
const GiveawayParticipation = require('../models/GiveawayParticipation');
const GiveawayWinner = require('../models/GiveawayWinner');

async function verify() {
  await mongoose.connect('mongodb://localhost:27017/veloop_giveaway_mock');
  console.log('Connected to DB');

  // 1. Create an admin user and a normal user
  await User.deleteMany({ email: { $in: ['admin@test.com', 'user@test.com'] } });
  
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin'
  });
  
  const normalUser = await User.create({
    name: 'Normal User',
    email: 'user@test.com',
    password: 'password123',
    balances: { VEs: 1000, SVEs: 1000, Tokens: 1000 }
  });

  // 2. Fetch the ended giveaway (from seed data GW-2026-07)
  const endedGiveaway = await Giveaway.findOne({ id: 'GW-2026-07' });
  if (endedGiveaway) {
    // 3. Create mock participations for this giveaway
    await GiveawayParticipation.deleteMany({ giveawayId: 'GW-2026-07' });
    await GiveawayParticipation.create({
      userId: normalUser._id,
      giveawayId: 'GW-2026-07',
      prizeId: 'PRIZE-005',
      entryCurrency: 'VEs',
      entryAmount: 1000,
      status: 'active'
    });
    console.log('Created mock participation for ended giveaway.');

    // 4. Test finalize API via direct controller logic
    const { finalizeGiveaway } = require('../controllers/adminController');
    const req = { params: { id: 'GW-2026-07' }, user: { id: admin._id } };
    const res = { 
      json: (data) => console.log('Finalize Success:', data),
      status: (code) => ({ json: (err) => console.log('Finalize Error:', code, err) })
    };
    
    // Simulate finalizing
    console.log('Finalizing Giveaway...');
    await finalizeGiveaway(req, res, (err) => console.log('Finalize Next Error:', err));
    
    // Check if winner was recorded
    const winners = await GiveawayWinner.find({ giveawayId: 'GW-2026-07' });
    console.log(`Winners selected: ${winners.length}`);
    if (winners.length > 0) {
      console.log(`Winner ID: ${winners[0].userId}, Masked: ${winners[0].maskedUserId}`);
    }
  }

  process.exit(0);
}

verify().catch(console.error);
