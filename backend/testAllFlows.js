async function runTests() {
  const baseUrl = 'http://localhost:5000/api/giveaways';

  console.log('--- 1. Testing Current Giveaways ---');
  const currentRes = await fetch(`${baseUrl}/current`);
  const currentData = await currentRes.json();
  console.log(`Found ${currentData.length} current giveaways:`);
  for (const g of currentData) {
    console.log(`  - [${g.status.toUpperCase()}] ${g.title} (ID: ${g.id}) | Ends: ${new Date(g.endDate).toLocaleDateString()}`);
  }

  console.log('\n--- 2. Testing Previous Giveaways ---');
  const previousRes = await fetch(`${baseUrl}/previous`);
  const previousData = await previousRes.json();
  console.log(`Found ${previousData.length} previous giveaways:`);
  for (const g of previousData) {
    console.log(`  - [${g.status.toUpperCase()}] ${g.title} (ID: ${g.id}) | Ended: ${new Date(g.endDate).toLocaleDateString()}`);
    for (const p of g.prizes) {
      console.log(`      Prize: ${p.name} | Image: ${p.image ? 'Valid URL' : 'UNDEFINED'}`);
    }
  }

  console.log('\n--- 3. Testing Giveaway Details (Active) ---');
  if (currentData.length > 0) {
    const detailsRes = await fetch(`${baseUrl}/${currentData[0].id}`);
    const detailsData = await detailsRes.json();
    console.log(`  Fetched: ${detailsData.title} | Status: ${detailsData.status}`);
  }

  console.log('\n--- 4. Testing Giveaway Details (Ended) ---');
  if (previousData.length > 0) {
    const detailsRes = await fetch(`${baseUrl}/${previousData[0].id}`);
    const detailsData = await detailsRes.json();
    console.log(`  Fetched: ${detailsData.title} | Status: ${detailsData.status}`);
  }
}

runTests().catch(console.error);
