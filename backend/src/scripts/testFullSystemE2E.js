require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Giveaway = require('../models/Giveaway');
const GiveawayWinner = require('../models/GiveawayWinner');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:5000/api';

async function runE2EAudit() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB for E2E Audit\n');
  const results = [];

  const addResult = (name, passed, detail) => {
    results.push({ name, passed, detail });
    console.log((passed ? '✅ [PASS] ' : '❌ [FAIL] ') + name + ': ' + detail);
  };

  // 1. Auth Register
  const testEmail = 'e2e_audit_' + Date.now() + '@veloop.test';
  let regResp = await fetch(BASE_URL + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Audit User', email: testEmail, password: 'password123' })
  });
  let regData = await regResp.json();
  let token = regData.token;
  addResult('1. POST /api/auth/register', regResp.status === 201 && !!token, 'Status: ' + regResp.status + ', Token generated');

  // 2. Auth Login
  let loginResp = await fetch(BASE_URL + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'password123' })
  });
  let loginData = await loginResp.json();
  addResult('2. POST /api/auth/login', loginResp.status === 200 && !!loginData.token, 'Status: ' + loginResp.status + ', User: ' + loginData.user?.email);

  // 3. Auth Me
  let meResp = await fetch(BASE_URL + '/auth/me', {
    headers: { Authorization: 'Bearer ' + token }
  });
  let meData = await meResp.json();
  addResult('3. GET /api/auth/me', meResp.status === 200 && meData.balances?.VEs === 1000, 'Status: ' + meResp.status + ', VEs: ' + meData.balances?.VEs);

  // 4. Current Giveaways
  let currResp = await fetch(BASE_URL + '/giveaways/current');
  let currData = await currResp.json();
  addResult('4. GET /api/giveaways/current', currResp.status === 200 && Array.isArray(currData), 'Status: ' + currResp.status + ', Count: ' + currData.length);

  // 5. Previous Giveaways
  let prevResp = await fetch(BASE_URL + '/giveaways/previous');
  let prevData = await prevResp.json();
  addResult('5. GET /api/giveaways/previous', prevResp.status === 200 && Array.isArray(prevData), 'Status: ' + prevResp.status + ', Count: ' + prevData.length);

  // 6. Giveaway Stats
  let statsResp = await fetch(BASE_URL + '/giveaways/stats');
  let statsData = await statsResp.json();
  addResult('6. GET /api/giveaways/stats', statsResp.status === 200 && statsData.totalGiveaways !== undefined, 'Status: ' + statsResp.status + ', Total Giveaways: ' + statsData.totalGiveaways);

  // 7. Giveaway By ID
  const activeGwId = currData[0]?.id || 'GW-ACTIVE-01';
  let idResp = await fetch(BASE_URL + '/giveaways/' + activeGwId);
  let idData = await idResp.json();
  addResult('7. GET /api/giveaways/:id', idResp.status === 200 && idData.id === activeGwId, 'Status: ' + idResp.status + ', Title: ' + idData.title);

  // 8. Join Giveaway with Idempotency Key
  const ik = 'e2e_key_' + Date.now();
  const prizeId = idData.prizes[0].id;
  let joinResp = await fetch(BASE_URL + '/giveaways/' + activeGwId + '/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, 'Idempotency-Key': ik },
    body: JSON.stringify({ prizeId })
  });
  let joinData = await joinResp.json();
  addResult('8. POST /api/giveaways/:id/join', joinResp.status === 200 && joinData.success, 'Status: ' + joinResp.status + ', New Balance VEs: ' + joinData.newBalance?.VEs);

  // 9. My Status
  let statusResp = await fetch(BASE_URL + '/giveaways/' + activeGwId + '/my-status', {
    headers: { Authorization: 'Bearer ' + token }
  });
  let statusData = await statusResp.json();
  addResult('9. GET /api/giveaways/:id/my-status', statusResp.status === 200 && statusData.isParticipating, 'Status: ' + statusResp.status + ', IsParticipating: ' + statusData.isParticipating);

  // 10. My Participations
  let myPartResp = await fetch(BASE_URL + '/giveaways/my-participations', {
    headers: { Authorization: 'Bearer ' + token }
  });
  let myPartData = await myPartResp.json();
  addResult('10. GET /api/giveaways/my-participations', myPartResp.status === 200 && myPartData.length === 1, 'Status: ' + myPartResp.status + ', Count: ' + myPartData.length);

  // 11. Winners for Giveaway
  let winResp = await fetch(BASE_URL + '/giveaways/GW-ENDED-01/winners');
  let winData = await winResp.json();
  addResult('11. GET /api/giveaways/:id/winners', winResp.status === 200 && winData[0]?.prizeName === 'MacBook Air', 'Status: ' + winResp.status + ', Prize Name: ' + winData[0]?.prizeName);

  // 12. Previous Winners Feed
  let prevWinResp = await fetch(BASE_URL + '/giveaways/previous/winners');
  let prevWinData = await prevWinResp.json();
  addResult('12. GET /api/giveaways/previous/winners', prevWinResp.status === 200 && prevWinData.length > 0, 'Status: ' + prevWinResp.status + ', Count: ' + prevWinData.length);

  // 13. Claim Endpoint
  const testWinner = new GiveawayWinner({
    giveawayId: 'GW-ENDED-01',
    prizeId: 'PRIZE-005',
    userId: (await User.findOne({ email: testEmail }))._id,
    maskedUserId: 'VE****t1',
    selectionMethod: 'random',
    status: 'pending_claim'
  });
  await testWinner.save();

  let claimResp = await fetch(BASE_URL + '/giveaways/GW-ENDED-01/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({
      claimType: 'physical',
      fullName: 'Audit User',
      phoneNumber: '1234567890',
      address: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      pinCode: '123456'
    })
  });
  let claimData = await claimResp.json();
  addResult('13. POST /api/giveaways/:id/claim', claimResp.status === 200 && claimData.success, 'Status: ' + claimResp.status + ', Message: ' + claimData.message);

  // Clean up test winner
  await GiveawayWinner.deleteOne({ _id: testWinner._id });

  // 14. Admin Finalize Giveaway Endpoint
  let adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    adminUser = await User.findOne({ email: testEmail });
    adminUser.role = 'admin';
    await adminUser.save();
  }
  let adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || 'dev_secret');

  let adminFinResp = await fetch(BASE_URL + '/admin/giveaways/GW-NONEXISTENT/finalize', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + adminToken }
  });
  let adminFinData = await adminFinResp.json();
  addResult('14. POST /api/admin/giveaways/:id/finalize', adminFinResp.status === 404 && adminFinData.error === 'GIVEAWAY_NOT_FOUND', 'Status: ' + adminFinResp.status + ', Error: ' + adminFinData.error);

  // Clean up test user
  await User.deleteOne({ email: testEmail });

  console.log('\n========================================');
  console.log(`Final E2E Summary: ${results.filter(r => r.passed).length} / ${results.length} PASSED`);
  console.log('========================================');

  await mongoose.disconnect();
  process.exit(results.every(r => r.passed) ? 0 : 1);
}

runE2EAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
