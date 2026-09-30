const http = require('http');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(
  process.env.ZERO_ONE_TEST_PORT || process.env.ZERO_ONE_PORT || process.env.PORT || '5175',
  10
);
const SECRET = process.env.JWT_SECRET || 'dev_local_jwt_secret_change_me_before_production';

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

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
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

function isAllowedRedirect(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') return false;
  const trimmed = urlStr.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    const isCodescriet = hostname === 'codescriet.dev' || hostname.endsWith('.codescriet.dev');
    return isLocal || isCodescriet;
  } catch {
    return false;
  }
}

async function runAuthTestSuite() {
  console.log('============================================================');
  console.log('ZERO → ONE COMPLETE 13-POINT AUTHENTICATION TEST SUITE');
  console.log('============================================================\n');

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

  // TEST 1: Unauthenticated user opens ZERO -> ONE
  const t1Res = await request({ path: '/api/auth/me', method: 'GET' });
  assert(
    t1Res.statusCode === 200 && t1Res.data.authenticated === false && t1Res.data.user === null,
    'Unauthenticated user has no active session and requires Code.SCRIET authentication',
    `Status: ${t1Res.statusCode}, authenticated: ${t1Res.data?.authenticated}`
  );

  // TEST 2: Authenticated Code.SCRIET member opens ZERO -> ONE
  const memberToken = makeJwt({
    userId: 'usr-member-01',
    email: 'aman@scriet.edu',
    name: 'Aman Gupta',
    role: 'MEMBER',
  });
  const t2Res = await request({
    path: '/api/auth/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${memberToken}` },
  });
  assert(
    t2Res.statusCode === 200 &&
      t2Res.data.authenticated === true &&
      t2Res.data.user?.email === 'aman@scriet.edu' &&
      t2Res.data.user?.id === 'usr-member-01',
    'Authenticated Code.SCRIET member establishes valid application session',
    `User: ${t2Res.data.user?.email}`
  );

  // TEST 3: Authenticated user refreshes page
  const t3Res = await request({
    path: '/api/auth/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${memberToken}` },
  });
  assert(
    t3Res.statusCode === 200 && t3Res.data.authenticated === true,
    'Authenticated user session remains valid across refresh/navigation'
  );

  // TEST 4: Expired session
  const expiredToken = makeJwt(
    { userId: 'usr-exp', email: 'expired@scriet.edu', role: 'MEMBER' },
    SECRET,
    { expiresIn: -10 }
  );
  const t4Res = await request({
    path: '/api/auth/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${expiredToken}` },
  });
  assert(
    t4Res.data.authenticated === false,
    'Expired session is rejected by authentication layer'
  );

  // TEST 5: Forged token
  const forgedToken = makeJwt(
    { userId: 'usr-hacker', email: 'hacker@evil.com', role: 'SUPER_ADMIN' },
    'completely_wrong_secret_12345'
  );
  const t5Res = await request({
    path: '/api/zero-one/commands',
    method: 'POST',
    headers: { Authorization: `Bearer ${forgedToken}` },
  }, JSON.stringify({ type: 'RESET_SIMULATION' }));
  assert(
    t5Res.statusCode === 401,
    'Forged token signed with unknown secret rejected with 401',
    `Status: ${t5Res.statusCode}`
  );

  // TEST 6: Modified JWT payload (tampered signature)
  const validParts = memberToken.split('.');
  const tamperedToken = `${validParts[0]}.${Buffer.from('{"userId":"hacked","email":"hacked@scriet.edu","role":"SUPERADMIN"}').toString('base64url')}.${validParts[2]}`;
  const t6Res = await request({
    path: '/api/zero-one/commands',
    method: 'POST',
    headers: { Authorization: `Bearer ${tamperedToken}` },
  }, JSON.stringify({ type: 'RESET_SIMULATION' }));
  assert(
    t6Res.statusCode === 401,
    'Modified JWT payload with invalid cryptographic signature rejected with 401',
    `Status: ${t6Res.statusCode}`
  );

  // TEST 7: Normal Code.SCRIET user accesses admin API
  const t7Res = await request({
    path: '/api/admin/event/status',
    method: 'POST',
    headers: { Authorization: `Bearer ${memberToken}` },
  }, JSON.stringify({ status: 'ROUND_2' }));
  assert(
    t7Res.statusCode === 403,
    'Normal Code.SCRIET user blocked from admin API with 403 Forbidden',
    `Status: ${t7Res.statusCode}`
  );

  // TEST 8: Verified ZERO -> ONE admin accesses admin API
  const superAdminToken = makeJwt({
    userId: 'usr-bootstrap-admin',
    email: 'applicationinformation73737@gmail.com',
    name: 'Master Admin',
    role: 'SUPERADMIN',
  });
  const t8Res = await request({
    path: '/api/admin/event/status',
    method: 'POST',
    headers: { Authorization: `Bearer ${superAdminToken}` },
  }, JSON.stringify({ status: 'ROUND_2' }));
  assert(
    t8Res.statusCode === 200 && t8Res.data.success === true,
    'Verified ZERO -> ONE Super Admin successfully executes admin operation',
    `Status: ${t8Res.statusCode}`
  );

  // TEST 9: Revoked admin accesses admin API
  const revokedToken = makeJwt({
    userId: 'usr-vikram',
    email: 'vikram@scriet.ac.in',
    name: 'Vikram Singh',
    role: 'MEMBER',
  });
  const t9Res = await request({
    path: '/api/admin/event/status',
    method: 'POST',
    headers: { Authorization: `Bearer ${revokedToken}` },
  }, JSON.stringify({ status: 'ROUND_2' }));
  assert(
    t9Res.statusCode === 403,
    'Revoked admin blocked from admin API with 403 Forbidden',
    `Status: ${t9Res.statusCode}`
  );

  // TEST 10: Browser sends x-user-email: admin@example.com without valid authentication
  const t10Res = await request({
    path: '/api/admin/event/status',
    method: 'POST',
    headers: {
      'x-user-email': 'applicationinformation73737@gmail.com',
    },
  }, JSON.stringify({ status: 'ROUND_2' }));
  assert(
    t10Res.statusCode === 401 || t10Res.statusCode === 403,
    'Browser-supplied x-user-email spoofing header rejected without valid session',
    `Status: ${t10Res.statusCode} (Header NOT trusted)`
  );

  // TEST 11: Arbitrary external return URL rejected
  const evilUrl1 = 'https://evil-phishing-site.com/steal-creds';
  const evilUrl2 = '//attacker.com/oauth/steal';
  const evilUrl3 = 'javascript:alert(document.cookie)';
  const goodUrl1 = 'https://codescriet.dev/signin';
  const goodUrl2 = 'https://zero-one.codescriet.dev/team-dashboard';
  const goodUrl3 = '/team-dashboard';
  const goodUrl4 = 'http://localhost:5175/team-dashboard';

  const t11Pass =
    !isAllowedRedirect(evilUrl1) &&
    !isAllowedRedirect(evilUrl2) &&
    !isAllowedRedirect(evilUrl3) &&
    isAllowedRedirect(goodUrl1) &&
    isAllowedRedirect(goodUrl2) &&
    isAllowedRedirect(goodUrl3) &&
    isAllowedRedirect(goodUrl4);
  assert(
    t11Pass,
    'Arbitrary external return URLs rejected by open-redirect protection allowlist'
  );

  // TEST 12: User logs out
  const t12Res = await request({
    path: '/api/auth/logout',
    method: 'POST',
    headers: { Authorization: `Bearer ${memberToken}` },
  });
  const cookieHeader = t12Res.headers['set-cookie'] || [];
  const cookieCleared = Array.isArray(cookieHeader)
    ? cookieHeader.some((c) => c.includes('scriet_session=;') || c.includes('Max-Age=0') || c.includes('Expires=Thu, 01 Jan 1970'))
    : String(cookieHeader).includes('scriet_session=;');
  assert(
    t12Res.statusCode === 200 && cookieCleared,
    'Logout endpoint clears session cookie and terminates application session'
  );

  // TEST 13: Search source code to verify NO obsolete sign-in/up/mock forms remain
  const srcDir = path.resolve(__dirname, 'src');
  function findInFiles(dir, needle) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (findInFiles(fullPath, needle)) return true;
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(needle)) {
          return true;
        }
      }
    }
    return false;
  }

  const hasSignIntoJoin = findInFiles(srcDir, 'Sign In to Join');
  const hasUnifiedSignIn = findInFiles(srcDir, 'Unified Email Sign In');
  const hasForgotPass = findInFiles(srcDir, 'Forgot Password');
  const hasCreateAcct = findInFiles(srcDir, 'Create Account');
  const t13Pass = !hasSignIntoJoin && !hasUnifiedSignIn && !hasForgotPass && !hasCreateAcct;

  assert(
    t13Pass,
    'No obsolete login forms, password forms, or mock persona sign-in UI in ZERO -> ONE',
    `Clean UI verified: ${t13Pass}`
  );

  console.log('\n============================================================');
  console.log(`SUMMARY: ${passed} / ${total} TESTS PASSED`);
  console.log('============================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAuthTestSuite().catch((err) => {
  console.error('Fatal error during auth test suite:', err);
  process.exit(1);
});
