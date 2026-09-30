// ZERO → ONE Standalone Server (Oracle VM / LAN production)
// Serves the built frontend (apps/zero-one/dist) AND the authoritative
// /api backend from a single port, so the default deployment is same-origin
// (no CORS involved).
//
// Dev layout:  Vite dev on :5175 (server/zeroOneBackend.ts as middleware).
// Prod layout: this server on :5003 behind nginx
//              (https://zero-one.codescriet.dev → 127.0.0.1:5003).
// Venue LAN fallback: run directly, open http://<host>:5003.
//
// Env is loaded from the monorepo root .env first, then the local
// apps/zero-one/.env (local wins) — the same layering the playground
// execute-server uses so JWT_SECRET matches apps/api.

import { createServer } from 'http';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
import { zeroOneBackendMiddleware, serverEngine } from './zeroOneBackend.ts';

const HERE = import.meta.dirname;
dotenv.config({ path: path.resolve(HERE, '..', '..', '.env') });
dotenv.config({ path: path.resolve(HERE, '..', '.env') });

const PORT = parseInt(process.env.PORT || process.env.ZERO_ONE_PORT || '5003', 10);
const HOST = process.env.HOST || '0.0.0.0';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = createServer((req, res) => {
  // Let the backend middleware handle /api routes
  zeroOneBackendMiddleware(req, res, () => {
    const distDir = path.resolve(process.cwd(), 'dist');
    if (!fs.existsSync(distDir)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Production bundle not built. Run npm run build first.' }));
    }

    const rawPath = (req.url || '/').split('?')[0];
    let reqPath: string;
    try {
      reqPath = decodeURIComponent(rawPath);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Malformed request path' }));
    }
    if (reqPath === '/') reqPath = '/index.html';

    // Normalize and confine to distDir (blocks /%2e%2e/ traversal).
    const normalized = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, '');
    let filePath = path.join(distDir, normalized);
    if (!filePath.startsWith(distDir + path.sep) && filePath !== distDir) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Forbidden' }));
    }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, reqPath.startsWith('/admin') ? 'admin.html' : 'index.html');
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      const stream = fs.createReadStream(filePath);
      stream.on('error', () => {
        if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read file' }));
      });
      return stream.pipe(res);
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'File not found on ZERO → ONE server' }));
  });
});

server.listen(PORT, HOST, () => {
  console.log('====================================================');
  console.log(`ZERO → ONE AUTHORITATIVE SERVER ONLINE`);
  console.log(`Listening on: http://${HOST}:${PORT}`);
  console.log(`Authoritative Sequence: ${serverEngine.getAuthoritativeState().eventSequence}`);
  console.log(`Clock Running: ${serverEngine.getAuthoritativeState().serverClock.isClockRunning}`);
  console.log('====================================================');
});

export default server;
