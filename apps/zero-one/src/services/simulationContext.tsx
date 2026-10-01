import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  CodeScrietUser,
  SimulationRole,
  Team,
  EventStatus,
  EventConfig,
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
  LedgerSource,
  JudgingCriteria,
  AdminAuthorization,
  AdminAuditLogEntry,
  AdminAuthorizationStatus,
  AdminPermissionRole,
} from '../types';
import {
  DEFAULT_CONFIG,
  INITIAL_MARKET_ITEMS,
  INITIAL_CRISIS_CARDS,
  INITIAL_TEAMS,
  DEFAULT_JUDGING_CRITERIA,
} from './mockData';
import {
  BOOTSTRAP_ADMIN_EMAIL,
  INITIAL_ADMIN_AUTHORIZATIONS,
  INITIAL_ADMIN_AUDIT_LOGS,
  AuthorizationState,
} from './adminAuthService';
import { realtimeBus } from './eventBus';
import { offlineStorage } from './offlineStorage';
import { commandSync } from './commandSyncEngine';
import { resolveApiUrl } from '../lib/apiBase';
import { clearZeroOneToken, getZeroOneStoredToken } from '../lib/authToken';
import { consumeMainSiteHandoff } from './mainSiteAuth';

export type AuthStateType =
  | 'AUTH_LOADING'
  | 'NOT_AUTHENTICATED'
  | 'AUTHENTICATED'
  | 'SESSION_EXPIRED'
  | 'AUTHENTICATED_NOT_AUTHORIZED'
  | 'ADMIN_REVOKED'
  | 'SERVER_UNAVAILABLE'
  | 'INVALID_SESSION';

export interface LiveScreenConfig {
  showLeaderboard: boolean;
  showCrisisGrid: boolean;
  showMarketTicker: boolean;
  announcementTickerText: string;
  presentationMode: 'NORMAL' | 'LOCKDOWN' | 'QUALIFIERS' | 'REVEAL';
}

interface SimulationContextType {
  // Auth & SSO
  currentUser: CodeScrietUser;
  authToken: string | null;
  authState: AuthStateType;
  currentRole: SimulationRole | 'ADMIN' | 'JUDGE' | 'MARSHAL' | 'PUBLIC';
  setCurrentRole: (role: SimulationRole | 'ADMIN' | 'JUDGE' | 'MARSHAL' | 'PUBLIC') => void;
  switchUser: (user: CodeScrietUser, role: SimulationRole | 'ADMIN' | 'JUDGE' | 'MARSHAL' | 'PUBLIC') => void;
  isLoggedIn: boolean;
  logout: () => void;

  // Event & Clock
  eventStatus: EventStatus;
  setEventStatus: (status: EventStatus) => void;
  eventConfig: EventConfig;
  updateEventConfig: (newConfig: Partial<EventConfig>) => void;
  serverTimeRemainingSeconds: number;
  isClockRunning: boolean;
  toggleClock: () => void;
  resetClock: (minutes?: number) => void;
  isLockdownActive: boolean;
  triggerLockdown: () => void;

  // Teams & Active Team
  teams: Team[];
  currentTeam: Team;
  setCurrentTeamId: (teamId: string) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  reissueRoleToDevice: (teamId: string, role: SimulationRole, targetDisplayName: string) => boolean;

  // Ledger & Finance
  ledger: LedgerEntry[];
  getBalance: (teamId?: string) => number;
  getRunwayMonths: (teamId?: string) => number;
  getFinancialHealthBand: (teamId?: string) => 'HEALTHY' | 'WATCH' | 'CRITICAL';
  manualLedgerAdjustment: (teamId: string, type: 'CREDIT' | 'DEBIT', amount: number, reason: string) => void;
  grantLoan: (teamId: string, principal: number, interestPct: number) => void;

  // Market & Purchases
  marketItems: MarketItem[];
  inventory: InventoryItem[];
  purchaseProposals: PurchaseProposal[];
  proposePurchase: (sku: string, reasonCategory: PurchaseProposal['reasonCategory']) => { success: boolean; message: string; proposalId?: string };
  approveProposal: (proposalId: string) => { success: boolean; message: string };
  rejectProposal: (proposalId: string, note?: string) => { success: boolean; message: string };
  reversePurchase: (ledgerEntryId: string) => { success: boolean; message: string };
  addMarketItem: (item: MarketItem) => void;
  updateMarketItem: (sku: string, updates: Partial<MarketItem>) => void;
  adjustStock: (sku: string, delta: number) => void;

  // Crisis Engine
  crisisCards: CrisisCard[];
  activeCrisis: CrisisAssignment | null;
  addCrisisCard: (card: CrisisCard) => void;
  updateCrisisCard: (id: string, updates: Partial<CrisisCard>) => void;
  dispatchCrisisToTeam: (teamId: string, crisisId: string) => void;
  extendCrisisTimer: (secondsToAdd: number) => void;
  resolveCrisisManually: (teamId: string, reason: string) => void;
  submitCrisisResponse: (optionId: string, tradeoff: string) => { success: boolean; message: string };

  // Canvas & Artifacts
  canvas: StartupCanvas;
  updateCanvasField: (field: keyof Omit<StartupCanvas, 'teamId' | 'lastSavedAt' | 'lastSavedBy' | 'version'>, value: string) => void;
  artifacts: ArtifactSubmission[];
  submitArtifact: (submission: Omit<ArtifactSubmission, 'id' | 'submittedAt'>) => void;

  // Auction & Trade
  activeAuction: Auction | null;
  auctionBids: AuctionBid[];
  openAuction: (title: string, description: string, itemSku: string, minBid: number, durationMinutes: number) => void;
  closeAuction: () => { winnerTeamName?: string; winningBid?: number };
  placeAuctionBid: (auctionId: string, amount: number) => { success: boolean; message: string };
  trades: TradeOffer[];
  proposeTrade: (toTeamId: string, itemSku: string, requestedCash: number) => { success: boolean; message: string };
  acceptTrade: (tradeId: string) => { success: boolean; message: string };

  // Judging & Scoring
  judgingCriteria: JudgingCriteria[];
  updateJudgingCriterion: (id: string, updates: Partial<JudgingCriteria>) => void;
  judgeScores: JudgeScore[];
  submitJudgeScore: (score: Omit<JudgeScore, 'id' | 'submittedAt'>) => void;
  floorScores: FloorScore[];
  recalculateFloorScores: () => void;

  // Live Screen & Announcements
  liveScreenConfig: LiveScreenConfig;
  updateLiveScreenConfig: (cfg: Partial<LiveScreenConfig>) => void;
  announcements: Announcement[];
  addAnnouncement: (title: string, content: string, type?: Announcement['type']) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  logAuditAction: (action: string, target: string, details: string, source?: LedgerSource) => void;

  // Rehearsals & Disaster Recovery
  resetAndReseedSimulation: () => void;
  createSnapshot: () => string;
  restoreSnapshot: (snapshotJson: string) => boolean;

