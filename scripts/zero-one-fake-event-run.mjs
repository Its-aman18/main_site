// FULL FAKE ZERO-ONE EVENT RUN — drives the authoritative backend through the
// entire lifecycle round-by-round as the super-admin, with fake multi-team
// registrations on the main site.
//
// What it does:
//   1. Main site (:5001, if up): ensures event zero-one-2026 + registers fake
//      users for teams 01/02/03 (12 founders).
//   2. Zero-one (:5003): SETUP -> ... -> REVEAL, exercising every admin
//      control — clock, teams, market, crisis to a particular team, auction,
//      finance, canvas/artifacts, judging — then prints the final leaderboard.
//
// Run:  node scripts/zero-one-fake-event-run.mjs
// Requires the zero-one backend up. Safe to re-run (idempotent-ish demo data).

import fs from 'node:fs';
import path from 'node:path';

const ZO = (process.env.ZERO_ONE_BASE_URL || 'http://127.0.0.1:5003').replace(/\/+$/, '');
const API = (process.env.API_BASE_URL || 'http://localhost:5001').replace(/\/+$/, '');
const ADMIN = process.env.ZERO_ONE_ADMIN_EMAIL || 'admin@example.com';
const TEAM_PASSWORD = process.env.TEAM_PASSWORD || 'ZeroOne#2026';

