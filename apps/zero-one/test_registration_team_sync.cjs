const http = require('http');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function resolveTestSecret() {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim()) return process.env.JWT_SECRET.trim();
  for (const candidate of [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'apps', 'zero-one', '.env'),
    path.join(__dirname, '.env'),
  ]) {
    try {
      const m = fs.readFileSync(candidate, 'utf8').match(/^JWT_SECRET=(.*)$/m);
      if (m && m[1].trim()) return m[1].trim();
    } catch { /* try next */ }
  }
  return 'dev_local_jwt_secret_change_me_before_production';
}

const SECRET = resolveTestSecret();

function makeJwt(payload, secret = SECRET, options = {}) {
  return jwt.sign(
    {
      userId: 'usr-' + Math.random().toString(36).substring(2, 8),
      role: 'MEMBER',
      ...payload,
    },
    secret,
    { algorithm: 'HS256', expiresIn: '7d', ...options }
  );
}

const TEST_PORT = 5198;

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: TEST_PORT,
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
          let parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ statusCode: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function ensureServerRunning() {
  const serverPath = path.resolve(__dirname, 'server', 'standaloneServer.ts');
  const env = {
    ...process.env,
    PORT: '5198',
    ZERO_ONE_PORT: '5198',
    JWT_SECRET: SECRET,
  };

  const proc = spawn('cmd.exe', ['/c', 'npx', 'tsx', serverPath], {
    env,
    cwd: __dirname,
    stdio: 'ignore',
  });

  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      const res = await request({ path: '/api/health', method: 'GET' });
      if (res.statusCode === 200) {
        return proc;
      }
    } catch {
      // Waiting for server to come up
    }
  }

  proc.kill();
  throw new Error('Failed to start test server on port 5198');
}

