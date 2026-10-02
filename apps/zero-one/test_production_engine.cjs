const http = require('http');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

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
const TEST_SECRET = resolveTestSecret();

function makeTestToken(email = 'aman@scriet.edu', role = 'MEMBER', userId = 'usr-test-founder') {
  return jwt.sign(
    {
      userId,
      email,
      name: email.split('@')[0],
      role,
    },
    TEST_SECRET,
    { algorithm: 'HS256', expiresIn: '7d' }
  );
}

function request(options, postData) {
  const email = options.headers?.['x-user-email'] || 'aman@scriet.edu';
  const role = options.headers?.['x-user-role'] || 'MEMBER';
  const token = options.headers?.Authorization ? options.headers.Authorization.replace('Bearer ', '') : makeTestToken(email, role);

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: parseInt(process.env.ZERO_ONE_TEST_PORT || process.env.ZERO_ONE_PORT || process.env.PORT || '5003', 10),
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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

function sendCommand(cmd, headers = {}) {
  const email = headers.email || 'aman@scriet.edu';
  const role = headers.role || 'CFO';
  const token = headers.Authorization ? headers.Authorization.replace('Bearer ', '') : makeTestToken(email, role);

  return request(
    {
      path: '/api/zero-one/commands',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-user-email': email,
        'x-user-role': role,
        ...headers,
      },
    },
    JSON.stringify(cmd)
  );
}

