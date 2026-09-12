(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/giveaways/current', {
      method: 'OPTIONS',
      headers: { 'Origin': 'http://localhost:5174' }
    });
    console.log('Status:', res.status);
    console.log('CORS Allow Origin:', res.headers.get('access-control-allow-origin'));
  } catch(e) {
    console.error(e);
  }
})();
