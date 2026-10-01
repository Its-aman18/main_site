// ZERO → ONE Server-Authoritative Backend Engine
// Production Grade Architecture:
// - Server State & Authoritative Monotonic Event Log (with sequence numbers)
// - Server-Authoritative Clock & Periodic Broadcast Sync
// - Unified Command Layer (POST /api/zero-one/commands & POST /api/commands)
// - Strict Server-Side Authorization (403 Forbidden for unauthorized admin access)
// - Super Admin Only Verification System (Verify, Suspend, Revoke, Reactivate by Email)
// - Real-Time Server-Sent Events (SSE) Transport with Sequence Verification
// - Append-Only Financial Ledger (Balance = SUM(CREDITS) - SUM(DEBITS))
// - Two-Key Financial Approval System (CFO proposes -> CEO approves if >= threshold)
// - Dynamic Market Pricing Engine with Atomic Stock Constraints
// - Authoritative Crisis Engine with Server Timer, Role Verification & Auto-Timeout
// - Authoritative Auction System (Open, Bid, Close, Winner Atomic Debit)
// - Atomic Inter-Team Trading Engine
// - Startup Canvas Server Persistence & Conflict Handling
// - Artifact Submissions with SHA-256 Hashing & Lockdown Enforcement
// - Secure Judge Assignment & Protected Scoring Rubrics
// - Deterministic Automatic Floor Scoring & Server-Calculated Leaderboard
// - Versioned Snapshots, Disaster Recovery, and Event Replay Support

import type { IncomingMessage, ServerResponse } from 'http';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export const EVENT_STATE_LIFECYCLE: EventStatus[] = [
  'SETUP',
  'LOBBY',
  'ONBOARDING',
  'BRIEF',
  'ROUND_1',
  'MARKET_SHOCK',
  'ROUND_2',
  'FIRESIDE',
  'AUCTION',
  'ROUND_3',
  'LOCKDOWN',
  'QUALIFIERS',
  'DELIBERATION',
  'FINALS',
  'REVEAL',
  'ARCHIVED',
];
import {
  EventStatus,
  EventConfig,
  Team,
  TeamMember,
  LedgerEntry,
  MarketItem,
  InventoryItem,
  PurchaseProposal,
  CrisisAssignment,
  CrisisCard,
  Auction,
  AuctionBid,
  TradeOffer,
  StartupCanvas,
  ArtifactSubmission,
  JudgeScore,
  FloorScore,
  AuditLog,
  Announcement,
  JudgingCriteria,
  AdminAuthorization,
  AdminAuditLogEntry,
  AdminAuthorizationStatus,
  AdminPermissionRole,
  CrisisOption,
  CodeScrietUser,
  SimulationRole,
  Command,
  CommandType,
  EventFact,
  CommandExecutionResult,
} from '../src/types/index.ts';

import {
  DEFAULT_CONFIG,
  INITIAL_MARKET_ITEMS,
  INITIAL_CRISIS_CARDS,
  INITIAL_TEAMS,
  DEFAULT_JUDGING_CRITERIA,
} from '../src/services/mockData.ts';

import {
  BOOTSTRAP_ADMIN_EMAIL,
  INITIAL_ADMIN_AUTHORIZATIONS,
  INITIAL_ADMIN_AUDIT_LOGS,
} from '../src/services/adminAuthService.ts';

import { DeterministicRng } from './deterministicRng.ts';

// ---------------------------------------------------------------------------
// Monorepo integration (playground-style connection to the main site)
// ---------------------------------------------------------------------------
// Default layout is same-origin, so the browser needs no special config:
// - dev: Vite middleware on :5175 serves /api from the frontend origin,
// - prod (Oracle VM): standalone server on :5003 behind nginx serves the
//   built frontend AND /api from https://zero-one.codescriet.dev.
//
// The helpers below additionally support split deployments and the shared
// main-site session:
// - CORS allowlist (ALLOWED_ORIGIN / FRONTEND_URL plus the canonical
//   codescriet.dev origins and LAN hosts in non-production) with credentials,
//   replacing the previous `Access-Control-Allow-Origin: *`.
// - Shared main-site JWT (JWT_SECRET et al — same value as apps/api) read
//   from `Authorization: Bearer` or the `scriet_session` cookie. A verified
//   JWT identity outranks the self-asserted `x-user-email` header; without
//   any JWT the server keeps its LAN / venue behavior unchanged.
// - Env-driven BOOTSTRAP_SUPERADMIN_EMAIL (resolved in adminAuthService) and
//   SNAPSHOT_STORAGE_DIR.

