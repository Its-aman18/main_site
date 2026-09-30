const BASE = 'http://127.0.0.1:5003';
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

// LAN-mode admin command still works (bootstrap super-admin via header)
const price = await fetch(`${BASE}/api/admin/market/price`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-user-email': 'applicationinformation73737@gmail.com' },
  body: JSON.stringify({ sku: 'CLOUD-CREDITS', price: 99000 }),
}).then((r) => r.json());
check('LAN admin price override', price.success === true, JSON.stringify(price).slice(0, 200));

// Non-admin cannot touch admin routes
const denied = await fetch(`${BASE}/api/admin/market/price`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-user-email': 'random@student.edu' },
  body: JSON.stringify({ sku: 'CLOUD-CREDITS', price: 1 }),
});
check('non-admin gets 403', denied.status === 403);

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
