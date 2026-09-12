const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://shubhangimahajan2311:GxdOp8q2rOtiyyna@cluster0.zh5nxfb.mongodb.net/project-crm')
  .then(async () => {
    const models = ['Giveaway', 'GiveawayWinner', 'GiveawayParticipation', 'GiveawayEntryTransaction', 'AuditLog', 'User'];
    for (const name of models) {
      try {
        const Model = require('./src/models/' + name);
        const docs = await Model.find({ 
          $or: [ 
            { giveawayId: 'GW-2026-08' }, 
            { id: 'GW-2026-08' }, 
            { 'details.giveawayId': 'GW-2026-08' } 
          ] 
        });
        console.log('Collection ' + name + ' has ' + docs.length + ' references to GW-2026-08');
      } catch(e) {}
    }
    
    // Let's also check what getPreviousWinners returns EXACTLY!
    const GiveawayWinner = require('./src/models/GiveawayWinner');
    const winners = await GiveawayWinner.aggregate([
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
      }
    ]);
    
    console.log('getPreviousWinners API would return: ', winners.map(w => w.giveawayId));
    
    process.exit(0);
  });
