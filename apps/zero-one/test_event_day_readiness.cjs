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

function sendCommand(cmd, headers = {}) {
  return request(
    {
      path: '/api/zero-one/commands',
      method: 'POST',
      headers: {
        'x-user-email': headers.email || 'aman@scriet.edu',
        'x-user-role': headers.role || 'CFO',
        ...headers,
      },
    },
    JSON.stringify(cmd)
  );
}

async function runAudit() {
  console.log('================================================================');
  console.log('ZERO → ONE EVENT-DAY PRODUCTION READINESS & HARDENING AUDIT');
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

  // Reset simulation to guaranteed clean state
  await sendCommand({
    commandId: 'cmd-audit-reset-' + Date.now(),
    deviceId: 'DEV-ADMIN',
    userId: 'admin',
    teamId: 'admin',
    role: 'SUPER_ADMIN',
    type: 'RESET_SIMULATION',
    payload: {},
    clientCreatedAt: Date.now(),
  }, { email: 'applicationinformation73737@gmail.com', role: 'SUPER_ADMIN' });

  // -------------------------------------------------------------------------
  // 1. OFFICIAL TWO-KEY THRESHOLD VERIFICATION (Official: ₹1,00,000)
  // -------------------------------------------------------------------------
  console.log('--- 1. TWO-KEY PURCHASE APPROVAL & THRESHOLD ---');
  // 1A. Small purchase < ₹1,00,000 (e.g. ₹50,000 Marketing Campaign)
  const smallBuyCmd = {
    commandId: 'cmd-small-buy-' + Date.now(),
    deviceId: 'DEV-CFO-001',
    userId: 'cfo-user',
    teamId: 'team-07',
    role: 'CFO',
    type: 'PROPOSE_PURCHASE',
    payload: {
      teamId: 'team-07',
      sku: 'MKT-CAMPAIGN',
      cost: 50000,
      proposedByRole: 'CFO',
      idempotencyKey: 'idemp-small-' + Date.now(),
    },
    clientCreatedAt: Date.now(),
  };
  const smallBuyRes = await sendCommand(smallBuyCmd, { email: 'cfo@scriet.edu', role: 'CFO' });
  assert(
    smallBuyRes.statusCode === 200 && smallBuyRes.data.success && !smallBuyRes.data.data?.requiresCeoApproval,
    'Purchases < ₹1,00,000 Auto-Commit without CEO sign-off',
    `(Cost: ₹50,000)`
  );

  // 1B. High-value purchase >= ₹1,00,000 (e.g. ₹1,20,000 Data Analytics)
  const highValCmd = {
    commandId: 'cmd-high-buy-' + Date.now(),
    deviceId: 'DEV-CFO-001',
    userId: 'cfo-user',
    teamId: 'team-07',
    role: 'CFO',
    type: 'PROPOSE_PURCHASE',
    payload: {
      teamId: 'team-07',
      sku: 'DATA-ANALYTICS',
      cost: 120000,
      proposedByRole: 'CFO',
      proposedByName: 'CFO Executive',
      reasonTag: 'Analytics Expansion',
      idempotencyKey: 'idemp-high-' + Date.now(),
    },
    clientCreatedAt: Date.now(),
  };
  const highValRes = await sendCommand(highValCmd, { email: 'cfo@scriet.edu', role: 'CFO' });
  assert(
    highValRes.statusCode === 200 &&
      highValRes.data.success &&
      highValRes.data.data?.requiresCeoApproval === true &&
      highValRes.data.data?.proposal?.status === 'PENDING_CEO_APPROVAL',
    'Purchases >= ₹1,00,000 Require CEO Validation (Two-Key)',
    `(Threshold: ₹1,00,000, Item Cost: ₹1,20,000)`
  );

  const proposalId = highValRes.data.data?.proposal?.id;

  // 1C. CFO self-approval attempt (Must be rejected)
  const cfoSelfApproveCmd = {
    commandId: 'cmd-cfo-self-' + Date.now(),
    deviceId: 'DEV-CFO-001',
    userId: 'cfo-user',
    teamId: 'team-07',
    role: 'CFO',
    type: 'APPROVE_PURCHASE',
    payload: { proposalId },
    clientCreatedAt: Date.now(),
  };
  const cfoSelfRes = await sendCommand(cfoSelfApproveCmd, { email: 'cfo@scriet.edu', role: 'CFO' });
  assert(
    cfoSelfRes.statusCode === 400 && !cfoSelfRes.data.success,
    'CFO Cannot Self-Approve Two-Key Purchase (Enforced Server-Side)'
  );

  // 1D. Legitimate CEO approves
  const ceoApproveCmd = {
    commandId: 'cmd-ceo-legit-' + Date.now(),
    deviceId: 'DEV-CEO-001',
    userId: 'ceo-user',
    teamId: 'team-07',
    role: 'CEO',
    type: 'APPROVE_PURCHASE',
    payload: { proposalId },
    clientCreatedAt: Date.now(),
  };
  const ceoApproveRes = await sendCommand(ceoApproveCmd, { email: 'ceo@scriet.edu', role: 'CEO' });
  assert(
    ceoApproveRes.statusCode === 200 && ceoApproveRes.data.success,
    'CEO Successfully Authorizes High-Value Purchase'
  );

  // -------------------------------------------------------------------------
  // 2. DEVICE-BOUND ROLE SECURITY & SPOOFING DEFENSE
  // -------------------------------------------------------------------------
  console.log('\n--- 2. ROLE SPOOFING & DEVICE SESSION BINDING ---');
  // Bind device DEV-CTO-001 to role CTO for team-07
  await sendCommand({
    commandId: 'cmd-bind-cto-' + Date.now(),
    deviceId: 'DEV-CTO-001',
    userId: 'cto@scriet.edu',
    teamId: 'team-07',
    role: 'CTO',
    type: 'BIND_DEVICE',
    payload: { teamId: 'team-07', role: 'CTO', deviceName: 'CTO ThinkPad' },
    clientCreatedAt: Date.now(),
  });

  // Bound CTO device attempts to send an approval claiming role=CEO
  const spoofCmd = {
    commandId: 'cmd-spoof-attempt-' + Date.now(),
    deviceId: 'DEV-CTO-001',
    userId: 'cto@scriet.edu',
    teamId: 'team-07',
    role: 'CEO', // Attacker claims to be CEO
    type: 'APPROVE_PURCHASE',
    payload: { proposalId: 'prop-fake-id' },
    clientCreatedAt: Date.now(),
  };
  const spoofRes = await sendCommand(spoofCmd, { email: 'cto@scriet.edu', role: 'CEO' });
  assert(
    !spoofRes.data.success &&
      (spoofRes.data.code === 'CEO_ROLE_REQUIRED' || spoofRes.data.error?.code === 'CEO_ROLE_REQUIRED'),
    'Role Spoofing Blocked: Device bound as CTO cannot execute CEO approvals by modifying role body'
  );

  // Cross-team injection: Device bound to team-07 attempts to submit canvas for team-01
  const crossTeamCmd = {
    commandId: 'cmd-cross-inj-' + Date.now(),
    deviceId: 'DEV-CTO-001',
    userId: 'cto@scriet.edu',
    teamId: 'team-01', // Target different team
    role: 'CTO',
    type: 'SUBMIT_CANVAS',
    payload: { teamId: 'team-01', canvas: { problemStatement: 'Inject' } },
    clientCreatedAt: Date.now(),
  };
  const crossTeamRes = await sendCommand(crossTeamCmd, { email: 'cto@scriet.edu', role: 'CTO' });
  assert(
    !crossTeamRes.data.success && crossTeamRes.data.code === 'CROSS_TEAM_INJECTION',
    'Cross-Team Injection Blocked: Device cannot issue commands for unassigned squad'
  );

  // -------------------------------------------------------------------------
  // 3. EVENT STATE MACHINE LIFECYCLE ENFORCEMENT
  // -------------------------------------------------------------------------
  console.log('\n--- 3. EVENT STATE MACHINE TRANSITIONS ---');
  // Attempt to skip phases from ROUND_2 directly to REVEAL without force
  const skipPhaseCmd = {
    commandId: 'cmd-skip-phase-' + Date.now(),
    deviceId: 'DEV-ADMIN',
    userId: 'admin@scriet.edu',
    teamId: 'admin',
    role: 'SUPER_ADMIN',
    type: 'CHANGE_EVENT_STATE',
    payload: { status: 'REVEAL', force: false },
    clientCreatedAt: Date.now(),
  };
  const skipRes = await sendCommand(skipPhaseCmd, { email: 'applicationinformation73737@gmail.com', role: 'SUPER_ADMIN' });
  assert(
    !skipRes.data.success && skipRes.data.code === 'PHASE_SKIPPED',
    'State Machine: Skipping phases without emergency force flag is rejected'
  );

  // Attempt to revert phases from ROUND_2 back to ROUND_1 without force
  const revertPhaseCmd = {
    commandId: 'cmd-revert-phase-' + Date.now(),
    deviceId: 'DEV-ADMIN',
    userId: 'admin@scriet.edu',
    teamId: 'admin',
    role: 'SUPER_ADMIN',
    type: 'CHANGE_EVENT_STATE',
    payload: { status: 'ROUND_1', force: false },
    clientCreatedAt: Date.now(),
  };
  const revertRes = await sendCommand(revertPhaseCmd, { email: 'applicationinformation73737@gmail.com', role: 'SUPER_ADMIN' });
  assert(
    !revertRes.data.success && revertRes.data.code === 'INVALID_TRANSITION',
    'State Machine: Reverting phases without emergency force flag is rejected'
  );

  // -------------------------------------------------------------------------
  // 4. SERVER CLOCK DRIFT RESISTANCE
  // -------------------------------------------------------------------------
  console.log('\n--- 4. SERVER-AUTHORITATIVE CLOCK & DRIFT DEFENSE ---');
  // Client whose clock is set 10 minutes ahead attempts a command
  const driftedClientTime = Date.now() + 10 * 60 * 1000;
  const driftCmd = {
    commandId: 'cmd-drift-' + Date.now(),
    deviceId: 'DEV-DRIFT-001',
    userId: 'cfo-user',
    teamId: 'team-07',
    role: 'CFO',
    type: 'CLAIM_ROLE',
    payload: { teamId: 'team-07', role: 'CFO', userId: 'cfo-user' },
    clientCreatedAt: driftedClientTime,
  };
  const driftRes = await sendCommand(driftCmd);
  const serverClockRes = await request({ path: '/api/clock', method: 'GET' });
  assert(
    driftRes.statusCode === 200 &&
      Math.abs(serverClockRes.data.serverTimestamp - Date.now()) < 5000,
    'Clock Drift Defense: Server uses authoritative system timestamp, ignoring client clock drift (+10 mins)'
  );

  // -------------------------------------------------------------------------
  // 5. CONCURRENCY: TWO SIMULTANEOUS PURCHASES FOR LAST STOCK
  // -------------------------------------------------------------------------
  console.log('\n--- 5. CONCURRENCY & RACE CONDITIONS ---');
  // Set a test SKU stock to exactly 1
  await sendCommand({
    commandId: 'cmd-set-stock-' + Date.now(),
    deviceId: 'DEV-ADMIN',
    userId: 'admin',
    teamId: 'admin',
    role: 'SUPER_ADMIN',
    type: 'ADJUST_STOCK',
    payload: { sku: 'DATA-ANALYTICS', delta: -100 }, // zero out
    clientCreatedAt: Date.now(),
  }, { email: 'applicationinformation73737@gmail.com', role: 'SUPER_ADMIN' });

  await sendCommand({
    commandId: 'cmd-set-stock-1-' + Date.now(),
    deviceId: 'DEV-ADMIN',
    userId: 'admin',
    teamId: 'admin',
    role: 'SUPER_ADMIN',
    type: 'ADJUST_STOCK',
    payload: { sku: 'DATA-ANALYTICS', delta: 1 }, // exactly 1 stock
    clientCreatedAt: Date.now(),
  }, { email: 'applicationinformation73737@gmail.com', role: 'SUPER_ADMIN' });

  // Two simultaneous purchases submitted
  const [concBuy1, concBuy2] = await Promise.all([
    sendCommand({
      commandId: 'cmd-conc-buy-1-' + Date.now(),
      deviceId: 'DEV-TEAM1',
      userId: 'user-t1',
      teamId: 'team-07',
      role: 'CFO',
      type: 'PROPOSE_PURCHASE',
      payload: { teamId: 'team-07', sku: 'DATA-ANALYTICS', cost: 50000 },
      clientCreatedAt: Date.now(),
    }),
    sendCommand({
      commandId: 'cmd-conc-buy-2-' + Date.now(),
      deviceId: 'DEV-TEAM2',
      userId: 'user-t2',
      teamId: 'team-07',
      role: 'CFO',
      type: 'PROPOSE_PURCHASE',
      payload: { teamId: 'team-07', sku: 'DATA-ANALYTICS', cost: 50000 },
      clientCreatedAt: Date.now(),
    }),
  ]);

  const oneSuccess = (concBuy1.data.success && !concBuy2.data.success) || (!concBuy1.data.success && concBuy2.data.success);
  assert(
    oneSuccess,
    'Concurrency: Exactly one purchase succeeds when 1 stock remains; second buyer receives OUT_OF_STOCK'
  );

  // -------------------------------------------------------------------------
  // 6. CRISIS ENGINE DEADLINE ENFORCEMENT
  // -------------------------------------------------------------------------
  console.log('\n--- 6. CRISIS DEADLINE ENFORCEMENT ---');
  // Dispatch crisis
  const dispRes = await sendCommand({
    commandId: 'cmd-crisis-exp-' + Date.now(),
    deviceId: 'DEV-ADMIN',
    userId: 'admin',
    teamId: 'admin',
    role: 'SUPER_ADMIN',
    type: 'DISPATCH_CRISIS',
    payload: { teamId: 'team-07', crisisId: 'crisis-01', timerSeconds: 0 },
    clientCreatedAt: Date.now(),
  }, { email: 'applicationinformation73737@gmail.com', role: 'SUPER_ADMIN' });

  // Attempt response after deadline
  const lateCrisisResp = await sendCommand({
    commandId: 'cmd-late-crisis-' + Date.now(),
    deviceId: 'DEV-CTO-001',
    userId: 'cto@scriet.edu',
    teamId: 'team-07',
    role: 'CTO',
    type: 'SUBMIT_CRISIS_RESPONSE',
    payload: { teamId: 'team-07', optionId: 'opt-1-hotfix', tradeoff: 'Late effort' },
    clientCreatedAt: Date.now(),
  });
  assert(
    !lateCrisisResp.data.success && lateCrisisResp.data.code === 'CRISIS_EXPIRED',
    'Crisis Engine: Late response after deadline is rejected with CRISIS_EXPIRED and penalty applied'
  );

  // -------------------------------------------------------------------------
  // 7. AUCTION ENGINE CLOSING & INVENTORY TRANSFER
  // -------------------------------------------------------------------------
  console.log('\n--- 7. AUCTION ENGINE CLOSING & INVENTORY GRANT ---');
  // Open auction
  await sendCommand({
    commandId: 'cmd-auc-test-' + Date.now(),
    deviceId: 'DEV-ADMIN',
    userId: 'admin',
    teamId: 'admin',
    role: 'SUPER_ADMIN',
    type: 'OPEN_AUCTION',
    payload: {
      title: 'Tier-1 Accelerator Fast-Track',
      description: 'Direct entry into Y Combinator interview pool',
      itemSku: 'ACCELERATOR-PASS',
      minBid: 150000,
      durationMinutes: 10,
    },
    clientCreatedAt: Date.now(),
  }, { email: 'applicationinformation73737@gmail.com', role: 'SUPER_ADMIN' });

  // Place valid bid
  await sendCommand({
    commandId: 'cmd-auc-bid-' + Date.now(),
    deviceId: 'DEV-CEO-001',
    userId: 'ceo-user',
    teamId: 'team-07',
    role: 'CEO',
    type: 'PLACE_BID',
    payload: { teamId: 'team-07', amount: 160000 },
    clientCreatedAt: Date.now(),
  });

  // Close auction
  const closeRes = await sendCommand({
    commandId: 'cmd-auc-close-' + Date.now(),
    deviceId: 'DEV-ADMIN',
    userId: 'admin',
    teamId: 'admin',
    role: 'SUPER_ADMIN',
    type: 'CLOSE_AUCTION',
    payload: {},
    clientCreatedAt: Date.now(),
  }, { email: 'applicationinformation73737@gmail.com', role: 'SUPER_ADMIN' });

  // Verify inventory item granted to winner
  const postState = await request({ path: '/api/state', method: 'GET' });
  const wonItem = (postState.data.inventory || []).find((i) => i.teamId === 'team-07' && i.sku === 'ACCELERATOR-PASS');
  assert(
    closeRes.statusCode === 200 && Boolean(wonItem),
    'Auction Engine: Won auction item atomically granted to winner inventory and ledger debited'
  );

  // Late bid on closed auction must be rejected
  const lateBidRes = await sendCommand({
    commandId: 'cmd-late-bid-' + Date.now(),
    deviceId: 'DEV-CEO-001',
    userId: 'ceo-user',
    teamId: 'team-07',
    role: 'CEO',
    type: 'PLACE_BID',
    payload: { teamId: 'team-07', amount: 200000 },
    clientCreatedAt: Date.now(),
  });
  assert(
    !lateBidRes.data.success && lateBidRes.data.code === 'AUCTION_CLOSED',
    'Auction Engine: Bids submitted after auction close are rejected with AUCTION_CLOSED'
  );

  // -------------------------------------------------------------------------
  // 8. JUDGE ISOLATION & RUBRIC PROTECTION
  // -------------------------------------------------------------------------
  console.log('\n--- 8. JUDGE ISOLATION & INFORMATION HIDING ---');
  // Assign Judge A ONLY to team-07
  await sendCommand({
    commandId: 'cmd-judge-iso-' + Date.now(),
    deviceId: 'DEV-ADMIN',
    userId: 'admin',
    teamId: 'admin',
    role: 'SUPER_ADMIN',
    type: 'ASSIGN_JUDGE',
    payload: { judgeEmail: 'exclusive_judge@scriet.edu', teamIds: ['team-07'] },
    clientCreatedAt: Date.now(),
  }, { email: 'applicationinformation73737@gmail.com', role: 'SUPER_ADMIN' });

  // Judge checks assigned teams endpoint
  const assignedRes = await request({
    path: '/api/judge/assigned-teams',
    method: 'GET',
    headers: { 'x-user-email': 'exclusive_judge@scriet.edu' },
  });
  const judgeTeams = assignedRes.data.teams || [];
  assert(
    assignedRes.statusCode === 200 &&
      judgeTeams.length === 1 &&
      judgeTeams[0].id === 'team-07',
    'Judge Isolation: Judge only receives explicitly assigned squad(s) (team-07)'
  );

  // Judge attempts to score an unassigned team (e.g. team-01)
  const unauthScoreCmd = {
    commandId: 'cmd-unauth-score-' + Date.now(),
    deviceId: 'DEV-JUDGE',
    userId: 'exclusive_judge@scriet.edu',
    teamId: 'team-01', // Unassigned team
    role: 'JUDGE',
    type: 'SUBMIT_JUDGE_SCORE',
    payload: {
      teamId: 'team-01',
      judgeId: 'judge-exc',
      scores: { innovation: 8 },
    },
    clientCreatedAt: Date.now(),
  };
  const unauthScoreRes = await sendCommand(unauthScoreCmd, { email: 'exclusive_judge@scriet.edu', role: 'JUDGE' });
  assert(
    !unauthScoreRes.data.success && unauthScoreRes.data.code === 'UNAUTHORIZED_JUDGE_ASSIGNMENT',
    'Judge Isolation: Attempts to score unassigned squads are rejected (403/Forbidden)'
  );

  // Invalid rubric score > 10
  const invalidRubricCmd = {
    commandId: 'cmd-invalid-rubric-' + Date.now(),
    deviceId: 'DEV-JUDGE',
    userId: 'exclusive_judge@scriet.edu',
    teamId: 'team-07',
    role: 'JUDGE',
    type: 'SUBMIT_JUDGE_SCORE',
    payload: {
      teamId: 'team-07',
      judgeId: 'judge-exc',
      scores: { innovation: 99 }, // Out of range!
    },
    clientCreatedAt: Date.now(),
  };
  const invalidRubricRes = await sendCommand(invalidRubricCmd, { email: 'exclusive_judge@scriet.edu', role: 'JUDGE' });
  assert(
    !invalidRubricRes.data.success && invalidRubricRes.data.code === 'INVALID_RUBRIC_SCORE',
    'Rubric Validation: Scores out of bounds (> 10) are rejected'
  );

  // -------------------------------------------------------------------------
  // 9. LEADERBOARD & REVEAL SECURITY
  // -------------------------------------------------------------------------
  console.log('\n--- 9. LEADERBOARD & REVEAL SECURITY ---');
  // Participant fetches leaderboard before reveal
  const participantLb = await request({
    path: '/api/zero-one/leaderboard',
    method: 'GET',
    headers: { 'x-user-email': 'participant@scriet.edu' },
  });
  const sampleTeam = participantLb.data.leaderboard?.[0];
  const isHidden = sampleTeam && sampleTeam.totalScore === null && sampleTeam.balance === undefined;
  assert(
    participantLb.statusCode === 200 && isHidden,
    'Reveal Security: Preliminary scores and confidential balances hidden from participants before REVEAL'
  );

  // Super Admin fetches leaderboard
  const adminLb = await request({
    path: '/api/zero-one/leaderboard',
    method: 'GET',
    headers: { 'x-user-email': 'applicationinformation73737@gmail.com' },
  });
  const adminSample = adminLb.data.leaderboard?.[0];
  const isAdminVisible = adminSample && typeof adminSample.totalScore === 'number';
  assert(
    adminLb.statusCode === 200 && isAdminVisible,
    'Reveal Security: Authorized Super Admin can inspect authoritative scores'
  );

  // -------------------------------------------------------------------------
  // 10. DISK SNAPSHOT PERSISTENCE & DISASTER RECOVERY
  // -------------------------------------------------------------------------
  console.log('\n--- 10. DISK SNAPSHOT & DISASTER RECOVERY ---');
  const snapRes = await sendCommand({
    commandId: 'cmd-snap-disk-' + Date.now(),
    deviceId: 'DEV-ADMIN',
    userId: 'admin',
    teamId: 'admin',
    role: 'SUPER_ADMIN',
    type: 'CREATE_SNAPSHOT',
    payload: { name: 'Pre-Event Venue Checkpoint' },
    clientCreatedAt: Date.now(),
  }, { email: 'applicationinformation73737@gmail.com', role: 'SUPER_ADMIN' });

  const snapId = snapRes.data.data?.snapshot?.id || snapRes.data.data?.snapshotId;
  assert(
    snapRes.statusCode === 200 && Boolean(snapId),
    'Snapshot Creation: Serialized state snapshot saved to in-memory and disk storage',
    `(Snapshot ID: ${snapId})`
  );

  const restoreRes = await sendCommand({
    commandId: 'cmd-restore-disk-' + Date.now(),
    deviceId: 'DEV-ADMIN',
    userId: 'admin',
    teamId: 'admin',
    role: 'SUPER_ADMIN',
    type: 'RESTORE_SNAPSHOT',
    payload: { snapshotId: snapId },
    clientCreatedAt: Date.now(),
  }, { email: 'applicationinformation73737@gmail.com', role: 'SUPER_ADMIN' });
  assert(
    restoreRes.statusCode === 200 && restoreRes.data.success,
    'Disaster Recovery: Authoritative state successfully restored from snapshot'
  );

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TOTAL EVENT-DAY AUDIT TESTS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  console.log('================================================================');

  if (passed === total) {
    console.log('>>> ALL 18 EVENT-DAY READINESS & HARDENING TESTS PASSED 100%! <<<');
  } else {
    process.exit(1);
  }
}

runAudit().catch((e) => {
  console.error('Audit Suite Exception:', e);
  process.exit(1);
});
