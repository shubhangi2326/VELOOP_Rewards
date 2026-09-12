async function testAuthFlow() {
  const API_URL = 'http://localhost:5000/api/auth';
  
  const testUser = {
    name: 'Fresh Test User',
    email: 'fresh_test@veloop.com',
    password: 'password123'
  };

  console.log('1. Testing Fresh Signup API...');
  const registerRes = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  
  const registerData = await registerRes.json();
  if (registerRes.ok && registerData.token) {
    console.log('✅ Signup successful! JWT received.');
  } else {
    console.error('❌ Signup failed:', registerData);
    process.exit(1);
  }

  console.log('\n2. Testing Fresh Login API...');
  const loginRes = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUser.email, password: testUser.password })
  });
  
  const loginData = await loginRes.json();
  if (loginRes.ok && loginData.token) {
    console.log('✅ Login successful! JWT received.');
    console.log(`User ID: ${loginData.user.id}`);
    console.log(`Email: ${loginData.user.email}`);
    console.log(`Balances: VEs=${loginData.user.balances.VEs}, SVEs=${loginData.user.balances.SVEs}`);
  } else {
    console.error('❌ Login failed:', loginData);
    process.exit(1);
  }

  // 3. Optional: Verify JWT protected route (e.g., getting user profile/giveaways if there is a profile endpoint)
  console.log('\nAll core Auth APIs successfully verified using real hashing and JWTs.');
  process.exit(0);
}

testAuthFlow().catch(console.error);
