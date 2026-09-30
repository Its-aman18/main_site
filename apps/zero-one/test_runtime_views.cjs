const http = require('http');

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: 'localhost', port: parseInt(process.env.ZERO_ONE_TEST_PORT || process.env.ZERO_ONE_PORT || process.env.PORT || '5003', 10), path, headers }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('================================================================');
  console.log('ZERO → ONE RUNTIME WEB ASSET & ENDPOINT VALIDATION');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(cond, name, details = '') {
    total++;
    if (cond) {
      passed++;
      console.log(`[PASS] ${name} ${details}`);
    } else {
      console.error(`[FAIL] ${name} ${details}`);
    }
  }

  // 1. Index Page
  const indexRes = await get('/');
  assert(indexRes.statusCode === 200 && indexRes.body.includes('id="root"'), 'Landing Page HTML (/)', `(Status: ${indexRes.statusCode}, bytes: ${indexRes.body.length})`);
  assert(indexRes.body.includes('manifest.webmanifest'), 'PWA Webmanifest link present in index.html');
  assert(indexRes.body.includes('/src/main.tsx'), 'Vite React Entrypoint (/src/main.tsx) present in index.html');

  // 2. Admin Page
  const adminRes = await get('/admin.html');
  assert(adminRes.statusCode === 200 && adminRes.body.includes('id="admin-root"'), 'Admin HTML (/admin.html)', `(Status: ${adminRes.statusCode}, bytes: ${adminRes.body.length})`);
  assert(adminRes.body.includes('/src/adminMain.tsx'), 'Admin Entrypoint (/src/adminMain.tsx) present in admin.html');

  // 3. PWA Manifest
  const manifestRes = await get('/manifest.webmanifest');
  let manifestJson = null;
  try { manifestJson = JSON.parse(manifestRes.body); } catch {}
  assert(manifestRes.statusCode === 200 && manifestJson && manifestJson.short_name.includes('ZERO'), 'PWA Manifest (/manifest.webmanifest)', `(App: ${manifestJson?.name})`);

  // 4. PWA Service Worker
  const swRes = await get('/sw.js');
  assert(swRes.statusCode === 200 && swRes.body.includes('self.addEventListener'), 'Service Worker Script (/sw.js)', `(bytes: ${swRes.body.length})`);

  // 5. Authoritative APIs
  const healthRes = await get('/api/health');
  assert(healthRes.statusCode === 200 && healthRes.body.includes('"status":"ok"'), 'API /api/health');

  const clockRes = await get('/api/clock');
  assert(clockRes.statusCode === 200 && clockRes.body.includes('timeRemainingSeconds'), 'API /api/clock');

  const stateRes = await get('/api/state');
  assert(stateRes.statusCode === 200 && stateRes.body.includes('eventStatus'), 'API /api/state');

  const lbRes = await get('/api/zero-one/leaderboard');
  assert(lbRes.statusCode === 200 && lbRes.body.includes('leaderboard'), 'API /api/zero-one/leaderboard');

  const eventsRes = await get('/api/zero-one/events?sinceSequence=0');
  assert(eventsRes.statusCode === 200 && eventsRes.body.includes('sinceSequence'), 'API /api/zero-one/events');

  console.log('\n================================================================');
  console.log(`TOTAL WEB RUNTIME TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('================================================================');

  if (passed === total) {
    console.log('>>> ALL RUNTIME ASSET & WEB DELIVERABLE TESTS PASSED 100%! <<<');
  } else {
    process.exit(1);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
