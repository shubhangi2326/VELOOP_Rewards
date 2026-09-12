require('dotenv').config();
const mongoose = require('mongoose');
const fraudMiddleware = require('./src/middleware/fraudMiddleware');
const AuditLog = require('./src/models/AuditLog');
const GiveawayParticipation = require('./src/models/GiveawayParticipation');

async function simulateFraud() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Let's create a fake participation that uses 'fake-device-hash-123'
  await GiveawayParticipation.create({
    userId: new mongoose.Types.ObjectId(),
    giveawayId: 'test-gw-1',
    prizeId: 'test-prize-1',
    entryCurrency: 'VEs',
    entryAmount: 10,
    deviceHash: 'fake-device-hash-123'
  });

  // Now simulate a request from a DIFFERENT user but same device hash
  // Wait, fraudMiddleware uses crypto hash of IP+UA as deviceHash.
  // We can just fake req.ip and req.headers to generate a known hash, or mock the logic.
  // Actually, let's just create the exact logic:
  
  const req = {
    ip: '127.0.0.1',
    headers: { 'user-agent': 'test-agent' },
    body: { deviceHash: 'some-client-hash' },
    params: { id: 'test-gw-1' },
    user: { id: new mongoose.Types.ObjectId() } // different user
  };

  const res = {
    status: (code) => {
      console.log('Status set to:', code);
      return res;
    },
    json: (data) => {
      console.log('Response JSON:', data);
    }
  };

  const next = (err) => {
    if (err) console.error('Next called with error:', err);
    else console.log('Next called successfully');
  };

  // We need to inject the exact deviceHash the server will generate into the DB so it triggers fraud
  const crypto = require('crypto');
  const serverFingerprint = crypto.createHash('sha256').update(`${req.ip}-${req.headers['user-agent']}`).digest('hex');
  
  await GiveawayParticipation.create({
    userId: new mongoose.Types.ObjectId(), // another different user
    giveawayId: 'test-gw-1',
    prizeId: 'test-prize-1',
    entryCurrency: 'VEs',
    entryAmount: 10,
    deviceHash: serverFingerprint // This will trigger the "multi-account abuse"
  });

  console.log('Simulating fraud request...');
  await fraudMiddleware(req, res, next);
  
  // Check logs
  const logs = await AuditLog.find({ action: 'FRAUD_FLAGGED' }).lean();
  console.log('Audit Logs for FRAUD_FLAGGED:', logs);

  process.exit(0);
}

simulateFraud().catch(console.error);
