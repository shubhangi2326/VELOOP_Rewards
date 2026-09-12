

async function check() {
  try {
    console.log("Checking Previous Giveaways...");
    const res = await fetch('http://localhost:5000/api/giveaways/previous');
    const giveaways = await res.json();
    console.log(`Found ${giveaways.length} giveaways.`);
    
    for (const g of giveaways) {
      console.log(`\nGiveaway: ${g.title} (ID: ${g.id})`);
      if (g.prizes && g.prizes.length > 0) {
        g.prizes.forEach(p => {
           console.log(`  Prize: ${p.name}, image: ${p.image}`);
        });
      } else {
        console.log(`  No prizes found.`);
      }
    }
  } catch(e) {
    console.error(e);
  }
}
check();
