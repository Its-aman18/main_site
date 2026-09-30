// Creates the main-site ZERO → ONE event (idempotent by slug).
// The event page shows an "Enter Zero-One Event" button to registered users
// when the event is tagged `zero-one` (see EventDetailPage).
//
// Usage:
//   API_BASE_URL=http://localhost:5001 \
//   SUPER_ADMIN_EMAIL=admin@example.com SUPER_ADMIN_PASSWORD=secret \
//   node scripts/seed-zero-one-event.mjs
//
// Requires the API running and a CORE_MEMBER+ account. Safe to re-run.

const API = (process.env.API_BASE_URL || 'http://localhost:5001').replace(/\/+$/, '');
const EMAIL = process.env.SUPER_ADMIN_EMAIL;
const PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error('Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD (same as backend seed).');
  process.exit(1);
}

const unwrap = (payload) => payload?.data ?? payload;

const loginRes = await fetch(`${API}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
if (!loginRes.ok) {
  console.error('Login failed:', loginRes.status, await loginRes.text().catch(() => ''));
  process.exit(1);
}
const loginBody = unwrap(await loginRes.json().catch(() => null));
const token = loginBody?.token;
if (!token) {
  console.error('Login response carried no token.');
  process.exit(1);
}
const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

// Idempotency: slug lookup first (GET /api/events/:id accepts a slug).
const existing = await fetch(`${API}/api/events/zero-one`, { headers: auth });
if (existing.ok) {
  const body = unwrap(await existing.json().catch(() => null));
  console.log('ZERO-ONE event already exists:', body?.slug, '-', body?.title);
  process.exit(0);
}

const now = new Date();
// Next Saturday 10:00 IST -> UTC approximation (+5:30). Admins adjust in panel.
const start = new Date(now);
start.setDate(start.getDate() + ((6 - start.getDay() + 7) % 7 || 7));
start.setHours(4, 30, 0, 0);
const end = new Date(start.getTime() + 8 * 60 * 60 * 1000);

const createRes = await fetch(`${API}/api/events`, {
  method: 'POST',
  headers: auth,
  body: JSON.stringify({
    title: 'ZERO → ONE 2026',
    shortDescription: 'Flagship startup simulation: build, spend, survive crises, pitch.',
    description:
      'ZERO → ONE is the flagship interactive startup simulation of Code.SCRIET. ' +
      'Squads of founders receive ₹10,00,000 in virtual capital, trade on a live ' +
      'market, survive timed crisis events, bid in auctions, and pitch to judges. ' +
      'Register here, then enter the live arena from this page on event day.',
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    venue: 'SCRIET Campus, CCS University Meerut',
    eventType: 'Competition',
    targetAudience: 'Student founders (teams of 3-5)',
    capacity: 500,
    tags: ['zero-one', 'flagship', 'simulation'],
    featured: true,
  }),
});
const created = await createRes.json().catch(() => null);
if (!createRes.ok) {
  console.error('Create failed:', createRes.status, JSON.stringify(created)?.slice(0, 500));
  process.exit(1);
}
const event = unwrap(created);
console.log('Created ZERO-ONE event:', event?.slug, '-', event?.title);
console.log('Open:', `/events/${event?.slug}`, '— registered users will see "Enter Zero-One Event".');
