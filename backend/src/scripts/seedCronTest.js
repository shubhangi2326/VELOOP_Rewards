const mongoose = require('mongoose');
const User = require('../models/User');
const Giveaway = require('../models/Giveaway');
const GiveawayParticipation = require('../models/GiveawayParticipation');

async function seedCronTest() {
  await mongoose.connect('mongodb://localhost:27017/veloop_giveaway_mock');
  console.log('Connected to DB');

  const normalUser = await User.findOne({ email: 'user@test.com' }) || await User.create({
    name: 'Normal User',
    email: 'user@test.com',
    password: 'password123',
    balances: { VEs: 1000, SVEs: 1000, Tokens: 1000 }
  });

  const expiredGiveawayId = `GW-CRON-TEST-${Date.now()}`;

  const endDate = new Date(Date.now() - 5000); // Ended 5 seconds ago

  await Giveaway.create({
    id: expiredGiveawayId,
    title: 'Cron Test Giveaway',
    description: 'Testing automatic cron finalization',
    status: 'active',
    startDate: new Date(Date.now() - 86400000), // 1 day ago
    endDate: endDate,
    participantsCount: 1,
    prizes: [
      {
        id: 'PRIZE-CRON-1',
        name: 'Cron Test Prize',
        image: '/images/mock/prize.jpg',
        description: 'Test prize',
        value: 100,
        entryFee: 10,
        entryCurrency: 'VEs',
        winnerCount: 1,
        position: 1,
        type: 'digital'
      }
    ]
  });

  await GiveawayParticipation.create({
    userId: normalUser._id,
    giveawayId: expiredGiveawayId,
    prizeId: 'PRIZE-CRON-1',
    entryCurrency: 'VEs',
    entryAmount: 10,
    status: 'active'
  });

  console.log(`Created expired giveaway ${expiredGiveawayId} and 1 participation.`);
  process.exit(0);
}

seedCronTest().catch(console.error);
