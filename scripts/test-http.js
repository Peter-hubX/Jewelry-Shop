const http = require('http');

function post(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dev-secret'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.write('{}');
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: 'localhost', port: 3000, path }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

(async () => {
  try {
    console.log('POST /api/gold-prices');
    const postRes = await post('/api/gold-prices');
    console.log('POST status:', postRes.status);
    console.log('POST body:', postRes.body);

    console.log('\nGET /api/gold-prices');
    const getRes = await get('/api/gold-prices');
    console.log('GET status:', getRes.status);
    console.log('GET body:', getRes.body);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
