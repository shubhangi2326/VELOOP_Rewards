const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/veloop_giveaway_mock').then(async () => {
  const count = await mongoose.model('Giveaway', new mongoose.Schema({}, {strict: false})).countDocuments({ status: 'active', endDate: { $lte: new Date() } });
  console.log('Count:', count);
  const giveaways = await mongoose.model('Giveaway', new mongoose.Schema({}, {strict: false})).find({ status: 'active' });
  console.log(giveaways.map(g => g.endDate));
  process.exit(0);
});
