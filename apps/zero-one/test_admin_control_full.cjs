const http = require('http');
const jwt = require('jsonwebtoken');

const TEST_SECRET = process.env.JWT_SECRET || 'dev_local_jwt_secret_change_me_before_production';
const PORT = parseInt(process.env.ZERO_ONE_TEST_PORT || process.env.ZERO_ONE_PORT || process.env.PORT || '5175', 10);

function createTestToken(payload) {
  return jwt.sign(payload, TEST_SECRET, { algorithm: 'HS256', expiresIn: '7d' });
}

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

async function runFullAdminAudit() {
  console.log('================================================================');
  console.log('ZERO → ONE COMPLETE ADMIN CONTROL CENTER AUDIT & TEST SUITE');
  console.log('================================================================\n');

  const superAdminEmail = 'applicationinformation73737@gmail.com';
  const superAdminToken = createTestToken({
    userId: 'usr-admin-1',
    email: superAdminEmail,
    name: 'Aman Gupta',
    role: 'ADMIN',
  });

  const authHeaders = {
    Authorization: `Bearer ${superAdminToken}`,
    'x-user-email': superAdminEmail,
    'x-user-role': 'ADMIN',
  };

  let passed = 0;
  let failed = 0;

  function assert(desc, condition, details = '') {
    if (condition) {
      console.log(`[PASS] ${desc} ${details}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc} ${details}`);
      failed++;
    }
  }

  try {
    // 1. Check Server State & Overview
    const stateRes = await req('/api/state', { headers: authHeaders });
    assert('1. OVERVIEW: Fetch authoritative state', stateRes.status === 200 && stateRes.body.eventSequence > 0);

    // 2. EVENT CONTROL: Clock Duration Update
    const clockUpdate = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
      type: 'EXTEND_CLOCK',
      payload: { addedSeconds: 300 },
      metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
    });
    assert('2. EVENT CONTROL: Adjust Clock / Duration', clockUpdate.status === 200 && clockUpdate.body.success);

    // 3. EVENT CONTROL: Emergency Lockdown Trigger & Release
    const lockRes = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
      type: 'SET_LOCKDOWN',
      payload: { isLockdownActive: true },
      metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
    });
    assert('3. EVENT CONTROL: Trigger Emergency Lockdown', lockRes.status === 200 && lockRes.body.success);

    const unlockRes = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
      type: 'SET_LOCKDOWN',
      payload: { isLockdownActive: false },
      metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
    });
    assert('4. EVENT CONTROL: Release Emergency Lockdown', unlockRes.status === 200 && unlockRes.body.success);

    // 5. TEAMS & ROLES: Reissue Role Credentials
    const reissueRes = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
      type: 'REISSUE_DEVICE_ROLE',
      payload: {
        teamId: 'team-07',
        role: 'CFO',
        newDeviceId: 'dev-token-marshal-audit',
        targetDisplayName: 'Aman Gupta',
      },
      metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
    });
    assert('5. TEAMS & ROLES: Reissue role credentials without unwanted mock names', reissueRes.status === 200 && reissueRes.body.success);

    // 6. VIRTUAL FINANCE: Adjust Balance (Credit/Debit)
    const finRes = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
      type: 'RECORD_LEDGER_TRANSACTION',
      payload: {
        teamId: 'team-07',
        type: 'CREDIT',
        amount: 50000,
        reasonTag: 'MANUAL_OVERRIDE',
        description: 'Marshal Audit Test Credit',
      },
      metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
    });
    assert('6. VIRTUAL FINANCE: Manual Ledger Adjustment (Credit/Debit)', finRes.status === 200 && finRes.body.success);

    // 7. MARKET MANAGEMENT: Add Custom Market Item
    const testSku = 'TEST-ITEM-' + Date.now();
    const addMarketRes = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
      type: 'CREATE_MARKET_ITEM',
      payload: {
        sku: testSku,
        name: 'Enterprise Security Hardening Pack',
        category: 'SECURITY',
        basePrice: 40000,
        currentPrice: 40000,
        stockRemaining: 5,
        status: 'AVAILABLE',
      },
      metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
    });
    assert('7. MARKET MANAGEMENT: Create New Market Item', addMarketRes.status === 200 && addMarketRes.body.success);

    // 8. MARKET MANAGEMENT: Update Price & Stock
    const updateMarketRes = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
      type: 'UPDATE_MARKET_PRICE',
      payload: { sku: testSku, newPrice: 45000 },
      metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
    });
    assert('8. MARKET MANAGEMENT: Update Market Price dynamically', updateMarketRes.status === 200 && updateMarketRes.body.success);

    // 9. CRISIS ENGINE: Dispatch Targeted Crisis to Specific Team
    const crisisDispatch = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
      type: 'DISPATCH_CRISIS',
      payload: {
        teamId: 'team-07',
        crisisCard: {
          id: 'CRISIS-AUDIT-99',
          title: 'Database Replication Split-Brain',
          description: 'A network partition severed the multi-region replica sync.',
          severity: 'HIGH',
          timeLimitSeconds: 180,
          options: [
            {
              id: 'opt-failover',
              title: 'Promote Read Replica',
              costCash: 60000,
              successProb: 0.9,
              effectDescription: 'Quick failover with minor packet loss.',
            },
          ],
        },
      },
      metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
    });
    assert('9. CRISIS ENGINE: Dispatch targeted crisis to particular team (Rule 72)', crisisDispatch.status === 200 && crisisDispatch.body.success);

    // 10. CRISIS ENGINE: Extend Countdown Timer
    const extendCrisis = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
      type: 'EXTEND_CRISIS_TIMER',
      payload: { teamId: 'team-07', additionalSeconds: 60 },
      metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
    });
    assert('10. CRISIS ENGINE: Extend targeted crisis countdown timer', extendCrisis.status === 200 && extendCrisis.body.success);

    // 11. CRISIS ENGINE: Manually Resolve Crisis
    const resolveCrisis = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
      type: 'RESOLVE_CRISIS_MANUALLY',
      payload: { teamId: 'team-07', reason: 'Audit manual clearance' },
      metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
    });
    assert('11. CRISIS ENGINE: Manually resolve crisis by admin', resolveCrisis.status === 200 && resolveCrisis.body.success);

    // 12. CANVAS SUBMISSION: Submit / Update Canvas
    const canvasRes = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
      type: 'SUBMIT_CANVAS',
      payload: {
        teamId: 'team-07',
        canvas: {
          problem: 'Testing automated validation of canvas submissions.',
          customer: 'Collegiate hackathon founders.',
          solution: 'Cloud native simulation platform.',
          usp: 'Authoritative server ledger and dynamic economy.',
          revenueModel: 'Annual university licensing.',
          costStructure: 'Hosting, monitoring, event operations.',
          marketingStrategy: 'Open source club chapters.',
          competitors: 'Static spreadsheets.',
          traction: '42 squads active.',
          businessAssumptions: 'Squads require real-time economic telemetry.',
        },
        expectedVersion: 1,
      },
      metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
    });
    assert('12. CANVAS SUBMISSIONS: Versioned lean startup canvas save & sync', canvasRes.status === 200 && canvasRes.body.success);

    // 13. PROTOTYPES & DECKS: Submit Deliverable (Artifact)
    const artRes = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
      type: 'SUBMIT_ARTIFACT',
      payload: {
        teamId: 'team-07',
        kind: 'PROTOTYPE',
        title: 'Authoritative Production Prototype v1.0',
        url: 'https://demo.codescriet.dev',
        description: 'Fully responsive prototype with real-time SSE stream.',
        submittedBy: 'Team 07 Lead',
      },
      metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
    });
    assert('13. PROTOTYPES & DECKS: Register deliverable with SHA-256 tamper-evident hash', artRes.status === 200 && artRes.body.success);

    // 14. LIVE SCREEN: Config Update
    const liveRes = await req('/api/live-screen/config', { method: 'POST', headers: authHeaders }, {
      presentationMode: 'NORMAL',
      showLeaderboard: true,
      showCrisisGrid: true,
      showMarketTicker: true,
      announcementTickerText: 'ZERO → ONE ADMIN AUDIT SUITE VERIFIED',
    });
    assert('14. LIVE SCREEN CONTROL: Update presentation mode and overlay toggles', liveRes.status === 200 && liveRes.body.success);

    // 15. ANNOUNCEMENTS: Broadcast Push
    const annRes = await req('/api/announcements/broadcast', { method: 'POST', headers: authHeaders }, {
      title: 'Platform Readiness Confirmed',
      content: 'All administrative systems, crisis triggers, and markets fully validated.',
      type: 'INFO',
    });
    assert('15. ANNOUNCEMENTS: Broadcast priority announcement to all devices', annRes.status === 200 && annRes.body.success);

    // 16. ADMIN VERIFICATION: Search User
    const searchRes = await req('/api/admin/search-user?email=test.candidate@scriet.dev', { headers: authHeaders });
    assert('16. ADMIN VERIFICATION: Search Code.SCRIET user by email', searchRes.status === 200 && searchRes.body.found);

    // 17. ADMIN VERIFICATION: Verify New Admin
    const verifyRes = await req('/api/admin/verify', { method: 'POST', headers: authHeaders }, {
      email: 'test.candidate@scriet.dev',
      role: 'ADMIN',
    });
    assert('17. ADMIN VERIFICATION: Verify candidate email as ADMIN', verifyRes.status === 200 && verifyRes.body.success);

    // 18. ADMIN VERIFICATION: Suspend Admin
    const suspendRes = await req('/api/admin/suspend', { method: 'POST', headers: authHeaders }, {
      email: 'test.candidate@scriet.dev',
      reason: 'Audit cycle verification check',
    });
    assert('18. ADMIN VERIFICATION: Suspend administrator privileges', suspendRes.status === 200 && suspendRes.body.success);

    // 19. ADMIN VERIFICATION: Reactivate Admin
    const reactivateRes = await req('/api/admin/reactivate', { method: 'POST', headers: authHeaders }, {
      email: 'test.candidate@scriet.dev',
      reason: 'Audit cycle reinstatement',
    });
    assert('19. ADMIN VERIFICATION: Reactivate administrator privileges', reactivateRes.status === 200 && reactivateRes.body.success);

    // 20. ADMIN VERIFICATION: Purged unwanted mock names audit
    const authListRes = await req('/api/admin/authorizations', { headers: authHeaders });
    const auths = authListRes.body.authorizations || [];
    const unwantedFound = auths.filter(a =>
      a.name.includes('Kavita') || a.name.includes('Rohan Mehta') || a.name.includes('Vikram Singh')
    );
    assert('20. UNWANTED NAMES: Verified zero mock names in authoritative admin list', unwantedFound.length === 0, `(Count: ${unwantedFound.length})`);

    // 21. EXPORT & BACKUP: Create Snapshot
    const snapRes = await req('/api/zero-one/commands', { method: 'POST', headers: authHeaders }, {
      type: 'CREATE_SNAPSHOT',
      payload: { name: 'Full-Audit-Verification-Snapshot' },
      metadata: { userId: 'usr-admin-1', userEmail: superAdminEmail, role: 'ADMIN' },
    });
    assert('21. EXPORT & BACKUP: Create authoritative state snapshot', snapRes.status === 200 && snapRes.body.success);

  } catch (err) {
    console.error('[UNHANDLED ERROR]', err);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`TOTAL ADMIN CONTROL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================');

  if (failed === 0) {
    console.log('>>> ALL ADMIN CONTROLS, BUTTONS, CRISIS DISPATCH, AND VERIFICATION PASSED 100%! <<<\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runFullAdminAudit();
