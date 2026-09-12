const mongoose = require('mongoose');
const GiveawayWinner = require('./src/models/GiveawayWinner');
require('./src/models/Giveaway');

mongoose.connect('mongodb+srv://shubhangimahajan2311:GxdOp8q2rOtiyyna@cluster0.zh5nxfb.mongodb.net/project-crm')
  .then(() => GiveawayWinner.aggregate([
    {
      $lookup: {
        from: 'giveaways',
        localField: 'giveawayId',
        foreignField: 'id',
        as: 'giveaway'
      }
    },
    {
      $match: { 'giveaway.0': { $exists: true } }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $limit: 50
    },
    {
      $project: {
        giveaway: 0
      }
    }
  ]))
  .then(w => {
    console.log(`Found ${w.length} valid winners`);
    console.log(w);
    process.exit(0);
  });
