# ZERO → ONE — Oracle VM deployment

Target: `https://zero-one.codescriet.dev` on the Oracle VM, connected to the
main site exactly the way the playground is (shared JWT session, CORS
allowlist, env-driven origins, HTTP-only integration — no cross-app imports).

## 1. Layout on the VM

| Service            | Origin                        | Backend              |
| ------------------ | ----------------------------- | -------------------- |
| Main web           | `https://codescriet.dev`      | API on `:5001`       |
| Main API           | `https://api.codescriet.dev`  | Express on `:5001`   |
| Playground         | `https://code.codescriet.dev` | execute-server `:5002` |
| **Zero-One**       | `https://zero-one.codescriet.dev` | **standalone `:5003`** |

Zero-one is a **single service**: `server/standaloneServer.ts` serves the
built SPA (`dist/` — dual entry `index.html` + `admin.html`) and the
authoritative `/api` from `:5003`. Same-origin, so production needs no CORS
exceptions. (Dev uses Vite on `:5175` with the backend as middleware —
playground owns `:5174`, do not reuse it.)

## 2. First install

```bash
cd /opt
git clone <main_site repo> club && cd club
npm install                       # workspaces: api, web, playground, zero-one
cp apps/zero-one/.env.example apps/zero-one/.env
# Edit apps/zero-one/.env:
#   JWT_SECRET=<SAME value as the main API>
#   FRONTEND_URL=https://codescriet.dev
#   ALLOWED_ORIGIN=https://zero-one.codescriet.dev,https://codescriet.dev,https://www.codescriet.dev
#   BOOTSTRAP_SUPERADMIN_EMAIL=<venue super-admin>
#   SNAPSHOT_STORAGE_DIR=/var/lib/zero-one/snapshots   (persistent disk!)

npm run build --workspace=apps/zero-one
sudo mkdir -p /opt/zero-one /var/lib/zero-one/snapshots
sudo cp -r apps/zero-one/dist apps/zero-one/server apps/zero-one/package.json /opt/zero-one/
sudo cp apps/zero-one/.env /opt/zero-one/.env && sudo chmod 600 /opt/zero-one/.env
cd /opt/zero-one && npm install --omit=dev   # dotenv, jsonwebtoken, react…

sudo cp apps/zero-one/deploy/zero-one-backend.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now zero-one-backend

sudo cp apps/zero-one/deploy/nginx-zero-one.conf /etc/nginx/sites-available/zero-one.codescriet.dev
sudo ln -s /etc/nginx/sites-available/zero-one.codescriet.dev /etc/nginx/sites-enabled/
sudo certbot --nginx -d zero-one.codescriet.dev
sudo nginx -t && sudo systemctl reload nginx
```

Main API already allows the origin (`apps/api/src/index.ts`
`ALLOWED_CODESCRIET_ORIGINS` includes `https://zero-one.codescriet.dev`), and
the main web header links to zero-one with a `#token` handoff
(`apps/web/src/lib/zeroOneUrl.ts`).

## 2b. Main-site event entry (one-time)

Registered participants get an **Enter Zero-One Event** button on the event
page when the event carries the `zero-one` tag (or a `zero-one*` slug).
Create it once via API (idempotent by slug) or the admin panel:

```bash
API_BASE_URL=https://api.codescriet.dev \
SUPER_ADMIN_EMAIL=<admin> SUPER_ADMIN_PASSWORD=<secret> \
npm run seed:zero-one-event
```

Flow: user registers on `/events/zero-one*` → entry button appears →
handoff with `#token` → zero-one validates against the main API and signs
them in → onboarding binds squad + role + device to their email.

The local main-site super admin (`SUPER_ADMIN_EMAIL` in root `.env`,
`admin@example.com` in dev) is seeded as a zero-one SUPER_ADMIN, so it opens
`/admin.html` right after handoff. Extra staff: `ADMIN_EMAILS` (comma-separated,
auto-verified ADMIN; aliases `EXTRA_ADMIN_EMAILS`, `VITE_ADMIN_EMAILS`).

## 2c. Full fake event rehearsal (one command)

`npm run demo:zero-one` drives the backend through the whole lifecycle
SETUP → … → REVEAL as the super-admin: multi-team device check-ins, clock
sets, market edits, a crisis sent to AgriNext, auction with bids, lockdown
freeze check, judge scorecards, and the final leaderboard. Needs the zero-one
backend on :5003 (and the main API on :5001 for the registration leg).

## 3. Updates

```bash
cd /opt/club && git pull
npm run build --workspace=apps/zero-one
sudo cp -r apps/zero-one/dist /opt/zero-one/
sudo systemctl restart zero-one-backend
```

State is in-memory; take a snapshot from Admin (`/admin.html`) before
restarting on event day, and set `SNAPSHOT_STORAGE_DIR` to persistent disk so
`latest_snapshot.json` survives reboots.

## 4. Venue LAN fallback (no internet)

```bash
cd apps/zero-one
PORT=5003 HOST=0.0.0.0 NODE_ENV=production npm run backend
# Open http://<host-ip>:5003 on every device. Mock personas work with no
# JWT_SECRET; set JWT_SECRET + CODE_SCRIET_SSO_ENABLED only when the main
# API is reachable.
```

## 5. Smoke test

```bash
curl localhost:5003/api/health
npm run test:engine --workspace=apps/zero-one   # needs the server running
```