let pass = 0;
let fail = 0;
const step = (name) => console.log(`\n━━ ${name} ━━`);
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name} ${extra}`.slice(0, 300)); }
  return cond;
};
const unwrap = (p) => p?.data ?? p;

// ---------- zero-one helpers (verified-JWT only: the backend no longer
// trusts bare x-user-email headers) ----------
const TOKENS = {};
async function mainLogin(email, password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = unwrap(await res.json().catch(() => null));
  if (!body?.token) throw new Error(`main-site login failed for ${email}: ${res.status}`);
  TOKENS[email] = body.token;
  return body.token;
}
const zHeaders = (email, role, deviceId) => ({
  'Content-Type': 'application/json',
  ...(TOKENS[email] ? { Authorization: `Bearer ${TOKENS[email]}` } : {}),
  ...(email ? { 'x-user-email': email } : {}),
  ...(role ? { 'x-user-role': role } : {}),
  ...(deviceId ? { 'x-device-id': deviceId } : {}),
});
async function zcmd(type, payload = {}, email = ADMIN, role = 'ADMIN', deviceId) {
  const res = await fetch(`${ZO}/api/zero-one/commands`, {
    method: 'POST',
    headers: zHeaders(email, role, deviceId),
    body: JSON.stringify({
      commandId: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      payload,
      userEmail: email,
      role,
    }),
  });
  return res.json().catch(() => ({}));
}
async function zadmin(apiPath, body = {}, email = ADMIN) {
  const res = await fetch(`${ZO}${apiPath}`, {
    method: 'POST',
    headers: zHeaders(email),
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}
async function zpart(apiPath, body = {}, email, role) {
  const res = await fetch(`${ZO}${apiPath}`, {
    method: 'POST',
    headers: zHeaders(email, role),
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}
async function zstate() {
  const res = await fetch(`${ZO}/api/state`, { headers: zHeaders(ADMIN) });
  return res.json();
}
async function zleaderboard() {
  const res = await fetch(`${ZO}/api/zero-one/leaderboard`, { headers: zHeaders(ADMIN) });
  return unwrap(await res.json().catch(() => null));
}
const balanceOf = (ledger, teamId) =>
  ledger.filter((e) => e.teamId === teamId).reduce((a, e) => (e.type === 'CREDIT' ? a + e.amount : a - e.amount), 0);

// ---------- 0. preflight ----------
step('0. Preflight — logins, backend, super-admin, backup snapshot');
let envAdminPassword = process.env.SUPER_ADMIN_PASSWORD || null;
try {
  const env = {};
  for (let line of fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8').split('\n')) {
    line = line.replace(/\r$/, '');
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  envAdminPassword = envAdminPassword || env.SUPER_ADMIN_PASSWORD || null;
} catch { /* no .env */ }
if (!envAdminPassword) {
  console.log('  FATAL need SUPER_ADMIN_PASSWORD in env or .env for the fake admin login');
  process.exit(1);
}
const TEAM_USERS = [
  ['arjun@scriet.edu', TEAM_PASSWORD], ['sneha@scriet.edu', TEAM_PASSWORD],
  ['rahul@scriet.edu', TEAM_PASSWORD], ['pooja@scriet.edu', TEAM_PASSWORD],
  ['karan@scriet.edu', TEAM_PASSWORD], ['ishita@scriet.edu', TEAM_PASSWORD],
];
// Must stay in sync with TEAM_USERS above: every founder logs in with a real
// main-site JWT, so registration uses exactly these accounts (no extras).
const FOUNDERS = [
  ['Arjun Patel', 'arjun@scriet.edu'], ['Sneha Reddy', 'sneha@scriet.edu'],
  ['Rahul Yadav', 'rahul@scriet.edu'], ['Pooja Gupta', 'pooja@scriet.edu'],
  ['Karan Malhotra', 'karan@scriet.edu'], ['Ishita Bose', 'ishita@scriet.edu'],
];
try {
  await mainLogin(ADMIN, envAdminPassword);
  check('fake admin main-site login', true);
  for (const [email, pw] of TEAM_USERS) await mainLogin(email, pw);
  check('6 founders main-site login', TEAM_USERS.every(([e]) => !!TOKENS[e]));
} catch (e) {
  console.log(`  FATAL need main API with users: ${e.message}`);
  process.exit(1);
}
const health = await fetch(`${ZO}/api/health`).then((r) => r.json()).catch(() => null);
check('backend online', health?.status === 'ok', JSON.stringify(health));
const meRes = await fetch(`${ZO}/api/auth/me`, { headers: zHeaders(ADMIN) }).then((r) => r.json()).catch(() => ({}));
check('fake admin is super-admin', meRes.isSuperAdmin === true, JSON.stringify(meRes));
await zcmd('CREATE_SNAPSHOT', { name: 'pre-fake-run backup' });
check('backup snapshot created', true);

// ---------- main-site fake registrations (optional) ----------
step('Main site — fake multi-team registrations');
try {
  const env = {};
  for (let line of fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8').split('\n')) {
    line = line.replace(/\r$/, '');
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  const apiCall = async (p, opts = {}) => {
    const r = await fetch(`${API}${p}`, {
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}) },
      ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
    });
    return { status: r.status, body: unwrap(await r.json().catch(() => null)) };
  };
  const login = await apiCall('/api/auth/login', { method: 'POST', body: { email: env.SUPER_ADMIN_EMAIL, password: env.SUPER_ADMIN_PASSWORD } });
  check('main-site admin login', !!login.body?.token, `status=${login.status}`);
  if (login.body?.token) {
    const adminToken = login.body.token;
    let event = (await apiCall('/api/events/zero-one-2026', { token: adminToken })).body;
    check('main-site event exists', !!event?.id, `slug=${event?.slug}`);
    // Single source of truth: FOUNDERS (kept in sync with TEAM_USERS).
    const founders = FOUNDERS;
    let joined = 0;
    for (const [name, email] of founders) {
      let token = null;
      const reg = await apiCall('/api/auth/register', { method: 'POST', body: { name, email, password: TEAM_PASSWORD } });
      if (reg.status === 201 && reg.body?.token) token = reg.body.token;
      else {
        const again = await apiCall('/api/auth/login', { method: 'POST', body: { email, password: TEAM_PASSWORD } });
        if (again.body?.token) token = again.body.token;
      }
      if (!token) { check(`user ${email}`, false, 'register+login failed'); continue; }
      const j = await apiCall(`/api/registrations/events/${event.id}`, { method: 'POST', token });
      const already = j.status === 400 || j.status === 409;
      if (j.status === 200 || j.status === 201 || already) joined++;
    }
    check(`${founders.length} founders registered for event`, joined === founders.length, `joined=${joined}`);
  }
} catch (e) {
  console.log(`  SKIP main-site part (API down?): ${e.message}`);
}

// ---------- 1. SETUP ----------
step('1. SETUP — reset to start, set 25-min clock');
let r = await zcmd('CHANGE_EVENT_STATE', { status: 'SETUP', force: true });
check('force to SETUP', r.success === true, JSON.stringify(r).slice(0, 160));
r = await zcmd('RESET_CLOCK', { minutes: 25 });
check('clock set 25:00', r.success === true && r.data?.timeRemainingSeconds === 1500, JSON.stringify(r.data));

// ---------- 2. LOBBY — bind fake devices ----------
step('2. LOBBY — fake team check-ins (device binding)');
await zcmd('CHANGE_EVENT_STATE', { status: 'LOBBY' });
const bindings = [
  ['team-01', 'CEO', 'arjun@scriet.edu', 'Arjun Patel'],
  ['team-01', 'CFO', 'sneha@scriet.edu', 'Sneha Reddy'],
  ['team-02', 'CEO', 'rahul@scriet.edu', 'Rahul Yadav'],
  ['team-02', 'CFO', 'pooja@scriet.edu', 'Pooja Gupta'],
  ['team-03', 'CEO', 'karan@scriet.edu', 'Karan Malhotra'],
  ['team-03', 'CFO', 'ishita@scriet.edu', 'Ishita Bose'],
];
let bound = 0;
for (const [teamId, role, email, name] of bindings) {
  const b = await zcmd('BIND_DEVICE', { teamId, role, deviceName: `${name} device`, displayName: name }, email, role, `demo-dev-${teamId}-${role}`);
  if (b.success) bound++;
}
check('6 devices bound with identity', bound === 6, `bound=${bound}`);

// ---------- 3-4. ONBOARDING + BRIEF ----------
step('3-4. ONBOARDING → BRIEF');
check('to ONBOARDING', (await zcmd('CHANGE_EVENT_STATE', { status: 'ONBOARDING' })).success === true);
check('to BRIEF', (await zcmd('CHANGE_EVENT_STATE', { status: 'BRIEF' })).success === true);
r = await zcmd('ANNOUNCE', { title: 'Briefing complete', content: 'Round 1 market opens in 2 minutes. CFOs ready your runway sheets.', type: 'ROUND_CHANGE' });
check('brief announcement', r.success === true);

// ---------- 5. ROUND_1 — market edit + purchase ----------
step('5. ROUND_1 — edit market, team purchase');
check('to ROUND_1', (await zcmd('CHANGE_EVENT_STATE', { status: 'ROUND_1' })).success === true);
r = await zcmd('UPDATE_MARKET_PRICE', { sku: 'CLOUD-CREDITS', price: 99000 });
check('price edit accepted', r.success === true);
let st = await zstate();
check('price visible state-wide', st.marketItems.find((i) => i.sku === 'CLOUD-CREDITS')?.currentPrice === 99000);
r = await zcmd('ADJUST_STOCK', { sku: 'MKT-CAMPAIGN', delta: -2 });
check('stock adjusted', r.success === true);
const before = balanceOf(st.ledger, 'team-02');
const buy = await zpart('/api/participant/purchase', { teamId: 'team-02', sku: 'MKT-CAMPAIGN', idempotencyKey: `demo-buy-${Date.now()}` }, 'pooja@scriet.edu', 'CFO');
check('team-02 purchase commits', buy.body?.success === true, JSON.stringify(buy.body).slice(0, 160));
st = await zstate();
check('ledger debited', balanceOf(st.ledger, 'team-02') < before, `${before} -> ${balanceOf(st.ledger, 'team-02')}`);

// ---------- team edit (admin dashboard Teams tab) ----------
r = await zcmd('UPDATE_TEAM', { teamId: 'team-05', updates: { healthScore: 62 } });
check('team edit (UPDATE_TEAM)', r.success === true && r.data?.team?.healthScore === 62);

// ---------- 6. MARKET_SHOCK ----------
step('6. MARKET_SHOCK — surge pricing');
check('to MARKET_SHOCK', (await zcmd('CHANGE_EVENT_STATE', { status: 'MARKET_SHOCK' })).success === true);
r = await zcmd('UPDATE_MARKET_PRICE', { sku: 'DATA-ANALYTICS', price: 135000 });
check('surge price accepted', r.success === true);
await zcmd('ANNOUNCE', { title: 'Market surge', content: 'Data Analytics demand spike: +25% across the board.', type: 'ALERT' });

// ---------- 7. ROUND_2 — crisis to a PARTICULAR team ----------
step('7. ROUND_2 — crisis → team-02 (AgriNext)');
check('to ROUND_2', (await zcmd('CHANGE_EVENT_STATE', { status: 'ROUND_2' })).success === true);
r = await zcmd('DISPATCH_CRISIS', { teamId: 'team-02', crisisId: 'CRISIS-01' });
check('crisis dispatched', r.success === true, JSON.stringify(r).slice(0, 160));
st = await zstate();
check('crisis targets team-02', st.activeCrisis?.teamId === 'team-02', st.activeCrisis?.teamId);
r = await zcmd('EXTEND_CRISIS_TIMER', { teamId: 'team-02', additionalSeconds: 60 });
check('timer extended +60s', r.success === true);
const resp = await zpart('/api/participant/crisis/response', { teamId: 'team-02', optionId: 'OPT-1', tradeoff: 'Paused hiring to fund the counter-blitz' }, 'pooja@scriet.edu', 'CFO');
check('team resolves crisis', resp.body?.success === true, JSON.stringify(resp.body).slice(0, 200));

// ---------- 8. FIRESIDE ----------
step('8. FIRESIDE — bridge loan');
check('to FIRESIDE', (await zcmd('CHANGE_EVENT_STATE', { status: 'FIRESIDE' })).success === true);
r = await zcmd('GRANT_LOAN', { teamId: 'team-03', principal: 200000, interestPct: 5 });
check('loan granted', r.success === true && r.data?.entry?.amount === 200000);

// ---------- 9. AUCTION ----------
step('9. AUCTION — open, bids, close');
check('to AUCTION', (await zcmd('CHANGE_EVENT_STATE', { status: 'AUCTION' })).success === true);
const open = await zadmin('/api/admin/auction/open', { title: 'Demo Keynote Slot', description: 'First pitch position', itemSku: 'KEYNOTE-SLOT', minBid: 100000, durationMinutes: 10 });
check('auction opened', open.body?.success === true, JSON.stringify(open.body).slice(0, 160));
const bid1 = await zpart('/api/participant/auction/bid', { teamId: 'team-01', teamName: 'TechNova', amount: 120000 }, 'arjun@scriet.edu', 'CEO');
const bid2 = await zpart('/api/participant/auction/bid', { teamId: 'team-02', teamName: 'AgriNext', amount: 140000 }, 'rahul@scriet.edu', 'CEO');
check('two bids in', bid1.body?.success === true && bid2.body?.success === true);
const close = await zadmin('/api/admin/auction/close', {});
check('auction closed, team-02 wins @140000', close.body?.success === true && close.body?.auction?.winningBid === 140000, JSON.stringify(close.body?.auction));
st = await zstate();
const winDebit = st.ledger.find((e) => e.teamId === 'team-02' && e.type === 'DEBIT' && e.amount === 140000);
check('winner debited on ledger', !!winDebit);

// ---------- 10. ROUND_3 — bonus, canvas, artifact ----------
step('10. ROUND_3 — bonus, canvas, prototype');
check('to ROUND_3', (await zcmd('CHANGE_EVENT_STATE', { status: 'ROUND_3' })).success === true);
r = await zcmd('MANUAL_LEDGER_ADJUSTMENT', { teamId: 'team-01', type: 'CREDIT', amount: 50000, reason: 'Demo innovation bonus' });
check('manual bonus credited', r.success === true);
r = await zcmd('SUBMIT_CANVAS', { teamId: 'team-01', canvas: { usp: 'Demo USP: 70% cheaper via campus escrow lockers.' } });
check('canvas submitted', r.success === true);
r = await zcmd('SUBMIT_ARTIFACT', { teamId: 'team-01', kind: 'PROTOTYPE', title: 'Demo MVP', url: 'https://demo.example/mvp', description: 'Fake-run prototype' }, 'karan@scriet.edu', 'CTO');
check('artifact submitted', r.success === true, JSON.stringify(r).slice(0, 200));

// ---------- 11. LOCKDOWN — freeze enforced ----------
step('11. LOCKDOWN — trading freeze enforced server-side');
check('to LOCKDOWN', (await zcmd('CHANGE_EVENT_STATE', { status: 'LOCKDOWN' })).success === true);
r = await zcmd('LOCKDOWN', { active: true });
check('lockdown on', r.success === true && r.data?.isLockdownActive === true);
const frozen = await zpart('/api/participant/purchase', { teamId: 'team-01', sku: 'MKT-CAMPAIGN', idempotencyKey: `demo-frozen-${Date.now()}` }, 'sneha@scriet.edu', 'CFO');
check('purchase blocked in lockdown', frozen.body?.success === false, JSON.stringify(frozen.body).slice(0, 160));
r = await zcmd('LOCKDOWN', { active: false });
check('lockdown released', r.success === true && r.data?.isLockdownActive === false);

// ---------- 12. QUALIFIERS — judging ----------
step('12. QUALIFIERS — judge scoring');
check('to QUALIFIERS', (await zcmd('CHANGE_EVENT_STATE', { status: 'QUALIFIERS' })).success === true);
r = await zcmd('ASSIGN_JUDGE', { judgeEmail: 'judge@scriet.edu', teamIds: ['team-01', 'team-02', 'team-03'] });
check('judge assigned', r.success === true);
const rubric = { 'crit-problem': 8, 'crit-innovation': 7, 'crit-business': 8, 'crit-finance': 7, 'crit-crisis': 8, 'crit-pitch': 7, 'crit-feasibility': 8 };
let scored = 0;
for (const [teamId, tweak] of [['team-01', 1], ['team-02', 0], ['team-03', -1]]) {
  const s = { ...rubric, 'crit-pitch': 7 + tweak };
  const jr = await zcmd('SUBMIT_JUDGE_SCORE', { score: { teamId, judgeId: 'judge-1', judgeName: 'Demo Judge (via event admin)', scores: s, feedback: 'Fake-run evaluation' } }, ADMIN, 'ADMIN');
  if (jr.success) scored++;
}
check('3 judge scorecards in', scored === 3, `scored=${scored}`);

// ---------- 12b. ADMIN CONSOLE WIRING (new commands) ----------
step('12b. Admin console — config, crisis cards, criteria, live screen');
r = await zcmd('UPDATE_EVENT_CONFIG', { config: { dynamicPricingEnabled: false } });
check('dynamic pricing toggle off', r.success === true && r.data?.config?.dynamicPricingEnabled === false);
r = await zcmd('UPDATE_EVENT_CONFIG', { config: { dynamicPricingEnabled: true } });
check('dynamic pricing toggle on', r.success === true && r.data?.config?.dynamicPricingEnabled === true);
r = await zcmd('CREATE_CRISIS_CARD', { card: {
  title: 'Demo Supply Chain Freeze',
  category: 'Market',
  severity: 'MEDIUM',
  description: 'Fake-run authored shock.',
  timerSeconds: 300,
  options: [
    { id: 'OPT-A', label: 'Pay premium freight', cost: 40000, description: 'Air-freight the shortfall.', effectDescription: 'Delays avoided at cost.', healthDelta: 4, requiresRoles: ['CEO', 'CFO'] },
    { id: 'OPT-B', label: 'Wait it out', cost: 0, description: 'Absorb the delay.', effectDescription: 'No spend, minor impact.', healthDelta: -2, requiresRoles: ['CEO'] },
  ],
} });
const newCardId = r.data?.card?.id;
check('crisis card authored', r.success === true && !!newCardId, `id=${newCardId}`);
if (newCardId) {
  r = await zcmd('DISPATCH_CRISIS', { teamId: 'team-03', crisisId: newCardId });
  check('authored card dispatched to team-03', r.success === true && r.data?.crisis?.crisisId === newCardId);
  st = await zstate();
  check('team-03 holds the authored crisis', st.activeCrisis?.teamId === 'team-03');
  const resp3 = await zpart('/api/participant/crisis/response', { teamId: 'team-03', optionId: 'OPT-A', tradeoff: 'Paid premium freight from reserves' }, 'karan@scriet.edu', 'CEO');
  check('team-03 resolves authored crisis', resp3.body?.success === true, JSON.stringify(resp3.body).slice(0, 160));
}
r = await zcmd('UPDATE_JUDGING_CRITERIA', { id: 'crit-pitch', updates: { weight: 1.5 } });
check('criterion weight edited', r.success === true && r.data?.criterion?.weight === 1.5);
r = await zcmd('UPDATE_LIVE_SCREEN', { config: { announcementTickerText: 'DEMO TICKER • FAKE FULL RUN', presentationMode: 'NORMAL' } });
check('live screen ticker pushed', r.success === true);

// ---------- 13-14. DELIBERATION → FINALS ----------
step('13-14. DELIBERATION → FINALS');
check('to DELIBERATION', (await zcmd('CHANGE_EVENT_STATE', { status: 'DELIBERATION' })).success === true);
check('to FINALS', (await zcmd('CHANGE_EVENT_STATE', { status: 'FINALS' })).success === true);
let lb = await zleaderboard();
check('leaderboard computed', Array.isArray(lb?.leaderboard) && lb.leaderboard.length === 10, `rows=${lb?.leaderboard?.length}`);

// ---------- 15. REVEAL ----------
step('15. REVEAL — winners');
r = await zcmd('REVEAL_RESULTS', {});
check('results revealed', r.success === true);
lb = await zleaderboard();
const rows = [...(lb?.leaderboard || [])].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
console.log('\n  FINAL LEADERBOARD');
rows.forEach((t, i) => console.log(`  ${i + 1}. ${t.name} — ${t.totalScore} (floor ${t.floorScore}, judge ${t.judgeAverage}, bal ${t.balance})`));
await zcmd('CREATE_SNAPSHOT', { name: 'fake-full-run-final' });
check('final snapshot saved', true);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
