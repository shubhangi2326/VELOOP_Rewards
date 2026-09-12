require('dotenv').config();
const mongoose = require('mongoose');
const Giveaway = require('../models/Giveaway');

const MOCK_GIVEAWAYS = [
  {
    id: "GW-ACTIVE-01",
    title: "Summer Rewards Giveaway",
    description: "Complete eligible activities, collect entries and get a chance to win exciting rewards.",
    status: "active",
    // Ends in 12 days
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
    endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    participantsCount: 8523,
    eligibility: "Open to all active VELOOP users.",
    rules: [
      "Entry Requirement is based on the prize entry fee.",
      "Winners are selected randomly using our verifiable backend system.",
      "Suspicious activity or multiple accounts from the same user will result in disqualification."
    ],
    termsAndConditions: "Winners have 7 days to claim their prize by providing necessary details.",
    prizes: [
      {
        id: "PRIZE-001",
        name: "iPhone 15 Pro",
        description: "Latest iPhone 15 Pro 256GB",
        position: 1,
        type: "physical",
        winnerCount: 1,
        entryFee: 250,
        entryCurrency: "VEs",
        image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500&q=80"
      },
      {
        id: "PRIZE-002",
        name: "Apple Watch Series 9",
        description: "Stay active with the newest Apple Watch",
        position: 2,
        type: "physical",
        winnerCount: 3,
        entryFee: 200,
        entryCurrency: "VEs",
        image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&q=80"
      }
    ]
  },
  {
    id: "GW-UPCOMING-01",
    title: "Diwali Mega Giveaway",
    description: "Our biggest giveaway of the year is almost here!",
    status: "upcoming",
    // Starts in 5 days
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    participantsCount: 0,
    eligibility: "Open to all verified users.",
    rules: ["Must have verified account."],
    termsAndConditions: "Standard terms apply.",
    prizes: [
      {
        id: "PRIZE-003",
        name: "Sony PlayStation 5",
        description: "Next-gen gaming console",
        position: 1,
        type: "physical",
        winnerCount: 2,
        entryFee: 500,
        entryCurrency: "SVEs",
        image: "https://images.unsplash.com/photo-1606813907291-d86efa9b90db?w=500&q=80"
      }
    ]
  },
  {
    id: "GW-ENDED-01",
    title: "Independence Rewards",
    description: "Special independence day giveaway",
    status: "ended",
    startDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    participantsCount: 12450,
    eligibility: "Open to early adopters.",
    rules: ["One entry per user."],
    termsAndConditions: "Prizes distributed within 14 days.",
    prizes: [
      {
        id: "PRIZE-005",
        name: "MacBook Air",
        description: "M3 Chip, 8GB RAM, 256GB SSD",
        position: 1,
        type: "physical",
        winnerCount: 1,
        entryFee: 1000,
        entryCurrency: "VEs",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80"
      }
    ]
  },
  {
    id: "GW-ENDED-02",
    title: "Spring Festival Rewards",
    description: "Our spring season celebration giveaway.",
    status: "ended",
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    participantsCount: 5200,
    eligibility: "Open to early adopters.",
    rules: ["One entry per user."],
    termsAndConditions: "Prizes distributed within 14 days.",
    prizes: [
      {
        id: "PRIZE-006",
        name: "Samsung Galaxy S24 Ultra",
        description: "Titanium build, AI powered",
        position: 1,
        type: "physical",
        winnerCount: 2,
        entryFee: 800,
        entryCurrency: "VEs",
        image: "https://images.unsplash.com/photo-1707343843437-caacff5cfa74?w=500&q=80"
      }
    ]
  }
];

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/veloop');
    console.log('Connected.');

    console.log('Clearing old giveaways...');
    await Giveaway.deleteMany({});

    console.log('Inserting mock giveaways...');
    await Giveaway.insertMany(MOCK_GIVEAWAYS);
    
    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
