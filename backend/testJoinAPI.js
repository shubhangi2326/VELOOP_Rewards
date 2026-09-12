

async function run() {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test1@veloop.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  console.log('Login:', loginData);
  if (!loginData.token) return;

  const res = await fetch('http://localhost:5000/api/giveaways/e2e-test-gw-1789202114856/join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${loginData.token}`
    },
    body: JSON.stringify({ prizeId: 'PRIZE-1' })
  });
  const data = await res.json();
  console.log('Join Response:', res.status, data);
}

run();
