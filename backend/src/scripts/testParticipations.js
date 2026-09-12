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
  console.log('1. Logged in');

  // 2. Get my participations
  const res = await fetch(`${baseUrl}/giveaways/my-participations`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('2. My Participations:', JSON.stringify(data, null, 2));
}

runTest().catch(console.error);