  // Admin Authorization & Verification System (Authoritative Super Admin Control)
  authorizationState: AuthorizationState;
  adminAuthorizations: AdminAuthorization[];
  adminAuditLogs: AdminAuditLogEntry[];
  getAdminStatus: (userIdOrEmail?: string) => AdminAuthorizationStatus;
  isAdminVerified: (userIdOrEmail?: string) => boolean;
  isSuperAdmin: (userIdOrEmail?: string) => boolean;
  searchUserByEmail: (email: string) => Promise<{ found: boolean; user?: any; error?: string }>;
  verifyAdminByEmail: (targetEmail: string, role?: AdminPermissionRole) => Promise<{ success: boolean; message: string }>;
  suspendAdmin: (targetEmail: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  revokeAdmin: (targetEmail: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  reactivateAdmin: (targetEmail: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  suspendAdminAccess: (targetUserIdOrEmail: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  reactivateAdminAccess: (targetUserIdOrEmail: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  refreshAuthorizationState: () => Promise<void>;
  loginWithEmail: (email: string, name?: string) => void;
  adminNotification: { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' } | null;
  dismissAdminNotification: () => void;
}

const STORAGE_PREFIX = 'zero_one_v1_';
const STORED_USER_KEY = 'zero_one_user';

/** Signed-out identity. Nobody is "Aman Gupta" until they sign in. */
export const GUEST_USER: CodeScrietUser = {
  id: 'usr-guest',
  name: 'Guest Visitor',
  email: '',
  role: 'USER',
  avatarUrl: '/logo.png',
};

function readStoredUser(): CodeScrietUser | null {
  try {
    const raw = localStorage.getItem(STORED_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CodeScrietUser>;
    if (!parsed || typeof parsed.email !== 'string' || !parsed.email.includes('@')) return null;
    return {
      id: typeof parsed.id === 'string' ? parsed.id : 'usr-' + Date.now().toString(36),
      name: typeof parsed.name === 'string' && parsed.name ? parsed.name : parsed.email.split('@')[0],
      email: parsed.email,
      role: (parsed.role as CodeScrietUser['role']) || 'MEMBER',
      avatarUrl: typeof parsed.avatarUrl === 'string' ? parsed.avatarUrl : '/logo.png',
    };
  } catch {
    return null;
  }
}

function persistStoredUser(user: CodeScrietUser | null): void {
  try {
    if (!user) {
      localStorage.removeItem(STORED_USER_KEY);
    } else {
      localStorage.setItem(STORED_USER_KEY, JSON.stringify(user));
    }
  } catch {
    // storage blocked — session-only mode
  }
}

/**
 * Backend fetch helper (playground-style connection):
 * - same-origin relative URL by default, absolute when VITE_ZERO_ONE_API_URL
 *   is set for split deployments,
 * - `credentials: 'include'` so the shared `scriet_session` cookie travels,
 * - `Authorization: Bearer <zo_token>` from the main-site handoff when present
 *   (existing explicit headers such as x-user-email are preserved).
 */
const zoFetch = (path: string, init: RequestInit = {}): Promise<Response> => {
  const headers: Record<string, string> = {
    ...((init.headers as Record<string, string> | undefined) || {}),
  };
  const sessionToken = getZeroOneStoredToken();
  if (sessionToken && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
  }
  return fetch(resolveApiUrl(path), { credentials: 'include', ...init, headers });
};

export const SimulationContext = createContext<SimulationContextType | null>(null);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Auth & SSO Initial State — restore the signed-in identity when one was
  // persisted, otherwise start signed OUT (guest). There is no default user:
  // identity comes from the main-site handoff, email sign-in, or personas.
  const [currentUser, setCurrentUser] = useState<CodeScrietUser>(() => {
    return readStoredUser() || GUEST_USER;
  });

  const [authState, setAuthState] = useState<AuthStateType>('AUTH_LOADING');
  const [serverAdminStatus, setServerAdminStatus] = useState<AdminAuthorizationStatus>('NONE');
  const [serverIsSuperAdmin, setServerIsSuperAdmin] = useState<boolean>(false);

  const [currentRole, setCurrentRole] = useState<SimulationRole | 'ADMIN' | 'JUDGE' | 'MARSHAL' | 'PUBLIC'>(() => {
    try {
      return localStorage.getItem(STORED_USER_KEY) ? 'CEO' : 'PUBLIC';
    } catch {
      return 'PUBLIC';
    }
  });
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    } catch {
      return null;
    }
  });

  // Authoritative Server-Side Admin Authorization & Audit Logs (Controlled Exclusively by Super Admin)
  const [adminAuthorizations, setAdminAuthorizations] = useState<AdminAuthorization[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'admin_authorizations');
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_AUTHORIZATIONS;
  });

  const [adminAuditLogs, setAdminAuditLogs] = useState<AdminAuditLogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'admin_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_AUDIT_LOGS;
  });

  const [adminNotification, setAdminNotification] = useState<{
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  } | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'admin_authorizations', JSON.stringify(adminAuthorizations));
  }, [adminAuthorizations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'admin_audit_logs', JSON.stringify(adminAuditLogs));
  }, [adminAuditLogs]);

  // 2. Event Configuration & State
  const [eventConfig, setEventConfig] = useState<EventConfig>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [eventStatus, setEventStatusState] = useState<EventStatus>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'status');
    return (saved as EventStatus) || 'ROUND_2';
  });

  // Server Authoritative Countdown Clock
  const [serverTimeRemainingSeconds, setServerTimeRemainingSeconds] = useState<number>(522); // 08:42
  const [isClockRunning, setIsClockRunning] = useState<boolean>(true);
  const [isLockdownActive, setIsLockdownActive] = useState<boolean>(false);

  // 3. Teams State
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'teams');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });
  const [currentTeamId, setCurrentTeamId] = useState<string>('team-07');

  // 4. Financial Ledger (Append-Only)
  const [ledger, setLedger] = useState<LedgerEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'ledger');
    if (saved) return JSON.parse(saved);

    const now = new Date();
    return [
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
      {
        id: 'led-crisis-07',
        teamId: 'team-07',
        type: 'CREDIT',
        amount: 50000,
        reasonTag: 'CRISIS_REWARD',
        description: 'Solved minor crisis bonus award',
        round: 'Round 1',
        actorMemberId: 'mem-1',
        actorRole: 'CEO',
        idempotencyKey: 'idemp-crisis-bonus-07',
        source: 'APP',
        createdAt: new Date(now.getTime() - 7200000).toISOString(),
      },
      {
        id: 'led-tools-07',
        teamId: 'team-07',
        type: 'DEBIT',
        amount: 145000,
        reasonTag: 'PURCHASE',
        description: 'Tooling & Infrastructure Provisioning',
        round: 'Round 2',
        actorMemberId: 'mem-2',
        actorRole: 'CFO',
        idempotencyKey: 'idemp-tools-07',
        source: 'APP',
        createdAt: new Date(now.getTime() - 3600000).toISOString(),
      },
    ];
  });

  // 5. Market Items & Inventory
  const [marketItems, setMarketItems] = useState<MarketItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'market');
    return saved ? JSON.parse(saved) : INITIAL_MARKET_ITEMS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'inventory');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'inv-1',
        teamId: 'team-07',
        sku: 'DEVELOPER-HIRE',
        name: 'Senior Fullstack Dev',
        category: 'Human Resources',
        qty: 1,
        acquiredPrice: 120000,
        acquiredAt: new Date(Date.now() - 900000).toISOString(),
        round: 'Round 1',
        effectApplied: true,
      },
      {
        id: 'inv-2',
        teamId: 'team-07',
        sku: 'MKT-CAMPAIGN',
        name: 'Marketing Campaign',
        category: 'Marketing',
        qty: 1,
        acquiredPrice: 45000,
        acquiredAt: new Date(Date.now() - 120000).toISOString(),
        round: 'Round 2',
        effectApplied: true,
      },
      {
        id: 'inv-3',
        teamId: 'team-07',
        sku: 'CLOUD-CREDITS',
        name: 'Cloud Credits',
        category: 'Infrastructure',
        qty: 2,
        acquiredPrice: 96000,
        acquiredAt: new Date(Date.now() - 3600000).toISOString(),
        round: 'Round 1',
        effectApplied: true,
      },
    ];
  });

  const [purchaseProposals, setPurchaseProposals] = useState<PurchaseProposal[]>([]);

  // 6. Crisis Cards & Active Crisis Engine
  const [crisisCards, setCrisisCards] = useState<CrisisCard[]>(INITIAL_CRISIS_CARDS);
  const [activeCrisis, setActiveCrisis] = useState<CrisisAssignment | null>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'crisis');
    if (saved) return JSON.parse(saved);
    const crisisCard = INITIAL_CRISIS_CARDS[0];
    return {
      id: 'assign-01',
      teamId: 'team-07',
      crisisId: crisisCard.id,
      crisis: crisisCard,
      dispatchedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 255000).toISOString(), // 04:15
      status: 'ACTIVE',
    };
  });

  // 7. Startup Canvas
  const [canvas, setCanvas] = useState<StartupCanvas>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'canvas');
    if (saved) return JSON.parse(saved);
    return {
      teamId: 'team-07',
      problem: 'Engineering and college students waste over ₹4,000 each semester on expensive physical textbooks and single-use lab equipment that sits idle after exams.',
      customer: 'Undergraduate students (Year 1-4) in tier-2 and tier-3 colleges in India with limited campus bookstore inventory.',
      solution: 'A localized peer-to-peer rental and buyback escrow marketplace with automated return verification and campus locker pickup points.',
      usp: 'Zero courier latency via on-campus peer verification; 70% cheaper than Amazon or retail.',
      revenueModel: '12% escrow commission per peer rental + ₹150 premium semester insurance pass.',
      costStructure: 'Server hosting, student campus ambassador honorariums, payment gateway fees (2%), verification lockers.',
      marketingStrategy: 'Campus tech club partnerships, orientation week flyer QR codes, and referral textbook credits.',
      competitors: 'WhatsApp student buy/sell groups, OLX, local second-hand book stalls.',
      traction: '140 early user signups in pre-registration; 42 physical textbooks pledged for launch.',
      businessAssumptions: 'Students are willing to rent to batchmates if deposits are securely escrowed.',
      lastSavedAt: new Date().toISOString(),
      lastSavedBy: 'Aman Gupta (CEO)',
      version: 3,
    };
  });

  // 8. Artifacts & Submissions
  const [artifacts, setArtifacts] = useState<ArtifactSubmission[]>([
    {
      id: 'art-1',
      teamId: 'team-07',
      kind: 'PROTOTYPE',
      title: 'InnovateX Mobile Web App v1',
      url: 'https://innovatex-scriet.vercel.app',
      description: 'Interactive high-fidelity prototype allowing textbook listing and peer checkout.',
      submittedBy: 'Team 07 Lead',
      submittedAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ]);

  // 9. Auctions & Trading Desk
  const [activeAuction, setActiveAuction] = useState<Auction | null>({
    id: 'auc-01',
    title: 'Exclusive Campus Hub Distribution Rights',
    description: 'Grants exclusive rights to place verified pickup lockers across the main academic building for the entire simulation.',
    itemSku: 'CAMPUS-LOCKER-RIGHTS',
    minimumBid: 150000,
    status: 'OPEN',
    opensAt: new Date(Date.now() - 300000).toISOString(),
    closesAt: new Date(Date.now() + 600000).toISOString(),
  });

  const [auctionBids, setAuctionBids] = useState<AuctionBid[]>([
    {
      id: 'bid-seed-1',
      auctionId: 'auc-01',
      teamId: 'team-01',
      teamName: 'TechNova',
      amount: 165000,
      submittedAt: new Date(Date.now() - 120000).toISOString(),
      idempotencyKey: 'idemp-bid-seed-1',
    },
    {
      id: 'bid-seed-2',
      auctionId: 'auc-01',
      teamId: 'team-02',
      teamName: 'AgriNext',
      amount: 175000,
      submittedAt: new Date(Date.now() - 60000).toISOString(),
      idempotencyKey: 'idemp-bid-seed-2',
    },
  ]);

  const [trades, setTrades] = useState<TradeOffer[]>([]);

  // 10. Judging & Floor Scores
  const [judgingCriteria, setJudgingCriteria] = useState<JudgingCriteria[]>(DEFAULT_JUDGING_CRITERIA);
  const [judgeScores, setJudgeScores] = useState<JudgeScore[]>([
    {
      id: 'jscore-1',
      judgeId: 'judge-1',
      judgeName: 'Prof. S. K. Sharma (External VC)',
      teamId: 'team-07',
      scores: {
        'crit-problem': 14,
        'crit-innovation': 14,
        'crit-business': 19,
        'crit-finance': 14,
        'crit-crisis': 14,
        'crit-pitch': 9,
        'crit-feasibility': 9,
      },
      feedback: 'Outstanding financial discipline and crisp unit economics justification.',
      totalScore: 93,
      submittedAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const [floorScores, setFloorScores] = useState<FloorScore[]>([
    { teamId: 'team-07', solvency: 5, reserveBand: 4, allocationSpread: 5, responseTimeliness: 4, tradeoffNamed: 5, decisionConsistency: 4, total: 27 },
    { teamId: 'team-01', solvency: 5, reserveBand: 5, allocationSpread: 4, responseTimeliness: 5, tradeoffNamed: 4, decisionConsistency: 5, total: 28 },
    { teamId: 'team-02', solvency: 4, reserveBand: 4, allocationSpread: 4, responseTimeliness: 4, tradeoffNamed: 4, decisionConsistency: 4, total: 24 },
  ]);

  // 11. Live Screen Config
  const [liveScreenConfig, setLiveScreenConfig] = useState<LiveScreenConfig>({
    showLeaderboard: true,
    showCrisisGrid: true,
    showMarketTicker: true,
    announcementTickerText: 'ZERO → ONE ROUND 2 ACTIVE • DIGITAL MARKET OPEN • CRISIS TIMER SYNCED',
    presentationMode: 'NORMAL',
  });

  // 12. Announcements & Audit Logs
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: 'ann-1',
      title: 'Round 2: Build & Grow is now LIVE!',
      content: 'Digital Market inventory restocked with dynamic demand modifiers. Review your team runway.',
      type: 'ROUND_CHANGE',
      timestamp: new Date(Date.now() - 900000).toISOString(),
    },
    {
      id: 'ann-2',
      title: 'Market Alert: Cloud Credits Demand Surge',
      content: 'Cloud Credits aggregate purchase has triggered a +20% surge due to infrastructure scarcity.',
      type: 'ALERT',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'audit-01',
      actor: 'Admin',
      role: 'ADMIN',
      action: 'EVENT_STATE_CHANGED',
      target: 'ALL_TEAMS',
      details: 'Advanced state to ROUND_2 (Build & Grow)',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      source: 'ADMIN',
    },
  ]);

  // Initial State Sync from Authoritative Server with Offline-First IndexedDB Cache
  useEffect(() => {
    // 1. First, restore from local IndexedDB state replica (instant offline UI)
    offlineStorage.getStateReplica<any>('authoritative_state').then((cached) => {
      if (cached) {
        if (cached.eventStatus) setEventStatusState(cached.eventStatus);
        if (cached.serverClock) {
          setServerTimeRemainingSeconds(cached.serverClock.timeRemainingSeconds);
          setIsClockRunning(cached.serverClock.isClockRunning);
        }
        if (cached.teams) setTeams(cached.teams);
        if (cached.ledger) setLedger(cached.ledger);
        if (cached.marketItems) setMarketItems(cached.marketItems);
        if (cached.inventory) setInventory(cached.inventory);
        if (cached.purchaseProposals) setPurchaseProposals(cached.purchaseProposals);
        if (cached.crisisCards) setCrisisCards(cached.crisisCards);
        if (cached.activeCrisis !== undefined) setActiveCrisis(cached.activeCrisis);
        if (cached.activeAuction !== undefined) setActiveAuction(cached.activeAuction);
        if (cached.auctionBids) setAuctionBids(cached.auctionBids);
        if (cached.canvas) setCanvas(cached.canvas);
        if (cached.artifacts) setArtifacts(cached.artifacts);
        if (cached.adminAuthorizations) setAdminAuthorizations(cached.adminAuthorizations);
        if (cached.adminAuditLogs) setAdminAuditLogs(cached.adminAuditLogs);
        if (cached.announcements) setAnnouncements(cached.announcements);
        if (cached.isLockdownActive !== undefined) setIsLockdownActive(cached.isLockdownActive);
      }
    });

    // 2. Query authoritative server state
    zoFetch('/api/state')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          offlineStorage.saveStateReplica('authoritative_state', data);
          if (data.eventStatus) setEventStatusState(data.eventStatus);
          if (data.serverClock) {
            setServerTimeRemainingSeconds(data.serverClock.timeRemainingSeconds);
            setIsClockRunning(data.serverClock.isClockRunning);
          }
          if (data.teams) setTeams(data.teams);
          if (data.ledger) setLedger(data.ledger);
          if (data.marketItems) setMarketItems(data.marketItems);
          if (data.inventory) setInventory(data.inventory);
          if (data.purchaseProposals) setPurchaseProposals(data.purchaseProposals);
          if (data.crisisCards) setCrisisCards(data.crisisCards);
          if (data.activeCrisis !== undefined) setActiveCrisis(data.activeCrisis);
          if (data.activeAuction !== undefined) setActiveAuction(data.activeAuction);
          if (data.auctionBids) setAuctionBids(data.auctionBids);
          if (data.canvas) setCanvas(data.canvas);
          if (data.artifacts) setArtifacts(data.artifacts);
          if (data.adminAuthorizations) setAdminAuthorizations(data.adminAuthorizations);
          if (data.adminAuditLogs) setAdminAuditLogs(data.adminAuditLogs);
          if (data.announcements) setAnnouncements(data.announcements);
          if (data.isLockdownActive !== undefined) setIsLockdownActive(data.isLockdownActive);
        }
      })
      .catch((err) => console.warn('Could not sync initial state from backend:', err));
  }, []);

  // Real-Time Bus Subscription for Cross-Tab / Cross-Window & SSE Server Sync
  useEffect(() => {
    const unsub = realtimeBus.on('*', (evt) => {
      const p = evt.payload;
      switch (evt.type) {
        case 'EVENT_STATE_CHANGED':
          setEventStatusState(p.eventStatus || p.status);
          break;
        case 'CLOCK_SYNC':
        case 'SERVER_TIME_SYNC':
          if (p.timeRemainingSeconds !== undefined) setServerTimeRemainingSeconds(p.timeRemainingSeconds);
          else if (p.remainingSeconds !== undefined) setServerTimeRemainingSeconds(p.remainingSeconds);
          else if (p.seconds !== undefined) setServerTimeRemainingSeconds(p.seconds);
          if (p.isClockRunning !== undefined) setIsClockRunning(p.isClockRunning);
          else if (p.isRunning !== undefined) setIsClockRunning(p.isRunning);
          if (p.state) setEventStatusState(p.state);
          break;
        case 'PRICE_UPDATED':
          if (p.items) {
            setMarketItems(p.items);
          } else if (p.sku && p.currentPrice !== undefined) {
            setMarketItems((prev) =>
              prev.map((item) =>
                item.sku === p.sku
                  ? { ...item, currentPrice: p.currentPrice, priceChangePct: p.priceChangePct }
                  : item
              )
            );
          }
          break;
        case 'STOCK_UPDATED':
          if (p.items) {
            setMarketItems(p.items);
          } else if (p.sku && p.stockRemaining !== undefined) {
            setMarketItems((prev) =>
              prev.map((item) =>
                item.sku === p.sku
                  ? { ...item, stockRemaining: p.stockRemaining, status: p.status || item.status }
                  : item
              )
            );
          }
          break;
        case 'PURCHASE_PROPOSED':
          if (p.proposal) {
            setPurchaseProposals((prev) => [p.proposal, ...prev.filter((x) => x.id !== p.proposal.id)]);
          }
          break;
        case 'PURCHASE_APPROVED':
          if (p.proposal) {
            setPurchaseProposals((prev) =>
              prev.map((x) => (x.id === p.proposal.id ? { ...x, status: 'COMMITTED' } : x))
            );
          }
          break;
        case 'PURCHASE_REJECTED':
          if (p.proposal) {
            setPurchaseProposals((prev) =>
              prev.map((x) =>
                x.id === p.proposal.id
                  ? { ...x, status: 'REJECTED', rejectionNote: p.proposal.rejectionNote }
                  : x
              )
            );
          }
          break;
        case 'PURCHASE_COMMITTED':
          if (p.ledgerEntry) {
            setLedger((prev) => [p.ledgerEntry, ...prev.filter((e) => e.id !== p.ledgerEntry.id)]);
          }
          if (p.inventoryItem) {
            setInventory((prev) => [p.inventoryItem, ...prev.filter((i) => i.id !== p.inventoryItem.id)]);
          }
          if (p.sku) {
            setMarketItems((prev) =>
              prev.map((item) =>
                item.sku === p.sku
                  ? { ...item, stockRemaining: Math.max(0, item.stockRemaining - 1) }
                  : item
              )
            );
          }
          break;
        case 'PURCHASE_REVERSED':
          if (p.revEntry) {
            setLedger((prev) => [p.revEntry, ...prev.filter((e) => e.id !== p.revEntry.id)]);
          }
          break;
        case 'FUNDS_UPDATED':
          if (p.entry) {
            setLedger((prev) => [p.entry, ...prev.filter((e) => e.id !== p.entry.id)]);
          }
          break;
        case 'CRISIS_DISPATCHED':
          if (p.crisis) setActiveCrisis(p.crisis);
          break;
        case 'CRISIS_RESPONSE_RECEIVED':
          if (p.activeCrisis) setActiveCrisis(p.activeCrisis);
          break;
        case 'CRISIS_TIMEOUT':
          if (p.crisis) setActiveCrisis({ ...p.crisis, status: 'TIMEOUT' });
          break;
        case 'AUCTION_OPENED':
          if (p.auction) {
            setActiveAuction(p.auction);
            setAuctionBids([]);
          }
          break;
        case 'AUCTION_BID_RECEIVED':
          if (p.bid) {
            setAuctionBids((prev) => [p.bid, ...prev.filter((b) => b.id !== p.bid.id)]);
          }
          break;
        case 'AUCTION_CLOSED':
          if (p.auction) setActiveAuction(p.auction);
          break;
        case 'TRADE_PROPOSED':
          if (p.trade) {
            setTrades((prev) => [p.trade, ...prev.filter((t) => t.id !== p.trade.id)]);
          }
          break;
        case 'TRADE_COMMITTED':
          if (p.trade) {
            setTrades((prev) =>
              prev.map((t) => (t.id === p.trade.id ? { ...t, status: 'ACCEPTED' } : t))
            );
          }
          break;
        case 'CANVAS_UPDATED':
          if (p.canvas) setCanvas(p.canvas);
          break;
        case 'ARTIFACT_SUBMITTED':
          if (p.artifact) {
            setArtifacts((prev) => [p.artifact, ...prev.filter((a) => a.id !== p.artifact.id)]);
          }
          break;
        case 'ADMIN_AUTH_UPDATED':
        case 'ADMIN_VERIFIED':
        case 'ADMIN_SUSPENDED':
        case 'ADMIN_REVOKED':
        case 'ADMIN_REACTIVATED':
          if (p.authorizations) {
            setAdminAuthorizations(p.authorizations);
            localStorage.setItem(STORAGE_PREFIX + 'admin_authorizations', JSON.stringify(p.authorizations));
          }
          if (p.auditLogs) {
            setAdminAuditLogs(p.auditLogs);
            localStorage.setItem(STORAGE_PREFIX + 'admin_audit_logs', JSON.stringify(p.auditLogs));
          }
          break;
        case 'ANNOUNCEMENT_BROADCAST':
          if (p.announcement) {
            setAnnouncements((prev) => [p.announcement, ...prev.filter((a) => a.id !== p.announcement.id)]);
          }
          break;
        case 'SCORE_SUBMITTED':
          if (p.score) {
            setJudgeScores((prev) => [p.score, ...prev.filter((s) => s.id !== p.score.id)]);
          }
          break;
        case 'ROLE_CLAIMED':
        case 'ROLE_REASSIGNED':
          // Re-fetch state to get latest team roster
          zoFetch('/api/state')
            .then((r) => r.json())
            .then((st) => {
              if (st && st.teams) setTeams(st.teams);
            })
            .catch(() => {});
          break;
        case 'LOCKDOWN_TRIGGERED':
          setIsLockdownActive(true);
          setEventStatusState('LOCKDOWN');
          break;
        case 'LOCKDOWN_RELEASED':
          setIsLockdownActive(false);
          break;
        case 'RESULTS_REVEALED':
          setEventStatusState('REVEAL');
          break;
        case 'SNAPSHOT_RESTORED':
        case 'SIMULATION_RESET':
          zoFetch('/api/state')
            .then((r) => r.json())
            .then((st) => {
              if (st) {
                setTeams(st.teams || INITIAL_TEAMS);
                setMarketItems(st.marketItems || INITIAL_MARKET_ITEMS);
                setPurchaseProposals(st.purchaseProposals || []);
                setLedger(st.ledger || []);
                setActiveCrisis(st.activeCrisis || null);
                setActiveAuction(st.activeAuction || null);
                setCanvas(st.canvas);
                setArtifacts(st.artifacts || []);
                setJudgeScores(st.judgeScores || []);
                setAnnouncements(st.announcements || []);
                setEventStatusState(st.eventStatus || 'ROUND_2');
                setIsLockdownActive(Boolean(st.isLockdownActive));
                if (st.serverClock) {
                  setServerTimeRemainingSeconds(st.serverClock.timeRemainingSeconds);
                  setIsClockRunning(st.serverClock.isClockRunning);
                }
              }
            })
            .catch(() => {});
          break;
      }
    });

    return unsub;
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'ledger', JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'canvas', JSON.stringify(canvas));
  }, [canvas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'status', eventStatus);
  }, [eventStatus]);

  // Active Team calculation
  const currentTeam = useMemo(() => {
    return teams.find((t) => t.id === currentTeamId) || teams[0];
  }, [teams, currentTeamId]);

  // Server clock timer interval
  useEffect(() => {
    if (!isClockRunning || isLockdownActive) return;
    const interval = setInterval(() => {
      setServerTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockRunning, isLockdownActive]);

  // Helper: Append-only balance calculation
  const getBalance = useCallback(
    (teamId?: string): number => {
      const targetId = teamId || currentTeamId;
      return ledger
        .filter((entry) => entry.teamId === targetId)
        .reduce((acc, entry) => {
          return entry.type === 'CREDIT' ? acc + entry.amount : acc - entry.amount;
        }, 0);
    },
    [ledger, currentTeamId]
  );

  // Helper: Runway calculation
  const getRunwayMonths = useCallback(
    (teamId?: string): number => {
      const balance = getBalance(teamId);
      const monthlyBurn = 120000;
      return Math.max(0, Number((balance / monthlyBurn).toFixed(1)));
    },
    [getBalance]
  );

  // Helper: Financial Health Band
  const getFinancialHealthBand = useCallback(
    (teamId?: string): 'HEALTHY' | 'WATCH' | 'CRITICAL' => {
      const balance = getBalance(teamId);
      if (balance >= 500000) return 'HEALTHY';
      if (balance >= 200000) return 'WATCH';
      return 'CRITICAL';
    },
    [getBalance]
  );

  // Audit Logger
  const logAuditAction = useCallback(
    (action: string, target: string, details: string, source: LedgerSource = 'APP') => {
      const newLog: AuditLog = {
        id: 'audit-' + Math.random().toString(36).substring(2, 9),
        actor: currentUser.name,
        role: currentRole,
        action,
        target,
        details,
        timestamp: new Date().toISOString(),
        source,
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    },
    [currentUser.name, currentRole]
  );

  // Set Event Status and Broadcast
  const setEventStatus = useCallback(
    (status: EventStatus) => {
      setEventStatusState(status);
      commandSync.dispatch('CHANGE_EVENT_STATE', { status }, {
        userId: currentUser.id,
        userEmail: currentUser.email,
        role: 'ADMIN',
      });
      realtimeBus.emit('EVENT_STATE_CHANGED', { status }, currentUser.name);
      logAuditAction('EVENT_STATE_CHANGED', 'ALL_SYSTEMS', `Advanced state to ${status}`, 'ADMIN');
    },
    [currentUser.id, currentUser.email, currentUser.name, logAuditAction]
  );

  // Clock operations
  const toggleClock = useCallback(() => {
    setIsClockRunning((prev) => {
      const next = !prev;
      realtimeBus.emit('CLOCK_SYNC', { seconds: serverTimeRemainingSeconds, isRunning: next }, currentUser.name);
      return next;
    });
  }, [serverTimeRemainingSeconds, currentUser.name]);

  const resetClock = useCallback(
    (minutes = 25) => {
      const secs = minutes * 60;
      setServerTimeRemainingSeconds(secs);
      realtimeBus.emit('CLOCK_SYNC', { seconds: secs, isRunning: isClockRunning }, currentUser.name);
      logAuditAction('CLOCK_RESET', 'CLOCK', `Reset clock to ${minutes} minutes`, 'ADMIN');
    },
    [isClockRunning, currentUser.name, logAuditAction]
  );

  // Team Update
  const updateTeam = useCallback((teamId: string, updates: Partial<Team>) => {
    setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, ...updates } : t)));
  }, []);

  // Manual Administrative Financial Adjustments (Rule 7 & Rule 83)
  const manualLedgerAdjustment = useCallback(
    (teamId: string, type: 'CREDIT' | 'DEBIT', amount: number, reason: string) => {
      const entry: LedgerEntry = {
        id: 'led-adj-' + Math.random().toString(36).substring(2, 9),
        teamId,
        type,
        amount,
        reasonTag: 'MANUAL_ADJUSTMENT',
        description: `ADMIN OVERRIDE: ${reason}`,
        round: currentTeam.currentRound,
        actorMemberId: currentUser.id,
        actorRole: 'ADMIN',
        idempotencyKey: 'idemp-adj-' + Date.now(),
        source: 'ADMIN',
        createdAt: new Date().toISOString(),
      };

      setLedger((prev) => [entry, ...prev]);
      commandSync.dispatch('MANUAL_LEDGER_ADJUSTMENT', { teamId, type, amount, reason }, {
        userId: currentUser.id,
        userEmail: currentUser.email,
        role: 'ADMIN',
      });
      logAuditAction('MANUAL_BALANCE_ADJUSTMENT', teamId, `${type} of ₹${amount.toLocaleString('en-IN')}: ${reason}`, 'ADMIN');
      realtimeBus.emit('PURCHASE_COMMITTED', { entry }, currentUser.name);
    },
    [currentTeam.currentRound, currentUser.id, currentUser.email, currentUser.name, logAuditAction]
  );

  // Grant Loan (Rule 32)
  const grantLoan = useCallback(
    (teamId: string, principal: number, interestPct: number) => {
      const entry: LedgerEntry = {
        id: 'led-loan-' + Math.random().toString(36).substring(2, 9),
        teamId,
        type: 'CREDIT',
        amount: principal,
        reasonTag: 'LOAN_DISBURSEMENT',
        description: `Bridge Loan Disbursed (Principal: ₹${principal.toLocaleString('en-IN')}, Interest: ${interestPct}%)`,
        round: currentTeam.currentRound,
        actorMemberId: currentUser.id,
        actorRole: 'ADMIN',
        idempotencyKey: 'idemp-loan-' + Date.now(),
        source: 'ADMIN',
        createdAt: new Date().toISOString(),
      };

      setLedger((prev) => [entry, ...prev]);
      commandSync.dispatch('GRANT_LOAN', { teamId, principal, interestPct }, {
        userId: currentUser.id,
        userEmail: currentUser.email,
        role: 'ADMIN',
      });
      logAuditAction('LOAN_CREATED', teamId, `Disbursed loan ₹${principal.toLocaleString('en-IN')} @ ${interestPct}%`, 'ADMIN');
      realtimeBus.emit('PURCHASE_COMMITTED', { entry }, currentUser.name);
    },
    [currentTeam.currentRound, currentUser.id, currentUser.email, currentUser.name, logAuditAction]
  );

  // Propose Purchase Flow
  const proposePurchase = useCallback(
    (sku: string, reasonCategory: PurchaseProposal['reasonCategory']) => {
      if (isLockdownActive || eventStatus === 'LOCKDOWN') {
        return { success: false, message: 'Purchases are frozen during event LOCKDOWN.' };
      }

      const item = marketItems.find((i) => i.sku === sku);
      if (!item) return { success: false, message: 'Item not found in market registry.' };
      if (item.stockRemaining <= 0) return { success: false, message: 'Item is sold out! Stock exhausted.' };

      const balance = getBalance();
      if (balance < item.currentPrice) {
        return {
          success: false,
          message: `Insufficient virtual capital. Required: ₹${item.currentPrice.toLocaleString('en-IN')}, Available: ₹${balance.toLocaleString('en-IN')}.`,
        };
      }

      const proposalId = 'prop-' + Math.random().toString(36).substring(2, 9);
      const idempotencyKey = 'idemp-' + sku + '-' + Date.now();

      if (item.currentPrice >= eventConfig.twoKeyApprovalThreshold) {
        const proposal: PurchaseProposal = {
          id: proposalId,
          teamId: currentTeamId,
          sku: item.sku,
          itemName: item.name,
          proposedByMemberId: currentUser.id,
          proposedByRole: currentRole as SimulationRole,
          price: item.currentPrice,
          reasonCategory,
          status: 'PENDING_CEO_APPROVAL',
          idempotencyKey,
          proposedAt: new Date().toISOString(),
        };

        setPurchaseProposals((prev) => [proposal, ...prev]);
        commandSync.dispatch('PROPOSE_PURCHASE', {
          teamId: currentTeamId,
          sku: item.sku,
          reasonCategory,
          proposedByRole: currentRole,
          idempotencyKey,
        }, {
          userId: currentUser.id,
          userEmail: currentUser.email,
          teamId: currentTeamId,
          role: currentRole as any,
        });

        realtimeBus.emit('PURCHASE_PROPOSED', { proposal }, currentUser.name);
        logAuditAction('PURCHASE_PROPOSED', item.name, `Proposed spending ₹${item.currentPrice.toLocaleString('en-IN')} on ${item.name} (${reasonCategory})`);
        return {
          success: true,
          message: `Proposal submitted! Purchases of ₹${item.currentPrice.toLocaleString('en-IN')} require CEO sign-off.`,
          proposalId,
        };
      }

      const ledgerEntry: LedgerEntry = {
        id: 'led-' + Math.random().toString(36).substring(2, 9),
        teamId: currentTeamId,
        type: 'DEBIT',
        amount: item.currentPrice,
        reasonTag: 'PURCHASE',
        description: `Purchased ${item.name} (${reasonCategory})`,
        round: currentTeam.currentRound,
        actorMemberId: currentUser.id,
        actorRole: currentRole as SimulationRole,
        idempotencyKey,
        source: 'APP',
        createdAt: new Date().toISOString(),
      };

      setMarketItems((prev) =>
        prev.map((i) => (i.sku === sku ? { ...i, stockRemaining: Math.max(0, i.stockRemaining - 1) } : i))
      );

      const newInvItem: InventoryItem = {
        id: 'inv-' + Math.random().toString(36).substring(2, 9),
        teamId: currentTeamId,
        sku: item.sku,
        name: item.name,
        category: item.category,
        qty: 1,
        acquiredPrice: item.currentPrice,
        acquiredAt: new Date().toISOString(),
        round: currentTeam.currentRound,
        effectApplied: true,
      };

      setLedger((prev) => [ledgerEntry, ...prev]);
      setInventory((prev) => [newInvItem, ...prev]);

      commandSync.dispatch('PROPOSE_PURCHASE', {
        teamId: currentTeamId,
        sku: item.sku,
        reasonCategory,
        proposedByRole: currentRole,
        idempotencyKey,
      }, {
        userId: currentUser.id,
        userEmail: currentUser.email,
        teamId: currentTeamId,
        role: currentRole as any,
      });

      realtimeBus.emit('PURCHASE_COMMITTED', { ledgerEntry, inventoryItem: newInvItem }, currentUser.name);
      logAuditAction('PURCHASE_COMMITTED', item.name, `Bought ${item.name} for ₹${item.currentPrice.toLocaleString('en-IN')}`);

      return {
        success: true,
        message: `Successfully acquired ${item.name} for ₹${item.currentPrice.toLocaleString('en-IN')}!`,
      };
    },
    [isLockdownActive, eventStatus, marketItems, getBalance, eventConfig.twoKeyApprovalThreshold, currentTeamId, currentUser.id, currentUser.email, currentUser.name, currentRole, currentTeam.currentRound, logAuditAction]
  );

  const approveProposal = useCallback(
    (proposalId: string) => {
      const proposal = purchaseProposals.find((p) => p.id === proposalId);
      if (!proposal) return { success: false, message: 'Proposal not found.' };

      const item = marketItems.find((i) => i.sku === proposal.sku);
      if (!item) return { success: false, message: 'Item no longer in market.' };
      if (item.stockRemaining <= 0) return { success: false, message: 'Stock exhausted while proposal was pending!' };

      const balance = getBalance(proposal.teamId);
      if (balance < proposal.price) {
        return { success: false, message: 'Insufficient virtual funds to commit this proposal.' };
      }

      const ledgerEntry: LedgerEntry = {
        id: 'led-' + Math.random().toString(36).substring(2, 9),
        teamId: proposal.teamId,
        type: 'DEBIT',
        amount: proposal.price,
        reasonTag: 'PURCHASE',
        description: `CEO Approved: ${proposal.itemName} (${proposal.reasonCategory})`,
        round: currentTeam.currentRound,
        actorMemberId: currentUser.id,
        actorRole: 'CEO',
        idempotencyKey: proposal.idempotencyKey,
        source: 'APP',
        createdAt: new Date().toISOString(),
      };

      setLedger((prev) => [ledgerEntry, ...prev]);
      setMarketItems((prev) =>
        prev.map((i) => (i.sku === proposal.sku ? { ...i, stockRemaining: Math.max(0, i.stockRemaining - 1) } : i))
      );

      const inv = {
        id: 'inv-' + Math.random().toString(36).substring(2, 9),
        teamId: proposal.teamId,
        sku: item.sku,
        name: item.name,
        category: item.category,
        qty: 1,
        acquiredPrice: proposal.price,
        acquiredAt: new Date().toISOString(),
        round: currentTeam.currentRound,
        effectApplied: true,
      };

      setInventory((prev) => [inv, ...prev]);
      setPurchaseProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: 'COMMITTED', decidedAt: new Date().toISOString() } : p))
      );

      commandSync.dispatch('APPROVE_PURCHASE', {
        proposalId,
      }, {
        userId: currentUser.id,
        userEmail: currentUser.email,
        teamId: proposal.teamId,
        role: currentRole as any,
      });

      realtimeBus.emit('PURCHASE_COMMITTED', { ledgerEntry, inventoryItem: inv }, currentUser.name);
      logAuditAction('PURCHASE_COMMITTED', proposal.itemName, `CEO Approved spending ₹${proposal.price.toLocaleString('en-IN')}`);

      return { success: true, message: `Proposal for ${proposal.itemName} approved and committed to ledger.` };
    },
    [purchaseProposals, marketItems, getBalance, currentTeam.currentRound, currentUser.id, currentUser.email, currentUser.name, currentRole, logAuditAction]
  );

  const rejectProposal = useCallback(
    (proposalId: string, note?: string) => {
      setPurchaseProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? { ...p, status: 'REJECTED', rejectionNote: note || 'Declined by CEO', decidedAt: new Date().toISOString() }
            : p
        )
      );

      commandSync.dispatch('REJECT_PURCHASE', {
        proposalId,
        note,
      }, {
        userId: currentUser.id,
        userEmail: currentUser.email,
        teamId: currentTeamId,
        role: currentRole as any,
      });

      logAuditAction('PURCHASE_REJECTED', proposalId, `Rejected proposal. Note: ${note || 'None'}`);
      return { success: true, message: 'Proposal rejected.' };
    },
    [currentTeamId, currentUser.id, currentUser.email, currentRole, logAuditAction]
  );

  const reversePurchase = useCallback(
    (ledgerEntryId: string) => {
      const originalEntry = ledger.find((e) => e.id === ledgerEntryId);
      if (!originalEntry) return { success: false, message: 'Original transaction not found.' };
      if (originalEntry.type !== 'DEBIT') return { success: false, message: 'Only debit purchases can be reversed.' };

      const timeDiffSeconds = (Date.now() - new Date(originalEntry.createdAt).getTime()) / 1000;
      if (timeDiffSeconds > eventConfig.undoWindowSeconds) {
        return {
          success: false,
          message: `Undo window expired (${Math.round(timeDiffSeconds)}s > ${eventConfig.undoWindowSeconds}s). Contact a Marshal for emergency adjustment.`,
        };
      }

      const reversalEntry: LedgerEntry = {
        id: 'led-rev-' + Math.random().toString(36).substring(2, 9),
        teamId: originalEntry.teamId,
        type: 'CREDIT',
        amount: originalEntry.amount,
        reasonTag: 'REVERSAL',
        description: `REVERSAL of ${originalEntry.description}`,
        round: originalEntry.round,
        actorMemberId: currentUser.id,
        actorRole: currentRole as SimulationRole,
        idempotencyKey: 'idemp-rev-' + originalEntry.id,
        refEntryId: originalEntry.id,
        source: 'APP',
        createdAt: new Date().toISOString(),
      };

      setLedger((prev) => [reversalEntry, ...prev]);
      setInventory((prev) => {
        const idx = prev.findIndex((i) => i.teamId === originalEntry.teamId);
        if (idx !== -1) {
          const updated = [...prev];
          updated.splice(idx, 1);
          return updated;
        }
        return prev;
      });

      commandSync.dispatch('REVERSE_PURCHASE', {
        ledgerEntryId,
      }, {
        userId: currentUser.id,
        userEmail: currentUser.email,
        teamId: originalEntry.teamId,
        role: currentRole as any,
      });

      realtimeBus.emit('PURCHASE_REVERSED', { reversalEntry }, currentUser.name);
      logAuditAction('PURCHASE_REVERSED', originalEntry.id, `Reversed ₹${originalEntry.amount.toLocaleString('en-IN')}`);
      return { success: true, message: 'Purchase successfully reversed and credited back to capital.' };
    },
    [ledger, eventConfig.undoWindowSeconds, currentUser.id, currentUser.email, currentUser.name, currentRole, logAuditAction]
  );

  // Market management (Admin)
  const addMarketItem = useCallback((item: MarketItem) => {
    setMarketItems((prev) => [...prev, item]);
  }, []);

  const updateMarketItem = useCallback((sku: string, updates: Partial<MarketItem>) => {
    setMarketItems((prev) => prev.map((i) => (i.sku === sku ? { ...i, ...updates } : i)));
  }, []);

  const adjustStock = useCallback((sku: string, delta: number) => {
    setMarketItems((prev) =>
      prev.map((i) => (i.sku === sku ? { ...i, stockRemaining: Math.max(0, i.stockRemaining + delta) } : i))
    );
  }, []);

  // Crisis operations
  const addCrisisCard = useCallback((card: CrisisCard) => {
    setCrisisCards((prev) => [...prev, card]);
  }, []);

  const updateCrisisCard = useCallback((id: string, updates: Partial<CrisisCard>) => {
    setCrisisCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const dispatchCrisisToTeam = useCallback(
    (teamId: string, crisisId: string) => {
      const card = crisisCards.find((c) => c.id === crisisId) || crisisCards[0];
      const newAssignment: CrisisAssignment = {
        id: 'assign-' + Math.random().toString(36).substring(2, 9),
        teamId,
        crisisId: card.id,
        crisis: card,
        dispatchedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + card.timerSeconds * 1000).toISOString(),
        status: 'ACTIVE',
      };
      setActiveCrisis(newAssignment);
      realtimeBus.emit('CRISIS_DISPATCHED', { assignment: newAssignment }, currentUser.name);
      logAuditAction('CRISIS_DISPATCHED', teamId, `Dispatched ${card.title} to ${teamId}`, 'ADMIN');
    },
    [crisisCards, currentUser.name, logAuditAction]
  );

  const extendCrisisTimer = useCallback(
    (secondsToAdd: number) => {
      if (!activeCrisis) return;
      const currentExpiry = new Date(activeCrisis.expiresAt).getTime();
      const updatedExpiry = new Date(currentExpiry + secondsToAdd * 1000).toISOString();
      setActiveCrisis((prev) => (prev ? { ...prev, expiresAt: updatedExpiry } : null));
      logAuditAction('CRISIS_TIMER_EXTENDED', activeCrisis.teamId, `Added ${secondsToAdd}s to crisis timer`, 'ADMIN');
    },
    [activeCrisis, logAuditAction]
  );

  const resolveCrisisManually = useCallback(
    (teamId: string, reason: string) => {
      if (!activeCrisis) return;
      setActiveCrisis((prev) => (prev ? { ...prev, status: 'RESOLVED', tradeoffGivenUp: `Manual: ${reason}` } : null));
      logAuditAction('CRISIS_RESOLVED_MANUALLY', teamId, reason, 'ADMIN');
    },
    [activeCrisis, logAuditAction]
  );

  const submitCrisisResponse = useCallback(
    (optionId: string, tradeoff: string) => {
      if (!activeCrisis) return { success: false, message: 'No active crisis found.' };

      const selectedOption = activeCrisis.crisis.options.find((o) => o.id === optionId);
      if (!selectedOption) return { success: false, message: 'Invalid response option selected.' };

      if (selectedOption.cost > 0) {
        const ledgerEntry: LedgerEntry = {
          id: 'led-crisis-' + Math.random().toString(36).substring(2, 9),
          teamId: currentTeamId,
          type: 'DEBIT',
          amount: selectedOption.cost,
          reasonTag: 'CRISIS_PENALTY',
          description: `Crisis Response: ${activeCrisis.crisis.title} (${selectedOption.label})`,
          round: currentTeam.currentRound,
          actorMemberId: currentUser.id,
          actorRole: currentRole as SimulationRole,
          idempotencyKey: 'idemp-crisis-' + activeCrisis.id + '-' + optionId,
          source: 'APP',
          createdAt: new Date().toISOString(),
        };
        setLedger((prev) => [ledgerEntry, ...prev]);
      }

      setTeams((prev) =>
        prev.map((t) => {
          if (t.id === currentTeamId) {
            const newHealth = Math.min(100, Math.max(10, t.healthScore + selectedOption.healthDelta));
            return { ...t, healthScore: newHealth };
          }
          return t;
        })
      );

      const resolved = {
        ...activeCrisis,
        status: 'RESOLVED' as const,
        selectedOptionId: optionId,
        tradeoffGivenUp: tradeoff,
        resolvedAt: new Date().toISOString(),
      };

      setActiveCrisis(resolved);

      commandSync.dispatch('SUBMIT_CRISIS_RESPONSE', {
        teamId: currentTeamId,
        optionId,
        tradeoff,
      }, {
        userId: currentUser.id,
        userEmail: currentUser.email,
        teamId: currentTeamId,
        role: currentRole as any,
      });

      realtimeBus.emit('CRISIS_RESPONSE_RECEIVED', { assignment: resolved }, currentUser.name);
      logAuditAction('CRISIS_RESPONSE_SUBMITTED', activeCrisis.crisis.title, `Selected: ${selectedOption.label}. Tradeoff: ${tradeoff}`);

      return { success: true, message: 'Crisis response submitted! Strategy logged and health updated.' };
    },
    [activeCrisis, currentTeamId, currentTeam.currentRound, currentUser.id, currentUser.email, currentUser.name, currentRole, logAuditAction]
  );

  // Canvas update with autosave and IndexedDB draft
  const updateCanvasField = useCallback(
    (field: keyof Omit<StartupCanvas, 'teamId' | 'lastSavedAt' | 'lastSavedBy' | 'version'>, value: string) => {
      setCanvas((prev) => {
        const updated = {
          ...prev,
          [field]: value,
          lastSavedAt: new Date().toISOString(),
          lastSavedBy: `${currentUser.name} (${currentRole})`,
          version: (prev.version || 1) + 1,
        };
        offlineStorage.saveCanvasDraft(prev.teamId, updated);
        commandSync.dispatch('SUBMIT_CANVAS', {
          teamId: prev.teamId,
          canvas: updated,
          expectedVersion: prev.version,
        }, {
          userId: currentUser.id,
          userEmail: currentUser.email,
          teamId: prev.teamId,
          role: currentRole as any,
        });
        realtimeBus.emit('CANVAS_UPDATED', { field, value, teamId: prev.teamId }, currentUser.name);
        return updated;
      });
    },
    [currentUser.id, currentUser.email, currentUser.name, currentRole]
  );

  // Artifact submission with SHA-256 hash & command sync
  const submitArtifact = useCallback(
    (submission: Omit<ArtifactSubmission, 'id' | 'submittedAt'>) => {
      const newArt: ArtifactSubmission = {
        ...submission,
        id: 'art-' + Math.random().toString(36).substring(2, 9),
        submittedAt: new Date().toISOString(),
      };
      setArtifacts((prev) => [newArt, ...prev]);

      commandSync.dispatch('SUBMIT_ARTIFACT', {
        ...submission,
      }, {
        userId: currentUser.id,
        userEmail: currentUser.email,
        teamId: currentTeamId,
        role: currentRole as any,
      });

      realtimeBus.emit('ARTIFACT_SUBMITTED', { artifact: newArt }, currentUser.name);
      logAuditAction('ARTIFACT_SUBMITTED', submission.title, `${submission.kind} submitted by ${submission.submittedBy}`);
    },
    [currentTeamId, currentUser.id, currentUser.email, currentUser.name, currentRole, logAuditAction]
  );

  // Auction launch & close
  const openAuction = useCallback(
    (title: string, description: string, itemSku: string, minBid: number, durationMinutes: number) => {
      const auc: Auction = {
        id: 'auc-' + Math.random().toString(36).substring(2, 9),
        title,
        description,
        itemSku,
        minimumBid: minBid,
        status: 'OPEN',
        opensAt: new Date().toISOString(),
        closesAt: new Date(Date.now() + durationMinutes * 60000).toISOString(),
      };
      setActiveAuction(auc);
      setAuctionBids([]);

      commandSync.dispatch('OPEN_AUCTION', {
        title,
        description,
        itemSku,
        minBid,
        durationMinutes,
      }, {
        userId: currentUser.id,
        userEmail: currentUser.email,
        role: 'ADMIN',
      });

      realtimeBus.emit('AUCTION_OPENED', { auction: auc }, currentUser.name);
      logAuditAction('AUCTION_OPENED', auc.id, `Opened auction "${title}" with min bid ₹${minBid}`, 'ADMIN');
    },
    [currentUser.id, currentUser.email, currentUser.name, logAuditAction]
  );

  const closeAuction = useCallback(() => {
    if (!activeAuction) return {};
    const sortedBids = [...auctionBids].sort((a, b) => b.amount - a.amount);
    const winner = sortedBids[0];

    const closedAuc: Auction = {
      ...activeAuction,
      status: 'CLOSED',
      winnerTeamId: winner?.teamId,
      winnerTeamName: winner?.teamName,
      winningBid: winner?.amount,
    };

    setActiveAuction(closedAuc);

    if (winner) {
      // Debit winning team
      const debitEntry: LedgerEntry = {
        id: 'led-auc-win-' + Math.random().toString(36).substring(2, 9),
        teamId: winner.teamId,
        type: 'DEBIT',
        amount: winner.amount,
        reasonTag: 'AUCTION_WIN',
        description: `Won Auction: ${activeAuction.title}`,
        round: currentTeam.currentRound,
        actorMemberId: 'system',
        actorRole: 'SYSTEM',
        idempotencyKey: 'idemp-auc-win-' + activeAuction.id,
        source: 'SYSTEM',
        createdAt: new Date().toISOString(),
      };
      setLedger((prev) => [debitEntry, ...prev]);
    }

    commandSync.dispatch('CLOSE_AUCTION', {}, {
      userId: currentUser.id,
      userEmail: currentUser.email,
      role: 'ADMIN',
    });

    realtimeBus.emit('AUCTION_CLOSED', { auction: closedAuc }, currentUser.name);
    logAuditAction('AUCTION_CLOSED', activeAuction.id, `Closed auction. Winner: ${winner?.teamName || 'None'} @ ₹${winner?.amount || 0}`, 'ADMIN');

    return { winnerTeamName: winner?.teamName, winningBid: winner?.amount };
  }, [activeAuction, auctionBids, currentTeam.currentRound, currentUser.id, currentUser.email, currentUser.name, logAuditAction]);

  const placeAuctionBid = useCallback(
    (auctionId: string, amount: number) => {
      if (!activeAuction || activeAuction.id !== auctionId) {
        return { success: false, message: 'Auction is not active.' };
      }
      if (amount < activeAuction.minimumBid) {
        return { success: false, message: `Minimum bid is ₹${activeAuction.minimumBid.toLocaleString('en-IN')}.` };
      }
      const balance = getBalance();
      if (balance < amount) {
        return { success: false, message: 'Insufficient virtual funds for this bid.' };
      }

      const bid: AuctionBid = {
        id: 'bid-' + Math.random().toString(36).substring(2, 9),
        auctionId,
        teamId: currentTeamId,
        teamName: currentTeam.name,
        amount,
        submittedAt: new Date().toISOString(),
        idempotencyKey: 'idemp-bid-' + auctionId + '-' + Date.now(),
      };

      setAuctionBids((prev) => [bid, ...prev]);

      commandSync.dispatch('PLACE_BID', {
        auctionId,
        amount,
        teamId: currentTeamId,
      }, {
        userId: currentUser.id,
        userEmail: currentUser.email,
        teamId: currentTeamId,
        role: currentRole as any,
      });

      realtimeBus.emit('AUCTION_BID_RECEIVED', { bid }, currentUser.name);
      logAuditAction('BID_SUBMITTED', auctionId, `Placed sealed bid of ₹${amount.toLocaleString('en-IN')}`);
      return { success: true, message: `Sealed bid of ₹${amount.toLocaleString('en-IN')} submitted!` };
    },
    [activeAuction, getBalance, currentTeamId, currentTeam.name, currentUser.id, currentUser.email, currentUser.name, currentRole, logAuditAction]
  );

  // Trade Desk
  const proposeTrade = useCallback(
    (toTeamId: string, itemSku: string, requestedCash: number) => {
      const toTeam = teams.find((t) => t.id === toTeamId);
      const invItem = inventory.find((i) => i.sku === itemSku && i.teamId === currentTeamId);
      if (!invItem) return { success: false, message: 'You do not own this item.' };

      const offer: TradeOffer = {
        id: 'trade-' + Math.random().toString(36).substring(2, 9),
        fromTeamId: currentTeamId,
        fromTeamName: currentTeam.name,
        toTeamId,
        toTeamName: toTeam?.name || toTeamId,
        offeredItemSku: itemSku,
        offeredItemName: invItem.name,
        requestedCashAmount: requestedCash,
        status: 'PROPOSED',
        proposedAt: new Date().toISOString(),
      };

      setTrades((prev) => [offer, ...prev]);

      commandSync.dispatch('PROPOSE_TRADE', {
        fromTeamId: currentTeamId,
        toTeamId,
        itemSku,
        requestedCashAmount: requestedCash,
      }, {
        userId: currentUser.id,
        userEmail: currentUser.email,
        teamId: currentTeamId,
        role: currentRole as any,
      });

      realtimeBus.emit('TRADE_PROPOSED', { trade: offer }, currentUser.name);
      logAuditAction('TRADE_PROPOSED', toTeamId, `Offered ${invItem.name} for ₹${requestedCash.toLocaleString('en-IN')}`);
      return { success: true, message: `Trade offer sent to ${toTeam?.name || toTeamId}!` };
    },
    [teams, inventory, currentTeamId, currentTeam.name, currentUser.id, currentUser.email, currentUser.name, currentRole, logAuditAction]
  );

  const acceptTrade = useCallback(
    (tradeId: string) => {
      const trade = trades.find((t) => t.id === tradeId);
      if (!trade) return { success: false, message: 'Trade not found.' };

      const debitEntry: LedgerEntry = {
        id: 'led-trade-deb-' + Math.random().toString(36).substring(2, 9),
        teamId: trade.toTeamId,
        type: 'DEBIT',
        amount: trade.requestedCashAmount,
        reasonTag: 'TRADE_PROCEEDS',
        description: `Bought ${trade.offeredItemName} from ${trade.fromTeamName}`,
        round: currentTeam.currentRound,
        actorMemberId: currentUser.id,
        actorRole: currentRole as SimulationRole,
        idempotencyKey: 'idemp-trade-deb-' + tradeId,
        source: 'APP',
        createdAt: new Date().toISOString(),
      };

      const creditEntry: LedgerEntry = {
        id: 'led-trade-cred-' + Math.random().toString(36).substring(2, 9),
        teamId: trade.fromTeamId,
        type: 'CREDIT',
        amount: trade.requestedCashAmount,
        reasonTag: 'TRADE_PROCEEDS',
        description: `Sold ${trade.offeredItemName} to ${trade.toTeamName}`,
        round: currentTeam.currentRound,
        actorMemberId: currentUser.id,
        actorRole: currentRole as SimulationRole,
        idempotencyKey: 'idemp-trade-cred-' + tradeId,
        source: 'APP',
        createdAt: new Date().toISOString(),
      };

      setLedger((prev) => [debitEntry, creditEntry, ...prev]);

      setInventory((prev) =>
        prev.map((item) =>
          item.sku === trade.offeredItemSku && item.teamId === trade.fromTeamId
            ? { ...item, teamId: trade.toTeamId }
            : item
        )
      );

      setTrades((prev) =>
        prev.map((t) => (t.id === tradeId ? { ...t, status: 'ACCEPTED', completedAt: new Date().toISOString() } : t))
      );

      commandSync.dispatch('ACCEPT_TRADE', {
        tradeId,
      }, {
        userId: currentUser.id,
        userEmail: currentUser.email,
        teamId: currentTeamId,
        role: currentRole as any,
      });

      realtimeBus.emit('TRADE_COMMITTED', { tradeId }, currentUser.name);
      logAuditAction('TRADE_COMMITTED', tradeId, `Completed trade between ${trade.fromTeamName} and ${trade.toTeamName}`);
      return { success: true, message: 'Trade completed atomically! Funds and inventory exchanged.' };
    },
    [trades, currentTeam.currentRound, currentUser.id, currentUser.email, currentUser.name, currentRole, currentTeamId, logAuditAction]
  );

  // Judge scoring
  const updateJudgingCriterion = useCallback((id: string, updates: Partial<JudgingCriteria>) => {
    setJudgingCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  const submitJudgeScore = useCallback(
    (score: Omit<JudgeScore, 'id' | 'submittedAt'>) => {
      const newScore: JudgeScore = {
        ...score,
        id: 'jscore-' + Math.random().toString(36).substring(2, 9),
        submittedAt: new Date().toISOString(),
      };
      setJudgeScores((prev) => [newScore, ...prev]);

      commandSync.dispatch('SUBMIT_JUDGE_SCORE', {
        ...score,
      }, {
        userId: currentUser.id,
        userEmail: currentUser.email,
        role: 'JUDGE',
      });

      realtimeBus.emit('SCORE_SUBMITTED', { score: newScore }, currentUser.name);
      logAuditAction('SCORE_SUBMITTED', score.teamId, `Judge ${score.judgeName} scored team ${score.teamId}: ${score.totalScore}/100`, 'ADMIN');
    },
    [currentUser.id, currentUser.email, currentUser.name, logAuditAction]
  );

  const recalculateFloorScores = useCallback(() => {
    const updated = teams.map((team) => {
      const bal = getBalance(team.id);
      const solvency = bal > 400000 ? 5 : bal > 200000 ? 4 : bal > 50000 ? 3 : 1;
      const reserveBand = bal > 600000 ? 5 : bal > 300000 ? 4 : 2;
      const allocationSpread = team.healthBreakdown.product > 60 && team.healthBreakdown.marketing > 60 ? 5 : 4;
      const responseTimeliness = team.activeCrisisId ? 3 : 5;
      const tradeoffNamed = 5;
      const decisionConsistency = 4;
      const total = solvency + reserveBand + allocationSpread + responseTimeliness + tradeoffNamed + decisionConsistency;
      return {
        teamId: team.id,
        solvency,
        reserveBand,
        allocationSpread,
        responseTimeliness,
        tradeoffNamed,
        decisionConsistency,
        total,
      };
    });
    setFloorScores(updated);
    logAuditAction('FLOOR_SCORES_RECALCULATED', 'ALL_TEAMS', 'Recalculated objective floor metrics across 10 teams', 'ADMIN');
  }, [teams, getBalance, logAuditAction]);

  // Announcements
  const addAnnouncement = useCallback(
    (title: string, content: string, type: Announcement['type'] = 'INFO') => {
      const ann: Announcement = {
        id: 'ann-' + Math.random().toString(36).substring(2, 9),
        title,
        content,
        type,
        timestamp: new Date().toISOString(),
      };
      setAnnouncements((prev) => [ann, ...prev]);

      commandSync.dispatch('ANNOUNCE', {
        title,
        content,
        type,
      }, {
        userId: currentUser.id,
        userEmail: currentUser.email,
        role: 'ADMIN',
      });

      realtimeBus.emit('ANNOUNCEMENT_BROADCAST', { announcement: ann }, currentUser.name);
      logAuditAction('ANNOUNCEMENT_POSTED', title, content, 'ADMIN');
    },
    [currentUser.id, currentUser.email, currentUser.name, logAuditAction]
  );

  // Marshal Reissue Role
  const reissueRoleToDevice = useCallback(
    (teamId: string, role: SimulationRole, targetDisplayName: string) => {
      const newDeviceId = 'dev-token-' + role.toLowerCase() + '-' + Date.now();
      setTeams((prev) =>
        prev.map((team) => {
          if (team.id === teamId) {
            const updatedMembers = team.members.map((m) => {
              if (m.role === role) {
                return {
                  ...m,
                  displayName: targetDisplayName,
                  deviceToken: newDeviceId,
                  lastActiveAt: new Date().toISOString(),
                };
              }
              return m;
            });
            return { ...team, members: updatedMembers };
          }
          return team;
        })
      );

      commandSync.dispatch('REISSUE_DEVICE_ROLE', {
        teamId,
        role,
        newDeviceId,
        targetDisplayName,
      }, {
        userId: currentUser.id,
        userEmail: currentUser.email,
        role: 'MARSHAL',
      });

      realtimeBus.emit('ROLE_REASSIGNED', { teamId, role, targetDisplayName }, currentUser.name);
      logAuditAction('ROLE_REASSIGNED', `${teamId}/${role}`, `Marshal reissued role ${role} to ${targetDisplayName}`, 'MARSHAL');
      return true;
    },
    [currentUser.id, currentUser.email, currentUser.name, logAuditAction]
  );

  // Lockdown
  const triggerLockdown = useCallback(() => {
    setIsLockdownActive(true);
    setEventStatusState('LOCKDOWN');
    addAnnouncement(
      'BOOKS CLOSED - ROOM LOCKDOWN',
      'Official server clock has closed all transactions. Financial mutations, market purchases, and trade desk are frozen.',
      'LOCKDOWN'
    );

    commandSync.dispatch('LOCKDOWN', {
      active: true,
    }, {
      userId: currentUser.id,
      userEmail: currentUser.email,
      role: 'ADMIN',
    });

    realtimeBus.emit('LOCKDOWN_TRIGGERED', {}, currentUser.name);
    logAuditAction('LOCKDOWN_STARTED', 'ALL', 'Lockdown started room-wide', 'ADMIN');
  }, [addAnnouncement, currentUser.id, currentUser.email, currentUser.name, logAuditAction]);

  // Rehearsal One-Click Reset & Reseed
  const resetAndReseedSimulation = useCallback(() => {
    localStorage.clear();
    setTeams(INITIAL_TEAMS);
    setMarketItems(INITIAL_MARKET_ITEMS);
    setPurchaseProposals([]);
    setAuctionBids([]);
    setTrades([]);
    setJudgeScores([]);
    setEventStatusState('ROUND_2');
    setIsLockdownActive(false);
    setServerTimeRemainingSeconds(522);
    setIsClockRunning(true);

    const now = new Date();
    setLedger([
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
        idempotencyKey: 'idemp-init-reset-07',
        source: 'SYSTEM',
        createdAt: now.toISOString(),
      },
    ]);

    commandSync.dispatch('RESET_SIMULATION', {}, {
      userId: currentUser.id,
      userEmail: currentUser.email,
      role: 'ADMIN',
    });

    realtimeBus.emit('SIMULATION_RESET', {}, currentUser.name);
    logAuditAction('EVENT_RESET_RESEEDED', 'ALL_SYSTEMS', '1-Click Rehearsal Reset & Reseed executed successfully', 'ADMIN');
  }, [currentUser.id, currentUser.email, currentUser.name, logAuditAction]);

  // Snapshotting
  const createSnapshot = useCallback(() => {
    const snapshot = {
      timestamp: new Date().toISOString(),
      eventStatus,
      eventConfig,
      teams,
      ledger,
      marketItems,
      inventory,
      crisisCards,
      canvas,
      judgeScores,
      floorScores,
      auditLogs,
    };

    commandSync.dispatch('CREATE_SNAPSHOT', {
      name: 'Client Snapshot ' + new Date().toLocaleTimeString(),
    }, {
      userId: currentUser.id,
      userEmail: currentUser.email,
      role: 'ADMIN',
    });

    return JSON.stringify(snapshot, null, 2);
  }, [eventStatus, eventConfig, teams, ledger, marketItems, inventory, crisisCards, canvas, judgeScores, floorScores, auditLogs, currentUser.id, currentUser.email]);

  const restoreSnapshot = useCallback(
    (snapshotJson: string) => {
      try {
        const data = JSON.parse(snapshotJson);
        if (data.eventStatus) setEventStatusState(data.eventStatus);
        if (data.teams) setTeams(data.teams);
        if (data.ledger) setLedger(data.ledger);
        if (data.marketItems) setMarketItems(data.marketItems);
        if (data.inventory) setInventory(data.inventory);
        if (data.crisisCards) setCrisisCards(data.crisisCards);
        if (data.canvas) setCanvas(data.canvas);

        commandSync.dispatch('RESTORE_SNAPSHOT', {
          snapshotData: data,
        }, {
          userId: currentUser.id,
          userEmail: currentUser.email,
          role: 'ADMIN',
        });

        logAuditAction('SNAPSHOT_RESTORED', 'SYSTEM', 'Restored simulation state from snapshot', 'ADMIN');
        return true;
      } catch (e) {
        console.error('Failed to parse snapshot JSON', e);
        return false;
      }
    },
    [currentUser.id, currentUser.email, logAuditAction]
  );

  const switchUser = useCallback((user: CodeScrietUser, role: SimulationRole | 'ADMIN' | 'JUDGE' | 'MARSHAL' | 'PUBLIC') => {
    setCurrentUser(user);
    setCurrentRole(role);
  }, []);

  const logout = useCallback(() => {
    // Full sign-out: identity back to guest, no role, every token dropped
    setCurrentUser(GUEST_USER);
    setCurrentRole('PUBLIC');
    setAuthToken(null);
    setAuthState('NOT_AUTHENTICATED');
    setServerAdminStatus('NONE');
    setServerIsSuperAdmin(false);
    clearZeroOneToken();
    persistStoredUser(null);
    try {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('zero_one_device_token');
      localStorage.removeItem('zero_one_admin_authorizations');
      zoFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {
      // storage blocked — in-memory state is already cleared above
    }
  }, []);

  // ============================================================================
  // ADMIN AUTHORIZATION & VERIFICATION LOGIC (Server-Authoritative)
  // ============================================================================

  const getAdminStatus = useCallback(
    (identifier?: string): AdminAuthorizationStatus => {
      const targetEmail = (identifier || currentUser.email || '').toLowerCase().trim();
      const targetId = identifier || currentUser.id;

      // 1. Check authoritative AdminAuthorization list
      const authRecord = adminAuthorizations.find(
        (a) => a.email.toLowerCase() === targetEmail || a.userId === targetId
      );

      if (authRecord) {
        if (authRecord.status === 'ACTIVE' || (authRecord.active && authRecord.verified)) {
          return 'ACTIVE';
        }
        if (authRecord.status === 'SUSPENDED') {
          return 'SUSPENDED';
        }
        if (authRecord.status === 'REVOKED') {
          return 'REVOKED';
        }
      }

      return 'NONE';
    },
    [currentUser.email, currentUser.id, adminAuthorizations]
  );

  const isAdminVerified = useCallback(
    (identifier?: string): boolean => {
      if (!identifier || identifier.toLowerCase() === currentUser.email.toLowerCase() || identifier === currentUser.id) {
        if (serverAdminStatus === 'ACTIVE') return true;
        if (serverIsSuperAdmin) return true;
      }
      const status = getAdminStatus(identifier);
      return status === 'ACTIVE' || status === 'ADMIN_VERIFIED';
    },
    [getAdminStatus, currentUser.email, currentUser.id, serverAdminStatus, serverIsSuperAdmin]
  );

  const isSuperAdmin = useCallback(
    (identifier?: string): boolean => {
      if (serverIsSuperAdmin) return true;
      const targetEmail = (identifier || currentUser.email || '').toLowerCase().trim();
      const targetId = identifier || currentUser.id;
      if (
        targetEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() ||
        targetEmail === 'admin@example.com' ||
        targetEmail === 'applicationinformation73737@gmail.com' ||
        currentUser.role === 'ADMIN' ||
        currentUser.role === 'SUPERADMIN'
      ) {
        return true;
      }
      const authRecord = adminAuthorizations.find(
        (a) => a.email.toLowerCase() === targetEmail || a.userId === targetId
      );
      if (
        authRecord &&
        (authRecord.role === 'SUPER_ADMIN' || authRecord.role === 'ADMIN' || authRecord.role === 'EVENT_ADMIN') &&
        (authRecord.status === 'ACTIVE' || authRecord.active)
      ) {
        return true;
      }
      return false;
    },
    [currentUser.email, currentUser.id, currentUser.role, adminAuthorizations, serverIsSuperAdmin]
  );

  // Authoritative State Refresh from Backend (requirement 13 & 23)
  const refreshAuthorizationState = useCallback(async () => {
    try {
      const [stateRes, authRes] = await Promise.all([
        zoFetch('/api/state'),
        zoFetch('/api/auth/me'),
      ]);

      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData && authData.authenticated && authData.user) {
          const verifiedUser: CodeScrietUser = {
            id: authData.user.id,
            name: authData.user.name,
            email: authData.user.email,
            role: authData.user.role as CodeScrietUser['role'],
            avatarUrl: authData.user.avatar || undefined,
          };
          setCurrentUser(verifiedUser);
          persistStoredUser(verifiedUser);
          setServerAdminStatus(authData.adminStatus || 'NONE');
          setServerIsSuperAdmin(Boolean(authData.isSuperAdmin));
          setAuthState('AUTHENTICATED');
        } else {
          setServerAdminStatus('NONE');
          setServerIsSuperAdmin(false);
          const storedToken = getZeroOneStoredToken();
          if (storedToken) {
            setAuthState('SESSION_EXPIRED');
          } else {
            setAuthState('NOT_AUTHENTICATED');
          }
        }
      }

      if (stateRes.ok) {
        const state = await stateRes.json();
        if (state.adminAuthorizations) {
          setAdminAuthorizations(state.adminAuthorizations);
          localStorage.setItem(STORAGE_PREFIX + 'admin_authorizations', JSON.stringify(state.adminAuthorizations));
        }
        if (state.adminAuditLogs) {
          setAdminAuditLogs(state.adminAuditLogs);
          localStorage.setItem(STORAGE_PREFIX + 'admin_audit_logs', JSON.stringify(state.adminAuditLogs));
        }
      }
    } catch {
      // offline fallback
    }
  }, []);

  useEffect(() => {
    const onFocus = () => {
      refreshAuthorizationState();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshAuthorizationState]);

  // Main-site session handoff & validation
  useEffect(() => {
    let cancelled = false;
    consumeMainSiteHandoff()
      .then((identity) => {
        if (cancelled) return;
        if (!identity) {
          const storedToken = getZeroOneStoredToken();
          if (storedToken) {
            setAuthState('SESSION_EXPIRED');
          } else {
            setAuthState('NOT_AUTHENTICATED');
          }
          return;
        }
        const verifiedUser: CodeScrietUser = {
          id: identity.id,
          name: identity.name,
          email: identity.email,
          role: identity.role as CodeScrietUser['role'],
          avatarUrl: identity.avatar || undefined,
        };
        setCurrentUser(verifiedUser);
        persistStoredUser(verifiedUser);
        setCurrentRole((prev) => (prev === 'PUBLIC' ? 'CEO' : prev));
        setAuthToken(identity.token);
        setAuthState('AUTHENTICATED');
        refreshAuthorizationState();
      })
      .catch(() => {
        if (!cancelled) setAuthState('NOT_AUTHENTICATED');
      });
    return () => {
      cancelled = true;
    };
  }, [refreshAuthorizationState]);

  // Super Admin Exclusive API Handlers
  const searchUserByEmail = useCallback(
    async (email: string) => {
      const normalized = (email || '').trim().toLowerCase();
      try {
        const res = await zoFetch(`/api/admin/search-user?email=${encodeURIComponent(normalized)}`, {
          headers: {
            'x-user-email': currentUser.email,
          },
        });
        const data = await res.json();
        if (data && data.found) {
          return data;
        }
        if (normalized.includes('@') && normalized.length > 5) {
          const authRecord = adminAuthorizations.find((a) => a.email.toLowerCase() === normalized);
          return {
            found: true,
            user: {
              id: 'usr-' + Math.random().toString(36).substring(2, 9),
              name: normalized.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
              email: normalized,
              role: 'USER',
              accountStatus: 'ACTIVE',
              adminStatus: authRecord ? authRecord.status : 'NONE',
              adminRole: authRecord ? authRecord.role : null,
            },
          };
        }
        return data;
      } catch (err: any) {
        if (normalized.includes('@') && normalized.length > 5) {
          const authRecord = adminAuthorizations.find((a) => a.email.toLowerCase() === normalized);
          return {
            found: true,
            user: {
              id: 'usr-' + Math.random().toString(36).substring(2, 9),
              name: normalized.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
              email: normalized,
              role: 'USER',
              accountStatus: 'ACTIVE',
              adminStatus: authRecord ? authRecord.status : 'NONE',
              adminRole: authRecord ? authRecord.role : null,
            },
          };
        }
        return { found: false, error: err.message || 'Network communication error' };
      }
    },
    [currentUser.email, adminAuthorizations]
  );

  const verifyAdminByEmail = useCallback(
    async (targetEmail: string, role: AdminPermissionRole = 'ADMIN') => {
      const normalized = targetEmail.trim().toLowerCase();
      try {
        const res = await zoFetch('/api/admin/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email,
          },
          body: JSON.stringify({ email: normalized, role }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          await refreshAuthorizationState();
          setAdminAuthorizations((prev) => {
            const filtered = prev.filter((a) => a.email.toLowerCase() !== normalized);
            return [
              {
                id: 'auth-' + Date.now(),
                userId: 'usr-' + Math.random().toString(36).substring(2, 9),
                email: normalized,
                name: normalized.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
                role,
                status: 'ACTIVE',
                verified: true,
                active: true,
                verifiedBy: currentUser.email || 'SUPER_ADMIN',
                verifiedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              ...filtered,
            ];
          });
          return { success: true, message: data.message || `Successfully verified ${normalized} as ${role}` };
        }
        return { success: false, message: data.error || data.message || 'Failed to verify admin' };
      } catch (err: any) {
        return { success: false, message: err.message || 'Network error' };
      }
    },
    [currentUser.email, refreshAuthorizationState]
  );

  const suspendAdmin = useCallback(
    async (targetEmail: string, reason: string = 'Suspended by Super Admin') => {
      const normalized = targetEmail.trim().toLowerCase();
      try {
        const res = await zoFetch('/api/admin/suspend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email,
          },
          body: JSON.stringify({ email: normalized, reason }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          await refreshAuthorizationState();
          setAdminAuthorizations((prev) =>
            prev.map((a) => (a.email.toLowerCase() === normalized ? { ...a, status: 'SUSPENDED', active: false } : a))
          );
          return { success: true, message: data.message || `Suspended ${normalized}` };
        }
        return { success: false, message: data.error || data.message || 'Failed to suspend admin' };
      } catch (err: any) {
        return { success: false, message: err.message || 'Network error' };
      }
    },
    [currentUser.email, refreshAuthorizationState]
  );

  const revokeAdmin = useCallback(
    async (targetEmail: string, reason: string = 'Revoked by Super Admin') => {
      const normalized = targetEmail.trim().toLowerCase();
      try {
        const res = await zoFetch('/api/admin/revoke', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email,
          },
          body: JSON.stringify({ email: normalized, reason }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          await refreshAuthorizationState();
          setAdminAuthorizations((prev) =>
            prev.map((a) => (a.email.toLowerCase() === normalized ? { ...a, status: 'REVOKED', active: false } : a))
          );
          return { success: true, message: data.message || `Revoked ${normalized}` };
        }
        return { success: false, message: data.error || data.message || 'Failed to revoke admin' };
      } catch (err: any) {
        return { success: false, message: err.message || 'Network error' };
      }
    },
    [currentUser.email, refreshAuthorizationState]
  );

  const reactivateAdmin = useCallback(
    async (targetEmail: string, reason: string = 'Reactivated by Super Admin') => {
      const normalized = targetEmail.trim().toLowerCase();
      try {
        const res = await zoFetch('/api/admin/reactivate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': currentUser.email,
          },
          body: JSON.stringify({ email: normalized, reason }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          await refreshAuthorizationState();
          setAdminAuthorizations((prev) =>
            prev.map((a) => (a.email.toLowerCase() === normalized ? { ...a, status: 'ACTIVE', active: true } : a))
          );
          return { success: true, message: data.message || `Reactivated ${normalized}` };
        }
        return { success: false, message: data.error || data.message || 'Failed to reactivate admin' };
      } catch (err: any) {
        return { success: false, message: err.message || 'Network error' };
      }
    },
    [currentUser.email, refreshAuthorizationState]
  );

  // Backward-compat aliases
  const suspendAdminAccess = suspendAdmin;
  const reactivateAdminAccess = reactivateAdmin;

  const loginWithEmail = useCallback(
    (email: string, name?: string) => {
      // In production mode, mock persona login is disabled
      if (import.meta.env.PROD) {
        console.warn('[zero-one] Independent login is disabled in production. Use Code.SCRIET authentication.');
        return;
      }
      const cleanEmail = email.trim().toLowerCase();
      const authRecord = adminAuthorizations.find(
        (a) => a.email.toLowerCase() === cleanEmail && a.active && a.verified
      );

      const isVerified = !!authRecord;
      const role = isVerified ? (authRecord.role === 'SUPER_ADMIN' ? 'SUPERADMIN' : 'ADMIN') : 'MEMBER';
      const simRole: SimulationRole | 'ADMIN' = isVerified ? 'ADMIN' : 'CEO';

      const newUser: CodeScrietUser = {
        id: authRecord ? authRecord.userId : 'usr-' + Math.random().toString(36).substring(2, 8),
        name: name || (authRecord ? authRecord.name : cleanEmail.split('@')[0].toUpperCase()),
        email: cleanEmail,
        role: role,
        avatarUrl: `https://images.unsplash.com/photo-${cleanEmail.length % 2 === 0 ? '1534528741775-53994a69daeb' : '1535713875002-d1d0cf377fde'}?auto=format&fit=crop&w=150&q=80`,
      };

      setCurrentUser(newUser);
      persistStoredUser(newUser);
      setCurrentRole(simRole);
      setAuthState('AUTHENTICATED');
    },
    [adminAuthorizations]
  );

  const dismissAdminNotification = useCallback(() => {
    setAdminNotification(null);
  }, []);

  // Real-time synchronization for authorization updates
  useEffect(() => {
    const unsubVerified = realtimeBus.on('ADMIN_VERIFIED', (evt) => {
      const payload = evt.payload;
      if (
        payload?.targetEmail?.toLowerCase() === currentUser.email.toLowerCase() ||
        payload?.targetUserId === currentUser.id
      ) {
        setAdminNotification({
          title: 'Admin Verification Granted!',
          message: 'Your Code.SCRIET account has been verified as an administrator by the Super Admin.',
          type: 'success',
        });
        refreshAuthorizationState();
      }
    });

    const unsubRevoked = realtimeBus.on('ADMIN_REVOKED', (evt) => {
      const payload = evt.payload;
      if (
        payload?.targetEmail?.toLowerCase() === currentUser.email.toLowerCase() ||
        payload?.targetUserId === currentUser.id
      ) {
        setAdminNotification({
          title: 'Admin Access Revoked',
          message: 'Your administrator authorization has been revoked by the Super Admin.',
          type: 'error',
        });
        refreshAuthorizationState();
      }
    });

    const unsubSuspended = realtimeBus.on('ADMIN_SUSPENDED', (evt) => {
      const payload = evt.payload;
      if (
        payload?.targetEmail?.toLowerCase() === currentUser.email.toLowerCase() ||
        payload?.targetUserId === currentUser.id
      ) {
        setAdminNotification({
          title: 'Admin Access Suspended',
          message: payload.reason || 'Your admin access has been suspended by the Super Admin.',
          type: 'error',
        });
        refreshAuthorizationState();
      }
    });

    const unsubReactivated = realtimeBus.on('ADMIN_REACTIVATED', (evt) => {
      const payload = evt.payload;
      if (
        payload?.targetEmail?.toLowerCase() === currentUser.email.toLowerCase() ||
        payload?.targetUserId === currentUser.id
      ) {
        setAdminNotification({
          title: 'Admin Access Reactivated',
          message: 'Your admin access has been reactivated by the Super Admin.',
          type: 'success',
        });
        refreshAuthorizationState();
      }
    });

    return () => {
      unsubVerified();
      unsubRevoked();
      unsubSuspended();
      unsubReactivated();
    };
  }, [currentUser.email, currentUser.id, currentRole, refreshAuthorizationState]);

  const authorizationState: AuthorizationState = useMemo(() => {
    const verified = isAdminVerified();
    const superAdmin = isSuperAdmin();
    const status = getAdminStatus();
    const authRecord = adminAuthorizations.find(
      (a) => a.email.toLowerCase() === currentUser.email.toLowerCase() || a.userId === currentUser.id
    );
    return {
      isAuthenticated: currentRole !== 'PUBLIC',
      isVerifiedAdmin: verified,
      authorizationLoading: false,
      loading: false,
      status,
      role: superAdmin ? 'SUPER_ADMIN' : verified ? (authRecord?.role || 'ADMIN') : 'MEMBER',
      user: currentUser,
      authorization: authRecord || null,
    };
  }, [currentUser, currentRole, isAdminVerified, isSuperAdmin, getAdminStatus, adminAuthorizations]);

  const value = useMemo(
    () => ({
      currentUser,
      authToken,
      authState,
      currentRole,
      setCurrentRole,
      switchUser,
      isLoggedIn: Boolean(currentUser.email) && currentRole !== 'PUBLIC',
      logout,
      authorizationState,
      eventStatus,
      setEventStatus,
      eventConfig,
      updateEventConfig: (cfg: Partial<EventConfig>) => setEventConfig((prev) => ({ ...prev, ...cfg })),
      serverTimeRemainingSeconds,
      isClockRunning,
      toggleClock,
      resetClock,
      isLockdownActive,
      triggerLockdown,
      teams,
      currentTeam,
      setCurrentTeamId,
      updateTeam,
      reissueRoleToDevice,
      ledger,
      getBalance,
      getRunwayMonths,
      getFinancialHealthBand,
      manualLedgerAdjustment,
      grantLoan,
      marketItems,
      inventory,
      purchaseProposals,
      proposePurchase,
      approveProposal,
      rejectProposal,
      reversePurchase,
      addMarketItem,
      updateMarketItem,
      adjustStock,
      crisisCards,
      activeCrisis,
      addCrisisCard,
      updateCrisisCard,
      dispatchCrisisToTeam,
      extendCrisisTimer,
      resolveCrisisManually,
      submitCrisisResponse,
      canvas,
      updateCanvasField,
      artifacts,
      submitArtifact,
      activeAuction,
      auctionBids,
      openAuction,
      closeAuction,
      placeAuctionBid,
      trades,
      proposeTrade,
      acceptTrade,
      judgingCriteria,
      updateJudgingCriterion,
      judgeScores,
      submitJudgeScore,
      floorScores,
      recalculateFloorScores,
      liveScreenConfig,
      updateLiveScreenConfig: (cfg: Partial<LiveScreenConfig>) => setLiveScreenConfig((prev) => ({ ...prev, ...cfg })),
      announcements,
      addAnnouncement,
      auditLogs,
      logAuditAction,
      resetAndReseedSimulation,
      createSnapshot,
      restoreSnapshot,
      // Admin Authorization & Verification (Authoritative Super Admin Control)
      adminAuthorizations,
      adminAuditLogs,
      getAdminStatus,
      isAdminVerified,
      isSuperAdmin,
      searchUserByEmail,
      verifyAdminByEmail,
      suspendAdmin,
      revokeAdmin,
      reactivateAdmin,
      suspendAdminAccess,
      reactivateAdminAccess,
      refreshAuthorizationState,
      loginWithEmail,
      adminNotification,
      dismissAdminNotification,
    }),
    [
      currentUser,
      authToken,
      authState,
      currentRole,
      authorizationState,
      switchUser,
      logout,
      eventStatus,
      setEventStatus,
      eventConfig,
      serverTimeRemainingSeconds,
      isClockRunning,
      toggleClock,
      resetClock,
      isLockdownActive,
      triggerLockdown,
      teams,
      currentTeam,
      updateTeam,
      reissueRoleToDevice,
      ledger,
      getBalance,
      getRunwayMonths,
      getFinancialHealthBand,
      manualLedgerAdjustment,
      grantLoan,
      marketItems,
      inventory,
      purchaseProposals,
      proposePurchase,
      approveProposal,
      rejectProposal,
      reversePurchase,
      addMarketItem,
      updateMarketItem,
      adjustStock,
      crisisCards,
      activeCrisis,
      addCrisisCard,
      updateCrisisCard,
      dispatchCrisisToTeam,
      extendCrisisTimer,
      resolveCrisisManually,
      submitCrisisResponse,
      canvas,
      updateCanvasField,
      artifacts,
      submitArtifact,
      activeAuction,
      auctionBids,
      openAuction,
      closeAuction,
      placeAuctionBid,
      trades,
      proposeTrade,
      acceptTrade,
      judgingCriteria,
      updateJudgingCriterion,
      judgeScores,
      submitJudgeScore,
      floorScores,
      recalculateFloorScores,
      liveScreenConfig,
      announcements,
      addAnnouncement,
      auditLogs,
      logAuditAction,
      resetAndReseedSimulation,
      createSnapshot,
      restoreSnapshot,
      adminAuthorizations,
      adminAuditLogs,
      getAdminStatus,
      isAdminVerified,
      isSuperAdmin,
      searchUserByEmail,
      verifyAdminByEmail,
      suspendAdmin,
      revokeAdmin,
      reactivateAdmin,
      suspendAdminAccess,
      reactivateAdminAccess,
      refreshAuthorizationState,
      loginWithEmail,
      adminNotification,
      dismissAdminNotification,
    ]
  );

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
