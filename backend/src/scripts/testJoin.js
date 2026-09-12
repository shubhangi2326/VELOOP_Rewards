// use native fetch

async function runTest() {
  const baseUrl = 'http://localhost:5000/api';
  
  // 1. Login
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test2@example.com', password: 'password123' })
  });
  
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('1. Logged in, token received');

  const giveawayId = "GW-2026-08";
  const prizeId = "PRIZE-001";
  
  // 2. Check Status
  const statusRes1 = await fetch(`${baseUrl}/giveaways/${giveawayId}/my-status`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const status1 = await statusRes1.json();
  console.log('2. Initial status isParticipating:', status1.isParticipating);
  
  // 3. Join Giveaway
  const joinRes = await fetch(`${baseUrl}/giveaways/${giveawayId}/join`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ prizeId })
  });
  
  const joinData = await joinRes.json();
  console.log('3. Join response:', joinData);
  
  // 4. Try Joining Again
  const joinAgainRes = await fetch(`${baseUrl}/giveaways/${giveawayId}/join`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({ prizeId })
  });
  
  const joinAgainData = await joinAgainRes.json();
  console.log('4. Duplicate join response:', joinAgainData);

  // 5. Check Status Again
  const statusRes2 = await fetch(`${baseUrl}/giveaways/${giveawayId}/my-status`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const status2 = await statusRes2.json();
  console.log('5. Final status isParticipating:', status2.isParticipating);
}

runTest().catch(console.error);
