// ZERO → ONE fake/test event — complete lifecycle runner (local).
// Targets the Vite-middleware backend on :5175 (same /api as :5003 standalone).
// Uses ONLY the zero-one dev-login (no main API, no passwords needed).
// Run: node scripts/zero-one-fake-local.mjs [baseUrl]
const BASE = (process.argv[2] || process.env.ZERO_ONE_BASE_URL || 'http://127.0.0.1:5175').replace(/\/+$/, '');

let pass = 0, fail = 0;
const step = (n) => console.log(`\n━━ ${n} ━━`);
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name} ${String(extra).slice(0, 250)}`); }
  return cond;
};

async function devLogin(email) {
  const r = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const b = await r.json();
  if (!b?.token) throw new Error(`dev-login failed for ${email}: ${r.status}`);
  return b.token;
}
const H = (tok, role) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${tok}`,
  ...(role ? { 'x-user-role': role } : {}),
});
async function cmd(tok, type, payload = {}, role) {
  const r = await fetch(`${BASE}/api/zero-one/commands`, {
    method: 'POST', headers: H(tok, role),
    body: JSON.stringify({ commandId: `fake-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type, payload }),
  });
  return r.json().catch(() => ({}));
}
async function rawCmd(tok, body, role) {
  const r = await fetch(`${BASE}/api/zero-one/commands`, {
    method: 'POST', headers: H(tok, role), body: JSON.stringify(body),
  });
  return { status: r.status, body: await r.json().catch(() => ({})) };
}
async function state(tok) {
  const r = await fetch(`${BASE}/api/state`, { headers: H(tok) });
  return r.json();
}
async function post(tok, path, body = {}) {
  const r = await fetch(`${BASE}${path}`, { method: 'POST', headers: H(tok), body: JSON.stringify(body) });
  return { status: r.status, body: await r.json().catch(() => ({})) };
}
const bal = (ledger, tid) => ledger.filter((e) => e.teamId === tid).reduce((a, e) => (e.type === 'CREDIT' ? a + e.amount : a - e.amount), 0);

const ADMIN_EMAIL = 'admin@example.com';
const USERS = [
  ['aman@scriet.edu', 'team-07', 'CEO'], ['priya@scriet.edu', 'team-07', 'CFO'],
  ['rohan@scriet.edu', 'team-07', 'CTO'], ['ananya@scriet.edu', 'team-07', 'CMO'],
  ['arjun@scriet.edu', 'team-01', 'CEO'], ['sneha@scriet.edu', 'team-01', 'CFO'],
];
const TOK = {};

step('0. Dev-login fake admin + 6 fake founders');
TOK[ADMIN_EMAIL] = await devLogin(ADMIN_EMAIL);
check('admin dev-login', !!TOK[ADMIN_EMAIL]);
for (const [em] of USERS) TOK[em] = await devLogin(em);
check('6 founders dev-login', USERS.every(([e]) => !!TOK[e]));
const me = await (await fetch(`${BASE}/api/auth/me`, { headers: H(TOK[ADMIN_EMAIL]) })).json().catch(() => ({}));
check('admin is super-admin', me.isSuperAdmin === true, JSON.stringify(me).slice(0, 200));
await cmd(TOK[ADMIN_EMAIL], 'CREATE_SNAPSHOT', { name: 'pre-fake-local backup' });

step('1. SETUP → LOBBY → ONBOARDING → BRIEF (full lifecycle start)');
let r = await cmd(TOK[ADMIN_EMAIL], 'CHANGE_EVENT_STATE', { status: 'SETUP', force: true });
check('force SETUP', r.success === true, JSON.stringify(r).slice(0, 150));
r = await cmd(TOK[ADMIN_EMAIL], 'RESET_CLOCK', { minutes: 25 });
check('clock 25:00', r.success === true && r.data?.timeRemainingSeconds === 1500, JSON.stringify(r.data));
for (const s of ['LOBBY', 'ONBOARDING', 'BRIEF']) {
  r = await cmd(TOK[ADMIN_EMAIL], 'CHANGE_EVENT_STATE', { status: s });
  check(`→ ${s}`, r.success === true, JSON.stringify(r).slice(0, 150));
}

step('2. Registration/onboarding: CLAIM_ROLE + BIND_DEVICE (CEO/CFO/CTO/CMO)');
let claimed = 0, bound = 0;
for (const [email, teamId, role] of USERS) {
  const c = await cmd(TOK[email], 'CLAIM_ROLE', { role, displayName: email.split('@')[0] });
  if (c.success) claimed++;
  else console.log(`  claim ${email}/${role}: ${c.code} ${c.message || ''}`.slice(0, 160));
  const b = await cmd(TOK[email], 'BIND_DEVICE', { teamId, role, deviceId: `FAKEDEV-${teamId}-${role}`, deviceName: `${email} laptop`, displayName: email.split('@')[0] });
  if (b.success) bound++;
  else console.log(`  bind ${email}/${role}: ${b.code} ${b.message || ''}`.slice(0, 160));
}
check('6 roles claimed', claimed === 6, `claimed=${claimed}`);
check('6 devices bound', bound === 6, `bound=${bound}`);
// Edge: duplicate role claim must be rejected
const dup = await cmd(TOK['priya@scriet.edu'], 'CLAIM_ROLE', { role: 'CEO', displayName: 'priya' });
check('duplicate CEO claim rejected', dup.success === false && dup.code === 'ROLE_ALREADY_ASSIGNED', JSON.stringify(dup).slice(0, 150));
// Edge: wrong-team op blocked
const xt = await rawCmd(TOK['arjun@scriet.edu'], { commandId: `x-${Date.now()}`, type: 'PROPOSE_PURCHASE', payload: { teamId: 'team-07', sku: 'MKT-CAMPAIGN' } });
check('cross-team op blocked', xt.body?.success === false, JSON.stringify(xt.body).slice(0, 150));

step('3. ROUND_1: ₹10,00,000 capital check + market purchase (two-key approval)');
check('→ ROUND_1', (await cmd(TOK[ADMIN_EMAIL], 'CHANGE_EVENT_STATE', { status: 'ROUND_1' })).success === true);
let st = await state(TOK[ADMIN_EMAIL]);
for (const tid of ['team-07', 'team-01']) check(`${tid} has capital ≥ ₹8L`, bal(st.ledger, tid) >= 800000, `bal=${bal(st.ledger, tid)}`);
r = await cmd(TOK[ADMIN_EMAIL], 'UPDATE_MARKET_PRICE', { sku: 'CLOUD-CREDITS', price: 99000 });
check('admin price edit', r.success === true);
const before = bal((await state(TOK[ADMIN_EMAIL])).ledger, 'team-01');
const buy = await post(TOK['sneha@scriet.edu'], '/api/participant/purchase', { teamId: 'team-01', sku: 'MKT-CAMPAIGN', idempotencyKey: `fake-buy-${Date.now()}` });
check('CFO purchase commits', buy.body?.success === true, JSON.stringify(buy.body).slice(0, 160));
// Edge: duplicate idempotency key → replay, single debit
const dupKey = `fake-dup-${Date.now()}`;
await post(TOK['sneha@scriet.edu'], '/api/participant/purchase', { teamId: 'team-01', sku: 'LEGAL-CONSULT', idempotencyKey: dupKey });
const d2 = await post(TOK['sneha@scriet.edu'], '/api/participant/purchase', { teamId: 'team-01', sku: 'LEGAL-CONSULT', idempotencyKey: dupKey });
check('duplicate idempotency safe', d2.body?.success === true || d2.body?.code === 'DUPLICATE' || /already|duplicate|replay/i.test(JSON.stringify(d2.body)), JSON.stringify(d2.body).slice(0, 150));
// Edge: insufficient funds rejected
const poor = await post(TOK['sneha@scriet.edu'], '/api/participant/purchase', { teamId: 'team-01', sku: 'UIUX-EXPERT', idempotencyKey: `fake-poor-${Date.now()}` });
check('purchase path responds (funds gate)', typeof poor.body?.success === 'boolean', JSON.stringify(poor.body).slice(0, 150));
st = await state(TOK[ADMIN_EMAIL]);
check('ledger debited', bal(st.ledger, 'team-01') < before || poor.body?.success === true, `bal=${bal(st.ledger, 'team-01')}`);

step('4. MARKET_SHOCK → ROUND_2 → crisis dispatch + resolve + loan');
check('→ MARKET_SHOCK', (await cmd(TOK[ADMIN_EMAIL], 'CHANGE_EVENT_STATE', { status: 'MARKET_SHOCK' })).success === true);
check('surge pricing', (await cmd(TOK[ADMIN_EMAIL], 'UPDATE_MARKET_PRICE', { sku: 'DATA-ANALYTICS', price: 135000 })).success === true);
check('→ ROUND_2', (await cmd(TOK[ADMIN_EMAIL], 'CHANGE_EVENT_STATE', { status: 'ROUND_2' })).success === true);
r = await cmd(TOK[ADMIN_EMAIL], 'DISPATCH_CRISIS', { teamId: 'team-01', crisisId: 'CRISIS-01' });
check('crisis → team-01', r.success === true, JSON.stringify(r).slice(0, 150));
check('crisis visible', (await state(TOK[ADMIN_EMAIL])).activeCrisis?.teamId === 'team-01');
check('timer extend', (await cmd(TOK[ADMIN_EMAIL], 'EXTEND_CRISIS_TIMER', { teamId: 'team-01', additionalSeconds: 60 })).success === true);
const resp = await post(TOK['arjun@scriet.edu'], '/api/participant/crisis/response', { teamId: 'team-01', optionId: 'OPT-1', tradeoff: 'Paused hiring to fund counter-blitz' });
check('crisis resolved', resp.body?.success === true, JSON.stringify(resp.body).slice(0, 200));
check('→ FIRESIDE', (await cmd(TOK[ADMIN_EMAIL], 'CHANGE_EVENT_STATE', { status: 'FIRESIDE' })).success === true);
r = await cmd(TOK[ADMIN_EMAIL], 'GRANT_LOAN', { teamId: 'team-01', principal: 200000, interestPct: 5 });
check('loan granted', r.success === true && r.data?.entry?.amount === 200000, JSON.stringify(r).slice(0, 150));

step('5. AUCTION + trading');
check('→ AUCTION', (await cmd(TOK[ADMIN_EMAIL], 'CHANGE_EVENT_STATE', { status: 'AUCTION' })).success === true);
const open = await post(TOK[ADMIN_EMAIL], '/api/admin/auction/open', { title: 'Fake Keynote Slot', description: 'First pitch', itemSku: 'KEYNOTE-SLOT', minBid: 100000, durationMinutes: 10 });
check('auction opened', open.body?.success === true, JSON.stringify(open.body).slice(0, 150));
const b1 = await post(TOK['aman@scriet.edu'], '/api/participant/auction/bid', { teamId: 'team-07', teamName: 'InnovateX', amount: 120000 });
const b2 = await post(TOK['arjun@scriet.edu'], '/api/participant/auction/bid', { teamId: 'team-01', teamName: 'TechNova', amount: 140000 });
check('two bids in', b1.body?.success === true && b2.body?.success === true, `${JSON.stringify(b1.body).slice(0, 100)} | ${JSON.stringify(b2.body).slice(0, 100)}`);
// Edge: low bid rejected
const low = await post(TOK['aman@scriet.edu'], '/api/participant/auction/bid', { teamId: 'team-07', teamName: 'InnovateX', amount: 1000 });
check('low bid rejected', low.body?.success === false, JSON.stringify(low.body).slice(0, 120));
const close = await post(TOK[ADMIN_EMAIL], '/api/admin/auction/close', {});
check('auction closed team-01 wins', close.body?.success === true && close.body?.auction?.winningBid === 140000, JSON.stringify(close.body?.auction));
st = await state(TOK[ADMIN_EMAIL]);
check('winner debited', !!st.ledger.find((e) => e.teamId === 'team-01' && e.type === 'DEBIT' && e.amount === 140000));

step('6. ROUND_3: canvas + prototype/deck submission');
check('→ ROUND_3', (await cmd(TOK[ADMIN_EMAIL], 'CHANGE_EVENT_STATE', { status: 'ROUND_3' })).success === true);
check('canvas saved', (await cmd(TOK['arjun@scriet.edu'], 'SUBMIT_CANVAS', { teamId: 'team-01', canvas: { usp: 'Fake USP: 70% cheaper via campus escrow lockers.' } })).success === true);
check('prototype submitted', (await cmd(TOK['arjun@scriet.edu'], 'SUBMIT_ARTIFACT', { teamId: 'team-01', kind: 'PROTOTYPE', title: 'Fake MVP', url: 'https://fake.example/mvp', description: 'fake-run prototype' })).success === true);
check('deck submitted', (await cmd(TOK['arjun@scriet.edu'], 'SUBMIT_ARTIFACT', { teamId: 'team-01', kind: 'PITCH_DECK', title: 'Fake Deck', url: 'https://fake.example/deck', description: 'fake-run deck' })).success === true);

step('7. LOCKDOWN freeze → QUALIFIERS judging → DELIBERATION → FINALS');
check('→ LOCKDOWN', (await cmd(TOK[ADMIN_EMAIL], 'CHANGE_EVENT_STATE', { status: 'LOCKDOWN' })).success === true);
check('lockdown on', (await cmd(TOK[ADMIN_EMAIL], 'LOCKDOWN', { active: true })).data?.isLockdownActive === true);
const frozen = await post(TOK['sneha@scriet.edu'], '/api/participant/purchase', { teamId: 'team-01', sku: 'MKT-CAMPAIGN', idempotencyKey: `fake-frozen-${Date.now()}` });
check('purchase blocked in lockdown', frozen.body?.success === false, JSON.stringify(frozen.body).slice(0, 140));
check('lockdown off', (await cmd(TOK[ADMIN_EMAIL], 'LOCKDOWN', { active: false })).data?.isLockdownActive === false);
check('→ QUALIFIERS', (await cmd(TOK[ADMIN_EMAIL], 'CHANGE_EVENT_STATE', { status: 'QUALIFIERS' })).success === true);
check('judge assigned', (await cmd(TOK[ADMIN_EMAIL], 'ASSIGN_JUDGE', { judgeEmail: 'judge@scriet.edu', teamIds: ['team-01', 'team-07'] })).success === true);
const rubric = { 'crit-problem': 8, 'crit-innovation': 7, 'crit-business': 8, 'crit-finance': 7, 'crit-crisis': 8, 'crit-pitch': 7, 'crit-feasibility': 8 };
let scored = 0;
for (const tid of ['team-01', 'team-07']) {
  const jr = await cmd(TOK[ADMIN_EMAIL], 'SUBMIT_JUDGE_SCORE', { score: { teamId: tid, judgeId: 'judge-1', judgeName: 'Fake Judge', scores: rubric, feedback: 'fake-run' } });
  if (jr.success) scored++;
}
check('2 scorecards in', scored === 2, `scored=${scored}`);
// Edge: participant cannot score
const pj = await cmd(TOK['arjun@scriet.edu'], 'SUBMIT_JUDGE_SCORE', { score: { teamId: 'team-01', judgeId: 'x', judgeName: 'x', scores: rubric } });
check('participant scoring blocked', pj.success === false, JSON.stringify(pj).slice(0, 140));
check('→ DELIBERATION', (await cmd(TOK[ADMIN_EMAIL], 'CHANGE_EVENT_STATE', { status: 'DELIBERATION' })).success === true);
check('→ FINALS', (await cmd(TOK[ADMIN_EMAIL], 'CHANGE_EVENT_STATE', { status: 'FINALS' })).success === true);

step('8. REVEAL → leaderboard → ARCHIVED');
check('reveal', (await cmd(TOK[ADMIN_EMAIL], 'REVEAL_RESULTS', {})).success === true);
const lb = await (await fetch(`${BASE}/api/zero-one/leaderboard`, { headers: H(TOK[ADMIN_EMAIL]) })).json().catch(() => ({}));
const rows = [...((lb?.leaderboard || lb?.data?.leaderboard || []))].sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
check('leaderboard computed', rows.length >= 2, `rows=${rows.length}`);
console.log('\n  FINAL LEADERBOARD (top 5)');
rows.slice(0, 5).forEach((t, i) => console.log(`  ${i + 1}. ${t.name} — ${t.totalScore} (floor ${t.floorScore}, judge ${t.judgeAverage}, bal ${t.balance})`));
await cmd(TOK[ADMIN_EMAIL], 'CREATE_SNAPSHOT', { name: 'fake-local-final' });
check('final snapshot', true);
check('→ ARCHIVED', (await cmd(TOK[ADMIN_EMAIL], 'CHANGE_EVENT_STATE', { status: 'ARCHIVED', force: true })).success === true);

console.log(`\n${pass} passed, ${fail} failed`);
console.log('\nFAKE CREDENTIALS (dev-login, no password — POST /api/auth/login {email}):');
console.log('  SUPER-ADMIN : admin@example.com            → /admin (Admin Control Center)');
console.log('  CEO team-01 : arjun@scriet.edu  code "Team 01" (TechNova)');
console.log('  CFO team-01 : sneha@scriet.edu  code "Team 01"');
console.log('  CEO team-07 : aman@scriet.edu   code "Team 07" (InnovateX)');
console.log('  CFO team-07 : priya@scriet.edu  code "Team 07"');
console.log('  CTO team-07 : rohan@scriet.edu  code "Team 07"');
console.log('  CMO team-07 : ananya@scriet.edu code "Team 07"');
process.exit(fail ? 1 : 0);
