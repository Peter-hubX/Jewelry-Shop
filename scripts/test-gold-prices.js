(async () => {
  try {
    const base = 'http://localhost:3000';
    console.log('POSTing to /api/gold-prices');
    const postRes = await fetch(`${base}/api/gold-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GOLD_PRICE_UPDATE_SECRET || 'dev-secret'}`
      },
      body: JSON.stringify({})
    });

    console.log('POST status:', postRes.status);
    const postText = await postRes.text();
    console.log('POST response body:\n', postText);

    console.log('\nGETting /api/gold-prices');
    const getRes = await fetch(`${base}/api/gold-prices`);
    console.log('GET status:', getRes.status);
    const getText = await getRes.text();
    console.log('GET response body:\n', getText);
  } catch (err) {
    console.error('Script error:', err);
    process.exit(1);
  }
})();
