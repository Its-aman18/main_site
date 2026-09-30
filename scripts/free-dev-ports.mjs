#!/usr/bin/env node
import { execSync } from 'node:child_process';
import os from 'node:os';

const PORTS = [5001, 5002, 5003, 5173, 5174, 5175];
const isWindows = os.platform() === 'win32';

function freePortsWindows() {
  try {
    const output = execSync('netstat -ano -p tcp', { encoding: 'utf8' });
    const pids = new Map();
    for (const line of output.split('\n')) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5 && parts[0] === 'TCP' && parts[3] === 'LISTENING') {
        const port = Number(parts[1].split(':').pop());
        const pid = Number(parts[parts.length - 1]);
        if (PORTS.includes(port) && pid > 0 && pid !== 4 && pid !== process.pid) {
          pids.set(pid, port);
        }
      }
    }

    if (pids.size > 0) {
      console.log(`Freeing occupied dev ports (${PORTS.join(', ')}): PIDs ${Array.from(pids.keys()).join(', ')}`);
      for (const pid of pids.keys()) {
        try {
          execSync(`taskkill /F /PID ${pid} /T`, { stdio: 'ignore' });
        } catch {
          // ignore already stopped processes
        }
      }
      console.log(`Dev ports freed (${PORTS.join(', ')})`);
    } else {
      console.log(`Dev ports already free (${PORTS.join(', ')})`);
    }
  } catch (err) {
    console.warn(`[free-dev-ports] Warning: Could not check/free dev ports: ${err.message}`);
  }
}

function freePortsUnix() {
  const portsStr = PORTS.join(',');
  try {
    const pids = execSync(`lsof -ti tcp:${portsStr}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (pids) {
      const list = pids.split(/\s+/).filter(Boolean);
      console.log(`Freeing occupied dev ports (${portsStr}): ${list.join(', ')}`);
      for (const pid of list) {
        try {
          process.kill(Number(pid), 'SIGTERM');
        } catch {}
      }
      setTimeout(() => {
        try {
          const remaining = execSync(`lsof -ti tcp:${portsStr}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
          if (remaining) {
            for (const pid of remaining.split(/\s+/).filter(Boolean)) {
              try {
                process.kill(Number(pid), 'SIGKILL');
              } catch {}
            }
          }
        } catch {}
      }, 1000);
    } else {
      console.log(`Dev ports already free (${portsStr})`);
    }
  } catch {
    console.log(`Dev ports already free (${portsStr})`);
  }
}

if (isWindows) {
  freePortsWindows();
} else {
  freePortsUnix();
}
