import jwt from 'jsonwebtoken';

const BASE = process.env.ZERO_ONE_BASE_URL?.replace(/\/+$/, '') || 'http://127.0.0.1:5003';
let pass = 0;
let fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};

const health = await fetch(`${BASE}/api/health`).then((r) => r.json());
check('health ok', health.status === 'ok' && health.sequence >= 10000, JSON.stringify(health));

const state = await fetch(`${BASE}/api/state`).then((r) => r.json());
check('state has teams+ledger', Array.isArray(state.teams) && Array.isArray(state.ledger));
check(
  'state strips staff lists for anonymous',
  Array.isArray(state.adminAuthorizations) && state.adminAuthorizations.length === 0 &&
    Array.isArray(state.adminAuditLogs) && state.adminAuditLogs.length === 0
);

const status = await fetch(`${BASE}/api/auth/status`).then((r) => r.json());
check('auth/status anonymous', status.authenticated === false, JSON.stringify(status));

// CORS: allowed origin is echoed, credentials enabled
const pre = await fetch(`${BASE}/api/state`, {
  method: 'OPTIONS',
  headers: { Origin: 'https://zero-one.codescriet.dev', 'Access-Control-Request-Method': 'GET' },
});
check('CORS echo allowed origin', pre.headers.get('access-control-allow-origin') === 'https://zero-one.codescriet.dev');
check('CORS credentials', pre.headers.get('access-control-allow-credentials') === 'true');

// CORS: evil origin gets no echo
const evil = await fetch(`${BASE}/api/state`, {
  method: 'OPTIONS',
  headers: { Origin: 'https://evil.example.com', 'Access-Control-Request-Method': 'GET' },
});
check('CORS rejects evil origin', evil.headers.get('access-control-allow-origin') === null);

// NOTE (JWT hardening): admin routes now require a verified main-site JWT —
// bare `x-user-email` headers return 401. This script signs a dev JWT for the
// bootstrap super-admin when JWT_SECRET (or the dev fallback) is available,
// matching apps/zero-one/test_engine.cjs. Set JWT_SECRET to the real shared
// secret when verifying a deployed backend.
const TEST_SECRET = process.env.JWT_SECRET?.trim() || 'dev_local_jwt_secret_change_me_before_production';
const adminToken = jwt.sign(
  { userId: '7b9962b4-a08c-4d24-9f28-8c722d81d20f', id: '7b9962b4-a08c-4d24-9f28-8c722d81d20f', email: 'applicationinformation73737@gmail.com', name: 'Bootstrap Admin', role: 'ADMIN' },
  TEST_SECRET,
  { algorithm: 'HS256', expiresIn: '10m' }
);
const adminHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}`, 'x-user-email': 'applicationinformation73737@gmail.com' };

// Verified-admin command works (JWT path)
const price = await fetch(`${BASE}/api/admin/market/price`, {
  method: 'POST',
  headers: adminHeaders,
  body: JSON.stringify({ sku: 'CLOUD-CREDITS', price: 99000 }),
}).then((r) => r.json());
check('verified admin price override', price.success === true, JSON.stringify(price).slice(0, 200));

// Bare header with no JWT is rejected (401), not honored
const bareDenied = await fetch(`${BASE}/api/admin/market/price`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-user-email': 'applicationinformation73737@gmail.com' },
  body: JSON.stringify({ sku: 'CLOUD-CREDITS', price: 1 }),
});
check('bare header without JWT rejected', bareDenied.status === 401, `status=${bareDenied.status}`);

// Non-admin cannot touch admin routes (401 without JWT, 403 with non-admin JWT)
const denied = await fetch(`${BASE}/api/admin/market/price`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-user-email': 'random@student.edu' },
  body: JSON.stringify({ sku: 'CLOUD-CREDITS', price: 1 }),
});
check('non-admin gets 401/403', denied.status === 401 || denied.status === 403, `status=${denied.status}`);

// Command endpoint (LAN purchase flow via device session)
const cmd = await fetch(`${BASE}/api/zero-one/commands`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-user-email': 'aman@scriet.edu', 'x-device-id': 'verify-device-1' },
  body: JSON.stringify({
    commandId: 'verify-cmd-1',
    type: 'CLAIM_TEAM',
    payload: { teamId: 'team-07', role: 'CEO', displayName: 'Verify Bot' },
  }),
}).then((r) => r.json());
check('command endpoint responds', typeof cmd.success === 'boolean', JSON.stringify(cmd).slice(0, 200));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
