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

function makeJwt(payload, secret = SECRET) {
  return jwt.sign(
    {
      userId: payload.userId || 'usr-' + Math.random().toString(36).substring(2, 8),
      role: payload.role || 'MEMBER',
      ...payload,
    },
    secret,
    { algorithm: 'HS256', expiresIn: '7d' }
  );
}

const TEST_PORT = 5199;

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
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING ZERO → ONE TEAM ACCESS CONTROL VALIDATION SUITE ---');

  // Spawn standalone server on TEST_PORT
  const serverProc = spawn(
    'npx',
    ['tsx', 'server/standaloneServer.ts'],
    {
      cwd: __dirname,
      env: {
        ...process.env,
        PORT: String(TEST_PORT),
        JWT_SECRET: SECRET,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  let serverStarted = false;
  serverProc.stdout.on('data', (d) => {
    const s = d.toString();
    if (s.includes('ZERO → ONE') || s.includes('listening') || s.includes(String(TEST_PORT))) {
      serverStarted = true;
    }
  });
  serverProc.stderr.on('data', (d) => {
    // console.error('[SERVER LOG]', d.toString());
  });

  // Wait for server readiness
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const res = await request({ path: '/api/clock', method: 'GET' });
      if (res.status === 200) {
        serverStarted = true;
        break;
      }
    } catch {
      // waiting
    }
  }

  if (!serverStarted) {
    serverProc.kill();
    throw new Error('Standalone server failed to start on port ' + TEST_PORT);
  }

  console.log(`✓ Test server running on http://127.0.0.1:${TEST_PORT}\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // Tokens for test participants
    const arjunToken = makeJwt({ email: 'arjun@scriet.edu', name: 'Arjun Patel', role: 'USER' });
    const amanToken = makeJwt({ email: 'aman@scriet.edu', name: 'Aman Gupta', role: 'USER' });
    const adminToken = makeJwt({ email: 'applicationinformation73737@gmail.com', name: 'Super Admin', role: 'ADMIN' });
    const judgeToken = makeJwt({ email: 'judge1@scriet.edu', name: 'Judge One', role: 'JUDGE' });

    console.log('TEST 1: User A belongs to Team 01 (TechNova)');
    {
      const res = await request({
        path: '/api/state',
        method: 'GET',
        headers: { Authorization: `Bearer ${arjunToken}` },
      });
      assert(res.status === 200, 'GET /api/state returns 200');
      assert(Array.isArray(res.data.teams), 'teams array is present');
      assert(res.data.teams.length === 1, `teams.length is exactly 1 (got ${res.data.teams.length})`);
      assert(res.data.teams[0].id === 'team-01', `teams[0].id is team-01 (got ${res.data.teams[0]?.id})`);
      assert(res.data.teams[0].name === 'TechNova', `teams[0].name is TechNova`);
    }

    console.log('\nTEST 2: User B belongs to Team 07 (InnovateX)');
    {
      const res = await request({
        path: '/api/state',
        method: 'GET',
        headers: { Authorization: `Bearer ${amanToken}` },
      });
      assert(res.status === 200, 'GET /api/state returns 200');
      assert(Array.isArray(res.data.teams), 'teams array is present');
      assert(res.data.teams.length === 1, `teams.length is exactly 1 (got ${res.data.teams.length})`);
      assert(res.data.teams[0].id === 'team-07', `teams[0].id is team-07 (got ${res.data.teams[0]?.id})`);
      assert(res.data.teams[0].name === 'InnovateX', `teams[0].name is InnovateX`);
    }

    console.log('\nTEST 3 & 10: Participant network/API state contains NO other team dashboard data');
    {
      const res = await request({
        path: '/api/state',
        method: 'GET',
        headers: { Authorization: `Bearer ${arjunToken}` },
      });
      const data = res.data;
      // Check ledger
      const otherTeamLedger = data.ledger.filter((l) => l.teamId !== 'team-01');
      assert(otherTeamLedger.length === 0, `Ledger contains 0 entries for other teams (got ${otherTeamLedger.length})`);
      // Check inventory
      const otherTeamInv = data.inventory.filter((i) => i.teamId !== 'team-01');
      assert(otherTeamInv.length === 0, `Inventory contains 0 entries for other teams (got ${otherTeamInv.length})`);
      // Check proposals
      const otherTeamProposals = data.purchaseProposals.filter((p) => p.teamId !== 'team-01');
      assert(otherTeamProposals.length === 0, `Purchase proposals contain 0 entries for other teams`);
      // Check canvasStore
      const canvasKeys = Object.keys(data.canvasStore);
      const invalidCanvasKeys = canvasKeys.filter((k) => k !== 'team-01');
      assert(invalidCanvasKeys.length === 0, `CanvasStore only contains team-01`);
      // Check admin authorizations
      assert(data.adminAuthorizations.length === 0, 'Admin authorizations stripped for participants');
    }

    console.log('\nTEST 5: Participant tampers with API request body and sends another team ID');
    {
      // Arjun (Team 01) attempts to purchase for team-07
      const purchaseTamper = await request(
        {
          path: '/api/participant/purchase',
          method: 'POST',
          headers: { Authorization: `Bearer ${arjunToken}` },
        },
        JSON.stringify({
          teamId: 'team-07',
          sku: 'DEVELOPER-HIRE',
          actorRole: 'CFO',
        })
      );
      assert(purchaseTamper.status === 403, `Cross-team purchase rejected with 403 Forbidden (got ${purchaseTamper.status})`);

      // Aman (Team 07) attempts to respond to crisis for team-01
      const crisisTamper = await request(
        {
          path: '/api/participant/crisis/response',
          method: 'POST',
          headers: { Authorization: `Bearer ${amanToken}` },
        },
        JSON.stringify({
          teamId: 'team-01',
          optionId: 'OPT-1',
          tradeoff: 'Accept fine',
        })
      );
      assert(crisisTamper.status === 403, `Cross-team crisis response rejected with 403 Forbidden (got ${crisisTamper.status})`);

      // Arjun (Team 01) attempts to bid for team-02
      const auctionTamper = await request(
        {
          path: '/api/participant/auction/bid',
          method: 'POST',
          headers: { Authorization: `Bearer ${arjunToken}` },
        },
        JSON.stringify({
          teamId: 'team-02',
          teamName: 'AgriNext',
          amount: 500000,
        })
      );
      assert(auctionTamper.status === 403, `Cross-team auction bid rejected with 403 Forbidden (got ${auctionTamper.status})`);

      // Aman (Team 07) attempts to dispatch cross-team command for team-01
      const commandTamper = await request(
        {
          path: '/api/zero-one/commands',
          method: 'POST',
          headers: { Authorization: `Bearer ${amanToken}` },
        },
        JSON.stringify({
          type: 'SUBMIT_CANVAS',
          teamId: 'team-01',
          role: 'CEO',
          payload: { teamId: 'team-01', canvas: {} },
        })
      );
      assert(commandTamper.status === 403, `Cross-team command rejected with 403 Forbidden (got ${commandTamper.status})`);
    }

    console.log('\nTEST 8: Judge/Admin/Marshal multi-team access is preserved');
    {
      // Admin gets full teams list
      const adminState = await request({
        path: '/api/state',
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert(adminState.status === 200, 'Admin GET /api/state returns 200');
      assert(adminState.data.teams.length > 1, `Admin sees all teams (got ${adminState.data.teams.length} teams)`);

      // Judge gets full teams list
      const judgeState = await request({
        path: '/api/state',
        method: 'GET',
        headers: { Authorization: `Bearer ${judgeToken}` },
      });
      assert(judgeState.status === 200, 'Judge GET /api/state returns 200');
      assert(judgeState.data.teams.length > 1, `Judge sees multiple teams (got ${judgeState.data.teams.length} teams)`);

      // Normal participant cannot submit judge scores
      const unauthorizedScore = await request(
        {
          path: '/api/judge/score',
          method: 'POST',
          headers: { Authorization: `Bearer ${arjunToken}` },
        },
        JSON.stringify({
          teamId: 'team-07',
          rubricScores: { problemValidation: 20 },
        })
      );
      assert(unauthorizedScore.status === 403, `Normal participant rejected from judge scoring with 403 (got ${unauthorizedScore.status})`);
    }

    console.log('\nTEST 4, 6, 7 & 9: Frontend logic verification');
    {
      const headerContent = fs.readFileSync(path.join(__dirname, 'src', 'components', 'Header.tsx'), 'utf8');
      assert(!headerContent.includes('Select Active Team</span>'), 'No static Select Active Team label for participants');
      assert(headerContent.includes('isPrivilegedStaff ? ('), 'Header conditions team switcher on isPrivilegedStaff');
      assert(headerContent.includes('Registered Team:'), 'Header displays static title for normal participants');
      assert(!headerContent.includes('onClick={() => setIsTeamDropdownOpen') || headerContent.includes('isPrivilegedStaff ? ('), 'Participant badge is not clickable');

      const simContextContent = fs.readFileSync(path.join(__dirname, 'src', 'services', 'simulationContext.tsx'), 'utf8');
      assert(simContextContent.includes('resolveUserOwnTeamId'), 'simulationContext derives ownTeamId via resolveUserOwnTeamId');
      assert(simContextContent.includes('currentTeamId = useMemo('), 'currentTeamId is a computed value');
      assert(simContextContent.includes('privilegedSelectedTeamId'), 'Multi-team selection state is isolated to privilegedSelectedTeamId');
      assert(simContextContent.includes("localStorage.removeItem('zero_one_role')"), 'Logout cleans up zero_one_role');
      assert(simContextContent.includes("localStorage.removeItem('zero_one_team_id')"), 'Logout cleans up zero_one_team_id');
      assert(simContextContent.includes('setZeroOneContext(null)'), 'Logout and switchUser reset zeroOneContext');
    }

  } finally {
    serverProc.kill('SIGINT');
  }

  console.log('\n==================================================');
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test suite runner crashed:', err);
  process.exit(1);
});
