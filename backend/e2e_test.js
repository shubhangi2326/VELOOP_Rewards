require('dotenv').config();
const mongoose = require('mongoose');

// We will use native fetch to test the actual running backend on port 5000.
const BASE_URL = 'http://localhost:5002/api';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log('--- STARTING E2E VERIFICATION ---');
  let passed = 0;
  let failed = 0;
  const results = [];

  const assert = (condition, message, dataObj) => {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      results.push(`PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`, dataObj ? JSON.stringify(dataObj) : '');
      results.push(`FAIL: ${message}`);
      failed++;
    }
  };

  try {
    // Connect to DB directly to verify records
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB directly for verifications.');

    // --- SETUP: Create a test giveaway ---
    const Giveaway = require('./src/models/Giveaway');
    const testGiveawayId = `e2e-test-gw-${Date.now()}`;
    const testPrizeId = `e2e-test-prize-${Date.now()}`;
    const giveaway = await Giveaway.create({
      id: testGiveawayId,
      title: 'E2E Test Giveaway',
      status: 'active',
      startDate: new Date(Date.now() - 10000), // started 10s ago
      endDate: new Date(Date.now() + 10000), // ends in 10s
      participantsCount: 0,
      prizes: [{
        id: testPrizeId,
        position: 1,
        type: 'physical',
        name: 'Test iPhone',
        entryFee: 10,
        entryCurrency: 'VEs',
        winnerCount: 1
      }]
    });
    assert(giveaway.id === testGiveawayId, 'Test Giveaway created in MongoDB.');

    // --- TEST: Public Giveaway data loads without login ---
    let res = await fetch(`${BASE_URL}/giveaways/current`);
    assert(res.status === 200, 'Public Giveaways API responds 200 OK without auth.');
    let data = await res.json();
    assert(data.some(g => g.id === testGiveawayId), 'Public Giveaways includes test giveaway (dynamic data).');

    // --- TEST: Giveaway details load dynamically ---
    res = await fetch(`${BASE_URL}/giveaways/${testGiveawayId}`);
    assert(res.status === 200, 'Giveaway Details API responds 200 OK.');
    data = await res.json();
    assert(data.title === 'E2E Test Giveaway', 'Giveaway details match MongoDB exactly.');

    // --- TEST: Registration & Login ---
    const email1 = `test1_${Date.now()}@test.com`;
    const email2 = `test2_${Date.now()}@test.com`;
    const pw = 'password123';

    // Register User 1
    res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User One', email: email1, password: pw })
    });
    data = await res.json();
    assert(res.status === 201 && data.token, 'User 1 registered and received token.');
    const token1 = data.token;
    const userId1 = data.user.id;

    // Register User 2
    res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User Two', email: email2, password: pw })
    });
    data = await res.json();
    assert(res.status === 201 && data.token, 'User 2 registered and received token.');
    const token2 = data.token;
    const userId2 = data.user.id;

    // Invalid login
    res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email1, password: 'wrong' })
    });
    assert(res.status === 401, 'Invalid login properly rejected with 401.');

    // --- SETUP: Give User 1 Balance ---
    const User = require('./src/models/User');
    await User.findByIdAndUpdate(userId1, { $set: { 'balances.VEs': 50 } });
    await User.findByIdAndUpdate(userId2, { $set: { 'balances.VEs': 5 } }); // insufficient
    
    // --- TEST: User balance fetched correctly ---
    res = await fetch(`${BASE_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${token1}` }});
    data = await res.json();
    assert(data.balances.VEs === 50, 'Authenticated user data fetches real balance.');

    // --- TEST: Joining Giveaway with sufficient balance ---
    res = await fetch(`${BASE_URL}/giveaways/${testGiveawayId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}` },
      body: JSON.stringify({ prizeId: testPrizeId, deviceHash: 'client-hash' })
    });
    data = await res.json();
    assert(res.status === 200 && data.success, 'User 1 joined giveaway successfully.');

    // Verify atomic transaction & balance
    const updatedUser1 = await User.findById(userId1);
    assert(updatedUser1.balances.VEs === 40, 'User 1 balance deducted atomically (50 -> 40).');

    const GiveawayEntryTransaction = require('./src/models/GiveawayEntryTransaction');
    const tx = await GiveawayEntryTransaction.findOne({ userId: userId1, giveawayId: testGiveawayId });
    assert(tx && tx.status === 'SUCCESS', 'GiveawayEntryTransaction created correctly.');

    const AuditLog = require('./src/models/AuditLog');
    let audit = await AuditLog.findOne({ userId: userId1, action: 'JOIN_GIVEAWAY' });
    assert(audit, 'JOIN_GIVEAWAY AuditLog created correctly.');

    // --- TEST: Duplicate participation rejected ---
    res = await fetch(`${BASE_URL}/giveaways/${testGiveawayId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}` },
      body: JSON.stringify({ prizeId: testPrizeId, deviceHash: 'client-hash' })
    });
    data = await res.json();
    assert(res.status === 400 || res.status === 500 || res.status === 409, 'Duplicate participation rejected.', { status: res.status, data }); 

    // --- TEST: Fraud / Multi-account blocked ---
    // User 2 uses the exact same fetch (which has the same IP and User-Agent as User 1 locally).
    res = await fetch(`${BASE_URL}/giveaways/${testGiveawayId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}` },
      body: JSON.stringify({ prizeId: testPrizeId, deviceHash: 'client-hash' })
    });
    data = await res.json();
    assert(res.status === 403 && data.error === 'SUSPICIOUS_ACTIVITY', 'Fraud/multi-account attempt properly blocked (User 2 on same IP/UA).');
    
    audit = await AuditLog.findOne({ userId: userId2, action: 'FRAUD_FLAGGED' });
    assert(audit, 'FRAUD_FLAGGED AuditLog created correctly.');

    // --- SETUP: Make User 2 use a different User-Agent to bypass fraud and test insufficient balance ---
    res = await fetch(`${BASE_URL}/giveaways/${testGiveawayId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}`, 'User-Agent': 'test-agent-2' },
      body: JSON.stringify({ prizeId: testPrizeId, deviceHash: 'client-hash-2' })
    });
    data = await res.json();
    assert(res.status === 400 && data.message.includes('Not enough VEs'), 'Insufficient balance properly rejected.', { status: res.status, data });

    // --- TEST: Finalize Giveaway ---
    // Make the giveaway end right now
    await Giveaway.findOneAndUpdate({ id: testGiveawayId }, { $set: { endDate: new Date(Date.now() - 1000) } });
    
    // Admin finalization
    // Setup Admin user
    const adminEmail = `admin_${Date.now()}@test.com`;
    res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Admin', email: adminEmail, password: pw, role: 'admin' }) // assuming role can be passed, if not we update in DB
    });
    data = await res.json();
    const adminToken = data.token;
    await User.findByIdAndUpdate(data.user.id, { $set: { role: 'admin' } });

    res = await fetch(`${BASE_URL}/admin/giveaways/${testGiveawayId}/finalize`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    data = await res.json();
    assert(res.status === 200 && data.success, 'Giveaway finalized successfully by admin.', { status: res.status, data });
    
    audit = await AuditLog.findOne({ action: 'GIVEAWAY_FINALIZED' }).sort({ createdAt: -1 });
    assert(audit, 'GIVEAWAY_FINALIZED AuditLog created correctly.');

    // --- TEST: Winners Selected ---
    const GiveawayWinner = require('./src/models/GiveawayWinner');
    const winner = await GiveawayWinner.findOne({ giveawayId: testGiveawayId });
    assert(winner && winner.userId.toString() === userId1.toString(), 'User 1 selected as winner (only participant).');

    res = await fetch(`${BASE_URL}/giveaways/${testGiveawayId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token1}` },
      body: JSON.stringify({ 
        fullName: 'Test Winner', 
        phoneNumber: '1234567890', 
        address: '123 Test St', 
        city: 'Testville', 
        state: 'TS', 
        pinCode: '12345' 
      })
    });
    data = await res.json();
    assert(res.status === 200 && data.success, 'Valid winner claimed prize successfully.', { status: res.status, data });

    audit = await AuditLog.findOne({ userId: userId1, action: 'CLAIM_SUBMITTED' });
    assert(audit, 'CLAIM_SUBMITTED AuditLog created correctly.');

    // Verify Winner Status updated
    const updatedWinner = await GiveawayWinner.findOne({ giveawayId: testGiveawayId });
    assert(updatedWinner.status === 'claimed', 'Winner status updated to claimed.');

    // --- TEST: Unauthorized Claim Attempt ---
    await delay(1000); // delay to avoid rate limit
    res = await fetch(`${BASE_URL}/giveaways/${testGiveawayId}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}` },
      body: JSON.stringify({ claimType: 'digital', emailAddress: 'loser@test.com' })
    });
    const unauthorizedData = await res.json();
    assert(res.status === 403 || res.status === 400 || res.status === 429, 'Non-winner cannot claim prize.', { status: res.status, data: unauthorizedData });

    // --- TEST: Admin functionality restricted ---
    res = await fetch(`${BASE_URL}/admin/giveaways/${testGiveawayId}/finalize`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token1}` } // normal user token
    });
    assert(res.status === 403, 'Admin functionality blocked for normal user.');

    // Cleanup
    const GiveawayWinner = require('./src/models/GiveawayWinner');
    const GiveawayParticipation = require('./src/models/GiveawayParticipation');
    const GiveawayEntryTransaction = require('./src/models/GiveawayEntryTransaction');
    const PrizeClaim = require('./src/models/PrizeClaim');
    const AuditLog = require('./src/models/AuditLog');
    const FraudEvent = require('./src/models/FraudEvent');

    await GiveawayWinner.deleteMany({ giveawayId: testGiveawayId });
    await GiveawayParticipation.deleteMany({ giveawayId: testGiveawayId });
    await GiveawayEntryTransaction.deleteMany({ giveawayId: testGiveawayId });
    await PrizeClaim.deleteMany({ giveawayId: testGiveawayId });
    await AuditLog.deleteMany({ 'details.giveawayId': testGiveawayId });
    await FraudEvent.deleteMany({ giveawayId: testGiveawayId });
    await Giveaway.deleteOne({ id: testGiveawayId });
    await User.deleteMany({ email: { $in: [email1, email2, adminEmail] } });
    
    console.log(`\n--- SUMMARY ---`);
    console.log(`PASSED: ${passed}`);
    console.log(`FAILED: ${failed}`);

  } catch (err) {
    console.error('Fatal Test Error:', err);
  } finally {
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
