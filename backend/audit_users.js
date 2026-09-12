const mongoose = require('mongoose');

async function runAudit() {
  await mongoose.connect('mongodb+srv://shubhangimahajan2311:GxdOp8q2rOtiyyna@cluster0.zh5nxfb.mongodb.net/project-crm');
  
  const User = require('./src/models/User');
  const GiveawayParticipation = require('./src/models/GiveawayParticipation');
  const GiveawayWinner = require('./src/models/GiveawayWinner');
  const PrizeClaim = require('./src/models/PrizeClaim');
  const GiveawayEntryTransaction = require('./src/models/GiveawayEntryTransaction');
  const FraudEvent = require('./src/models/FraudEvent');
  const AuditLog = require('./src/models/AuditLog');

  const users = await User.find({}).select('-password').lean();
  
  const results = [];

  for (const user of users) {
    const userId = user._id.toString();
    const email = user.email;
    const isTest = email.includes('test') || email.includes('demo') || email.includes('mock');
    
    const pCount = await GiveawayParticipation.countDocuments({ userId });
    const wCount = await GiveawayWinner.countDocuments({ userId });
    const cCount = await PrizeClaim.countDocuments({ userId });
    const tCount = await GiveawayEntryTransaction.countDocuments({ userId });
    const fCount = await FraudEvent.countDocuments({ userId });
    
    // Audit log schema has userId or user
    const aCount = await AuditLog.countDocuments({ $or: [{ userId }, { user: userId }] });
    
    const totalRefs = pCount + wCount + cCount + tCount + fCount + aCount;
    
    results.push({
      id: userId,
      email: email,
      name: user.name,
      isTest: isTest,
      totalRefs: totalRefs,
      breakdown: {
        participation: pCount,
        winner: wCount,
        claim: cCount,
        transaction: tCount,
        fraud: fCount,
        audit: aCount
      }
    });
  }
  
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}

runAudit().catch(console.error);