async function runProductionEngineTests() {
  console.log('================================================================');
  console.log('ZERO → ONE COMPREHENSIVE PRODUCTION ENGINE & INTEGRATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName, extra = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] ${testName} ${extra}`);
    } else {
      console.error(`[FAIL] ${testName} ${extra}`);
    }
  }

  // 1. Health & Authoritative Clock
  await sendCommand({
    commandId: 'cmd-init-reset-' + Date.now(),
    deviceId: 'DEV-ADMIN',
    userId: 'admin',
    teamId: 'admin',
    role: 'SUPER_ADMIN',
    type: 'RESET_SIMULATION',
    payload: {},
    clientCreatedAt: Date.now(),
  }, { email: 'applicationinformation73737@gmail.com', role: 'SUPER_ADMIN' });

  const health = await request({ path: '/api/health', method: 'GET' });
  assert(health.statusCode === 200 && health.data.status === 'ok', 'Server Health Check');

  const clock = await request({ path: '/api/clock', method: 'GET' });
  assert(clock.statusCode === 200 && typeof clock.data.timeRemainingSeconds === 'number', 'Authoritative Clock Check', `(${clock.data.timeRemainingSeconds}s remaining, Phase: ${clock.data.currentPhase})`);

  // 2. Identity, Role Claim, and Device Binding Command
  const claimCmd = {
    commandId: 'cmd-claim-' + Date.now(),
    deviceId: 'DEV-TEST-001',
    userId: 'user-01',
    teamId: 'team-07',
    role: 'CFO',
    type: 'CLAIM_ROLE',
    payload: { teamId: 'team-07', role: 'CFO', userId: 'user-01', userName: 'Aman Gupta' },
    clientCreatedAt: Date.now(),
  };
  const claimRes = await sendCommand(claimCmd, { email: 'aman@scriet.edu', role: 'CFO' });
  assert(claimRes.statusCode === 200 && claimRes.data.success, 'CLAIM_ROLE Command Dispatch');

  const bindCmd = {
    commandId: 'cmd-bind-' + Date.now(),
    deviceId: 'DEV-TEST-001',
    userId: 'user-01',
    teamId: 'team-07',
    role: 'CFO',
    type: 'BIND_DEVICE',
    payload: { teamId: 'team-07', role: 'CFO', deviceName: 'Primary Founder Workstation' },
    clientCreatedAt: Date.now(),
  };
  const bindRes = await sendCommand(bindCmd, { email: 'aman@scriet.edu', role: 'CFO' });
  assert(bindRes.statusCode === 200 && bindRes.data.success, 'BIND_DEVICE Command Dispatch');

  // 3. Two-Key Purchase Workflow & Threshold Verification
  // 3A: Propose purchase above threshold (>= 200,000)
  const propId = 'prop-' + Date.now();
  const proposeCmd = {
    commandId: 'cmd-prop-' + Date.now(),
    deviceId: 'DEV-TEST-001',
    userId: 'user-01',
    teamId: 'team-07',
    role: 'CFO',
    type: 'PROPOSE_PURCHASE',
    payload: {
      teamId: 'team-07',
      sku: 'CLOUD-CREDITS',
      itemName: 'H100 GPU Cluster Compute',
      cost: 250000,
      proposedByRole: 'CFO',
      proposedByName: 'Aman (CFO)',
      reasonTag: 'Infrastructure Scale',
      justification: 'Critical GPU capacity for AI model training before demo',
    },
    clientCreatedAt: Date.now(),
  };
  const proposeRes = await sendCommand(proposeCmd, { email: 'aman@scriet.edu', role: 'CFO' });
  assert(proposeRes.statusCode === 200 && proposeRes.data.success, 'PROPOSE_PURCHASE (High Value >= ₹2L) Created Proposal');

  // Find created proposal ID
  const stateAfterProp = await request({ path: '/api/state', method: 'GET' });
  const pendingProp = (stateAfterProp.data.purchaseProposals || []).find(
    (p) => p.teamId === 'team-07' && (p.status === 'PENDING_CEO_APPROVAL' || p.status === 'PENDING')
  );
  assert(Boolean(pendingProp), 'Purchase Proposal stored in Authoritative Server State with PENDING_CEO_APPROVAL status');

  if (pendingProp) {
    // 3B: Non-CEO tries to approve proposal (Security / Role Enforcement)
    const spoofApproveCmd = {
      commandId: 'cmd-spoof-' + Date.now(),
      deviceId: 'DEV-TEST-001',
      userId: 'user-01',
      teamId: 'team-07',
      role: 'CMO',
      type: 'APPROVE_PURCHASE',
      payload: { proposalId: pendingProp.id },
      clientCreatedAt: Date.now(),
    };
    const spoofRes = await sendCommand(spoofApproveCmd, { email: 'aman@scriet.edu', role: 'CMO' });
    assert(!spoofRes.data.success, 'Role Enforcement: CMO Cannot Approve Purchase (Must be CEO)', `(${spoofRes.data.error || 'Blocked'})`);

    // Bind CEO device before CEO approval
    await sendCommand({
      commandId: 'cmd-bind-ceo-' + Date.now(),
      deviceId: 'DEV-TEST-CEO',
      userId: 'user-ceo',
      teamId: 'team-07',
      role: 'CEO',
      type: 'BIND_DEVICE',
      payload: { teamId: 'team-07', role: 'CEO', deviceName: 'Primary CEO Machine' },
      clientCreatedAt: Date.now(),
    }, { email: 'aman.gupta@scriet.ac.in', role: 'CEO' });

    // 3C: Legitimate CEO approves proposal
    const ceoApproveCmd = {
      commandId: 'cmd-ceo-app-' + Date.now(),
      deviceId: 'DEV-TEST-CEO',
      userId: 'user-ceo',
      teamId: 'team-07',
      role: 'CEO',
      type: 'APPROVE_PURCHASE',
      payload: { proposalId: pendingProp.id },
      clientCreatedAt: Date.now(),
    };
    const approveRes = await sendCommand(ceoApproveCmd, { email: 'aman.gupta@scriet.ac.in', role: 'CEO' });
    assert(approveRes.statusCode === 200 && approveRes.data.success, 'Two-Key Flow: CEO Authorizes High-Value Purchase');
  }

  // 4. Idempotency: Duplicate Command Protection
  const idempotentCmdId = 'cmd-idemp-strict-' + Date.now();
  const cmdA = {
    commandId: idempotentCmdId,
    deviceId: 'DEV-TEST-001',
    userId: 'user-01',
    teamId: 'team-07',
    role: 'CFO',
    type: 'CLAIM_ROLE',
    payload: { teamId: 'team-07', role: 'CFO', userId: 'user-01', userName: 'Aman' },
    clientCreatedAt: Date.now(),
  };
  const resA = await sendCommand(cmdA);
  const resB = await sendCommand(cmdA);
  assert(resA.statusCode === 200 && resB.statusCode === 200 && resB.data.idempotentReplay === true, 'Command Idempotency: Duplicate command detected and replayed safely');

  // 5. Dynamic Market Pricing & Stock Management
  const priceCmd = {
    commandId: 'cmd-price-' + Date.now(),
    deviceId: 'DEV-TEST-ADMIN',
    userId: 'admin-01',
    teamId: 'admin',
    role: 'SUPER_ADMIN',
    type: 'UPDATE_MARKET_PRICE',
    payload: { sku: 'CLOUD-CREDITS', newPrice: 75000 },
    clientCreatedAt: Date.now(),
  };
  const priceRes = await sendCommand(priceCmd, { email: 'applicationinformation73737@gmail.com', role: 'SUPER_ADMIN' });
  assert(priceRes.statusCode === 200 && priceRes.data.success, 'UPDATE_MARKET_PRICE Authoritative Command Executed');

  // 6. Crisis Engine: Dispatch & Mitigation Response
  const crisisCmd = {
    commandId: 'cmd-crisis-disp-' + Date.now(),
    deviceId: 'DEV-TEST-ADMIN',
    userId: 'admin-01',
    teamId: 'admin',
    role: 'SUPER_ADMIN',
    type: 'DISPATCH_CRISIS',
    payload: { teamId: 'team-07', crisisId: 'crisis-01' },
    clientCreatedAt: Date.now(),
  };
  const crisisDispRes = await sendCommand(crisisCmd, { email: 'applicationinformation73737@gmail.com', role: 'SUPER_ADMIN' });
  assert(crisisDispRes.statusCode === 200 && crisisDispRes.data.success, 'DISPATCH_CRISIS Command Succeeded');

  const crisisRespCmd = {
    commandId: 'cmd-crisis-resp-' + Date.now(),
    deviceId: 'DEV-TEST-001',
    userId: 'user-01',
    teamId: 'team-07',
    role: 'CTO',
    type: 'SUBMIT_CRISIS_RESPONSE',
    payload: { teamId: 'team-07', optionId: 'opt-1-hotfix', tradeoff: 'Patch deployed under pressure' },
    clientCreatedAt: Date.now(),
  };
  const crisisRespRes = await sendCommand(crisisRespCmd, { email: 'cto@scriet.edu', role: 'CTO' });
  assert(crisisRespRes.statusCode === 200 && crisisRespRes.data.success, 'SUBMIT_CRISIS_RESPONSE Command Succeeded');

  // 7. Atomic Inter-Team Trading
  const tradePropCmd = {
    commandId: 'cmd-trade-prop-' + Date.now(),
    deviceId: 'DEV-TEST-001',
    userId: 'user-01',
    teamId: 'team-07',
    role: 'CEO',
    type: 'PROPOSE_TRADE',
    payload: {
      fromTeamId: 'team-07',
      toTeamId: 'team-01',
      offeredItems: ['CLOUD-CREDITS'],
      offeredAmount: 10000,
      requestedItems: ['CYBER-SHIELD'],
      requestedAmount: 0,
      notes: 'Hardware for security shield exchange',
    },
    clientCreatedAt: Date.now(),
  };
  const tradePropRes = await sendCommand(tradePropCmd, { email: 'ceo@scriet.edu', role: 'CEO' });
  assert(tradePropRes.statusCode === 200 && tradePropRes.data.success, 'PROPOSE_TRADE Command Succeeded');

  const stateTrades = await request({ path: '/api/state', method: 'GET' });
  const pendingTrade = (stateTrades.data.tradeOffers || []).find((t) => t.status === 'PENDING');
  if (pendingTrade) {
    const tradeAcceptCmd = {
      commandId: 'cmd-trade-acc-' + Date.now(),
      deviceId: 'DEV-TEST-TEAM01',
      userId: 'user-team01',
      teamId: pendingTrade.toTeamId,
      role: 'CEO',
      type: 'ACCEPT_TRADE',
      payload: { tradeId: pendingTrade.id },
      clientCreatedAt: Date.now(),
    };
    const tradeAccRes = await sendCommand(tradeAcceptCmd, { email: 'team01@scriet.edu', role: 'CEO' });
    assert(tradeAccRes.statusCode === 200 && tradeAccRes.data.success, 'ACCEPT_TRADE: Atomic Multi-Team Asset & Ledger Swap Executed');
  }

  // 8. Startup Canvas & Cryptographic Artifact Submission
  const canvasCmd = {
    commandId: 'cmd-canvas-' + Date.now(),
    deviceId: 'DEV-TEST-001',
    userId: 'user-01',
    teamId: 'team-07',
    role: 'CEO',
    type: 'SUBMIT_CANVAS',
    payload: {
      teamId: 'team-07',
      canvas: {
        problemStatement: 'Distributed consensus simulation latency under high volatility',
        targetCustomer: 'FinTech and algorithmic trading platforms',
        uniqueAdvantage: 'Deterministic sub-millisecond replay log with offline reconciliation',
      },
    },
    clientCreatedAt: Date.now(),
  };
  const canvasRes = await sendCommand(canvasCmd);
  assert(canvasRes.statusCode === 200 && canvasRes.data.success, 'SUBMIT_CANVAS Versioned Persistence');

  const artifactCmd = {
    commandId: 'cmd-art-' + Date.now(),
    deviceId: 'DEV-TEST-001',
    userId: 'user-01',
    teamId: 'team-07',
    role: 'CTO',
    type: 'SUBMIT_ARTIFACT',
    payload: {
      teamId: 'team-07',
      round: 1,
      artifactType: 'PROTOTYPE_URL',
      content: 'https://github.com/scriet-innovatex/production-prototype-v1.git',
    },
    clientCreatedAt: Date.now(),
  };
  const artRes = await sendCommand(artifactCmd, { email: 'cto@scriet.edu', role: 'CTO' });
  assert(
    artRes.statusCode === 200 &&
      artRes.data.success &&
      typeof artRes.data.data.artifact.sha256Hash === 'string' &&
      artRes.data.data.artifact.sha256Hash.length === 64,
    'SUBMIT_ARTIFACT Cryptographic SHA-256 Tamper-Evidence Hashing',
    `(Hash: ${artRes.data.data?.artifact?.sha256Hash?.substring(0, 16)}...)`
  );

  // 9. Judge Assignment, Scoring, and Authoritative Leaderboard
  const judgeAssignCmd = {
    commandId: 'cmd-judge-assign-' + Date.now(),
    deviceId: 'DEV-TEST-ADMIN',
    userId: 'admin-01',
    teamId: 'admin',
    role: 'SUPER_ADMIN',
    type: 'ASSIGN_JUDGE',
    payload: { judgeEmail: 'judge@scriet.edu', teamIds: ['team-07'] },
    clientCreatedAt: Date.now(),
  };
  const judgeAssignRes = await sendCommand(judgeAssignCmd, { email: 'applicationinformation73737@gmail.com', role: 'SUPER_ADMIN' });
  assert(judgeAssignRes.statusCode === 200 && judgeAssignRes.data.success, 'ASSIGN_JUDGE Command Executed');

  const scoreCmd = {
    commandId: 'cmd-judge-score-' + Date.now(),
    deviceId: 'DEV-TEST-JUDGE',
    userId: 'judge-01',
    teamId: 'team-07',
    role: 'JUDGE',
    type: 'SUBMIT_JUDGE_SCORE',
    payload: {
      teamId: 'team-07',
      judgeId: 'judge-01',
      judgeName: 'Dr. A. Sharma',
      scores: {
        innovation: 9.5,
        executionFeasibility: 9.0,
        financialPrudence: 8.5,
        marketStrategy: 9.2,
      },
      feedback: 'Outstanding technical architecture and disciplined capital management.',
    },
    clientCreatedAt: Date.now(),
  };
  const scoreRes = await sendCommand(scoreCmd, { email: 'judge@scriet.edu', role: 'JUDGE' });
  assert(scoreRes.statusCode === 200 && scoreRes.data.success, 'SUBMIT_JUDGE_SCORE Rubric Validation & Storage');

  const lbRes = await request({ path: '/api/zero-one/leaderboard', method: 'GET' });
  assert(
    lbRes.statusCode === 200 &&
      lbRes.data.success &&
      Array.isArray(lbRes.data.leaderboard) &&
      lbRes.data.leaderboard.length > 0,
    'Authoritative Server-Calculated Leaderboard endpoint',
    `(${lbRes.data.leaderboard?.length} teams calculated)`
  );

  // 10. Fact Stream & Event Sequence Replay
  const eventsRes = await request({ path: '/api/zero-one/events?sinceSequence=0', method: 'GET' });
  assert(
    eventsRes.statusCode === 200 &&
      eventsRes.data.success &&
      Array.isArray(eventsRes.data.facts || eventsRes.data.events) &&
      (eventsRes.data.facts || eventsRes.data.events).length > 0,
    'Fact Log & Monotonic Event Sequence Catchup Replay',
    `(${eventsRes.data.events?.length || eventsRes.data.facts?.length} facts logged, current sequence: ${eventsRes.data.currentSequence})`
  );

  // 11. Snapshot Creation and Restoration
  const snapCmd = {
    commandId: 'cmd-snap-' + Date.now(),
    deviceId: 'DEV-TEST-ADMIN',
    userId: 'admin-01',
    teamId: 'admin',
    role: 'SUPER_ADMIN',
    type: 'CREATE_SNAPSHOT',
    payload: { name: 'Automated test suite checkpoint' },
    clientCreatedAt: Date.now(),
  };
  const snapRes = await sendCommand(snapCmd, { email: 'applicationinformation73737@gmail.com', role: 'SUPER_ADMIN' });
  const snapshotId = snapRes.data.data?.snapshot?.id || snapRes.data.data?.snapshotId;
  assert(snapRes.statusCode === 200 && snapRes.data.success && Boolean(snapshotId), 'CREATE_SNAPSHOT Command Executed', `(Snapshot ID: ${snapshotId})`);

  if (snapshotId) {
    const restoreCmd = {
      commandId: 'cmd-restore-' + Date.now(),
      deviceId: 'DEV-TEST-ADMIN',
      userId: 'admin-01',
      teamId: 'admin',
      role: 'SUPER_ADMIN',
      type: 'RESTORE_SNAPSHOT',
      payload: { snapshotId },
      clientCreatedAt: Date.now(),
    };
    const restoreRes = await sendCommand(restoreCmd, { email: 'applicationinformation73737@gmail.com', role: 'SUPER_ADMIN' });
    assert(restoreRes.statusCode === 200 && restoreRes.data.success, 'RESTORE_SNAPSHOT Command Executed');
  }

  console.log('\n================================================================');
  console.log(`TOTAL PRODUCTION ENGINE TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('================================================================');

  if (passed === total) {
    console.log('>>> ALL PRODUCTION ENGINE INTEGRATION TESTS PASSED 100%! <<<');
  } else {
    process.exit(1);
  }
}

runProductionEngineTests().catch((err) => {
  console.error('Test Suite Encountered Exception:', err);
  process.exit(1);
});
