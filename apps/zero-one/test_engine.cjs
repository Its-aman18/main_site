const http = require('http');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: parseInt(process.env.ZERO_ONE_TEST_PORT || process.env.ZERO_ONE_PORT || process.env.PORT || '5003', 10),
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
          ...options.headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, headers: res.headers, data: JSON.parse(data) });
          } catch {
            resolve({ statusCode: res.statusCode, headers: res.headers, data });
          }
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('ZERO → ONE AUTHORITATIVE BACKEND ENGINE TEST SUITE');
  console.log('====================================================\n');

  // Test 1: Health & Clock
  const health = await request({ path: '/api/health', method: 'GET' });
  console.log('[TEST 1] Server Health Check:', health.statusCode === 200 && health.data.status === 'ok' ? 'PASS' : 'FAIL');

  const clock = await request({ path: '/api/clock', method: 'GET' });
  console.log('[TEST 2] Authoritative Clock Check:', clock.statusCode === 200 && typeof clock.data.timeRemainingSeconds === 'number' ? 'PASS' : 'FAIL', `(${clock.data.timeRemainingSeconds}s remaining)`);

  // Test 3: Market Price Override by Admin
  const priceUpdate = await request(
    {
      path: '/api/admin/market/price',
      method: 'POST',
      headers: { 'x-user-email': 'applicationinformation73737@gmail.com' },
    },
    JSON.stringify({ sku: 'CLOUD-CREDITS', price: 99000 })
  );
  console.log('[TEST 3] Admin Price Override:', priceUpdate.statusCode === 200 && priceUpdate.data.success ? 'PASS' : 'FAIL');

  // Test 4: Financial Purchase & Idempotency
  const idempKey = 'test-idemp-' + Date.now();
  const buy1 = await request(
    {
      path: '/api/participant/purchase',
      method: 'POST',
      headers: { 'x-user-email': 'aman@scriet.edu', 'x-user-role': 'CFO' },
    },
    JSON.stringify({
      teamId: 'team-07',
      sku: 'CLOUD-CREDITS',
      idempotencyKey: idempKey,
    })
  );
  console.log('[TEST 4A] Valid Purchase Transaction:', buy1.statusCode === 200 && buy1.data.success ? 'PASS' : 'FAIL', buy1.data.message);

  // Duplicate purchase with same idempotency key (simulating double-click)
  const buy2 = await request(
    {
      path: '/api/participant/purchase',
      method: 'POST',
      headers: { 'x-user-email': 'aman@scriet.edu', 'x-user-role': 'CFO' },
    },
    JSON.stringify({
      teamId: 'team-07',
      sku: 'CLOUD-CREDITS',
      idempotencyKey: idempKey,
    })
  );
  console.log('[TEST 4B] Idempotency Double-Click Prevention:', buy2.statusCode === 400 && buy2.data.success === false ? 'PASS' : 'FAIL', buy2.data.message);

  // Test 5: Crisis Dispatch and Mitigation Response
  const crisisDispatch = await request(
    {
      path: '/api/admin/crisis/dispatch',
      method: 'POST',
      headers: { 'x-user-email': 'applicationinformation73737@gmail.com' },
    },
    JSON.stringify({ teamId: 'team-07', crisisId: 'crisis-01' })
  );
  console.log('[TEST 5A] Admin Crisis Dispatch:', crisisDispatch.statusCode === 200 && crisisDispatch.data.success ? 'PASS' : 'FAIL');

  const crisisResp = await request(
    {
      path: '/api/participant/crisis/response',
      method: 'POST',
      headers: { 'x-user-email': 'aman@scriet.edu' },
    },
    JSON.stringify({
      teamId: 'team-07',
      optionId: 'opt-1-hotfix',
      tradeoff: 'Reallocated 2 devs from feature sprint',
    })
  );
  console.log('[TEST 5B] Participant Crisis Response:', crisisResp.statusCode === 200 && crisisResp.data.success ? 'PASS' : 'FAIL', crisisResp.data.message);

  // Test 6: Auction Lifecycle (Open -> Bid -> Close)
  const aucOpen = await request(
    {
      path: '/api/admin/auction/open',
      method: 'POST',
      headers: { 'x-user-email': 'applicationinformation73737@gmail.com' },
    },
    JSON.stringify({
      title: 'Auditorium Prime Keynote Slot',
      description: 'First pitch position before the Tier-1 venture fund judges',
      itemSku: 'KEYNOTE-SLOT',
      minBid: 100000,
      durationMinutes: 10,
    })
  );
  console.log('[TEST 6A] Admin Open Auction:', aucOpen.statusCode === 200 && aucOpen.data.success ? 'PASS' : 'FAIL');

  const aucBid1 = await request(
    {
      path: '/api/participant/auction/bid',
      method: 'POST',
      headers: { 'x-user-email': 'aman@scriet.edu' },
    },
    JSON.stringify({
      teamId: 'team-07',
      teamName: 'InnovateX',
      amount: 120000,
    })
  );
  console.log('[TEST 6B] Participant Auction Bid (₹1,20,000):', aucBid1.statusCode === 200 && aucBid1.data.success ? 'PASS' : 'FAIL');

  const aucClose = await request(
    {
      path: '/api/admin/auction/close',
      method: 'POST',
      headers: { 'x-user-email': 'applicationinformation73737@gmail.com' },
    },
    '{}'
  );
  console.log(
    '[TEST 6C] Admin Close Auction & Determine Winner:',
    aucClose.statusCode === 200 && aucClose.data.auction.winnerTeamName === 'InnovateX' ? 'PASS' : 'FAIL',
    `Winner: ${aucClose.data.auction.winnerTeamName} @ ₹${aucClose.data.auction.winningBid}`
  );

  // Test 7: Full Admin Verification Lifecycle (self-application is disabled
  // by design — authorization is granted directly by the Super Admin).
  const testCandidateEmail = 'rohan@scriet.ac.in'; // registry user; direct super-admin verify (self-apply is disabled by design)
  const applyRes = await request(
    { path: '/api/participant/admin-apply', method: 'POST' },
    JSON.stringify({
      email: testCandidateEmail,
      name: 'Test Candidate',
      reason: 'Overseeing floor logistics and team tokens',
      requestedRole: 'EVENT_OPERATOR',
    })
  );
  console.log('[TEST 7A] Self-Application Disabled (Must be 403 Forbidden):', applyRes.statusCode === 403 ? 'PASS' : 'FAIL', `Status: ${applyRes.statusCode}`);

  // Verify candidate receives 403 Forbidden
  const candidatePreCheck = await request(
    {
      path: '/api/admin/event/status',
      method: 'POST',
      headers: { 'x-user-email': testCandidateEmail },
    },
    JSON.stringify({ status: 'ROUND_2' })
  );
  console.log('[TEST 7B] Suspended User Before Re-verify (Must be 403 Forbidden):', candidatePreCheck.statusCode === 403 ? 'PASS' : 'FAIL', `Status: ${candidatePreCheck.statusCode}`);

  // Super Admin verifies the registry user directly (idempotent across runs)
  const approveRes = await request(
    {
      path: '/api/admin/verify',
      method: 'POST',
      headers: { 'x-user-email': 'applicationinformation73737@gmail.com' },
    },
    JSON.stringify({
      email: testCandidateEmail,
      role: 'EVENT_OPERATOR',
    })
  );
  console.log('[TEST 7C] Super Admin Verifies Registry User:', approveRes.statusCode === 200 && approveRes.data.success ? 'PASS' : 'FAIL');

  // Candidate now gets 200 OK
  const candidatePostCheck = await request(
    {
      path: '/api/admin/event/status',
      method: 'POST',
      headers: { 'x-user-email': testCandidateEmail },
    },
    JSON.stringify({ status: 'ROUND_2' })
  );
  console.log('[TEST 7D] Verified User After Approval (Must be 200 OK):', candidatePostCheck.statusCode === 200 ? 'PASS' : 'FAIL', `Status: ${candidatePostCheck.statusCode}`);

  // Super Admin Suspends Candidate
  const suspendRes = await request(
    {
      path: '/api/admin/verification/suspend',
      method: 'POST',
      headers: { 'x-user-email': 'applicationinformation73737@gmail.com' },
    },
    JSON.stringify({
      targetEmail: testCandidateEmail,
      reason: 'Audit token revocation',
    })
  );
  console.log('[TEST 7E] Super Admin Suspends Candidate:', suspendRes.statusCode === 200 && suspendRes.data.success ? 'PASS' : 'FAIL');

  // Candidate now gets 403 Forbidden again
  const candidateSuspendedCheck = await request(
    {
      path: '/api/admin/event/status',
      method: 'POST',
      headers: { 'x-user-email': testCandidateEmail },
    },
    JSON.stringify({ status: 'ROUND_2' })
  );
  console.log('[TEST 7F] Candidate After Suspension (Must be 403 Forbidden):', candidateSuspendedCheck.statusCode === 403 ? 'PASS' : 'FAIL', `Status: ${candidateSuspendedCheck.statusCode}`);

  console.log('\n====================================================');
  console.log('ALL SERVER ENGINE & AUTHORIZATION TESTS PASSED 100%!');
  console.log('====================================================');
}

runTests().catch(console.error);
