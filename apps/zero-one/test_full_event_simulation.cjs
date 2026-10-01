const http = require('http');
const jwt = require('jsonwebtoken');

const TEST_SECRET = process.env.JWT_SECRET || 'dev_local_jwt_secret_change_me_before_production';
const PORT = parseInt(process.env.ZERO_ONE_TEST_PORT || process.env.ZERO_ONE_PORT || process.env.PORT || '5175', 10);

const superAdminEmail = 'applicationinformation73737@gmail.com';
const superAdminToken = jwt.sign(
  {
    userId: 'usr-admin-1',
    email: superAdminEmail,
    name: 'Aman Gupta (Venue Master)',
    role: 'ADMIN',
  },
  TEST_SECRET,
  { algorithm: 'HS256', expiresIn: '7d' }
);

const authHeaders = {
  Authorization: `Bearer ${superAdminToken}`,
  'x-user-email': superAdminEmail,
  'x-user-role': 'ADMIN',
};

function req(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: PORT,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const request = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    request.on('error', reject);
    if (body) request.write(typeof body === 'string' ? body : JSON.stringify(body));
    request.end();
  });
}

async function runFullEventSimulation() {
  console.log('================================================================');
  console.log('🚀 ZERO → ONE: FULL EVENT LIFECYCLE & 15-TAB AUDIT SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, description, details = '') {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${description} ${details}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${description} ${details}`);
    }
  }

  // 1. OVERVIEW & INITIAL STATE
  console.log('👉 Testing 1: OVERVIEW Tab...');
  const stateRes = await req('/api/state', { headers: authHeaders });
  assert(stateRes.status === 200 && stateRes.body.eventSequence > 0, 'Fetched Authoritative Simulation State', `(Event Sequence: ${stateRes.body?.eventSequence})`);
  assert(Array.isArray(stateRes.body.teams) && stateRes.body.teams.length > 0, `Initialized Squad Roster`, `(${stateRes.body?.teams?.length} Teams Active)`);

  // 2. TEAMS & ROLES: Reissue / Entry of Team Roles
  console.log('\n👉 Testing 2: TEAMS & ROLES Tab (Team Role Binding & Fake Reissue)...');
  const roleReissue = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
    commandId: 'cmd-reissue-' + Date.now(),
    type: 'REISSUE_DEVICE_ROLE',
    payload: {
      teamId: 'team-07',
      role: 'CEO',
      newDeviceId: 'dev-alpha-squad-sim',
      targetDisplayName: 'Aman Gupta',
    },
    metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
  });
  assert(roleReissue.status === 200 && roleReissue.body.success, 'Reissued & Verified Team Credentials for team-07');

  // 3. EVENT CONTROL: All Rounds & Clock Manipulation
  console.log('\n👉 Testing 3: EVENT CONTROL Tab (All Rounds & Timer)...');
  const advanceR1 = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
    commandId: 'cmd-r1-' + Date.now(),
    type: 'CHANGE_EVENT_STATE',
    payload: { eventStatus: 'ROUND_1', force: true },
    metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
  });
  assert(advanceR1.status === 200 && advanceR1.body.success, 'Advanced to ROUND 1: Idea Validation & Foundation');

  const extendClock = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
    commandId: 'cmd-clock-ext-' + Date.now(),
    type: 'EXTEND_CLOCK',
    payload: { addedSeconds: 300 },
    metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
  });
  assert(extendClock.status === 200 && extendClock.body.success, 'Clock Control: Extended Event Timer by +5 Minutes');

  const toggleTimer = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
    commandId: 'cmd-toggle-' + Date.now(),
    type: 'TOGGLE_CLOCK',
    payload: {},
    metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
  });
  assert(toggleTimer.status === 200 && toggleTimer.body.success, 'Clock Control: Toggled Timer State');

  const advanceR2 = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
    commandId: 'cmd-r2-' + Date.now(),
    type: 'CHANGE_EVENT_STATE',
    payload: { eventStatus: 'ROUND_2', force: true },
    metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
  });
  assert(advanceR2.status === 200 && advanceR2.body.success, 'Advanced to ROUND 2: Prototyping & Traction');

  const lockEngage = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
    commandId: 'cmd-lock-on-' + Date.now(),
    type: 'SET_LOCKDOWN',
    payload: { isLockdownActive: true },
    metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
  });
  assert(lockEngage.status === 200 && lockEngage.body.success, 'Emergency Lockdown: Activated');

  const lockRelease = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
    commandId: 'cmd-lock-off-' + Date.now(),
    type: 'SET_LOCKDOWN',
    payload: { isLockdownActive: false },
    metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
  });
  assert(lockRelease.status === 200 && lockRelease.body.success, 'Emergency Lockdown: Released');

  const advanceR3 = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
    commandId: 'cmd-r3-' + Date.now(),
    type: 'CHANGE_EVENT_STATE',
    payload: { eventStatus: 'ROUND_3', force: true },
    metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
  });
  assert(advanceR3.status === 200 && advanceR3.body.success, 'Advanced to ROUND 3: Pitch & Scale');

  // 4. VIRTUAL FINANCE & LOANS
  console.log('\n👉 Testing 4: VIRTUAL FINANCE & LOANS Tab...');
  const ledgerAdj = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
    commandId: 'cmd-ledger-' + Date.now(),
    type: 'RECORD_LEDGER_TRANSACTION',
    payload: {
      teamId: 'team-07',
      type: 'CREDIT',
      amount: 75000,
      reason: 'Venture Capital Grant Round 3',
    },
    metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
  });
  assert(ledgerAdj.status === 200 && ledgerAdj.body.success, 'Issued VC Grant (+75,000 Credits) to team-07');

  const loanGrant = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
    commandId: 'cmd-loan-' + Date.now(),
    type: 'GRANT_LOAN',
    payload: {
      teamId: 'team-07',
      principal: 25000,
      interestPct: 5,
    },
    metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
  });
  assert(loanGrant.status === 200 && loanGrant.body.success, 'Approved & Granted Institutional Loan to team-07');

  // 5. MARKET MANAGEMENT
  console.log('\n👉 Testing 5: MARKET MANAGEMENT Tab...');
  const sku = 'SIM-GPU-CLUSTER-' + Date.now();
  const createMarket = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
    commandId: 'cmd-mkt-add-' + Date.now(),
    type: 'CREATE_MARKET_ITEM',
    payload: {
      sku,
      name: 'High-Density GPU Cluster Allocation',
      category: 'COMPUTE',
      basePrice: 60000,
      currentPrice: 60000,
      stockRemaining: 8,
      status: 'AVAILABLE',
    },
    metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
  });
  assert(createMarket.status === 200 && createMarket.body.success, `Created Custom Market Asset (${sku})`);

  const updateMarket = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
    commandId: 'cmd-mkt-upd-' + Date.now(),
    type: 'UPDATE_MARKET_PRICE',
    payload: { sku, price: 68000 },
    metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
  });
  assert(updateMarket.status === 200 && updateMarket.body.success, 'Updated Market Index / Resource Price');

  // 6. CRISIS ENGINE: Dispatch to Particular Team & Resolve
  console.log('\n👉 Testing 6: CRISIS ENGINE Tab (Dispatch to Team & Resolve)...');
  const triggerCrisis = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
    commandId: 'cmd-crisis-disp-' + Date.now(),
    type: 'DISPATCH_CRISIS',
    payload: {
      teamId: 'team-07',
      crisisId: 'crisis-sec-01',
      timerSeconds: 240,
    },
    metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
  });
  assert(triggerCrisis.status === 200 && triggerCrisis.body.success, 'Dispatched Shock Card Crisis specifically to team-07');

  const extendCrisis = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
    commandId: 'cmd-crisis-ext-' + Date.now(),
    type: 'EXTEND_CRISIS_TIMER',
    payload: { teamId: 'team-07', additionalSeconds: 180 },
    metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
  });
  assert(extendCrisis.status === 200 && extendCrisis.body.success, 'Extended Crisis Timer (+3m) for active shock card');

  const resolveCrisis = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
    commandId: 'cmd-crisis-res-' + Date.now(),
    type: 'RESOLVE_CRISIS_MANUALLY',
    payload: { teamId: 'team-07', reason: 'RESOLVED_BY_ADMIN' },
    metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
  });
  assert(resolveCrisis.status === 200 && resolveCrisis.body.success, 'Resolved Active Crisis Manually for team-07');

  // 7. AUCTION & TRADING
  console.log('\n👉 Testing 7: AUCTION & TRADING Tab...');
  const openAuction = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
    commandId: 'cmd-auc-open-' + Date.now(),
    type: 'OPEN_AUCTION',
    payload: {
      title: 'Decentralized Zero-Knowledge Identity Patent',
      description: 'Exclusive sovereign identity protocol IP',
      itemSku: sku,
      minBid: 35000,
      durationMinutes: 10,
    },
    metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
  });
  assert(openAuction.status === 200 && openAuction.body.success, 'Opened Live Asset / IP Auction for squads');

  // 8. LIVE SCREEN CONTROL
  console.log('\n👉 Testing 8: LIVE SCREEN CONTROL Tab...');
  const liveScreenPost = await req('/api/live-screen/config', { method: 'POST', headers: authHeaders }, {
    presentationMode: 'QUALIFIERS',
    activeOverlay: 'LEADERBOARD',
    tickerText: 'LIVE UPDATE: Finals underway at Code.SCRIET Zero-One Arena!',
  });
  assert(liveScreenPost.status === 200 && liveScreenPost.body.success, 'Saved Live Screen Presentation Config & Ticker Banner');

  const liveScreenGet = await req('/api/live-screen/config', { headers: authHeaders });
  assert(liveScreenGet.status === 200 && liveScreenGet.body.presentationMode === 'QUALIFIERS', 'Retrieved Active Live Screen Configuration');

  // 9. ANNOUNCEMENTS
  console.log('\n👉 Testing 9: ANNOUNCEMENTS Tab...');
  const announcePost = await req('/api/announcements/broadcast', { method: 'POST', headers: authHeaders }, {
    title: 'Round 3 Pitch Queue Opened',
    content: 'All teams must report to Judge Panels immediately.',
    type: 'ALERT',
    target: 'ALL',
  });
  assert(announcePost.status === 200 && announcePost.body.success, 'Broadcasted System Emergency Announcement');

  // 10. AUDIT LOGS & ADMIN VERIFICATION
  console.log('\n👉 Testing 10: AUDIT LOGS & ADMIN VERIFICATION Tabs...');
  const auditRes = await req('/api/admin/audit-logs', { headers: authHeaders });
  assert(auditRes.status === 200 && Array.isArray(auditRes.body.auditLogs), 'Audit Trail Verified', `(${auditRes.body?.auditLogs?.length} Logs Recorded)`);

  const authList = await req('/api/admin/authorizations', { headers: authHeaders });
  assert(authList.status === 200 && Array.isArray(authList.body.authorizations), 'Admin Verification Authorization Registry Active');

  const sessionCheck = await req('/api/auth/me', { headers: authHeaders });
  assert(sessionCheck.status === 200 && sessionCheck.body.verified && sessionCheck.body.isSuperAdmin, 'SUPER Admin Authority Verified (applicationinformation73737@gmail.com)');

  // 11. EXPORT & BACKUP
  console.log('\n👉 Testing 11: EXPORT & BACKUP Tab...');
  const snapshotRes = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
    commandId: 'cmd-snap-' + Date.now(),
    type: 'CREATE_SNAPSHOT',
    payload: { name: 'Full Event End-to-End Simulation Snapshot' },
    metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
  });
  assert(snapshotRes.status === 200 && snapshotRes.body.success, 'Created & Exported Full State Snapshot Backup');

  console.log('\n================================================================');
  console.log(`📊 FINAL SIMULATION RESULT: ${passed} / ${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runFullEventSimulation().catch((err) => {
  console.error('Fatal simulation error:', err);
  process.exit(1);
});