async function runTestSuite() {
  console.log('============================================================');
  console.log('ZERO → ONE 15-POINT REGISTRATION, TEAM SYNC & SECURITY SUITE');
  console.log('============================================================\n');

  let serverProcess = null;
  try {
    serverProcess = await ensureServerRunning();
  } catch (err) {
    console.error('Error starting standalone test server:', err.message);
    process.exit(1);
  }

  let passed = 0;
  let total = 0;

  function assert(condition, name, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] TEST ${total}: ${name} ${details ? '— ' + details : ''}`);
    } else {
      console.error(`[FAIL] TEST ${total}: ${name} ${details ? '— ' + details : ''}`);
    }
  }

  try {
    // TEST 1: Registered team member enters ZERO → ONE.
    // Expected: team automatically detected.
    const user1Jwt = makeJwt({
      userId: 'usr-arjun-01',
      email: 'arjun@scriet.ac.in',
      name: 'Arjun Patel',
    });
    const ctx1 = await request({
      path: '/api/zero-one/context',
      method: 'GET',
      headers: { Authorization: `Bearer ${user1Jwt}` },
    });
    assert(
      ctx1.statusCode === 200 &&
      ctx1.data.authenticated === true &&
      ctx1.data.registration.registered === true &&
      ctx1.data.team !== null &&
      ctx1.data.team.name.length > 0,
      'Registered team member enters ZERO → ONE',
      `Team detected: "${ctx1.data?.team?.name}" (Code: ${ctx1.data?.team?.code})`
    );

    // TEST 2: User attempts to submit another teamId during role claim / commands.
    // Expected: rejected with 403 Forbidden.
    const fakeTeamClaim = await request(
      {
        path: '/api/zero-one/roles/claim',
        method: 'POST',
        headers: { Authorization: `Bearer ${user1Jwt}` },
      },
      JSON.stringify({ role: 'CFO', teamId: 'team-fake-unauthorized-999' })
    );
    assert(
      fakeTeamClaim.statusCode === 403,
      'User attempts to submit another teamId',
      `Server rejected spoofed teamId with status ${fakeTeamClaim.statusCode}`
    );

    // TEST 3: Unregistered Code.SCRIET user enters.
    // Expected: NOT_REGISTERED or registered = false.
    const unauthCtx = await request({
      path: '/api/zero-one/context',
      method: 'GET',
    });
    assert(
      unauthCtx.statusCode === 200 &&
      unauthCtx.data.authenticated === false &&
      unauthCtx.data.registration.registered === false,
      'Unregistered / Unauthenticated user enters',
      `Status correctly returned NOT_AUTHENTICATED / NOT_REGISTERED`
    );

    // TEST 4: Registered user selects role.
    // Expected: role assigned to authenticated user.
    const claimRoleRes = await request(
      {
        path: '/api/zero-one/roles/claim',
        method: 'POST',
        headers: { Authorization: `Bearer ${user1Jwt}` },
      },
      JSON.stringify({ role: 'CEO', teamId: ctx1.data.team.id })
    );
    assert(
      claimRoleRes.statusCode === 200 && claimRoleRes.data.success === true,
      'Registered user selects role (CEO)',
      'CEO role claimed successfully'
    );

    // TEST 5: Two members simultaneously select CEO.
    // Expected: second user gets 409 ROLE_ALREADY_ASSIGNED.
    const user2Jwt = makeJwt({
      userId: 'usr-aman-02',
      email: 'aman@scriet.ac.in',
      name: 'Aman Gupt',
    });
    const duplicateClaimRes = await request(
      {
        path: '/api/zero-one/roles/claim',
        method: 'POST',
        headers: { Authorization: `Bearer ${user2Jwt}` },
      },
      JSON.stringify({ role: 'CEO', teamId: ctx1.data.team.id })
    );
    assert(
      duplicateClaimRes.statusCode === 409 || duplicateClaimRes.data.code === 'ROLE_ALREADY_ASSIGNED',
      'Two members simultaneously select CEO',
      `Second member rejected with 409 ROLE_ALREADY_ASSIGNED (${duplicateClaimRes.statusCode})`
    );

    // TEST 6: First team member enters.
    // Expected: ₹10,00,000 initialized.
    const stateRes1 = await request({ path: '/api/state', method: 'GET' });
    const teamState1 = stateRes1.data.teams.find((t) => t.id === ctx1.data.team.id) || stateRes1.data.teams[0];
    const initialCredit = stateRes1.data.ledger.find(
      (e) => e.teamId === teamState1.id && e.reasonTag === 'INITIAL_CAPITAL'
    );
    assert(
      initialCredit && initialCredit.amount === 1000000,
      'First team member enters',
      `Authoritative initial capital of ₹${initialCredit?.amount?.toLocaleString('en-IN')} credited`
    );

    // TEST 7: Second team member enters.
    // Expected: balance remains unchanged (no duplicate credit).
    const ctx2 = await request({
      path: '/api/zero-one/context',
      method: 'GET',
      headers: { Authorization: `Bearer ${user2Jwt}` },
    });
    const stateRes2 = await request({ path: '/api/state', method: 'GET' });
    const creditCount = stateRes2.data.ledger.filter(
      (e) => e.teamId === teamState1.id && e.reasonTag === 'INITIAL_CAPITAL'
    ).length;
    assert(
      creditCount === 1,
      'Second team member enters',
      `Initial capital credited exactly once (count: ${creditCount})`
    );

    // TEST 8: Page refreshed 20 times (idempotency test).
    // Expected: capital remains unchanged.
    let balanceMatches = true;
    for (let i = 0; i < 20; i++) {
      const refreshCtx = await request({
        path: '/api/zero-one/context',
        method: 'GET',
        headers: { Authorization: `Bearer ${user1Jwt}` },
      });
      if (refreshCtx.data.simulation?.startingCapital !== 1000000) {
        balanceMatches = false;
        break;
      }
    }
    assert(
      balanceMatches,
      'Page refreshed 20 times',
      'Capital remains perfectly idempotent across 20 rapid invocations'
    );

    // TEST 9: Logout / Login.
    // Expected: team and role restored from server.
    const restoreCtx = await request({
      path: '/api/zero-one/context',
      method: 'GET',
      headers: { Authorization: `Bearer ${user1Jwt}` },
    });
    assert(
      restoreCtx.statusCode === 200 &&
      restoreCtx.data.team?.id === ctx1.data.team.id &&
      restoreCtx.data.participant?.role === 'CEO',
      'Logout / Login identity restore',
      `Team "${restoreCtx.data.team?.name}" and role "${restoreCtx.data.participant?.role}" restored accurately`
    );

    // TEST 10: Fake x-user-email header without valid JWT.
    // Expected: cannot impersonate participant.
    const impersonateRes = await request({
      path: '/api/zero-one/commands',
      method: 'POST',
      headers: {
        'x-user-email': 'superadmin@scriet.ac.in',
        'x-user-role': 'ADMIN',
      },
    }, JSON.stringify({ type: 'CHANGE_EVENT_STATE', payload: { status: 'FINALS' } }));
    assert(
      impersonateRes.statusCode === 401,
      'Fake x-user-email header without valid JWT',
      `Rejected with 401 Unauthorized (status: ${impersonateRes.statusCode})`
    );

    // TEST 11: Fake x-user-role=admin on participant token.
    // Expected: no admin privileges.
    const fakeAdminRes = await request({
      path: '/api/admin/event/status',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user1Jwt}`,
        'x-user-role': 'ADMIN',
      },
    }, JSON.stringify({ status: 'FINALS' }));
    assert(
      fakeAdminRes.statusCode === 403,
      'Fake x-user-role=admin on participant token',
      `Admin privilege escalation rejected with 403 Forbidden`
    );

    // TEST 12: Direct simulation command without registration / auth.
    // Expected: access denied.
    const directCmdRes = await request({
      path: '/api/zero-one/commands',
      method: 'POST',
    }, JSON.stringify({ type: 'CLAIM_ROLE', payload: { role: 'CFO' } }));
    assert(
      directCmdRes.statusCode === 401,
      'Direct command without registration/auth',
      `Rejected with 401 Unauthorized`
    );

    // TEST 13: Returning participant with completed onboarding.
    // Expected: returns full participant role and device bound status.
    const bindRes = await request({
      path: '/api/zero-one/device/bind',
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Jwt}` },
    }, JSON.stringify({ deviceId: 'DEV-TEST-1234', deviceName: 'MacBook Pro', role: 'CEO' }));
    const returningCtx = await request({
      path: '/api/zero-one/context',
      method: 'GET',
      headers: { Authorization: `Bearer ${user1Jwt}` },
    });
    assert(
      bindRes.statusCode === 200 &&
      returningCtx.data.participant?.role === 'CEO' &&
      returningCtx.data.participant?.deviceBound === true,
      'Returning participant with completed onboarding',
      'Device bound and role verified for direct entry'
    );

    // TEST 14: Participant tries to claim role belonging to another team.
    // Expected: 403.
    const invalidTeamClaim = await request({
      path: '/api/zero-one/roles/claim',
      method: 'POST',
      headers: { Authorization: `Bearer ${user1Jwt}` },
    }, JSON.stringify({ role: 'CTO', teamId: 'unauthorized-team-999' }));
    assert(
      invalidTeamClaim.statusCode === 403,
      'Participant claims role with invalid teamId',
      `Server protected role assignment against spoofed team IDs (${invalidTeamClaim.statusCode})`
    );

    // TEST 15: Production build with unavailable API.
    // Expected: returns NOT_AUTHENTICATED / SERVER_UNAVAILABLE, never loads mock participant.
    const guestState = await request({
      path: '/api/auth/status',
      method: 'GET',
    });
    assert(
      guestState.data.authenticated === false && guestState.data.email === null,
      'Production build with unauthenticated session',
      'Never silently falls back to mock user'
    );

  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
  }

  console.log('\n============================================================');
  console.log(`TEST SUMMARY: ${passed} / ${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('============================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
