// Local test setup: creates team users on the main API, ensures the ZERO-ONE
// event exists, and registers the users for it.
// Run with the API up:  node scripts/seed-zero-one-local.mjs
// Reads SUPER_ADMIN creds from root .env (never printed).
import fs from 'node:fs';
import path from 'node:path';

const API = (process.env.API_BASE_URL || 'http://localhost:5001').replace(/\/+$/, '');
const TEAM_PASSWORD = process.env.TEAM_PASSWORD || 'ZeroOne#2026';

const TEAM = [
  { name: 'Arjun Patel', email: 'arjun@scriet.edu' },
  { name: 'Sneha Reddy', email: 'sneha@scriet.edu' },
  { name: 'Vikram Joshi', email: 'vikram@scriet.edu' },
  { name: 'Divya Nair', email: 'divya@scriet.edu' },
];

function loadEnv(root) {
  const out = {};
  try {
    for (let line of fs.readFileSync(path.join(root, '.env'), 'utf8').split('\n')) {
      line = line.replace(/\r$/, '');
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim();
    }
  } catch { /* no .env */ }
  return out;
}
const env = loadEnv(process.cwd());
const ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || env.SUPER_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || env.SUPER_ADMIN_PASSWORD;
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('SUPER_ADMIN_EMAIL/PASSWORD missing from .env');
  process.exit(1);
}

const unwrap = (p) => p?.data ?? p;
async function api(pathname, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${API}${pathname}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await res.json().catch(() => null);
  return { status: res.status, body: unwrap(payload), raw: payload };
}

// 1. Admin login
const login = await api('/api/auth/login', { method: 'POST', body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
if (!login.body?.token) {
  console.error('Admin login failed:', login.status, JSON.stringify(login.raw)?.slice(0, 300));
  process.exit(1);
}
const adminToken = login.body.token;
console.log('admin login ok');

// 2. Ensure ZERO-ONE event
let event = (await api('/api/events/zero-one', { token: adminToken })).body;
if (!event?.id) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() + ((6 - start.getDay() + 7) % 7 || 7));
  start.setHours(4, 30, 0, 0);
  const created = await api('/api/events', {
    method: 'POST',
    token: adminToken,
    body: {
      title: 'ZERO → ONE 2026',
      shortDescription: 'Flagship startup simulation: build, spend, survive crises, pitch.',
      description:
        'ZERO → ONE is the flagship interactive startup simulation of Code.SCRIET. ' +
        'Squads receive ₹10,00,000 virtual capital, trade on a live market, survive ' +
        'crisis events, bid in auctions, and pitch to judges. Register here, then ' +
        'enter the live arena from this page on event day.',
      startDate: start.toISOString(),
      endDate: new Date(start.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      venue: 'SCRIET Campus, CCS University Meerut',
      eventType: 'Competition',
      targetAudience: 'Student founders (teams of 3-5)',
      capacity: 500,
      tags: ['zero-one', 'flagship', 'simulation'],
      featured: true,
    },
  });
  if (!created.body?.id) {
    console.error('Event create failed:', created.status, JSON.stringify(created.raw)?.slice(0, 500));
    process.exit(1);
  }
  event = created.body;
  console.log('event created:', event.slug);
} else {
  console.log('event exists:', event.slug, '-', event.title);
}

// 3. Team users + registrations
for (const u of TEAM) {
  let token = null;
  const reg = await api('/api/auth/register', { method: 'POST', body: { name: u.name, email: u.email, password: TEAM_PASSWORD } });
  if (reg.status === 201 && reg.body?.token) {
    token = reg.body.token;
    console.log(`user created: ${u.email}`);
  } else {
    const again = await api('/api/auth/login', { method: 'POST', body: { email: u.email, password: TEAM_PASSWORD } });
    if (again.body?.token) {
      token = again.body.token;
      console.log(`user exists, login ok: ${u.email}`);
    } else {
      console.log(`USER PROBLEM ${u.email}: register=${reg.status} login=${again.status} ${JSON.stringify(again.raw)?.slice(0, 200)}`);
      continue;
    }
  }
  const join = await api(`/api/registrations/events/${event.id}`, { method: 'POST', token });
  console.log(`  registered for event: ${join.status === 200 || join.status === 201 ? 'yes' : `NO (${join.status} ${JSON.stringify(join.raw)?.slice(0, 200)})`}`);
}

console.log('\nDone. Login as a team member with:');
console.log(`  email:    ${TEAM[0].email}`);
console.log(`  password: ${TEAM_PASSWORD}`);
console.log(`Event page: /events/${event.slug}  (register state shown, Enter Zero-One Event button)`);
