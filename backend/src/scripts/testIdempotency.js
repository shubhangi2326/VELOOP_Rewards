require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Giveaway = require('../models/Giveaway');
const IdempotencyKey = require('../models/IdempotencyKey');
const crypto = require('crypto');

async function testIdempotency() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  // Create a test user and generate token
  await mongoose.connection.collection('giveawayparticipations').deleteMany({ userId: 'test.idem@test.com' }); // It's objectId but this is fine since user hasn't joined.
  await mongoose.connection.collection('idempotencykeys').deleteMany({});
  
  let user = await User.findOne({ email: 'test.idem@test.com' });
  if (!user) {
    user = await User.create({
      name: 'Idem Test',
      email: 'test.idem@test.com',
      password: 'password123',
      balances: { VEs: 10000 }
    });
  } else {
    user.balances.VEs = 10000;
    await user.save();
  }
  
  await mongoose.connection.collection('giveawayparticipations').deleteMany({ userId: user._id.toString() });

  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });

  // Get a giveaway to join
  const giveaway = await Giveaway.findOne({ status: 'active' });
  if (!giveaway) {
    console.log('No active giveaway found to test.');
    process.exit(1);
  }

  const prizeId = giveaway.prizes[0].id;
  const url = `http://localhost:5000/api/giveaways/${giveaway.id}/join`;
  const headers = { Authorization: `Bearer ${token}` };
  const payload = { prizeId };

  const fetchApi = async (url, opts) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Forwarded-For': '192.168.1.' + Math.floor(Math.random() * 255),
        ...opts.headers 
      },
      body: JSON.stringify(opts.payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw { status: res.status, data };
    return data;
  };

  console.log('--- Test 1: Missing Idempotency Key ---');
  try {
    await fetchApi(url, { headers, payload });
    console.log('❌ Failed: Should have rejected missing key');
  } catch (error) {
    if (error.status === 400) {
      console.log('✅ Passed: Rejected missing key');
    } else {
      console.log('❌ Failed:', error.data);
    }
  }

  console.log('\n--- Test 2: Sequential Duplicates ---');
  const key1 = crypto.randomUUID();
  try {
    const res1 = await fetchApi(url, { payload, headers: { ...headers, 'Idempotency-Key': key1 } });
    console.log('Initial request succeeded:', res1.success);
    
    // Send same key again
    const res2 = await fetchApi(url, { payload, headers: { ...headers, 'Idempotency-Key': key1 } });
    console.log('Retry response success:', res2.success);
    if (res1.newBalance === res2.newBalance) {
      console.log('✅ Passed: Identical response and balance for retry');
    } else {
      console.log('❌ Failed: Balance changed on retry');
    }
  } catch (err) {
    console.log('❌ Failed:', err.data || err.message);
  }

  console.log('\n--- Test 3: Concurrent Duplicates ---');
  await mongoose.connection.collection('giveawayparticipations').deleteMany({ userId: user._id.toString() });
  const key2 = crypto.randomUUID();
  try {
    // Send 3 requests concurrently
    const req1 = fetchApi(url, { payload, headers: { ...headers, 'Idempotency-Key': key2 } });
    const req2 = fetchApi(url, { payload, headers: { ...headers, 'Idempotency-Key': key2 } });
    const req3 = fetchApi(url, { payload, headers: { ...headers, 'Idempotency-Key': key2 } });

    const results = await Promise.allSettled([req1, req2, req3]);
    let successCount = 0;
    let conflictCount = 0;

    results.forEach(r => {
      if (r.status === 'fulfilled') successCount++;
      else if (r.reason.status === 409) conflictCount++;
    });

    console.log(`Successes: ${successCount}, Conflicts (409): ${conflictCount}`);
    if (successCount === 1 && conflictCount === 2) {
      console.log('✅ Passed: Only one request succeeded, others got 409 Conflict');
    } else {
      console.log('❌ Failed: Incorrect concurrency handling');
    }
  } catch (err) {
    console.log('❌ Failed:', err.message);
  }

  console.log('\n--- Test 4: Failed Request Retry ---');
  await mongoose.connection.collection('giveawayparticipations').deleteMany({ userId: user._id.toString() });
  const key3 = crypto.randomUUID();
  // Manually insert a FAILED record
  await IdempotencyKey.create({ key: key3, userId: user._id, requestPath: `/api/giveaways/${giveaway.id}/join`, status: 'FAILED' });
  try {
    const res3 = await fetchApi(url, { payload, headers: { ...headers, 'Idempotency-Key': key3 } });
    if (res3.success) {
      console.log('✅ Passed: Recovered from FAILED state and successfully joined');
    }
  } catch (err) {
    console.log('❌ Failed:', err.data || err.message);
  }

  console.log('\n--- Test 5: Same key, different user (cross-user isolation) ---');
  let user2 = await User.findOne({ email: 'test2.idem@test.com' });
  if (!user2) {
    user2 = await User.create({ name: 'Idem Test 2', email: 'test2.idem@test.com', password: 'password123', balances: { VEs: 10000 } });
  } else {
    user2.balances.VEs = 10000;
    await user2.save();
  }
  await mongoose.connection.collection('giveawayparticipations').deleteMany({ userId: user2._id.toString() });
  const token2 = jwt.sign({ id: user2._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });

  const user2BalanceBefore = user2.balances.VEs;
  try {
    // key1 was created by user 1 — user 2 must NOT be allowed to use it
    const resUser2 = await fetchApi(url, { payload, headers: { Authorization: `Bearer ${token2}`, 'Idempotency-Key': key1 } });
    console.log('❌ Failed: Request should have been rejected, but got success:', resUser2);
  } catch (err) {
    if (err.status === 403 && err.data?.error === 'IDEMPOTENCY_KEY_OWNED_BY_ANOTHER_USER') {
      // Verify user2's balance was NOT deducted
      const freshUser2 = await User.findById(user2._id);
      const noParticipation = await mongoose.connection.collection('giveawayparticipations').findOne({ userId: user2._id.toString() });
      if (freshUser2.balances.VEs === user2BalanceBefore && !noParticipation) {
        console.log('✅ Passed: Cross-user key reuse correctly rejected with 403. No balance deducted, no participation created.');
      } else {
        console.log('❌ Failed: Got 403 but balance was deducted or participation was created.');
      }
    } else {
      console.log('❌ Failed/Unexpected:', err.data || err.message);
    }
  }

  console.log('\n--- Test 6: Verify other functionalities are intact ---');
  // Just ensure we can still get stats or giveaways
  try {
    const pubRes = await fetch('http://localhost:5000/api/giveaways/current');
    if (pubRes.ok) {
      console.log('✅ Passed: Public endpoints are still working');
    }
  } catch (err) {
    console.log('❌ Failed: Existing endpoints broken');
  }

  process.exit(0);
}

testIdempotency();