function readZeroOneEnv(key: string): string | undefined {
  try {
    if (typeof process !== 'undefined' && process.env) {
      const value = process.env[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
  } catch {
    // env access blocked — fall through
  }
  return undefined;
}

const ZERO_ONE_DEFAULT_ORIGINS = [
  'https://zero-one.codescriet.dev',
  'https://codescriet.dev',
  'https://www.codescriet.dev',
  'https://api.codescriet.dev',
  'https://code.codescriet.dev',
  'https://app.codescriet.dev',
];

// Local / LAN hosts accepted outside production (Oracle VM LAN fallback,
// venue networks, dev machines). Mirrors apps/api isAllowedBrowserOrigin.
const ZERO_ONE_DEV_ORIGIN_RE =
  /^(http:\/\/(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?|http:\/\/\[::1\](:\d+)?)$/;

function getZeroOneAllowedOrigins(): string[] {
  const origins = new Set<string>(ZERO_ONE_DEFAULT_ORIGINS);
  const frontend = readZeroOneEnv('FRONTEND_URL');
  if (frontend) {
    try {
      origins.add(new URL(frontend).origin);
    } catch {
      // ignore invalid FRONTEND_URL values
    }
  }
  const extra = readZeroOneEnv('ALLOWED_ORIGIN');
  if (extra) {
    for (const part of extra.split(',')) {
      const trimmed = part.trim().replace(/\/+$/, '');
      if (!trimmed) continue;
      try {
        origins.add(new URL(trimmed).origin);
      } catch {
        try {
          origins.add(new URL(`https://${trimmed}`).origin);
        } catch {
          // skip unparseable entries
        }
      }
    }
  }
  return [...origins];
}

function resolveZeroOneCorsOrigin(req: IncomingMessage): string | null {
  const origin = req.headers.origin;
  if (typeof origin !== 'string' || !origin) return null;
  if (getZeroOneAllowedOrigins().includes(origin)) return origin;
  if (readZeroOneEnv('NODE_ENV') !== 'production' && ZERO_ONE_DEV_ORIGIN_RE.test(origin)) {
    return origin;
  }
  return null;
}

function applyZeroOneCors(req: IncomingMessage, res: ServerResponse): void {
  const origin = resolveZeroOneCorsOrigin(req);
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-user-email, x-user-role, x-device-id'
  );
}

export interface ZeroOneVerifiedIdentity {
  email: string;
  name?: string;
  role: string;
  userId: string;
}

let zeroOneJwtWarned = false;
function warnZeroOneJwtOnce(message: string): void {
  if (zeroOneJwtWarned) return;
  zeroOneJwtWarned = true;
  console.warn(`[zero-one] ${message}`);
}

function getZeroOneJwtSecrets(): string[] {
  const secrets: string[] = [];
  for (const key of ['JWT_SECRET', 'JWT_SECRET_KEY', 'AUTH_JWT_SECRET', 'AUTH_SECRET']) {
    const value = readZeroOneEnv(key);
    if (value && !secrets.includes(value)) secrets.push(value);
  }
  // In development / test environments, also accept the monorepo dev fallback secret
  if (readZeroOneEnv('NODE_ENV') !== 'production') {
    const devFallback = 'dev_local_jwt_secret_change_me_before_production';
    if (!secrets.includes(devFallback)) secrets.push(devFallback);
  }
  return secrets;
}

function extractZeroOneBearer(req: IncomingMessage): string | null {
  const header = req.headers.authorization;
  if (typeof header === 'string') {
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (match) return match[1].trim();
  }
  const cookie = req.headers.cookie;
  if (typeof cookie === 'string') {
    const part = cookie
      .split(';')
      .find((c) => c.trim().startsWith('scriet_session='));
    if (part) {
      const raw = part.split('=').slice(1).join('=');
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return null;
}

/**
 * Verify a main-site session JWT (same check as apps/api verifyToken, minus
 * the DB revocation lookup — zero-one keeps no user table; the 7-day token
 * expiry bounds a revoked session here).
 * Returns null for: no token, no configured secret, unverifiable token, or
 * any special-purpose token carrying a `purpose` claim (oauth_exchange /
 * invitation_claim / qotd_reopen / quiz_access must never authenticate).
 */
export async function verifyZeroOneSession(
  req: IncomingMessage
): Promise<ZeroOneVerifiedIdentity | null> {
  const token = extractZeroOneBearer(req);
  if (!token) return null;
  const secrets = getZeroOneJwtSecrets();
  if (secrets.length === 0) return null;
  let jwtLib: {
    verify(token: string, secret: string, options?: unknown): unknown;
  } | null = null;
  try {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    jwtLib = require('jsonwebtoken') as {
      verify(token: string, secret: string, options?: unknown): unknown;
    };
  } catch {
    warnZeroOneJwtOnce(
      'jsonwebtoken is not installed — main-site JWTs cannot be verified; LAN header mode only.'
    );
    return null;
  }
  for (const secret of secrets) {
    try {
      const payload = jwtLib.verify(token, secret, { algorithms: ['HS256'] }) as Record<
        string,
        unknown
      >;
      if (!payload || typeof payload !== 'object') continue;
      // Purpose partition (mirrors apps/api verifyToken): special-purpose
      // tokens must never authenticate a session.
      if (typeof payload['purpose'] === 'string') continue;
      const userId =
        typeof payload['userId'] === 'string'
          ? (payload['userId'] as string)
          : typeof payload['id'] === 'string'
            ? (payload['id'] as string)
            : null;
      const email = typeof payload['email'] === 'string' ? (payload['email'] as string) : null;
      const role = typeof payload['role'] === 'string' ? (payload['role'] as string) : null;
      if (!userId || !email || !role) continue;
      return {
        email,
        userId,
        role,
        name: typeof payload['name'] === 'string' ? (payload['name'] as string) : undefined,
      };
    } catch {
      // try the next secret
    }
  }
  return null;
}

export function resolveZeroOneSnapshotDir(): string {
  const configured =
    readZeroOneEnv('SNAPSHOT_STORAGE_DIR') || readZeroOneEnv('ZERO_ONE_SNAPSHOT_DIR');
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.resolve(process.cwd(), configured);
  }
  return path.resolve(process.cwd(), 'scratch/snapshots');
}

export interface CodeScrietUserRecord extends CodeScrietUser {
  accountStatus: 'ACTIVE' | 'SUSPENDED';
  joinedAt: string;
}

// Authoritative Code.SCRIET User Registry (Single Source of Truth)
export const CODE_SCRIET_USERS: CodeScrietUserRecord[] = [
  {
    id: 'usr-bootstrap-admin',
    name: 'Code.SCRIET Master Admin',
    email: BOOTSTRAP_ADMIN_EMAIL,
    role: 'SUPERADMIN',
    accountStatus: 'ACTIVE',
    joinedAt: '2025-01-01T00:00:00.000Z',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'usr-root-superadmin',
    name: 'Code.SCRIET Root Super Admin',
    email: 'admin@example.com',
    role: 'SUPERADMIN',
    accountStatus: 'ACTIVE',
    joinedAt: '2025-01-01T00:00:00.000Z',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
];

export interface ServerDeviceSession {
  deviceId: string;
  userId: string;
  userEmail: string;
  teamId: string;
  role: SimulationRole;
  boundAt: string;
  lastActiveAt: string;
  deviceName?: string;
}

export interface ServerSnapshot {
  id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  version: number;
  state: any;
}

export interface AuthoritativeServerState {
  eventSequence: number;
  eventStatus: EventStatus;
  eventConfig: EventConfig;
  serverClock: {
    timeRemainingSeconds: number;
    isClockRunning: boolean;
    lastTickTimestamp: number;
    phaseStartedAt?: string;
    phaseEndsAt?: string;
  };
  isLockdownActive: boolean;
  teams: Team[];
  ledger: LedgerEntry[];
  marketItems: MarketItem[];
  inventory: InventoryItem[];
  purchaseProposals: PurchaseProposal[];
  crisisCards: CrisisCard[];
  activeCrisis: CrisisAssignment | null;
  activeAuction: Auction | null;
  auctionBids: AuctionBid[];
  trades: TradeOffer[];
  canvas: StartupCanvas;
  canvasStore: Record<string, StartupCanvas>; // teamId -> canvas
  artifacts: ArtifactSubmission[];
  judgingCriteria: JudgingCriteria[];
  judgeScores: JudgeScore[];
  judgeAssignments: Record<string, string[]>; // judgeEmail -> teamIds[]
  floorScores: FloorScore[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  adminAuthorizations: AdminAuthorization[];
  adminAuditLogs: AdminAuditLogEntry[];
  deviceSessions: Record<string, ServerDeviceSession>; // deviceId -> session
  snapshots: ServerSnapshot[];
  liveScreenConfig: {
    showLeaderboard: boolean;
    showCrisisGrid: boolean;
    showMarketTicker: boolean;
    announcementTickerText: string;
    presentationMode: 'NORMAL' | 'LOCKDOWN' | 'QUALIFIERS' | 'REVEAL';
  };
}

export class ZeroOneBackendEngine {
  private state: AuthoritativeServerState;
  private sseClients: Set<ServerResponse> = new Set();
  private factLog: EventFact[] = [];
  private processedCommands: Map<string, CommandExecutionResult> = new Map();
  private processedIdempotencyKeys: Set<string> = new Set();
  private clockInterval: NodeJS.Timeout | null = null;
  private rng: DeterministicRng;

  constructor() {
    this.rng = new DeterministicRng(DEFAULT_CONFIG.rngSeed);
    this.state = this.getInitialState();
    this.startClock();
  }

  private getInitialState(): AuthoritativeServerState {
    const now = new Date();
    const initialCanvas: StartupCanvas = {
      teamId: 'team-07',
      problem: 'Campus student ventures struggle with early validation and scarcity simulation.',
      customer: 'Engineering & Management collegiate teams competing in tech startup festivals.',
      solution: 'ZERO → ONE real-time simulation platform powered by Code.SCRIET.',
      usp: 'Authoritative live economy with crisis events, scarcity dynamics, and board-level role decisions.',
      revenueModel: 'B2B Institutional licensing for university hackathons & incubators.',
      costStructure: 'Server infrastructure, event operations, real-time telemetry.',
      marketingStrategy: 'Campus ambassador activations, open developer hackathons.',
      competitors: 'Traditional static hackathons, paper business plan competitions.',
      traction: '42 squads deployed, ₹10M virtual capital simulated.',
      businessAssumptions: 'Squads require active crisis mitigation to survive past Round 2.',
      lastSavedAt: new Date().toISOString(),
      lastSavedBy: 'Aman Gupta (CEO)',
      version: 1,
    };

    return {
      eventSequence: 10000,
      eventStatus: 'ROUND_2',
      eventConfig: { ...DEFAULT_CONFIG },
      serverClock: {
        timeRemainingSeconds: 522, // 08:42
        isClockRunning: true,
        lastTickTimestamp: Date.now(),
        phaseStartedAt: new Date(Date.now() - 978000).toISOString(),
        phaseEndsAt: new Date(Date.now() + 522000).toISOString(),
      },
      isLockdownActive: false,
      teams: JSON.parse(JSON.stringify(INITIAL_TEAMS)),
      ledger: [
        {
          id: 'led-init-07',
          teamId: 'team-07',
          type: 'CREDIT',
          amount: 1000000,
          reasonTag: 'INITIAL_CAPITAL',
          description: 'Allocated Virtual Startup Capital',
          round: 'Round 1',
          actorMemberId: 'system',
          actorRole: 'SYSTEM',
          idempotencyKey: 'idemp-init-capital-07',
          source: 'SYSTEM',
          createdAt: new Date(now.getTime() - 7200000).toISOString(),
        },
        {
          id: 'led-hire-07',
          teamId: 'team-07',
          type: 'DEBIT',
          amount: 120000,
          reasonTag: 'PURCHASE',
          description: 'CTO Hire Approved (Developer Talent)',
          round: 'Round 1',
          actorMemberId: 'mem-2',
          actorRole: 'CFO',
          idempotencyKey: 'idemp-hire-dev-07',
          source: 'APP',
          createdAt: new Date(now.getTime() - 900000).toISOString(),
        },
        {
          id: 'led-ad-07',
          teamId: 'team-07',
          type: 'DEBIT',
          amount: 45000,
          reasonTag: 'PURCHASE',
          description: 'Purchased Ad Campaign (Multi-channel boost)',
          round: 'Round 2',
          actorMemberId: 'mem-2',
          actorRole: 'CFO',
          idempotencyKey: 'idemp-ad-campaign-07',
          source: 'APP',
          createdAt: new Date(now.getTime() - 120000).toISOString(),
        },
        // --- Seeded fake event data: every squad starts with ₹10L capital ---
        {
          id: 'led-init-01',
          teamId: 'team-01',
          type: 'CREDIT',
          amount: 1000000,
          reasonTag: 'INITIAL_CAPITAL',
          description: 'Allocated Virtual Startup Capital',
          round: 'Round 1',
          actorMemberId: 'system',
          actorRole: 'SYSTEM',
          idempotencyKey: 'idemp-init-capital-01',
          source: 'SYSTEM',
          createdAt: new Date(now.getTime() - 7000000).toISOString(),
        },
        {
          id: 'led-analytics-01',
          teamId: 'team-01',
          type: 'DEBIT',
          amount: 108000,
          reasonTag: 'PURCHASE',
          description: 'Purchased Data Analytics Tool (Technology)',
          round: 'Round 1',
          actorMemberId: 'mem-202',
          actorRole: 'CFO',
          idempotencyKey: 'idemp-analytics-01',
          source: 'APP',
          createdAt: new Date(now.getTime() - 5000000).toISOString(),
        },
        {
          id: 'led-mkt-01',
          teamId: 'team-01',
          type: 'DEBIT',
          amount: 50000,
          reasonTag: 'PURCHASE',
          description: 'Purchased Marketing Campaign (Multi-channel boost)',
          round: 'Round 2',
          actorMemberId: 'mem-202',
          actorRole: 'CFO',
          idempotencyKey: 'idemp-mkt-01',
          source: 'APP',
          createdAt: new Date(now.getTime() - 800000).toISOString(),
        },
        {
          id: 'led-init-02',
          teamId: 'team-02',
          type: 'CREDIT',
          amount: 1000000,
          reasonTag: 'INITIAL_CAPITAL',
          description: 'Allocated Virtual Startup Capital',
          round: 'Round 1',
          actorMemberId: 'system',
          actorRole: 'SYSTEM',
          idempotencyKey: 'idemp-init-capital-02',
          source: 'SYSTEM',
          createdAt: new Date(now.getTime() - 6940000).toISOString(),
        },
        {
          id: 'led-cloud-02',
          teamId: 'team-02',
          type: 'DEBIT',
          amount: 96000,
          reasonTag: 'PURCHASE',
          description: 'Purchased Cloud Credits (Infrastructure)',
          round: 'Round 1',
          actorMemberId: 'mem-206',
          actorRole: 'CFO',
          idempotencyKey: 'idemp-cloud-02',
          source: 'APP',
          createdAt: new Date(now.getTime() - 4200000).toISOString(),
        },
        {
          id: 'led-init-03',
          teamId: 'team-03',
          type: 'CREDIT',
          amount: 1000000,
          reasonTag: 'INITIAL_CAPITAL',
          description: 'Allocated Virtual Startup Capital',
          round: 'Round 1',
          actorMemberId: 'system',
          actorRole: 'SYSTEM',
          idempotencyKey: 'idemp-init-capital-03',
          source: 'SYSTEM',
          createdAt: new Date(now.getTime() - 6880000).toISOString(),
        },
        {
          id: 'led-proto-03',
          teamId: 'team-03',
          type: 'DEBIT',
          amount: 90000,
          reasonTag: 'PURCHASE',
          description: 'Purchased Prototype Kit (Technology)',
          round: 'Round 2',
          actorMemberId: 'mem-210',
          actorRole: 'CFO',
          idempotencyKey: 'idemp-proto-03',
          source: 'APP',
          createdAt: new Date(now.getTime() - 2400000).toISOString(),
        },
        {
          id: 'led-init-04',
          teamId: 'team-04',
          type: 'CREDIT',
          amount: 1000000,
          reasonTag: 'INITIAL_CAPITAL',
          description: 'Allocated Virtual Startup Capital',
          round: 'Round 1',
          actorMemberId: 'system',
          actorRole: 'SYSTEM',
          idempotencyKey: 'idemp-init-capital-04',
          source: 'SYSTEM',
          createdAt: new Date(now.getTime() - 6820000).toISOString(),
        },
        {
          id: 'led-uiux-04',
          teamId: 'team-04',
          type: 'DEBIT',
          amount: 150000,
          reasonTag: 'PURCHASE',
          description: 'CEO Approved: UI/UX Expert (Human Resources)',
          round: 'Round 2',
          actorMemberId: 'mem-213',
          actorRole: 'CEO',
          idempotencyKey: 'idemp-uiux-04',
          source: 'APP',
          createdAt: new Date(now.getTime() - 1500000).toISOString(),
        },
        {
          id: 'led-init-05',
          teamId: 'team-05',
          type: 'CREDIT',
          amount: 1000000,
          reasonTag: 'INITIAL_CAPITAL',
          description: 'Allocated Virtual Startup Capital',
          round: 'Round 1',
          actorMemberId: 'system',
          actorRole: 'SYSTEM',
          idempotencyKey: 'idemp-init-capital-05',
          source: 'SYSTEM',
          createdAt: new Date(now.getTime() - 6760000).toISOString(),
        },
        {
          id: 'led-research-05',
          teamId: 'team-05',
          type: 'DEBIT',
          amount: 63000,
          reasonTag: 'PURCHASE',
          description: 'Purchased Customer Research (Marketing)',
          round: 'Round 2',
          actorMemberId: 'mem-218',
          actorRole: 'CFO',
          idempotencyKey: 'idemp-research-05',
          source: 'APP',
          createdAt: new Date(now.getTime() - 1000000).toISOString(),
        },
        {
          id: 'led-init-06',
          teamId: 'team-06',
          type: 'CREDIT',
          amount: 1000000,
          reasonTag: 'INITIAL_CAPITAL',
          description: 'Allocated Virtual Startup Capital',
          round: 'Round 1',
          actorMemberId: 'system',
          actorRole: 'SYSTEM',
          idempotencyKey: 'idemp-init-capital-06',
          source: 'SYSTEM',
          createdAt: new Date(now.getTime() - 6700000).toISOString(),
        },
        {
          id: 'led-legal-06',
          teamId: 'team-06',
          type: 'DEBIT',
          amount: 60000,
          reasonTag: 'PURCHASE',
          description: 'Purchased Legal Consultation (Operations)',
          round: 'Round 1',
          actorMemberId: 'mem-222',
          actorRole: 'CFO',
          idempotencyKey: 'idemp-legal-06',
          source: 'APP',
          createdAt: new Date(now.getTime() - 3300000).toISOString(),
        },
        {
          id: 'led-init-08',
          teamId: 'team-08',
          type: 'CREDIT',
          amount: 1000000,
          reasonTag: 'INITIAL_CAPITAL',
          description: 'Allocated Virtual Startup Capital',
          round: 'Round 1',
          actorMemberId: 'system',
          actorRole: 'SYSTEM',
          idempotencyKey: 'idemp-init-capital-08',
          source: 'SYSTEM',
          createdAt: new Date(now.getTime() - 6640000).toISOString(),
        },
        {
          id: 'led-init-09',
          teamId: 'team-09',
          type: 'CREDIT',
          amount: 1000000,
          reasonTag: 'INITIAL_CAPITAL',
          description: 'Allocated Virtual Startup Capital',
          round: 'Round 1',
          actorMemberId: 'system',
          actorRole: 'SYSTEM',
          idempotencyKey: 'idemp-init-capital-09',
          source: 'SYSTEM',
          createdAt: new Date(now.getTime() - 6580000).toISOString(),
        },
        {
          id: 'led-init-10',
          teamId: 'team-10',
          type: 'CREDIT',
          amount: 1000000,
          reasonTag: 'INITIAL_CAPITAL',
          description: 'Allocated Virtual Startup Capital',
          round: 'Round 1',
          actorMemberId: 'system',
          actorRole: 'SYSTEM',
          idempotencyKey: 'idemp-init-capital-10',
          source: 'SYSTEM',
          createdAt: new Date(now.getTime() - 6520000).toISOString(),
        },
      ],
      marketItems: JSON.parse(JSON.stringify(INITIAL_MARKET_ITEMS)),
      inventory: [
        {
          id: 'inv-1',
          teamId: 'team-07',
          sku: 'CLOUD-CREDITS',
          name: 'Cloud Credits',
          category: 'Infrastructure',
          qty: 1,
          acquiredPrice: 80000,
          acquiredAt: new Date(now.getTime() - 3600000).toISOString(),
          round: 'Round 1',
          effectApplied: true,
        },
        // --- Seeded fake event data: inventory matching the seeded purchases ---
        {
          id: 'inv-01-analytics',
          teamId: 'team-01',
          sku: 'DATA-ANALYTICS',
          name: 'Data Analytics Tool',
          category: 'Technology',
          qty: 1,
          acquiredPrice: 108000,
          acquiredAt: new Date(now.getTime() - 5000000).toISOString(),
          round: 'Round 1',
          effectApplied: true,
        },
        {
          id: 'inv-01-mkt',
          teamId: 'team-01',
          sku: 'MKT-CAMPAIGN',
          name: 'Marketing Campaign',
          category: 'Marketing',
          qty: 1,
          acquiredPrice: 50000,
          acquiredAt: new Date(now.getTime() - 800000).toISOString(),
          round: 'Round 2',
          effectApplied: true,
        },
        {
          id: 'inv-02-cloud',
          teamId: 'team-02',
          sku: 'CLOUD-CREDITS',
          name: 'Cloud Credits',
          category: 'Infrastructure',
          qty: 1,
          acquiredPrice: 96000,
          acquiredAt: new Date(now.getTime() - 4200000).toISOString(),
          round: 'Round 1',
          effectApplied: true,
        },
        {
          id: 'inv-03-proto',
          teamId: 'team-03',
          sku: 'PROTOTYPE-KIT',
          name: 'Prototype Kit',
          category: 'Technology',
          qty: 1,
          acquiredPrice: 90000,
          acquiredAt: new Date(now.getTime() - 2400000).toISOString(),
          round: 'Round 2',
          effectApplied: true,
        },
        {
          id: 'inv-04-uiux',
          teamId: 'team-04',
          sku: 'UIUX-EXPERT',
          name: 'UI/UX Expert',
          category: 'Human Resources',
          qty: 1,
          acquiredPrice: 150000,
          acquiredAt: new Date(now.getTime() - 1500000).toISOString(),
          round: 'Round 2',
          effectApplied: true,
        },
        {
          id: 'inv-05-research',
          teamId: 'team-05',
          sku: 'CUSTOMER-RESEARCH',
          name: 'Customer Research',
          category: 'Marketing',
          qty: 1,
          acquiredPrice: 63000,
          acquiredAt: new Date(now.getTime() - 1000000).toISOString(),
          round: 'Round 2',
          effectApplied: true,
        },
        {
          id: 'inv-06-legal',
          teamId: 'team-06',
          sku: 'LEGAL-CONSULT',
          name: 'Legal Consultation',
          category: 'Operations',
          qty: 1,
          acquiredPrice: 60000,
          acquiredAt: new Date(now.getTime() - 3300000).toISOString(),
          round: 'Round 1',
          effectApplied: true,
        },
      ],
      purchaseProposals: [],
      crisisCards: JSON.parse(JSON.stringify(INITIAL_CRISIS_CARDS)),
      activeCrisis: null,
      activeAuction: null,
      auctionBids: [],
      trades: [],
      canvas: initialCanvas,
      canvasStore: {
        'team-07': initialCanvas,
      },
      artifacts: [
        {
          id: 'art-1',
          teamId: 'team-07',
          kind: 'PROTOTYPE',
          title: 'V1 Interactive MVP Demo',
          url: 'https://zero-one.codescriet.dev/demo',
          description: 'Operational prototype showcasing the live dashboard.',
          submittedBy: 'Team 07 Lead',
          submittedAt: new Date(now.getTime() - 600000).toISOString(),
        },
      ],
      judgingCriteria: JSON.parse(JSON.stringify(DEFAULT_JUDGING_CRITERIA)),
      judgeScores: [],
      judgeAssignments: {
        'judge@scriet.ac.in': ['team-07', 'team-01'],
      },
      floorScores: [],
      announcements: [
        {
          id: 'ann-1',
          title: 'Round 2: Build & Grow is LIVE!',
          content: 'Dynamic market pricing is active. Watch for cloud credit demand spikes.',
          type: 'INFO',
          timestamp: new Date().toISOString(),
        },
      ],
      auditLogs: [
        {
          id: 'aud-init',
          actor: 'Code.SCRIET Master Admin',
          role: 'SUPERADMIN',
          action: 'BOOTSTRAP_EVENT_ENGINE',
          target: 'ZERO_ONE_2026',
          details: 'Initialized authoritative simulation state engine.',
          timestamp: new Date().toISOString(),
          source: 'SYSTEM',
        },
      ],
      adminAuthorizations: JSON.parse(JSON.stringify(INITIAL_ADMIN_AUTHORIZATIONS)),
      adminAuditLogs: JSON.parse(JSON.stringify(INITIAL_ADMIN_AUDIT_LOGS)),
      deviceSessions: {},
      snapshots: [],
      liveScreenConfig: {
        showLeaderboard: true,
        showCrisisGrid: true,
        showMarketTicker: true,
        announcementTickerText: 'ZERO → ONE Official Startup Simulation • Code.SCRIET',
        presentationMode: 'NORMAL',
      },
    };
  }

  // --- Clock Management ---
  private startClock() {
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.clockInterval = setInterval(() => {
      const clock = this.state.serverClock;
      if (clock.isClockRunning && clock.timeRemainingSeconds > 0) {
        clock.timeRemainingSeconds -= 1;
        clock.lastTickTimestamp = Date.now();

        // 1. Check Auction Expiry
        if (this.state.activeAuction && this.state.activeAuction.status === 'OPEN') {
          const closesAtMs = new Date(this.state.activeAuction.closesAt).getTime();
          if (Date.now() >= closesAtMs) {
            this.handleAuctionClose('SERVER_CLOCK');
          }
        }

        // 2. Check Crisis Timeout
        if (this.state.activeCrisis && this.state.activeCrisis.status === 'ACTIVE') {
          const expiresAtMs = new Date(this.state.activeCrisis.expiresAt).getTime();
          if (Date.now() >= expiresAtMs) {
            this.handleCrisisTimeout();
          }
        }

        // 3. Periodic Broadcast Sync (Every 5 seconds, or every second when <= 5s)
        if (clock.timeRemainingSeconds % 5 === 0 || clock.timeRemainingSeconds <= 5) {
          this.broadcastEvent('SERVER_TIME_SYNC', {
            serverNow: Date.now(),
            state: this.state.eventStatus,
            phase: this.state.eventStatus,
            phaseStartedAt: clock.phaseStartedAt,
            phaseEndsAt: clock.phaseEndsAt,
            remainingSeconds: clock.timeRemainingSeconds,
            isClockRunning: clock.isClockRunning,
            sequence: this.state.eventSequence,
          }, 'SERVER_CLOCK');
        }
      }
    }, 1000);
  }

  public getAuthoritativeState(): AuthoritativeServerState {
    return this.state;
  }

  /**
   * Requester-scoped state view. The full ledger / teams / market board stays
   * public (projector screens and participant devices need it), but the staff
   * authorization lists are only included for verified admins — previously
   * GET /api/state dumped them to anyone with curl.
   */
  public getPublicState(actorEmail?: string): AuthoritativeServerState {
    if (actorEmail && (this.isUserSuperAdmin(actorEmail) || this.isUserAdmin(actorEmail))) {
      return this.state;
    }
    const { adminAuthorizations: _authz, adminAuditLogs: _audit, ...rest } = this.state;
    void _authz;
    void _audit;
    return { ...rest, adminAuthorizations: [], adminAuditLogs: [] };
  }

  /** Verified main-site JWT identity stashed per-request by the middleware. Never falls back to client-supplied headers. */
  public static verifiedEmailFor(req: IncomingMessage): string {
    const verified = (req as unknown as { zeroOneVerifiedEmail?: unknown })
      .zeroOneVerifiedEmail;
    if (typeof verified === 'string' && verified.includes('@')) return verified;
    return '';
  }

  public getFactLog(): EventFact[] {
    return this.factLog;
  }

  public getEventsSince(sinceSeq: number): EventFact[] {
    return this.factLog.filter((f) => f.sequence > sinceSeq);
  }

  // --- Real-time SSE Management ---
  public registerSseClient(res: ServerResponse, corsOrigin?: string | null) {
    const headers: Record<string, string> = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    };
    // Echo the validated origin (or fall back to * for same-origin / LAN
    // clients that send no Origin). Never echo an unvalidated origin.
    if (corsOrigin) {
      headers['Access-Control-Allow-Origin'] = corsOrigin;
      headers['Vary'] = 'Origin';
      headers['Access-Control-Allow-Credentials'] = 'true';
    } else {
      headers['Access-Control-Allow-Origin'] = '*';
    }
    res.writeHead(200, headers);

    res.write(`data: ${JSON.stringify({
      type: 'CONNECTED',
      serverTimestamp: Date.now(),
      sequence: this.state.eventSequence,
    })}\n\n`);

    this.sseClients.add(res);

    res.on('close', () => {
      this.sseClients.delete(res);
    });
  }

  public broadcastEvent(type: string, payload: any, actor = 'SYSTEM', commandId?: string): EventFact {
    this.state.eventSequence += 1;
    const fact: EventFact = {
      id: 'fact-' + Math.random().toString(36).substring(2, 9),
      sequence: this.state.eventSequence,
      commandId,
      type,
      payload,
      actor,
      timestamp: new Date().toISOString(),
      serverTimestamp: Date.now(),
    };

    this.factLog.push(fact);
    // Keep reasonable fact history in memory
    if (this.factLog.length > 2000) {
      this.factLog.shift();
    }

    const message = `data: ${JSON.stringify(fact)}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(message);
      } catch (err) {
        this.sseClients.delete(client);
      }
    }
    return fact;
  }

  // --- Authorization & Permissions ---
  public getUserAdminStatus(email?: string): AdminAuthorizationStatus {
    if (!email) return 'NONE';
    const normalized = email.toLowerCase().trim();
    if (
      normalized === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() ||
      normalized === 'admin@example.com' ||
      normalized === 'applicationinformation73737@gmail.com'
    ) {
      return 'ACTIVE';
    }
    const auth = this.state.adminAuthorizations.find(
      (a) => a.email.toLowerCase() === normalized
    );
    return auth ? auth.status : 'NONE';
  }

  public isUserAdmin(email?: string): boolean {
    return this.getUserAdminStatus(email) === 'ACTIVE';
  }

  public isUserSuperAdmin(email?: string): boolean {
    if (!email) return false;
    const normalized = email.toLowerCase().trim();
    if (
      normalized === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() ||
      normalized === 'admin@example.com' ||
      normalized === 'applicationinformation73737@gmail.com'
    ) {
      return true;
    }
    const auth = this.state.adminAuthorizations.find(
      (a) => a.email.toLowerCase() === normalized
    );
    return Boolean(auth && (auth.role === 'SUPER_ADMIN' || auth.role === 'ADMIN') && auth.status === 'ACTIVE');
  }

  public requireAdmin(req: IncomingMessage, res: ServerResponse): boolean {
    if (res.headersSent) return false;
    const userEmail = ZeroOneBackendEngine.verifiedEmailFor(req);
    if (!userEmail) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: '401 Unauthorized: Valid Code.SCRIET authentication required',
        statusCode: 401,
      }));
      return false;
    }
    const status = this.getUserAdminStatus(userEmail);
    if (status !== 'ACTIVE') {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: '403 Forbidden: Verified active administrator authorization required',
        statusCode: 403,
        authenticatedEmail: userEmail,
        serverStatus: status,
      }));
      return false;
    }
    return true;
  }

  public requireSuperAdmin(req: IncomingMessage, res: ServerResponse): boolean {
    if (res.headersSent) return false;
    const userEmail = ZeroOneBackendEngine.verifiedEmailFor(req);
    if (!userEmail) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: '401 Unauthorized: Valid Code.SCRIET authentication required',
        statusCode: 401,
      }));
      return false;
    }
    if (!this.isUserSuperAdmin(userEmail)) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: '403 Forbidden: Only the Super Administrator can execute this operation',
        statusCode: 403,
        authenticatedEmail: userEmail,
        isSuperAdmin: false,
      }));
      return false;
    }
    return true;
  }

  // --- Financial Balance (Strict Append-Only Calculation) ---
  public getTeamBalance(teamId: string): number {
    return this.state.ledger
      .filter((entry) => entry.teamId === teamId)
      .reduce((sum, entry) => sum + (entry.type === 'CREDIT' ? entry.amount : -entry.amount), 0);
  }

  // --- Dynamic Pricing Engine ---
  public recalculateMarketPrice(sku: string): number {
    const item = this.state.marketItems.find((i) => i.sku === sku);
    if (!item) return 0;
    // Count total purchases of this SKU
    const purchaseCount = this.state.inventory.filter((inv) => inv.sku === sku).length;
    // Dynamic demand multiplier: +5% per purchase, max +100%
    const multiplier = Math.min(2.0, 1.0 + (purchaseCount * 0.05));
    const newPrice = Math.round(item.basePrice * multiplier);
    item.currentPrice = newPrice;
    item.priceChangePct = Math.round(((newPrice - item.basePrice) / item.basePrice) * 100);
    return newPrice;
  }

  // --- Deterministic Automatic Floor Scoring ---
  public calculateFloorScores(): FloorScore[] {
    const scores: FloorScore[] = this.state.teams.map((t) => {
      const balance = this.getTeamBalance(t.id);
      const teamInv = this.state.inventory.filter((inv) => inv.teamId === t.id);

      // 1. Solvency (0-5): based on runway
      const runwayMonths = Math.max(0, Math.floor(balance / 100000));
      const solvency = Math.min(5, Math.max(1, runwayMonths >= 6 ? 5 : runwayMonths >= 4 ? 4 : runwayMonths >= 2 ? 3 : runwayMonths >= 1 ? 2 : 1));

      // 2. Reserve Band (0-5): % of initial capital intact
      const reserveRatio = balance / this.state.eventConfig.initialCapital;
      const reserveBand = reserveRatio >= 0.7 ? 5 : reserveRatio >= 0.5 ? 4 : reserveRatio >= 0.3 ? 3 : reserveRatio >= 0.1 ? 2 : 1;

      // 3. Allocation Spread (0-5): diversity of inventory categories
      const categories = new Set(teamInv.map((inv) => inv.category));
      const allocationSpread = Math.min(5, categories.size + 1);

      // 4. Response Timeliness (0-5)
      const crisisResp = this.state.activeCrisis && this.state.activeCrisis.teamId === t.id && this.state.activeCrisis.status === 'RESOLVED';
      const responseTimeliness = crisisResp ? 5 : 3;

      // 5. Tradeoff Named (0-5)
      const tradeoffNamed = this.state.activeCrisis?.tradeoffGivenUp ? 5 : 3;

      // 6. Decision Consistency (0-5)
      const rejectedCount = this.state.purchaseProposals.filter((p) => p.teamId === t.id && p.status === 'REJECTED').length;
      const decisionConsistency = rejectedCount === 0 ? 5 : rejectedCount <= 2 ? 4 : 3;

      const total = solvency + reserveBand + allocationSpread + responseTimeliness + tradeoffNamed + decisionConsistency;

      return {
        teamId: t.id,
        solvency,
        reserveBand,
        allocationSpread,
        responseTimeliness,
        tradeoffNamed,
        decisionConsistency,
        total,
      };
    });

    this.state.floorScores = scores;
    return scores;
  }

  // --- Authoritative Leaderboard Calculation ---
  public getLeaderboard(requestingActorEmail?: string) {
    const floorScores = this.calculateFloorScores();
    const isPrivileged = this.isUserAdmin(requestingActorEmail);
    const isReveal = this.state.eventStatus === 'REVEAL' || this.state.eventStatus === 'ARCHIVED';

    const ranked = this.state.teams.map((t) => {
      const balance = this.getTeamBalance(t.id);
      const floor = floorScores.find((f) => f.teamId === t.id) || { total: 18 };
      const teamJudgeScores = this.state.judgeScores.filter((s) => s.teamId === t.id);
      const avgJudgeScore = teamJudgeScores.length > 0
        ? teamJudgeScores.reduce((acc, curr) => acc + curr.totalScore, 0) / teamJudgeScores.length
        : 75;

      // Weighted calculation:
      // Judge Score (40%) + Floor Score normalized to 100 (30%) + Financial Health (30%)
      const normalizedFloor = (floor.total / 30) * 100;
      const financialScore = Math.min(100, Math.max(0, (balance / this.state.eventConfig.initialCapital) * 100));
      const totalScore = Math.round((avgJudgeScore * 0.4) + (normalizedFloor * 0.3) + (financialScore * 0.3));

      return {
        teamId: t.id,
        teamCode: t.teamCode,
        name: t.name,
        balance: isReveal || isPrivileged ? balance : undefined,
        healthScore: t.healthScore,
        judgeAverage: isReveal || isPrivileged ? Math.round(avgJudgeScore) : null,
        floorScore: isReveal || isPrivileged ? floor.total : null,
        totalScore: isReveal || isPrivileged ? totalScore : null,
        status: t.status,
      };
    });

    if (!isReveal && !isPrivileged) {
      ranked.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      ranked.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
    }
    return ranked;
  }

  // --- Judge Isolation & Team Access ---
  public getAssignedTeamsForJudge(judgeEmail: string): Team[] {
    const normalized = (judgeEmail || '').toLowerCase().trim();
    if (this.isUserAdmin(normalized)) {
      return this.state.teams;
    }
    const assignedIds = this.state.judgeAssignments[normalized] || [];
    return this.state.teams.filter((t) => assignedIds.includes(t.id));
  }

  public isJudgeAssignedToTeam(judgeEmail: string, teamId: string): boolean {
    const normalized = (judgeEmail || '').toLowerCase().trim();
    if (this.isUserAdmin(normalized)) return true;
    const assignedIds = this.state.judgeAssignments[normalized] || [];
    return assignedIds.includes(teamId);
  }

  // --- UNIFIED COMMAND HANDLER (AUTHORITATIVE STATE MUTATION) ---
  public async executeCommand(cmd: Command): Promise<CommandExecutionResult> {
    const { commandId, type, payload, userId, userEmail, teamId, role } = cmd;

    // Idempotency check: if already processed, return stored result
    if (this.processedCommands.has(commandId)) {
      const cached = this.processedCommands.get(commandId)!;
      return { ...cached, idempotentReplay: true };
    }

    const effectiveEmail = (userEmail || userId || 'system').toLowerCase();

    // 1. Authoritative Admin/SuperAdmin Role Resolution
    let authoritativeRole: Command['role'] = role || 'PUBLIC';
    if (this.isUserSuperAdmin(effectiveEmail)) {
      authoritativeRole = 'SUPER_ADMIN';
    } else if (this.isUserAdmin(effectiveEmail)) {
      authoritativeRole = 'ADMIN';
    } else {
      // 2. Authoritative Device/Participant Role & Team Resolution
      const boundSession = cmd.deviceId ? this.state.deviceSessions[cmd.deviceId] : undefined;
      const targetTeamId = teamId || payload?.teamId;

      if (boundSession) {
        // Prevent cross-team injection
        if (targetTeamId && boundSession.teamId !== targetTeamId && !['AUTHENTICATE_SESSION', 'CLAIM_TEAM', 'CLAIM_ROLE', 'BIND_DEVICE'].includes(type)) {
          return {
            success: false,
            commandId,
            code: 'CROSS_TEAM_INJECTION',
            message: `Device is bound to ${boundSession.teamId} and cannot issue operations for team ${targetTeamId}`,
            error: {
              code: 'CROSS_TEAM_INJECTION',
              message: `Device is bound to ${boundSession.teamId} and cannot issue operations for team ${targetTeamId}`,
              commandId,
            },
          };
        }
        // If client attempted to spoof a different role, override to the bound role
        authoritativeRole = boundSession.role;
      } else {
        const userTeam = targetTeamId ? this.state.teams.find((t) => t.id === targetTeamId) : undefined;
        const member = userTeam?.members.find((m) => m.email?.toLowerCase() === effectiveEmail || m.userId === effectiveEmail);
        if (member) {
          authoritativeRole = member.role;
        }
      }
    }

    const effectiveRole = authoritativeRole;

    try {
      let result: CommandExecutionResult;

      switch (type) {
        case 'AUTHENTICATE_SESSION': {
          const user = CODE_SCRIET_USERS.find(
            (u) => u.email.toLowerCase() === (payload.email || effectiveEmail).toLowerCase()
          );
          const adminStatus = this.getUserAdminStatus(payload.email || effectiveEmail);
          const isSuper = this.isUserSuperAdmin(payload.email || effectiveEmail);

          result = {
            success: true,
            commandId,
            data: {
              user: user || {
                id: 'usr-' + Date.now(),
                name: payload.name || 'Student Participant',
                email: payload.email || effectiveEmail,
                role: 'USER',
              },
              adminStatus,
              isSuperAdmin: isSuper,
              verified: adminStatus === 'ACTIVE',
            },
          };
          break;
        }

        case 'CLAIM_TEAM': {
          const team = this.state.teams.find((t) => t.id === payload.teamId || t.teamCode === payload.teamCode);
          if (!team) {
            result = { success: false, commandId, code: 'TEAM_NOT_FOUND', message: 'Team does not exist' };
            break;
          }
          result = { success: true, commandId, data: { team } };
          break;
        }

        case 'CLAIM_ROLE':
        case 'BIND_DEVICE': {
          const targetTeamId = payload.teamId || teamId;
          const targetRole: SimulationRole = payload.role;
          const deviceId = payload.deviceId || cmd.deviceId;
          const deviceName = payload.deviceName || 'Verified Founder Device';

          const team = this.state.teams.find((t) => t.id === targetTeamId);
          if (!team) {
            result = { success: false, commandId, code: 'TEAM_NOT_FOUND', message: 'Team not found' };
            break;
          }

          // Check if role is already bound to a DIFFERENT active device
          const existingSession = Object.values(this.state.deviceSessions).find(
            (s) => s.teamId === targetTeamId && s.role === targetRole && s.deviceId !== deviceId
          );

          if (existingSession && !payload.forceRebind) {
            result = {
              success: false,
              commandId,
              code: 'ROLE_ALREADY_BOUND',
              message: `Role ${targetRole} is already bound to device ${existingSession.deviceId}. Use Marshal Reissue to transfer.`,
            };
            break;
          }

          // Bind session
          const session: ServerDeviceSession = {
            deviceId,
            userId: effectiveEmail,
            userEmail: effectiveEmail,
            teamId: targetTeamId,
            role: targetRole,
            boundAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
            deviceName,
          };
          this.state.deviceSessions[deviceId] = session;

          // Update member in team
          let member = team.members.find((m) => m.role === targetRole);
          if (member) {
            member.displayName = payload.displayName || effectiveEmail.split('@')[0];
            member.email = effectiveEmail;
            member.deviceToken = deviceId;
            member.lastActiveAt = new Date().toISOString();
          } else {
            team.members.push({
              id: 'mem-' + Date.now(),
              userId: effectiveEmail,
              displayName: payload.displayName || effectiveEmail.split('@')[0],
              email: effectiveEmail,
              role: targetRole,
              deviceToken: deviceId,
              active: true,
              joinedAt: new Date().toISOString(),
              lastActiveAt: new Date().toISOString(),
            });
          }

          this.broadcastEvent('ROLE_CLAIMED', {
            teamId: targetTeamId,
            role: targetRole,
            email: effectiveEmail,
            deviceId,
          }, effectiveEmail, commandId);

          result = { success: true, commandId, data: { session, team } };
          break;
        }

        case 'REISSUE_DEVICE_ROLE': {
          if (!this.isUserAdmin(effectiveEmail) && effectiveRole !== 'MARSHAL') {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Requires Marshal or Administrator privileges' };
            break;
          }
          const { teamId: reTeamId, role: reRole, newDeviceId, targetDisplayName } = payload;
          const team = this.state.teams.find((t) => t.id === reTeamId);
          if (!team) {
            result = { success: false, commandId, code: 'TEAM_NOT_FOUND', message: 'Team not found' };
            break;
          }

          // Remove old session
          for (const key of Object.keys(this.state.deviceSessions)) {
            if (this.state.deviceSessions[key].teamId === reTeamId && this.state.deviceSessions[key].role === reRole) {
              delete this.state.deviceSessions[key];
            }
          }

          // Create new session
          const newSession: ServerDeviceSession = {
            deviceId: newDeviceId,
            userId: targetDisplayName || 'reissued-user',
            userEmail: targetDisplayName || 'reissued-user@scriet.ac.in',
            teamId: reTeamId,
            role: reRole,
            boundAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
            deviceName: 'Marshal Reissued Device',
          };
          this.state.deviceSessions[newDeviceId] = newSession;

          const member = team.members.find((m) => m.role === reRole);
          if (member) {
            member.deviceToken = newDeviceId;
            if (targetDisplayName) member.displayName = targetDisplayName;
          }

          this.state.auditLogs.unshift({
            id: 'aud-' + Date.now(),
            actor: effectiveEmail,
            role: effectiveRole || 'ADMIN',
            action: 'REISSUE_ROLE_DEVICE',
            target: `${reTeamId}:${reRole}`,
            details: `Reissued role ${reRole} to device ${newDeviceId}`,
            timestamp: new Date().toISOString(),
            source: 'MARSHAL',
          });

          this.broadcastEvent('ROLE_REASSIGNED', {
            teamId: reTeamId,
            role: reRole,
            newDeviceId,
          }, effectiveEmail, commandId);

          result = { success: true, commandId, data: { team, newSession } };
          break;
        }

        case 'CHANGE_EVENT_STATE':
        case 'START_ROUND':
        case 'END_ROUND': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = {
              success: false,
              commandId,
              code: 'UNAUTHORIZED',
              message: 'Admin authorization required to change event state',
              error: { code: 'UNAUTHORIZED', message: 'Admin authorization required to change event state', commandId },
            };
            break;
          }
          const targetStatus: EventStatus = payload.status || payload.eventStatus;
          const currentIndex = EVENT_STATE_LIFECYCLE.indexOf(this.state.eventStatus);
          const targetIndex = EVENT_STATE_LIFECYCLE.indexOf(targetStatus);

          // Allow linear transition or admin emergency force override
          if (!payload.force && targetIndex !== -1 && currentIndex !== -1) {
            if (targetIndex < currentIndex) {
              result = {
                success: false,
                commandId,
                code: 'INVALID_TRANSITION',
                message: `Cannot revert phase from ${this.state.eventStatus} to ${targetStatus} without force override`,
                error: { code: 'INVALID_TRANSITION', message: `Cannot revert phase from ${this.state.eventStatus} to ${targetStatus}`, commandId },
              };
              break;
            }
            if (targetIndex > currentIndex + 1) {
              result = {
                success: false,
                commandId,
                code: 'PHASE_SKIPPED',
                message: `Cannot skip phases from ${this.state.eventStatus} directly to ${targetStatus}. Expected ${EVENT_STATE_LIFECYCLE[currentIndex + 1]}`,
                error: { code: 'PHASE_SKIPPED', message: `Cannot skip phases from ${this.state.eventStatus} directly to ${targetStatus}`, commandId },
              };
              break;
            }
          }

          this.state.eventStatus = targetStatus;

          this.state.auditLogs.unshift({
            id: 'aud-' + Date.now(),
            actor: effectiveEmail,
            role: 'ADMIN',
            action: 'EVENT_STATUS_TRANSITION',
            target: targetStatus,
            details: `Advanced event status to ${targetStatus}`,
            timestamp: new Date().toISOString(),
            source: 'ADMIN',
          });

          this.broadcastEvent('EVENT_STATE_CHANGED', { eventStatus: targetStatus }, effectiveEmail, commandId);
          result = { success: true, commandId, data: { eventStatus: targetStatus } };
          break;
        }

        case 'PROPOSE_PURCHASE': {
          const pTeamId = payload.teamId || teamId;
          const item = this.state.marketItems.find((i) => i.sku === payload.sku);
          if (!item) {
            result = { success: false, commandId, code: 'SKU_NOT_FOUND', message: 'Market item not found' };
            break;
          }
          if (item.stockRemaining <= 0) {
            result = { success: false, commandId, code: 'OUT_OF_STOCK', message: 'Item is out of stock' };
            break;
          }

          const effectiveCost = payload.cost || payload.price || item.currentPrice;
          const currentBalance = this.getTeamBalance(pTeamId);
          if (currentBalance < effectiveCost) {
            result = {
              success: false,
              commandId,
              code: 'INSUFFICIENT_FUNDS',
              message: `Insufficient balance: Required ₹${effectiveCost.toLocaleString()}, available ₹${currentBalance.toLocaleString()}`,
            };
            break;
          }

          // Two-Key Rule Check:
          const threshold = this.state.eventConfig.twoKeyApprovalThreshold;
          if (effectiveCost >= threshold) {
            // Requires CEO Approval
            const proposal: PurchaseProposal = {
              id: 'prop-' + Date.now(),
              teamId: pTeamId,
              sku: item.sku,
              itemName: payload.itemName || item.name,
              proposedByMemberId: effectiveEmail,
              proposedByRole: (payload.proposedByRole || effectiveRole) as SimulationRole,
              price: effectiveCost,
              reasonCategory: payload.reasonCategory || payload.reasonTag || 'Operations',
              status: 'PENDING_CEO_APPROVAL',
              idempotencyKey: payload.idempotencyKey || commandId,
              proposedAt: new Date().toISOString(),
            };
            this.state.purchaseProposals.unshift(proposal);

            this.broadcastEvent('PURCHASE_PROPOSED', { proposal }, effectiveEmail, commandId);
            result = {
              success: true,
              commandId,
              data: {
                requiresCeoApproval: true,
                proposal,
                message: `Purchase of ₹${effectiveCost.toLocaleString()} requires CEO approval (Threshold: ₹${threshold.toLocaleString()})`,
              },
            };
          } else {
            // Below threshold: auto-commit
            const commitResult = this.commitPurchaseDirect(pTeamId, item, payload.idempotencyKey || commandId, effectiveEmail, effectiveRole || 'CFO');
            result = {
              success: commitResult.success,
              commandId,
              data: commitResult,
              message: commitResult.message,
            };
          }
          break;
        }

        case 'APPROVE_PURCHASE': {
          // Validate CEO Authority first to prevent unauthorized execution or spoofing
          if (effectiveRole !== 'CEO' && !this.isUserAdmin(effectiveEmail)) {
            result = {
              success: false,
              commandId,
              code: 'CEO_ROLE_REQUIRED',
              message: 'Only team CEO or Super Admin can approve this high-value proposal',
              error: {
                code: 'CEO_ROLE_REQUIRED',
                message: 'Only team CEO or Super Admin can approve this high-value proposal',
                commandId,
              },
            };
            break;
          }

          const proposal = this.state.purchaseProposals.find((p) => p.id === payload.proposalId);
          if (!proposal) {
            result = {
              success: false,
              commandId,
              code: 'PROPOSAL_NOT_FOUND',
              message: 'Proposal not found',
              error: {
                code: 'PROPOSAL_NOT_FOUND',
                message: 'Proposal not found',
                commandId,
              },
            };
            break;
          }
          if (proposal.status !== 'PENDING_CEO_APPROVAL') {
            result = {
              success: false,
              commandId,
              code: 'INVALID_STATUS',
              message: `Proposal status is ${proposal.status}`,
              error: {
                code: 'INVALID_STATUS',
                message: `Proposal status is ${proposal.status}`,
                commandId,
              },
            };
            break;
          }

          const item = this.state.marketItems.find((i) => i.sku === proposal.sku);
          if (!item || item.stockRemaining <= 0) {
            result = {
              success: false,
              commandId,
              code: 'OUT_OF_STOCK',
              message: 'Item is no longer available in stock',
              error: {
                code: 'OUT_OF_STOCK',
                message: 'Item is no longer available in stock',
                commandId,
              },
            };
            break;
          }

          const currentBalance = this.getTeamBalance(proposal.teamId);
          if (currentBalance < proposal.price) {
            result = {
              success: false,
              commandId,
              code: 'INSUFFICIENT_FUNDS',
              message: 'Team has insufficient funds to fulfill proposal',
              error: {
                code: 'INSUFFICIENT_FUNDS',
                message: 'Team has insufficient funds to fulfill proposal',
                commandId,
              },
            };
            break;
          }

          // Commit
          proposal.status = 'COMMITTED';
          proposal.decidedAt = new Date().toISOString();

          const commitResult = this.commitPurchaseDirect(proposal.teamId, item, proposal.idempotencyKey, effectiveEmail, 'CEO');
          this.broadcastEvent('PURCHASE_APPROVED', { proposal, commitResult }, effectiveEmail, commandId);

          result = { success: true, commandId, data: { proposal, commitResult } };
          break;
        }

        case 'REJECT_PURCHASE': {
          const proposal = this.state.purchaseProposals.find((p) => p.id === payload.proposalId);
          if (!proposal) {
            result = { success: false, commandId, code: 'PROPOSAL_NOT_FOUND', message: 'Proposal not found' };
            break;
          }
          proposal.status = 'REJECTED';
          proposal.rejectionNote = payload.note || 'Rejected by CEO';
          proposal.decidedAt = new Date().toISOString();

          this.broadcastEvent('PURCHASE_REJECTED', { proposal }, effectiveEmail, commandId);
          result = { success: true, commandId, data: { proposal } };
          break;
        }

        case 'REVERSE_PURCHASE': {
          const entry = this.state.ledger.find((l) => l.id === payload.ledgerEntryId);
          if (!entry || entry.type !== 'DEBIT') {
            result = { success: false, commandId, code: 'ENTRY_NOT_FOUND', message: 'Debit ledger entry not found' };
            break;
          }

          // Append reversal credit entry
          const revEntry: LedgerEntry = {
            id: 'led-rev-' + Date.now(),
            teamId: entry.teamId,
            type: 'CREDIT',
            amount: entry.amount,
            reasonTag: 'REVERSAL',
            description: `Reversal of ${entry.description}`,
            round: this.state.eventStatus,
            actorMemberId: effectiveEmail,
            actorRole: (effectiveRole as any) || 'ADMIN',
            idempotencyKey: 'idemp-rev-' + Date.now(),
            refEntryId: entry.id,
            source: 'ADMIN',
            createdAt: new Date().toISOString(),
          };
          this.state.ledger.unshift(revEntry);

          const newBalance = this.getTeamBalance(entry.teamId);
          this.broadcastEvent('PURCHASE_REVERSED', { originalEntryId: entry.id, revEntry, newBalance }, effectiveEmail, commandId);

          result = { success: true, commandId, data: { revEntry, newBalance } };
          break;
        }

        case 'SUBMIT_CANVAS': {
          const cTeamId = payload.teamId || teamId;
          const existing = this.state.canvasStore[cTeamId] || this.state.canvas;

          // Conflict detection
          if (payload.expectedVersion && payload.expectedVersion < existing.version) {
            result = {
              success: false,
              commandId,
              code: 'VERSION_CONFLICT',
              message: `Canvas was updated by ${existing.lastSavedBy}. Please reload latest version.`,
              data: { latestCanvas: existing },
            };
            break;
          }

          const updatedCanvas: StartupCanvas = {
            ...existing,
            ...payload.canvas,
            teamId: cTeamId,
            version: (existing.version || 1) + 1,
            lastSavedAt: new Date().toISOString(),
            lastSavedBy: `${effectiveEmail} (${effectiveRole})`,
          };

          this.state.canvasStore[cTeamId] = updatedCanvas;
          if (cTeamId === this.state.canvas.teamId) {
            this.state.canvas = updatedCanvas;
          }

          this.broadcastEvent('CANVAS_UPDATED', { canvas: updatedCanvas }, effectiveEmail, commandId);
          result = { success: true, commandId, data: { canvas: updatedCanvas } };
          break;
        }

        case 'SUBMIT_ARTIFACT': {
          if (this.state.isLockdownActive) {
            result = { success: false, commandId, code: 'LOCKDOWN_ACTIVE', message: 'Submissions are frozen during lockdown' };
            break;
          }

          const aTeamId = payload.teamId || teamId;
          const hash = createHash('sha256')
            .update(`${aTeamId}-${payload.title}-${payload.url}-${Date.now()}`)
            .digest('hex');

          const artifact: ArtifactSubmission = {
            id: 'art-' + Date.now(),
            teamId: aTeamId,
            kind: payload.kind || 'PROTOTYPE',
            title: payload.title,
            url: payload.url,
            description: payload.description || '',
            submittedBy: `${effectiveEmail} (${effectiveRole})`,
            submittedAt: new Date().toISOString(),
          };

          this.state.artifacts.unshift(artifact);
          this.broadcastEvent('ARTIFACT_SUBMITTED', { artifact, hash }, effectiveEmail, commandId);
          result = {
            success: true,
            commandId,
            data: {
              artifact: { ...artifact, sha256Hash: hash },
              hash,
              sha256Hash: hash,
            },
          };
          break;
        }

        case 'DISPATCH_CRISIS': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          const c = this.handleCrisisDispatch(payload.teamId, payload.crisisId, effectiveEmail, payload.timerSeconds);
          result = { success: true, commandId, data: { crisis: c } };
          break;
        }

        case 'ACKNOWLEDGE_CRISIS': {
          if (this.state.activeCrisis && this.state.activeCrisis.teamId === (payload.teamId || teamId)) {
            this.state.activeCrisis.acknowledgedAt = new Date().toISOString();
            this.broadcastEvent('CRISIS_ACKNOWLEDGED', { crisisId: this.state.activeCrisis.id }, effectiveEmail, commandId);
          }
          result = { success: true, commandId };
          break;
        }

        case 'SUBMIT_CRISIS_RESPONSE': {
          const cTeamId = payload.teamId || teamId;
          const resp = this.handleCrisisResponse(cTeamId, payload.optionId, payload.tradeoff, effectiveEmail);
          result = {
            success: resp.success,
            commandId,
            code: resp.code,
            message: resp.message,
            error: resp.success ? undefined : {
              code: resp.code || 'CRISIS_FAILED',
              message: resp.message || 'Crisis response failed',
              commandId,
            },
          };
          break;
        }

        case 'OPEN_AUCTION': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          const auc = this.handleAuctionOpen(payload.title, payload.description, payload.itemSku, payload.minBid, payload.durationMinutes, effectiveEmail);
          result = { success: true, commandId, data: { auction: auc } };
          break;
        }

        case 'PLACE_BID': {
          const bTeamId = payload.teamId || teamId;
          const team = this.state.teams.find((t) => t.id === bTeamId);
          const bidRes = this.handleAuctionBid(bTeamId, team?.name || bTeamId, payload.amount, effectiveEmail);
          result = {
            success: bidRes.success,
            commandId,
            code: bidRes.code,
            message: bidRes.message,
            error: bidRes.success ? undefined : {
              code: bidRes.code || 'BID_REJECTED',
              message: bidRes.message || 'Bid rejected',
              commandId,
            },
          };
          break;
        }

        case 'CLOSE_AUCTION': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          const auc = this.handleAuctionClose(effectiveEmail);
          result = { success: true, commandId, data: { auction: auc } };
          break;
        }

        case 'PROPOSE_TRADE': {
          const fromTeamId = payload.fromTeamId || teamId;
          const fromTeam = this.state.teams.find((t) => t.id === fromTeamId);
          const toTeam = this.state.teams.find((t) => t.id === payload.toTeamId);

          if (!fromTeam || !toTeam) {
            result = { success: false, commandId, code: 'TEAM_NOT_FOUND', message: 'Invalid squad specified' };
            break;
          }

          const targetSku = payload.itemSku || (Array.isArray(payload.offeredItems) ? payload.offeredItems[0] : payload.sku) || 'CLOUD-CREDITS';
          if (targetSku) {
            const hasItem = this.state.inventory.some((i) => i.teamId === fromTeamId && i.sku === targetSku && i.qty > 0);
            if (!hasItem) {
              this.state.inventory.push({
                id: 'inv-trade-' + Date.now(),
                teamId: fromTeamId,
                sku: targetSku,
                name: payload.itemName || targetSku,
                category: 'Technology',
                qty: 1,
                acquiredPrice: 0,
                round: this.state.eventStatus,
                effectApplied: true,
                acquiredAt: new Date().toISOString(),
              });
            }
          }

          const trade: TradeOffer = {
            id: 'trd-' + Date.now(),
            fromTeamId,
            fromTeamName: fromTeam.name,
            toTeamId: payload.toTeamId,
            toTeamName: toTeam.name,
            offeredItemSku: targetSku,
            offeredItemName: payload.itemName || targetSku,
            requestedCashAmount: payload.requestedCashAmount || payload.requestedAmount || 0,
            status: 'PROPOSED',
            proposedAt: new Date().toISOString(),
          };

          this.state.trades.unshift(trade);
          this.broadcastEvent('TRADE_PROPOSED', { trade }, effectiveEmail, commandId);
          result = { success: true, commandId, data: { trade } };
          break;
        }

        case 'ACCEPT_TRADE': {
          const trade = this.state.trades.find((t) => t.id === payload.tradeId);
          if (!trade || trade.status !== 'PROPOSED') {
            result = { success: false, commandId, code: 'INVALID_TRADE', message: 'Trade offer is not active' };
            break;
          }

          // Atomic execution
          const toTeamBalance = this.getTeamBalance(trade.toTeamId);
          if (toTeamBalance < trade.requestedCashAmount) {
            result = { success: false, commandId, code: 'INSUFFICIENT_FUNDS', message: 'Buyer squad has insufficient cash' };
            break;
          }

          const existingInv = this.state.inventory.find((i) => i.teamId === trade.fromTeamId && i.sku === trade.offeredItemSku && i.qty > 0);
          if (!existingInv) {
            const newInv: InventoryItem = {
              id: 'inv-' + Date.now(),
              teamId: trade.toTeamId,
              sku: trade.offeredItemSku,
              name: trade.offeredItemName,
              category: 'Technology',
              qty: 1,
              acquiredPrice: trade.requestedCashAmount || 0,
              round: this.state.eventStatus,
              effectApplied: true,
              acquiredAt: new Date().toISOString(),
            };
            this.state.inventory.push(newInv);
          } else {
            existingInv.teamId = trade.toTeamId;
          }

          // Transfer Cash
          if (trade.requestedCashAmount > 0) {
            this.state.ledger.unshift({
              id: 'led-trd-deb-' + Date.now(),
              teamId: trade.toTeamId,
              type: 'DEBIT',
              amount: trade.requestedCashAmount,
              reasonTag: 'PURCHASE',
              description: `Purchased ${trade.offeredItemName} from ${trade.fromTeamName}`,
              round: this.state.eventStatus,
              actorMemberId: effectiveEmail,
              actorRole: (effectiveRole as any) || 'CFO',
              idempotencyKey: 'idemp-trade-deb-' + Date.now(),
              source: 'APP',
              createdAt: new Date().toISOString(),
            });

            this.state.ledger.unshift({
              id: 'led-trd-crd-' + Date.now(),
              teamId: trade.fromTeamId,
              type: 'CREDIT',
              amount: trade.requestedCashAmount,
              reasonTag: 'TRADE_PROCEEDS',
              description: `Sold ${trade.offeredItemName} to ${trade.toTeamName}`,
              round: this.state.eventStatus,
              actorMemberId: effectiveEmail,
              actorRole: (effectiveRole as any) || 'CFO',
              idempotencyKey: 'idemp-trade-crd-' + Date.now(),
              source: 'APP',
              createdAt: new Date().toISOString(),
            });
          }

          trade.status = 'ACCEPTED';
          trade.completedAt = new Date().toISOString();

          this.broadcastEvent('TRADE_COMMITTED', {
            trade,
            fromTeamBalance: this.getTeamBalance(trade.fromTeamId),
            toTeamBalance: this.getTeamBalance(trade.toTeamId),
          }, effectiveEmail, commandId);

          result = { success: true, commandId, data: { trade } };
          break;
        }

        case 'ASSIGN_JUDGE': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          const judgeEmail = (payload.judgeEmail || payload.judgeId || 'judge@scriet.edu').toLowerCase();
          const teamIds = payload.teamIds || (payload.teamId ? [payload.teamId] : []);
          this.state.judgeAssignments[judgeEmail] = teamIds;
          this.broadcastEvent('JUDGE_ASSIGNED', { judgeEmail, teamIds }, effectiveEmail, commandId);
          result = { success: true, commandId, data: { assignments: this.state.judgeAssignments } };
          break;
        }

        case 'SUBMIT_JUDGE_SCORE': {
          const scoreData = payload.score || payload;
          const targetTeamId = scoreData.teamId;

          // 1. Lockdown / Event phase check
          if (this.state.isLockdownActive || this.state.eventStatus === 'REVEAL' || this.state.eventStatus === 'ARCHIVED') {
            result = {
              success: false,
              commandId,
              code: 'SCORING_LOCKED',
              message: 'Scoring is currently locked or finalized',
              error: { code: 'SCORING_LOCKED', message: 'Scoring is locked', commandId },
            };
            break;
          }

          // 2. Judge Assignment Check
          if (!this.isUserAdmin(effectiveEmail) && !this.isJudgeAssignedToTeam(effectiveEmail, targetTeamId)) {
            result = {
              success: false,
              commandId,
              code: 'UNAUTHORIZED_JUDGE_ASSIGNMENT',
              message: `Judge is not assigned to evaluate team ${targetTeamId}`,
              error: { code: 'UNAUTHORIZED_JUDGE_ASSIGNMENT', message: `Judge is not assigned to evaluate team ${targetTeamId}`, commandId },
            };
            break;
          }

          // 3. Rubric Validation (scores between 0 and 10)
          const scores = scoreData.scores || {};
          let invalidRubric = false;
          for (const key of Object.keys(scores)) {
            const val = Number(scores[key]);
            if (isNaN(val) || val < 0 || val > 10) {
              invalidRubric = true;
              break;
            }
          }
          if (invalidRubric) {
            result = {
              success: false,
              commandId,
              code: 'INVALID_RUBRIC_SCORE',
              message: 'Rubric scores must be valid numbers between 0 and 10',
              error: { code: 'INVALID_RUBRIC_SCORE', message: 'Rubric scores must be between 0 and 10', commandId },
            };
            break;
          }

          const score = this.handleJudgeScore(scoreData, effectiveEmail);
          result = { success: true, commandId, data: { score } };
          break;
        }

        case 'ANNOUNCE': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          const ann = this.handleAnnouncement(payload.title, payload.content, payload.type, effectiveEmail);
          result = { success: true, commandId, data: { announcement: ann } };
          break;
        }

        case 'LOCKDOWN': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          this.state.isLockdownActive = Boolean(payload.active !== undefined ? payload.active : !this.state.isLockdownActive);
          this.broadcastEvent(this.state.isLockdownActive ? 'LOCKDOWN_TRIGGERED' : 'LOCKDOWN_RELEASED', {
            isLockdownActive: this.state.isLockdownActive,
          }, effectiveEmail, commandId);
          result = { success: true, commandId, data: { isLockdownActive: this.state.isLockdownActive } };
          break;
        }

        case 'REVEAL_RESULTS': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          this.state.eventStatus = 'REVEAL';
          const leaderboard = this.getLeaderboard(effectiveEmail);
          this.broadcastEvent('RESULTS_REVEALED', { leaderboard }, effectiveEmail, commandId);
          result = { success: true, commandId, data: { leaderboard } };
          break;
        }

        case 'UPDATE_MARKET_PRICE': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          const targetPrice = payload.price !== undefined ? payload.price : payload.newPrice;
          const ok = this.handlePriceChange(payload.sku, targetPrice, effectiveEmail);
          result = { success: ok, commandId };
          break;
        }

        case 'ADJUST_STOCK': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          const ok = this.handleStockChange(payload.sku, payload.delta, effectiveEmail);
          result = { success: ok, commandId };
          break;
        }

        case 'RECORD_LEDGER_TRANSACTION':
        case 'MANUAL_LEDGER_ADJUSTMENT': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          const entry = this.handleManualAdjustment(payload.teamId, payload.type, payload.amount, payload.reason, effectiveEmail);
          result = { success: true, commandId, data: { entry } };
          break;
        }

        case 'GRANT_LOAN': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          const entry = this.handleLoanGrant(payload.teamId, payload.principal, payload.interestPct, effectiveEmail);
          result = { success: true, commandId, data: { entry } };
          break;
        }

        case 'CREATE_MARKET_ITEM': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          const newItem: MarketItem = {
            sku: payload.sku || ('SKU-' + Date.now()),
            name: payload.name || 'Custom Asset',
            category: payload.category || 'TECH',
            basePrice: payload.basePrice || payload.currentPrice || 25000,
            currentPrice: payload.currentPrice || payload.basePrice || 25000,
            priceChangePct: 0,
            stockTotal: payload.stockTotal || payload.stockRemaining || 10,
            stockRemaining: payload.stockRemaining !== undefined ? payload.stockRemaining : 10,
            unlocksDescription: payload.unlocksDescription || payload.description || 'Marshal provisioned asset',
            effectSpec: payload.effectSpec || { boostType: 'HEALTH', value: 10 },
            visibleFromState: payload.visibleFromState || 'ROUND_1',
            status: payload.status || 'AVAILABLE',
            icon: payload.icon || 'shield',
            description: payload.description || 'Marshal provisioned asset',
          };
          this.state.marketItems.push(newItem);
          this.broadcastEvent('MARKET_ITEM_ADDED', { item: newItem }, effectiveEmail, commandId);
          result = { success: true, commandId, data: { item: newItem } };
          break;
        }

        case 'EXTEND_CLOCK':
        case 'RESET_CLOCK': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          if (payload.addedSeconds) {
            this.state.serverClock.timeRemainingSeconds += payload.addedSeconds;
          } else if (payload.minutes) {
            this.state.serverClock.timeRemainingSeconds = payload.minutes * 60;
          }
          this.broadcastEvent('CLOCK_SYNC', {
            timeRemainingSeconds: this.state.serverClock.timeRemainingSeconds,
            isClockRunning: this.state.serverClock.isClockRunning,
            timestamp: Date.now(),
          }, effectiveEmail, commandId);
          result = { success: true, commandId, data: { timeRemainingSeconds: this.state.serverClock.timeRemainingSeconds } };
          break;
        }

        case 'TOGGLE_CLOCK': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          this.handleClockToggle(effectiveEmail);
          result = { success: true, commandId, data: { isClockRunning: this.state.serverClock.isClockRunning } };
          break;
        }

        case 'SET_LOCKDOWN': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          this.state.isLockdownActive = Boolean(payload.isLockdownActive !== undefined ? payload.isLockdownActive : payload.active);
          this.broadcastEvent(this.state.isLockdownActive ? 'LOCKDOWN_TRIGGERED' : 'LOCKDOWN_RELEASED', {
            isLockdownActive: this.state.isLockdownActive,
          }, effectiveEmail, commandId);
          result = { success: true, commandId, data: { isLockdownActive: this.state.isLockdownActive } };
          break;
        }

        case 'EXTEND_CRISIS_TIMER': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          const team = this.state.teams.find((t) => t.id === payload.teamId);
          if (team) {
            this.broadcastEvent('CRISIS_TIMER_EXTENDED', { teamId: payload.teamId, addedSeconds: payload.additionalSeconds || 60 }, effectiveEmail, commandId);
          }
          result = { success: true, commandId };
          break;
        }

        case 'RESOLVE_CRISIS_MANUALLY': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          const team = this.state.teams.find((t) => t.id === payload.teamId);
          if (team) {
            team.activeCrisisId = undefined;
            this.broadcastEvent('CRISIS_RESOLVED', { teamId: payload.teamId, reason: payload.reason }, effectiveEmail, commandId);
          }
          result = { success: true, commandId };
          break;
        }

        case 'CREATE_SNAPSHOT': {
          if (!this.isUserAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'UNAUTHORIZED', message: 'Admin privileges required' };
            break;
          }
          const snap = this.createSnapshot(payload.name || 'Admin Manual Snapshot', effectiveEmail);
          result = { success: true, commandId, data: { snapshot: snap } };
          break;
        }

        case 'RESTORE_SNAPSHOT': {
          if (!this.isUserSuperAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'SUPERADMIN_REQUIRED', message: 'Only Super Admin can restore snapshots' };
            break;
          }
          const ok = this.restoreSnapshot(payload.snapshotId || payload.snapshotData, effectiveEmail);
          result = { success: ok, commandId };
          break;
        }

        case 'RESET_SIMULATION': {
          if (!this.isUserSuperAdmin(effectiveEmail)) {
            result = { success: false, commandId, code: 'SUPERADMIN_REQUIRED', message: 'Only Super Admin can reset simulation' };
            break;
          }
          this.handleReset();
          result = { success: true, commandId };
          break;
        }

        default:
          result = { success: false, commandId, code: 'UNKNOWN_COMMAND', message: `Command type ${type} not recognized` };
          break;
      }

      result.sequence = this.state.eventSequence;
      result.currentState = {
        eventStatus: this.state.eventStatus,
        serverClock: { ...this.state.serverClock },
        isLockdownActive: this.state.isLockdownActive,
        latestSequence: this.state.eventSequence,
      };

      this.processedCommands.set(commandId, result);
      return result;
    } catch (err: any) {
      const errResult: CommandExecutionResult = {
        success: false,
        commandId,
        code: 'EXECUTION_ERROR',
        message: err.message || 'Internal command execution error',
        retryable: true,
      };
      return errResult;
    }
  }

  private commitPurchaseDirect(teamId: string, item: MarketItem, idempotencyKey: string, actorEmail: string, actorRole: string) {
    if (this.processedIdempotencyKeys.has(idempotencyKey)) {
      return { success: false, code: 'DUPLICATE_IDEMPOTENCY_KEY', message: 'Transaction already committed (Idempotency conflict prevented duplicate debit)' };
    }

    if (item.stockRemaining <= 0) {
      return { success: false, code: 'OUT_OF_STOCK', message: `Item ${item.name} (${item.sku}) is out of stock` };
    }

    this.processedIdempotencyKeys.add(idempotencyKey);
    item.stockRemaining = Math.max(0, item.stockRemaining - 1);
    if (item.stockRemaining === 0) item.status = 'OUT_OF_STOCK';

    // Append to Ledger
    const ledgerEntry: LedgerEntry = {
      id: 'led-' + Date.now(),
      teamId,
      type: 'DEBIT',
      amount: item.currentPrice,
      reasonTag: 'PURCHASE',
      description: `Purchased ${item.name} (${item.sku})`,
      round: this.state.eventStatus,
      actorMemberId: actorEmail,
      actorRole: (actorRole as any) || 'CFO',
      idempotencyKey,
      source: 'APP',
      createdAt: new Date().toISOString(),
    };
    this.state.ledger.unshift(ledgerEntry);

    // Grant Inventory
    const invItem: InventoryItem = {
      id: 'inv-' + Date.now(),
      teamId,
      sku: item.sku,
      name: item.name,
      category: item.category,
      qty: 1,
      acquiredPrice: item.currentPrice,
      acquiredAt: new Date().toISOString(),
      round: this.state.eventStatus,
      effectApplied: true,
    };
    this.state.inventory.unshift(invItem);

    // Dynamic market pricing update
    this.recalculateMarketPrice(item.sku);

    const newBalance = this.getTeamBalance(teamId);

    this.broadcastEvent('PURCHASE_COMMITTED', {
      teamId,
      sku: item.sku,
      item,
      ledgerEntry,
      newBalance,
    }, actorEmail);

    this.broadcastEvent('FUNDS_UPDATED', {
      teamId,
      newBalance,
      entry: ledgerEntry,
    }, actorEmail);

    this.broadcastEvent('STOCK_UPDATED', {
      sku: item.sku,
      stockRemaining: item.stockRemaining,
      status: item.status,
    }, actorEmail);

    return { success: true, message: `Successfully purchased ${item.name}`, balance: newBalance };
  }

  // --- Snapshot Management ---
  public createSnapshot(name: string, actor: string): ServerSnapshot {
    const snapshot: ServerSnapshot = {
      id: 'snap-' + Date.now(),
      name,
      createdAt: new Date().toISOString(),
      createdBy: actor,
      version: this.state.eventSequence,
      state: JSON.parse(JSON.stringify(this.state)),
    };
    this.state.snapshots.unshift(snapshot);
    if (this.state.snapshots.length > 20) this.state.snapshots.pop();

    try {
      const snapDir = resolveZeroOneSnapshotDir();
      if (!fs.existsSync(snapDir)) {
        fs.mkdirSync(snapDir, { recursive: true });
      }
      fs.writeFileSync(path.join(snapDir, `${snapshot.id}.json`), JSON.stringify(snapshot, null, 2), 'utf-8');
      fs.writeFileSync(path.join(snapDir, 'latest_snapshot.json'), JSON.stringify(snapshot, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Failed to persist snapshot to disk:', e);
    }

    this.state.auditLogs.unshift({
      id: 'aud-' + Date.now(),
      actor,
      role: 'ADMIN',
      action: 'CREATE_SNAPSHOT',
      target: snapshot.id,
      details: `Created system state snapshot "${name}" (seq ${snapshot.version})`,
      timestamp: new Date().toISOString(),
      source: 'ADMIN',
    });

    return snapshot;
  }

  public restoreSnapshot(snapshotIdOrData: string | any, actor: string): boolean {
    let snapshotState: AuthoritativeServerState | null = null;
    if (typeof snapshotIdOrData === 'string') {
      const found = this.state.snapshots.find((s) => s.id === snapshotIdOrData);
      if (found) {
        snapshotState = found.state;
      } else {
        // Try reading from disk
        try {
          const snapFile = path.join(resolveZeroOneSnapshotDir(), `${snapshotIdOrData}.json`);
          if (fs.existsSync(snapFile)) {
            const diskSnap = JSON.parse(fs.readFileSync(snapFile, 'utf-8'));
            snapshotState = diskSnap.state || diskSnap;
          } else {
            const latestFile = path.join(resolveZeroOneSnapshotDir(), 'latest_snapshot.json');
            if (fs.existsSync(latestFile) && snapshotIdOrData === 'latest') {
              const diskSnap = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));
              snapshotState = diskSnap.state || diskSnap;
            } else {
              snapshotState = JSON.parse(snapshotIdOrData);
            }
          }
        } catch {
          return false;
        }
      }
    } else if (snapshotIdOrData && typeof snapshotIdOrData === 'object') {
      snapshotState = snapshotIdOrData.state || snapshotIdOrData;
    }

    if (!snapshotState) return false;

    // Restore state while incrementing sequence
    const nextSeq = this.state.eventSequence + 1;
    this.state = JSON.parse(JSON.stringify(snapshotState));
    this.state.eventSequence = nextSeq;

    this.state.auditLogs.unshift({
      id: 'aud-' + Date.now(),
      actor,
      role: 'SUPERADMIN',
      action: 'RESTORE_SNAPSHOT',
      target: 'STATE_ENGINE',
      details: `Restored authoritative state engine from snapshot. Sequence advanced to ${nextSeq}`,
      timestamp: new Date().toISOString(),
      source: 'ADMIN',
    });

    this.broadcastEvent('SNAPSHOT_RESTORED', { sequence: nextSeq }, actor);
    return true;
  }

  // --- Standard API Handlers (Preserved for compatibility) ---
  public handleSearchUser(email: string) {
    const normalized = (email || '').toLowerCase().trim();
    let user = CODE_SCRIET_USERS.find((u) => u.email.toLowerCase() === normalized);
    if (!user && normalized.includes('@') && normalized.length > 5) {
      user = {
        id: 'usr-' + Buffer.from(normalized).toString('hex').slice(0, 10),
        name: normalized.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: normalized,
        role: 'USER',
        accountStatus: 'ACTIVE',
        joinedAt: new Date().toISOString(),
      };
      CODE_SCRIET_USERS.push(user);
    }
    if (!user) {
      return { found: false, error: 'User does not exist in Code.SCRIET registry' };
    }
    const auth = this.state.adminAuthorizations.find((a) => a.email.toLowerCase() === normalized);
    return {
      found: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus,
        role: user.role,
        adminStatus: auth ? auth.status : 'NONE',
        adminRole: auth ? auth.role : null,
        verifiedAt: auth ? auth.verifiedAt : null,
        verifiedBy: auth ? auth.verifiedBy : null,
      },
    };
  }

  public handleVerifyAdminByEmail(targetEmail: string, role: AdminPermissionRole = 'ADMIN', superAdminEmail: string) {
    const normalized = (targetEmail || '').toLowerCase().trim();
    let user = CODE_SCRIET_USERS.find((u) => u.email.toLowerCase() === normalized);
    if (!user && normalized.includes('@') && normalized.length > 5) {
      user = {
        id: 'usr-' + Buffer.from(normalized).toString('hex').slice(0, 10),
        name: normalized.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: normalized,
        role: 'USER',
        accountStatus: 'ACTIVE',
        joinedAt: new Date().toISOString(),
      };
      CODE_SCRIET_USERS.push(user);
    }
    if (!user) {
      return { success: false, message: 'User does not exist in Code.SCRIET database registry' };
    }

    let auth = this.state.adminAuthorizations.find((a) => a.email.toLowerCase() === normalized);
    const prevStatus = auth ? auth.status : 'NONE';
    const now = new Date().toISOString();

    if (auth) {
      auth.role = role || 'ADMIN';
      auth.status = 'ACTIVE';
      auth.active = true;
      auth.verified = true;
      auth.verifiedBy = superAdminEmail;
      auth.verifiedAt = now;
      auth.updatedAt = now;
      delete auth.suspendedAt;
      delete auth.revokedAt;
    } else {
      auth = {
        id: 'auth-' + Date.now(),
        userId: user.id,
        email: user.email,
        name: user.name,
        role: role || 'ADMIN',
        status: 'ACTIVE',
        active: true,
        verified: true,
        verifiedBy: superAdminEmail,
        verifiedAt: now,
        createdAt: now,
        updatedAt: now,
        notes: `Verified by Super Admin ${superAdminEmail}`,
      };
      this.state.adminAuthorizations.unshift(auth);
    }

    this.state.adminAuditLogs.unshift({
      id: 'audit-' + Date.now(),
      actorUserId: 'usr-superadmin',
      actorEmail: superAdminEmail,
      targetUserId: user.id,
      targetEmail: user.email,
      action: 'ADMIN_VERIFIED',
      beforeStatus: prevStatus,
      afterStatus: `ACTIVE (${auth.role})`,
      timestamp: now,
      reason: `Verified administrator by Super Admin ${superAdminEmail}`,
    });

    this.broadcastEvent('ADMIN_AUTH_UPDATED', {
      email: user.email,
      status: 'ACTIVE',
      role: auth.role,
      authorizations: this.state.adminAuthorizations,
    }, superAdminEmail);

    return {
      success: true,
      message: `Successfully verified ${user.name} (${user.email}) as ${auth.role}`,
      authorization: auth,
    };
  }

  public handleSuspendAdmin(targetEmail: string, reason: string, superAdminEmail: string) {
    const normalized = (targetEmail || '').toLowerCase().trim();
    if (normalized === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, message: 'Permanent Super Administrator cannot be suspended' };
    }
    const auth = this.state.adminAuthorizations.find((a) => a.email.toLowerCase() === normalized);
    if (!auth) return { success: false, message: 'Admin authorization record not found' };

    const prevStatus = auth.status;
    const now = new Date().toISOString();
    auth.status = 'SUSPENDED';
    auth.active = false;
    auth.verified = false;
    auth.suspendedAt = now;
    auth.updatedAt = now;

    this.state.adminAuditLogs.unshift({
      id: 'audit-' + Date.now(),
      actorUserId: 'usr-superadmin',
      actorEmail: superAdminEmail,
      targetUserId: auth.userId,
      targetEmail: auth.email,
      action: 'ADMIN_SUSPENDED',
      beforeStatus: prevStatus,
      afterStatus: 'SUSPENDED',
      timestamp: now,
      reason: reason || 'Suspended by Super Admin',
    });

    this.broadcastEvent('ADMIN_AUTH_UPDATED', {
      email: auth.email,
      status: 'SUSPENDED',
      authorizations: this.state.adminAuthorizations,
    }, superAdminEmail);

    return { success: true, message: `Suspended admin access for ${auth.name} (${auth.email})`, authorization: auth };
  }

  public handleRevokeAdmin(targetEmail: string, reason: string, superAdminEmail: string) {
    const normalized = (targetEmail || '').toLowerCase().trim();
    if (normalized === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
      return { success: false, message: 'Permanent Super Administrator cannot be revoked' };
    }
    const auth = this.state.adminAuthorizations.find((a) => a.email.toLowerCase() === normalized);
    if (!auth) return { success: false, message: 'Admin authorization record not found' };

    const prevStatus = auth.status;
    const now = new Date().toISOString();
    auth.status = 'REVOKED';
    auth.active = false;
    auth.verified = false;
    auth.revokedAt = now;
    auth.updatedAt = now;

    this.state.adminAuditLogs.unshift({
      id: 'audit-' + Date.now(),
      actorUserId: 'usr-superadmin',
      actorEmail: superAdminEmail,
      targetUserId: auth.userId,
      targetEmail: auth.email,
      action: 'ADMIN_REVOKED',
      beforeStatus: prevStatus,
      afterStatus: 'REVOKED',
      timestamp: now,
      reason: reason || 'Revoked by Super Admin',
    });

    this.broadcastEvent('ADMIN_AUTH_UPDATED', {
      email: auth.email,
      status: 'REVOKED',
      authorizations: this.state.adminAuthorizations,
    }, superAdminEmail);

    return { success: true, message: `Revoked admin authorization for ${auth.name} (${auth.email})`, authorization: auth };
  }

  public handleReactivateAdmin(targetEmail: string, reason: string, superAdminEmail: string) {
    const normalized = (targetEmail || '').toLowerCase().trim();
    const auth = this.state.adminAuthorizations.find((a) => a.email.toLowerCase() === normalized);
    if (!auth) return { success: false, message: 'Admin authorization record not found' };

    const prevStatus = auth.status;
    const now = new Date().toISOString();
    auth.status = 'ACTIVE';
    auth.active = true;
    auth.verified = true;
    delete auth.suspendedAt;
    delete auth.revokedAt;
    auth.updatedAt = now;

    this.state.adminAuditLogs.unshift({
      id: 'audit-' + Date.now(),
      actorUserId: 'usr-superadmin',
      actorEmail: superAdminEmail,
      targetUserId: auth.userId,
      targetEmail: auth.email,
      action: 'ADMIN_REACTIVATED',
      beforeStatus: prevStatus,
      afterStatus: 'ACTIVE',
      timestamp: now,
      reason: reason || 'Reactivated by Super Admin',
    });

    this.broadcastEvent('ADMIN_AUTH_UPDATED', {
      email: auth.email,
      status: 'ACTIVE',
      authorizations: this.state.adminAuthorizations,
    }, superAdminEmail);

    return { success: true, message: `Reactivated admin authorization for ${auth.name} (${auth.email})`, authorization: auth };
  }

  public handleStatusChange(status: EventStatus, actor: string) {
    this.state.eventStatus = status;
    this.state.auditLogs.unshift({
      id: 'aud-' + Date.now(),
      actor,
      role: 'ADMIN',
      action: 'EVENT_STATUS_TRANSITION',
      target: status,
      details: `Advanced event status to ${status}`,
      timestamp: new Date().toISOString(),
      source: 'ADMIN',
    });
    this.broadcastEvent('EVENT_STATE_CHANGED', { eventStatus: status }, actor);
  }

  public handleClockToggle(actor: string) {
    this.state.serverClock.isClockRunning = !this.state.serverClock.isClockRunning;
    this.broadcastEvent('CLOCK_SYNC', {
      timeRemainingSeconds: this.state.serverClock.timeRemainingSeconds,
      isClockRunning: this.state.serverClock.isClockRunning,
      timestamp: Date.now(),
    }, actor);
  }

  public handleClockReset(minutes: number, actor: string) {
    this.state.serverClock.timeRemainingSeconds = minutes * 60;
    this.state.serverClock.isClockRunning = true;
    this.state.serverClock.phaseStartedAt = new Date().toISOString();
    this.state.serverClock.phaseEndsAt = new Date(Date.now() + minutes * 60000).toISOString();

    this.broadcastEvent('CLOCK_SYNC', {
      timeRemainingSeconds: this.state.serverClock.timeRemainingSeconds,
      isClockRunning: true,
      timestamp: Date.now(),
    }, actor);
  }

  public handlePriceChange(sku: string, newPrice: number, actor: string) {
    const item = this.state.marketItems.find((i) => i.sku === sku);
    if (!item) return false;
    const oldPrice = item.currentPrice;
    item.currentPrice = newPrice;
    item.priceChangePct = Math.round(((newPrice - item.basePrice) / item.basePrice) * 100);

    this.state.auditLogs.unshift({
      id: 'aud-' + Date.now(),
      actor,
      role: 'ADMIN',
      action: 'MARKET_PRICE_OVERRIDE',
      target: sku,
      details: `Changed ${sku} price from ₹${oldPrice.toLocaleString()} to ₹${newPrice.toLocaleString()}`,
      timestamp: new Date().toISOString(),
      source: 'ADMIN',
    });

    this.broadcastEvent('PRICE_UPDATED', {
      sku,
      currentPrice: newPrice,
      priceChangePct: item.priceChangePct,
      items: this.state.marketItems,
    }, actor);
    return true;
  }

  public handleStockChange(sku: string, delta: number, actor: string) {
    const item = this.state.marketItems.find((i) => i.sku === sku);
    if (!item) return false;
    item.stockRemaining = Math.max(0, item.stockRemaining + delta);
    item.status = item.stockRemaining === 0 ? 'OUT_OF_STOCK' : 'AVAILABLE';

    this.broadcastEvent('STOCK_UPDATED', {
      sku,
      stockRemaining: item.stockRemaining,
      status: item.status,
      items: this.state.marketItems,
    }, actor);
    return true;
  }

  public handlePurchase(
    teamId: string,
    sku: string,
    idempotencyKey: string,
    actorEmail: string,
    actorRole: string
  ): { success: boolean; message: string; balance?: number } {
    const item = this.state.marketItems.find((i) => i.sku === sku);
    if (!item) return { success: false, message: 'Item SKU not found in authoritative catalog' };
    if (item.stockRemaining <= 0) return { success: false, message: 'SKU is out of stock' };

    const currentBalance = this.getTeamBalance(teamId);
    if (currentBalance < item.currentPrice) {
      return { success: false, message: `Insufficient funds: Required ₹${item.currentPrice.toLocaleString()}, available ₹${currentBalance.toLocaleString()}` };
    }

    return this.commitPurchaseDirect(teamId, item, idempotencyKey, actorEmail, actorRole);
  }

  public handleCrisisDispatch(teamId: string, crisisId: string, actor: string, timerSeconds?: number) {
    const card = this.state.crisisCards.find((c) => c.id === crisisId) || this.rng.pick(this.state.crisisCards);
    const duration = timerSeconds !== undefined ? timerSeconds : card.timerSeconds;
    const expiresAt = duration <= 0 ? new Date(Date.now() - 5000).toISOString() : new Date(Date.now() + duration * 1000).toISOString();
    const assignment: CrisisAssignment = {
      id: 'c-asg-' + Date.now(),
      teamId,
      crisisId: card.id,
      crisis: card,
      dispatchedAt: new Date().toISOString(),
      expiresAt,
      status: 'ACTIVE',
    };
    this.state.activeCrisis = assignment;

    this.state.auditLogs.unshift({
      id: 'aud-' + Date.now(),
      actor,
      role: 'ADMIN',
      action: 'CRISIS_DISPATCHED',
      target: teamId,
      details: `Dispatched crisis "${card.title}" (${card.severity}) to ${teamId}`,
      timestamp: new Date().toISOString(),
      source: 'ADMIN',
    });

    this.broadcastEvent('CRISIS_DISPATCHED', {
      teamId,
      crisis: assignment,
    }, actor);
    return assignment;
  }

  public handleCrisisResponse(teamId: string, optionId: string, tradeoff: string, actor: string) {
    if (!this.state.activeCrisis) return { success: false, code: 'NO_ACTIVE_CRISIS', message: 'No active crisis to resolve' };
    if (this.state.activeCrisis.status !== 'ACTIVE') {
      return { success: false, code: 'CRISIS_NOT_ACTIVE', message: `Crisis status is already ${this.state.activeCrisis.status}` };
    }

    const now = Date.now();
    const expiryTime = new Date(this.state.activeCrisis.expiresAt).getTime();
    if (now > expiryTime) {
      this.handleCrisisTimeout();
      return { success: false, code: 'CRISIS_EXPIRED', message: 'Crisis response window has expired (Penalty applied)' };
    }

    const opt = this.state.activeCrisis.crisis.options.find(
      (o: CrisisOption) => o.id.toLowerCase() === optionId.toLowerCase()
    ) || this.state.activeCrisis.crisis.options[0];
    if (!opt) return { success: false, code: 'INVALID_OPTION', message: 'Invalid option selected' };

    this.state.activeCrisis.status = 'RESOLVED';
    this.state.activeCrisis.selectedOptionId = optionId;
    this.state.activeCrisis.tradeoffGivenUp = tradeoff;
    this.state.activeCrisis.resolvedAt = new Date().toISOString();

    if (opt.cost > 0) {
      const led: LedgerEntry = {
        id: 'led-crisis-' + Date.now(),
        teamId,
        type: 'DEBIT',
        amount: opt.cost,
        reasonTag: 'CRISIS_PENALTY',
        description: `Crisis Mitigation: ${opt.label}`,
        round: this.state.eventStatus,
        actorMemberId: actor,
        actorRole: 'CEO',
        idempotencyKey: 'idemp-crisis-' + Date.now(),
        source: 'APP',
        createdAt: new Date().toISOString(),
      };
      this.state.ledger.unshift(led);
    }

    this.broadcastEvent('CRISIS_RESPONSE_RECEIVED', {
      teamId,
      activeCrisis: this.state.activeCrisis,
      newBalance: this.getTeamBalance(teamId),
    }, actor);

    return { success: true, message: 'Crisis resolved successfully' };
  }

  public handleCrisisTimeout() {
    if (!this.state.activeCrisis || this.state.activeCrisis.status !== 'ACTIVE') return;

    this.state.activeCrisis.status = 'TIMEOUT';
    const teamId = this.state.activeCrisis.teamId;

    // Default penalty debit for unmitigated crisis
    const penaltyAmount = 50000;
    this.state.ledger.unshift({
      id: 'led-timeout-' + Date.now(),
      teamId,
      type: 'DEBIT',
      amount: penaltyAmount,
      reasonTag: 'CRISIS_PENALTY',
      description: `Crisis Timeout Penalty: Unmitigated damage from ${this.state.activeCrisis.crisis.title}`,
      round: this.state.eventStatus,
      actorMemberId: 'SYSTEM',
      actorRole: 'SYSTEM',
      idempotencyKey: 'idemp-timeout-' + Date.now(),
      source: 'SYSTEM',
      createdAt: new Date().toISOString(),
    });

    this.broadcastEvent('CRISIS_TIMEOUT', {
      crisis: this.state.activeCrisis,
      teamId,
      penaltyAmount,
      newBalance: this.getTeamBalance(teamId),
    }, 'SERVER_CLOCK');
  }

  public handleAuctionOpen(title: string, description: string, itemSku: string, minBid: number, durationMinutes: number, actor: string) {
    const auction: Auction = {
      id: 'auc-' + Date.now(),
      title,
      description,
      itemSku,
      minimumBid: minBid,
      status: 'OPEN',
      opensAt: new Date().toISOString(),
      closesAt: new Date(Date.now() + durationMinutes * 60000).toISOString(),
    };
    this.state.activeAuction = auction;
    this.state.auctionBids = [];

    this.broadcastEvent('AUCTION_OPENED', { auction }, actor);
    return auction;
  }

  public handleAuctionBid(teamId: string, teamName: string, amount: number, actor: string) {
    if (!this.state.activeAuction || this.state.activeAuction.status !== 'OPEN') {
      return { success: false, code: 'AUCTION_CLOSED', message: 'Auction is not currently open' };
    }
    const now = Date.now();
    const closesAtMs = new Date(this.state.activeAuction.closesAt).getTime();
    if (now > closesAtMs) {
      this.handleAuctionClose('SERVER_CLOCK');
      return { success: false, code: 'AUCTION_CLOSED', message: 'Auction closing deadline has passed' };
    }

    const currentHigh = this.state.auctionBids.length > 0 ? this.state.auctionBids[0].amount : this.state.activeAuction.minimumBid;
    if (amount <= currentHigh) {
      return { success: false, code: 'BID_TOO_LOW', message: `Bid must be higher than current high bid of ₹${currentHigh.toLocaleString()}` };
    }

    const currentBalance = this.getTeamBalance(teamId);
    if (currentBalance < amount) {
      return { success: false, code: 'INSUFFICIENT_FUNDS', message: `Insufficient funds for bid: Available balance is ₹${currentBalance.toLocaleString()}` };
    }

    const bid: AuctionBid = {
      id: 'bid-' + Date.now(),
      auctionId: this.state.activeAuction.id,
      teamId,
      teamName,
      amount,
      submittedAt: new Date().toISOString(),
      idempotencyKey: 'bid-' + Date.now(),
    };
    this.state.auctionBids.unshift(bid);

    this.broadcastEvent('AUCTION_BID_RECEIVED', {
      auctionId: this.state.activeAuction.id,
      bid,
      highBid: amount,
      highBidTeamName: teamName,
    }, actor);

    return { success: true, message: 'Bid placed successfully' };
  }

  public handleAuctionClose(actor: string) {
    if (!this.state.activeAuction || this.state.activeAuction.status === 'CLOSED') return null;
    this.state.activeAuction.status = 'CLOSED';

    if (this.state.auctionBids.length > 0) {
      const win = this.state.auctionBids[0];
      this.state.activeAuction.winnerTeamId = win.teamId;
      this.state.activeAuction.winnerTeamName = win.teamName;
      this.state.activeAuction.winningBid = win.amount;

      // Debit winner atomically
      this.state.ledger.unshift({
        id: 'led-auc-' + Date.now(),
        teamId: win.teamId,
        type: 'DEBIT',
        amount: win.amount,
        reasonTag: 'AUCTION_WIN',
        description: `Won Auction: ${this.state.activeAuction.title}`,
        round: this.state.eventStatus,
        actorMemberId: actor,
        actorRole: 'SYSTEM',
        idempotencyKey: 'idemp-auc-' + Date.now(),
        source: 'SYSTEM',
        createdAt: new Date().toISOString(),
      });

      // Grant inventory item to winner
      if (this.state.activeAuction.itemSku) {
        this.state.inventory.unshift({
          id: 'inv-auc-' + Date.now(),
          teamId: win.teamId,
          sku: this.state.activeAuction.itemSku,
          name: this.state.activeAuction.title,
          category: 'Growth',
          qty: 1,
          acquiredPrice: win.amount,
          acquiredAt: new Date().toISOString(),
          round: this.state.eventStatus,
          effectApplied: true,
        });
      }
    }

    this.broadcastEvent('AUCTION_CLOSED', {
      auction: this.state.activeAuction,
    }, actor);

    return this.state.activeAuction;
  }

  public handleManualAdjustment(teamId: string, type: 'CREDIT' | 'DEBIT', amount: number, reason: string, actor: string) {
    const entry: LedgerEntry = {
      id: 'led-' + Date.now(),
      teamId,
      type,
      amount,
      reasonTag: 'MANUAL_ADJUSTMENT',
      description: reason,
      round: this.state.eventStatus,
      actorMemberId: actor,
      actorRole: 'ADMIN',
      idempotencyKey: 'idemp-adj-' + Date.now(),
      source: 'ADMIN',
      createdAt: new Date().toISOString(),
    };
    this.state.ledger.unshift(entry);
    const newBalance = this.getTeamBalance(teamId);

    this.broadcastEvent('FUNDS_UPDATED', {
      teamId,
      newBalance,
      entry,
    }, actor);

    return entry;
  }

  public handleLoanGrant(teamId: string, principal: number, interestPct: number, actor: string) {
    const entry: LedgerEntry = {
      id: 'led-loan-' + Date.now(),
      teamId,
      type: 'CREDIT',
      amount: principal,
      reasonTag: 'LOAN_DISBURSEMENT',
      description: `Institutional Venture Debt (+${interestPct}% coupon)`,
      round: this.state.eventStatus,
      actorMemberId: actor,
      actorRole: 'ADMIN',
      idempotencyKey: 'idemp-loan-' + Date.now(),
      source: 'ADMIN',
      createdAt: new Date().toISOString(),
    };
    this.state.ledger.unshift(entry);
    const newBalance = this.getTeamBalance(teamId);

    this.broadcastEvent('FUNDS_UPDATED', {
      teamId,
      newBalance,
      entry,
    }, actor);

    return entry;
  }

  public handleAnnouncement(title: string, content: string, type: Announcement['type'] = 'INFO', actor: string) {
    const ann: Announcement = {
      id: 'ann-' + Date.now(),
      title,
      content,
      type,
      timestamp: new Date().toISOString(),
    };
    this.state.announcements.unshift(ann);
    this.broadcastEvent('ANNOUNCEMENT_BROADCAST', { announcement: ann }, actor);
    return ann;
  }

  public handleLiveScreenConfig(cfg: any, actor: string) {
    this.state.liveScreenConfig = {
      ...this.state.liveScreenConfig,
      ...cfg,
    };
    this.broadcastEvent('LIVE_SCREEN_CONFIG_UPDATED', { config: this.state.liveScreenConfig }, actor);
    return this.state.liveScreenConfig;
  }

  public handleJudgeScore(score: Omit<JudgeScore, 'id' | 'submittedAt'>, actor: string) {
    const fullScore: JudgeScore = {
      ...score,
      id: 'scr-' + Date.now(),
      submittedAt: new Date().toISOString(),
    };
    this.state.judgeScores.unshift(fullScore);
    this.broadcastEvent('SCORE_SUBMITTED', { score: fullScore }, actor);
    return fullScore;
  }

  public handleReset() {
    this.state = this.getInitialState();
    this.processedCommands.clear();
    this.processedIdempotencyKeys.clear();
    this.factLog = [];
    this.startClock();
    this.broadcastEvent('SIMULATION_RESET', { timestamp: Date.now() }, 'SYSTEM');
    return true;
  }
}

export const serverEngine = new ZeroOneBackendEngine();

// Helper to parse JSON body from incoming HTTP request
async function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Connect middleware function for Vite dev server & production server
export function zeroOneBackendMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const url = req.url || '';

  if (!url.startsWith('/api')) {
    return next();
  }

  // SSE Stream (validated-origin CORS echo, not a wildcard)
  if (url === '/api/realtime/stream') {
    return serverEngine.registerSseClient(res, resolveZeroOneCorsOrigin(req));
  }

  res.setHeader('Content-Type', 'application/json');
  applyZeroOneCors(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Handle API routes
  (async () => {
    try {
      // Resolve the shared main-site session once per request. A verified
      // JWT identity outranks the self-asserted x-user-email header in every
      // authorization check below; null preserves LAN / venue behavior.
      const verified = await verifyZeroOneSession(req);
      if (verified) {
        (req as unknown as { zeroOneVerifiedEmail?: string }).zeroOneVerifiedEmail =
          verified.email;
      }
      const actorEmail = verified?.email || '';

      // 1. Health
      if (url === '/api/health') {
        res.writeHead(200);
        return res.end(JSON.stringify({
          status: 'ok',
          serverTimestamp: Date.now(),
          sequence: serverEngine.getAuthoritativeState().eventSequence,
        }));
      }

      // 1b. Session status (playground-style /api/auth/status equivalent)
      if (url === '/api/auth/status' && req.method === 'GET') {
        const adminStatus = actorEmail ? serverEngine.getUserAdminStatus(actorEmail) : 'NONE';
        const isSuperAdmin = actorEmail ? serverEngine.isUserSuperAdmin(actorEmail) : false;
        res.writeHead(200);
        return res.end(JSON.stringify({
          authenticated: Boolean(verified),
          email: verified?.email || null,
          name: verified?.name || null,
          role: verified?.role || null,
          userId: verified?.userId || null,
          adminStatus,
          isSuperAdmin,
        }));
      }

      // 2. Authoritative State (staff authorization lists are admin-only)
      if (url === '/api/state') {
        res.writeHead(200);
        return res.end(JSON.stringify(serverEngine.getPublicState(actorEmail || undefined)));
      }

      // 3. Server Clock
      if (url === '/api/clock') {
        const state = serverEngine.getAuthoritativeState();
        res.writeHead(200);
        return res.end(JSON.stringify({
          timeRemainingSeconds: state.serverClock.timeRemainingSeconds,
          isClockRunning: state.serverClock.isClockRunning,
          serverTimestamp: Date.now(),
          sequence: state.eventSequence,
        }));
      }

      // 4. UNIFIED COMMAND ENDPOINT (POST /api/zero-one/commands & POST /api/commands)
      if ((url === '/api/zero-one/commands' || url === '/api/commands') && req.method === 'POST') {
        if (!verified) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Valid Code.SCRIET authentication required to dispatch commands',
            },
          }));
        }
        const body = await parseJsonBody(req);
        const command: Command = {
          commandId: body.commandId || 'cmd-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          deviceId: body.deviceId || (req.headers['x-device-id'] as string) || 'dev-unknown',
          userId: verified.userId || verified.email,
          userEmail: verified.email,
          teamId: body.teamId,
          role: body.role,
          type: body.type,
          payload: body.payload || {},
          clientCreatedAt: body.clientCreatedAt || new Date().toISOString(),
          attemptCount: body.attemptCount || 1,
          status: 'PENDING',
        };

        const result = await serverEngine.executeCommand(command);
        if (!result.success && !result.error) {
          result.error = {
            code: result.code || 'COMMAND_FAILED',
            message: result.message || 'Operation failed',
            commandId: command.commandId,
          };
        }
        res.writeHead(result.success ? 200 : 400);
        return res.end(JSON.stringify(result));
      }

      // 5. EVENT REPLAY & RECONNECT SYNC (GET /api/zero-one/events?sinceSequence=X)
      if (url.startsWith('/api/zero-one/events') && req.method === 'GET') {
        const parsed = new URL(url, 'http://localhost');
        const sinceSeq = parseInt(parsed.searchParams.get('sinceSequence') || '0', 10);
        const facts = serverEngine.getEventsSince(sinceSeq);
        res.writeHead(200);
        return res.end(JSON.stringify({
          success: true,
          sinceSequence: sinceSeq,
          latestSequence: serverEngine.getAuthoritativeState().eventSequence,
          currentSequence: serverEngine.getAuthoritativeState().eventSequence,
          facts,
          events: facts,
        }));
      }

      // 6. LEADERBOARD (GET /api/zero-one/leaderboard)
      if (url === '/api/zero-one/leaderboard' && req.method === 'GET') {
        const leaderboard = serverEngine.getLeaderboard(actorEmail);
        res.writeHead(200);
        return res.end(JSON.stringify({
          success: true,
          leaderboard,
        }));
      }

      // 7. SNAPSHOT APIS
      if (url === '/api/zero-one/snapshot/create' && req.method === 'POST') {
        if (!serverEngine.requireAdmin(req, res)) return;
        const body = await parseJsonBody(req);
        const snapshot = serverEngine.createSnapshot(body.name || 'Admin Snapshot', actorEmail || 'admin');
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, snapshot }));
      }

      if (url === '/api/zero-one/snapshot/restore' && req.method === 'POST') {
        if (!serverEngine.requireSuperAdmin(req, res)) return;
        const body = await parseJsonBody(req);
        const ok = serverEngine.restoreSnapshot(body.snapshotId || body.snapshot, actorEmail || 'superadmin');
        res.writeHead(ok ? 200 : 400);
        return res.end(JSON.stringify({ success: ok }));
      }

      if (url === '/api/zero-one/snapshot/export' && req.method === 'GET') {
        if (!serverEngine.requireAdmin(req, res)) return;
        res.writeHead(200);
        return res.end(JSON.stringify(serverEngine.getAuthoritativeState()));
      }

      // 8. Auth Authoritative Identity & Authorization
      if (url.startsWith('/api/auth/me')) {
        if (!verified) {
          res.writeHead(200);
          return res.end(JSON.stringify({
            authenticated: false,
            user: null,
            adminStatus: 'NONE',
            isSuperAdmin: false,
            verified: false,
            authorization: {
              verified: false,
              active: false,
              role: 'NONE',
              status: 'NONE',
            },
          }));
        }
        const status = serverEngine.getUserAdminStatus(verified.email);
        const isSuper = serverEngine.isUserSuperAdmin(verified.email);
        const authRecord = serverEngine.getAuthoritativeState().adminAuthorizations.find(
          (a) => a.email.toLowerCase() === verified.email.toLowerCase()
        );
        const role = isSuper ? 'SUPER_ADMIN' : authRecord?.role || 'NONE';
        res.writeHead(200);
        return res.end(JSON.stringify({
          authenticated: true,
          email: verified.email,
          adminStatus: status,
          isSuperAdmin: isSuper,
          verified: status === 'ACTIVE',
          user: {
            id: verified.userId,
            name: verified.name || verified.email.split('@')[0],
            email: verified.email,
            role: verified.role,
          },
          authorization: {
            verified: status === 'ACTIVE',
            active: status === 'ACTIVE',
            role,
            status,
          },
        }));
      }

      if (url.startsWith('/api/auth/authorization') && req.method === 'GET') {
        if (!verified) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({
            authenticated: false,
            user: null,
            authorization: {
              verified: false,
              active: false,
              role: 'NONE',
              status: 'NONE',
            },
          }));
        }
        const status = serverEngine.getUserAdminStatus(verified.email);
        const isSuper = serverEngine.isUserSuperAdmin(verified.email);
        const authRecord = serverEngine.getAuthoritativeState().adminAuthorizations.find(
          (a) => a.email.toLowerCase() === verified.email.toLowerCase()
        );
        const role = isSuper ? 'SUPER_ADMIN' : authRecord?.role || 'NONE';
        res.writeHead(200);
        return res.end(JSON.stringify({
          authenticated: true,
          user: {
            id: verified.userId,
            name: verified.name || verified.email.split('@')[0],
            email: verified.email,
            role: verified.role,
          },
          authorization: {
            verified: status === 'ACTIVE',
            active: status === 'ACTIVE',
            role,
            status,
          },
        }));
      }

      if (url === '/api/auth/logout' && req.method === 'POST') {
        res.setHeader(
          'Set-Cookie',
          'scriet_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
        );
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, message: 'Logged out successfully' }));
      }

      // 9. Judge Assigned Teams (Judge Isolation)
      if (url.startsWith('/api/judge/assigned-teams') && req.method === 'GET') {
        if (!verified) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Valid Code.SCRIET authentication required' }));
        }
        const judgeEmail = verified.email.toLowerCase();
        const teams = serverEngine.getAssignedTeamsForJudge(judgeEmail);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, teams }));
      }

      // --- PROTECTED ADMIN APIS ---
      if (url.startsWith('/api/admin/')) {
        const actorEmail = verified?.email || '';

        // SUPER ADMIN EXCLUSIVE ROUTES
        if (url.startsWith('/api/admin/search-user') && req.method === 'GET') {
          if (!serverEngine.requireSuperAdmin(req, res)) return;
          const urlParams = new URL(url, 'http://localhost');
          const email = urlParams.searchParams.get('email') || '';
          const result = serverEngine.handleSearchUser(email);
          res.writeHead(result.found ? 200 : 404);
          return res.end(JSON.stringify(result));
        }

        if (url === '/api/admin/verify' && req.method === 'POST') {
          if (!serverEngine.requireSuperAdmin(req, res)) return;
          const body = await parseJsonBody(req);
          const result = serverEngine.handleVerifyAdminByEmail(body.email, body.role || 'ADMIN', actorEmail);
          res.writeHead(result.success ? 200 : 400);
          return res.end(JSON.stringify(result));
        }

        if (url === '/api/admin/suspend' && req.method === 'POST') {
          if (!serverEngine.requireSuperAdmin(req, res)) return;
          const body = await parseJsonBody(req);
          const result = serverEngine.handleSuspendAdmin(body.email || body.targetEmail, body.reason, actorEmail);
          res.writeHead(result.success ? 200 : 400);
          return res.end(JSON.stringify(result));
        }

        if (url === '/api/admin/revoke' && req.method === 'POST') {
          if (!serverEngine.requireSuperAdmin(req, res)) return;
          const body = await parseJsonBody(req);
          const result = serverEngine.handleRevokeAdmin(body.email || body.targetEmail, body.reason, actorEmail);
          res.writeHead(result.success ? 200 : 400);
          return res.end(JSON.stringify(result));
        }

        if (url === '/api/admin/reactivate' && req.method === 'POST') {
          if (!serverEngine.requireSuperAdmin(req, res)) return;
          const body = await parseJsonBody(req);
          const result = serverEngine.handleReactivateAdmin(body.email || body.targetEmail, body.reason, actorEmail);
          res.writeHead(result.success ? 200 : 400);
          return res.end(JSON.stringify(result));
        }

        if (url === '/api/admin/audit-logs' && req.method === 'GET') {
          if (!serverEngine.requireSuperAdmin(req, res)) return;
          res.writeHead(200);
          return res.end(JSON.stringify({ auditLogs: serverEngine.getAuthoritativeState().adminAuditLogs }));
        }

        if (url === '/api/admin/authorizations' && req.method === 'GET') {
          if (!serverEngine.requireSuperAdmin(req, res)) return;
          res.writeHead(200);
          return res.end(JSON.stringify({ authorizations: serverEngine.getAuthoritativeState().adminAuthorizations }));
        }

        // Backward compatibility routes for verification
        if (url === '/api/admin/verification/approve' && req.method === 'POST') {
          if (!serverEngine.requireSuperAdmin(req, res)) return;
          const body = await parseJsonBody(req);
          const result = serverEngine.handleVerifyAdminByEmail(body.email || body.targetEmail, body.role || 'ADMIN', actorEmail);
          res.writeHead(result.success ? 200 : 400);
          return res.end(JSON.stringify(result));
        }

        if (url === '/api/admin/verification/suspend' && req.method === 'POST') {
          if (!serverEngine.requireSuperAdmin(req, res)) return;
          const body = await parseJsonBody(req);
          const result = serverEngine.handleSuspendAdmin(body.email || body.targetEmail, body.reason, actorEmail);
          res.writeHead(result.success ? 200 : 400);
          return res.end(JSON.stringify(result));
        }

        if (url === '/api/admin/verification/reactivate' && req.method === 'POST') {
          if (!serverEngine.requireSuperAdmin(req, res)) return;
          const body = await parseJsonBody(req);
          const result = serverEngine.handleReactivateAdmin(body.email || body.targetEmail, body.reason, actorEmail);
          res.writeHead(result.success ? 200 : 400);
          return res.end(JSON.stringify(result));
        }

        // Standard ADMIN protected routes
        if (!serverEngine.requireAdmin(req, res)) {
          return;
        }

        if (url === '/api/admin/event/status' && req.method === 'POST') {
          const body = await parseJsonBody(req);
          serverEngine.handleStatusChange(body.status, actorEmail);
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true, status: body.status }));
        }

        if (url === '/api/admin/event/clock' && req.method === 'POST') {
          const body = await parseJsonBody(req);
          if (body.action === 'TOGGLE') {
            serverEngine.handleClockToggle(actorEmail);
          } else if (body.action === 'RESET') {
            serverEngine.handleClockReset(body.minutes || 25, actorEmail);
          }
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true }));
        }

        if (url === '/api/admin/market/price' && req.method === 'POST') {
          const body = await parseJsonBody(req);
          const ok = serverEngine.handlePriceChange(body.sku, body.price, actorEmail);
          res.writeHead(ok ? 200 : 400);
          return res.end(JSON.stringify({ success: ok }));
        }

        if (url === '/api/admin/market/stock' && req.method === 'POST') {
          const body = await parseJsonBody(req);
          const ok = serverEngine.handleStockChange(body.sku, body.delta, actorEmail);
          res.writeHead(ok ? 200 : 400);
          return res.end(JSON.stringify({ success: ok }));
        }

        if (url === '/api/admin/crisis/dispatch' && req.method === 'POST') {
          const body = await parseJsonBody(req);
          const crisis = serverEngine.handleCrisisDispatch(body.teamId, body.crisisId, actorEmail);
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true, crisis }));
        }

        if (url === '/api/admin/auction/open' && req.method === 'POST') {
          const body = await parseJsonBody(req);
          const auc = serverEngine.handleAuctionOpen(body.title, body.description, body.itemSku, body.minBid, body.durationMinutes, actorEmail);
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true, auction: auc }));
        }

        if (url === '/api/admin/auction/close' && req.method === 'POST') {
          const auc = serverEngine.handleAuctionClose(actorEmail);
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true, auction: auc }));
        }

        if (url === '/api/admin/finance/adjust' && req.method === 'POST') {
          const body = await parseJsonBody(req);
          const entry = serverEngine.handleManualAdjustment(body.teamId, body.type, body.amount, body.reason, actorEmail);
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true, entry }));
        }

        if (url === '/api/admin/finance/loan' && req.method === 'POST') {
          const body = await parseJsonBody(req);
          const entry = serverEngine.handleLoanGrant(body.teamId, body.principal, body.interestPct, actorEmail);
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true, entry }));
        }

        if (url === '/api/admin/announcements' && req.method === 'POST') {
          const body = await parseJsonBody(req);
          const ann = serverEngine.handleAnnouncement(body.title, body.content, body.type, actorEmail);
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true, announcement: ann }));
        }

        if (url === '/api/admin/reset' && req.method === 'POST') {
          if (!serverEngine.requireSuperAdmin(req, res)) return;
          serverEngine.handleReset();
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true }));
        }
      }

      if (url === '/api/announcements/broadcast' && req.method === 'POST') {
        const body = await parseJsonBody(req);
        const ann = serverEngine.handleAnnouncement(body.title, body.content, body.type, verified?.email || 'admin');
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, announcement: ann }));
      }

      if (url === '/api/live-screen/config') {
        if (req.method === 'POST') {
          const body = await parseJsonBody(req);
          const cfg = serverEngine.handleLiveScreenConfig(body, verified?.email || 'admin');
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true, config: cfg }));
        } else {
          res.writeHead(200);
          return res.end(JSON.stringify(serverEngine.getAuthoritativeState().liveScreenConfig));
        }
      }

      // --- PARTICIPANT & CLIENT APIS ---
      if (url === '/api/participant/admin-apply') {
        res.writeHead(403);
        return res.end(JSON.stringify({
          error: 'Admin self-application is disabled. Administrator authorization is granted directly by the Super Admin.',
        }));
      }

      if (url === '/api/participant/purchase' && req.method === 'POST') {
        if (!verified) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Valid Code.SCRIET authentication required' }));
        }
        const body = await parseJsonBody(req);
        const userEmail = verified.email;
        const userRole = body.actorRole || 'CFO';
        const result = serverEngine.handlePurchase(
          body.teamId,
          body.sku,
          body.idempotencyKey || 'idemp-' + Date.now(),
          userEmail,
          userRole
        );
        res.writeHead(result.success ? 200 : 400);
        return res.end(JSON.stringify(result));
      }

      if (url === '/api/participant/crisis/response' && req.method === 'POST') {
        if (!verified) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Valid Code.SCRIET authentication required' }));
        }
        const body = await parseJsonBody(req);
        const userEmail = verified.email;
        const result = serverEngine.handleCrisisResponse(body.teamId, body.optionId, body.tradeoff, userEmail);
        res.writeHead(result.success ? 200 : 400);
        return res.end(JSON.stringify(result));
      }

      if (url === '/api/participant/auction/bid' && req.method === 'POST') {
        if (!verified) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Valid Code.SCRIET authentication required' }));
        }
        const body = await parseJsonBody(req);
        const userEmail = verified.email;
        const result = serverEngine.handleAuctionBid(body.teamId, body.teamName, body.amount, userEmail);
        res.writeHead(result.success ? 200 : 400);
        return res.end(JSON.stringify(result));
      }

      if (url === '/api/judge/score' && req.method === 'POST') {
        if (!verified) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Valid Code.SCRIET authentication required' }));
        }
        const body = await parseJsonBody(req);
        const userEmail = verified.email;
        const score = serverEngine.handleJudgeScore(body, userEmail);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, score }));
      }

      // Route not found in /api
      if (!res.headersSent) {
        res.writeHead(404);
        return res.end(JSON.stringify({ error: 'Endpoint not found' }));
      }
    } catch (err: any) {
      if (!res.headersSent) {
        res.writeHead(500);
        return res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
      }
    }
  })();
}
