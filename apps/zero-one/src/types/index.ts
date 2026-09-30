// ZERO -> ONE Master Types Specification

export type UserRole = 'USER' | 'MEMBER' | 'ADMIN' | 'SUPERADMIN';

export type SimulationRole = 'CEO' | 'CFO' | 'CTO' | 'CMO' | 'JUDGE' | 'MARSHAL';

export interface CodeScrietUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export type EventStatus =
  | 'SETUP'
  | 'LOBBY'
  | 'ONBOARDING'
  | 'BRIEF'
  | 'ROUND_1'
  | 'MARKET_SHOCK'
  | 'ROUND_2'
  | 'FIRESIDE'
  | 'AUCTION'
  | 'ROUND_3'
  | 'LOCKDOWN'
  | 'QUALIFIERS'
  | 'DELIBERATION'
  | 'FINALS'
  | 'REVEAL'
  | 'ARCHIVED';

export interface EventConfig {
  id: string;
  name: string;
  slug: string;
  initialCapital: number;
  twoKeyApprovalThreshold: number; // e.g. 100000
  dynamicPricingEnabled: boolean;
  tradingEnabled: boolean;
  undoWindowSeconds: number; // e.g. 60
  roundDurationMinutes: number; // e.g. 25
  crisisResponseMinutes: number; // e.g. 6
  rngSeed: string;
}

export interface TeamMember {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  role: SimulationRole;
  deviceToken: string;
  active: boolean;
  joinedAt: string;
  lastActiveAt: string;
}

export interface Team {
  id: string;
  teamCode: string; // e.g. "TEAM-07"
  name: string; // e.g. "InnovateX"
  problemStatement: string;
  targetCustomer: string;
  equitySoldPct: number;
  members: TeamMember[];
  healthScore: number; // 0 - 100
  healthBreakdown: {
    financial: number;
    product: number;
    marketing: number;
    teamStability: number;
  };
  status: 'ACTIVE' | 'FROZEN' | 'DISQUALIFIED';
  currentRound: string;
  activeCrisisId?: string;
  createdAt: string;
}

export type LedgerSource = 'APP' | 'MARSHAL' | 'SYSTEM' | 'ADMIN';

export type LedgerReasonTag =
  | 'INITIAL_CAPITAL'
  | 'PURCHASE'
  | 'REVERSAL'
  | 'CRISIS_PENALTY'
  | 'CRISIS_REWARD'
  | 'LOAN_DISBURSEMENT'
  | 'LOAN_REPAYMENT'
  | 'AUCTION_WIN'
  | 'TRADE_PROCEEDS'
  | 'INVESTMENT_INFLOW'
  | 'MANUAL_ADJUSTMENT';

export interface LedgerEntry {
  id: string;
  teamId: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  reasonTag: LedgerReasonTag;
  description: string;
  round: string;
  actorMemberId: string;
  actorRole: SimulationRole | 'SYSTEM' | 'ADMIN';
  idempotencyKey: string;
  refEntryId?: string; // For reversals
  source: LedgerSource;
  createdAt: string;
}

export type ItemCategory =
  | 'Technology'
  | 'Marketing'
  | 'Human Resources'
  | 'Operations'
  | 'Infrastructure'
  | 'Product'
  | 'Growth'
  | 'Defensive'
  | 'TECH'
  | 'AUCTION_ASSET'
  | string;

export interface MarketItem {
  sku: string;
  name: string;
  category: ItemCategory;
  basePrice: number;
  currentPrice: number;
  priceChangePct: number; // e.g. +20% or -10%
  stockTotal: number;
  stockRemaining: number;
  unlocksDescription: string;
  effectSpec: {
    boostType: 'HEALTH' | 'SPEED' | 'MARKET' | 'DEFENSE';
    value: number;
    durationMinutes?: number;
  };
  visibleFromState: EventStatus;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'LOCKED';
  icon: string;
}

export interface InventoryItem {
  id: string;
  teamId: string;
  sku: string;
  name: string;
  category: ItemCategory;
  qty: number;
  acquiredPrice: number;
  acquiredAt: string;
  round: string;
  effectApplied: boolean;
}

export interface PurchaseProposal {
  id: string;
  teamId: string;
  sku: string;
  itemName: string;
  proposedByMemberId: string;
  proposedByRole: SimulationRole;
  price: number;
  reasonCategory: 'Product' | 'Marketing' | 'Hiring' | 'Operations' | 'Defensive' | 'Growth';
  status: 'PENDING_CEO_APPROVAL' | 'COMMITTED' | 'REJECTED' | 'REVERSED';
  rejectionNote?: string;
  idempotencyKey: string;
  proposedAt: string;
  decidedAt?: string;
}

export type CrisisSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CrisisOption {
  id: string;
  label: string;
  cost: number;
  description: string;
  effectDescription: string;
  healthDelta: number;
  requiresRoles?: SimulationRole[];
}

export interface CrisisCard {
  id: string;
  title: string;
  category: 'Market' | 'Technical' | 'Financial' | 'Team' | 'Legal';
  severity: CrisisSeverity;
  description: string;
  timerSeconds: number; // default 360 (6 mins)
  options: CrisisOption[];
  shieldItemSku?: string; // Item that mitigates this
}

export interface CrisisAssignment {
  id: string;
  teamId: string;
  crisisId: string;
  crisis: CrisisCard;
  dispatchedAt: string;
  expiresAt: string;
  acknowledgedAt?: string;
  selectedOptionId?: string;
  tradeoffGivenUp?: string;
  status: 'ACTIVE' | 'RESOLVED' | 'TIMEOUT';
  resolvedAt?: string;
}

export interface Auction {
  id: string;
  title: string;
  description: string;
  itemSku: string;
  minimumBid: number;
  status: 'UPCOMING' | 'OPEN' | 'CLOSED';
  opensAt: string;
  closesAt: string;
  winnerTeamId?: string;
  winnerTeamName?: string;
  winningBid?: number;
}

export interface AuctionBid {
  id: string;
  auctionId: string;
  teamId: string;
  teamName: string;
  amount: number;
  submittedAt: string;
  idempotencyKey: string;
}

export interface TradeOffer {
  id: string;
  fromTeamId: string;
  fromTeamName: string;
  toTeamId: string;
  toTeamName: string;
  offeredItemSku: string;
  offeredItemName: string;
  requestedCashAmount: number;
  status: 'PROPOSED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  proposedAt: string;
  completedAt?: string;
}

export interface StartupCanvas {
  teamId: string;
  problem: string;
  customer: string;
  solution: string;
  usp: string;
  revenueModel: string;
  costStructure: string;
  marketingStrategy: string;
  competitors: string;
  traction: string;
  businessAssumptions: string;
  lastSavedAt: string;
  lastSavedBy: string;
  version: number;
}

export interface ArtifactSubmission {
  id: string;
  teamId: string;
  kind: 'PROTOTYPE' | 'LANDING_PAGE' | 'DEMO_VIDEO' | 'PITCH_DECK';
  title: string;
  url: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
}

export interface JudgingCriteria {
  id: string;
  name: string;
  maxScore: number;
  weight: number;
}

export interface JudgeScore {
  id: string;
  judgeId: string;
  judgeName: string;
  teamId: string;
  scores: Record<string, number>; // criterionId -> score
  feedback: string;
  totalScore: number;
  submittedAt: string;
}

export interface FloorScore {
  teamId: string;
  solvency: number; // 0 - 5
  reserveBand: number; // 0 - 5
  allocationSpread: number; // 0 - 5
  responseTimeliness: number; // 0 - 5
  tradeoffNamed: number; // 0 - 5
  decisionConsistency: number; // 0 - 5
  total: number;
}

export interface AuditLog {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
  source: LedgerSource;
  ip?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'INFO' | 'ALERT' | 'CRISIS' | 'ROUND_CHANGE' | 'LOCKDOWN';
  timestamp: string;
}

// ============================================================================
// ADMIN AUTHORIZATION & VERIFICATION SYSTEM TYPES
// ============================================================================

export type AdminAuthorizationStatus =
  | 'NONE'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'REVOKED'
  // Backward compatibility aliases
  | 'NORMAL_USER'
  | 'ADMIN_VERIFIED'
  | 'ADMIN_SUSPENDED'
  | 'ADMIN_PENDING'
  | 'ADMIN_REJECTED';

export type AdminPermissionRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EVENT_ADMIN'
  | 'EVENT_OPERATOR'
  | 'MODERATOR';

export interface AdminAuthorization {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: AdminPermissionRole;
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  verifiedBy: string;
  verifiedAt: string;
  suspendedAt?: string;
  revokedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  notes?: string;
  // Backward-compat flags
  verified?: boolean;
  active?: boolean;
}

export interface AdminAuditLogEntry {
  id: string;
  actorUserId: string;
  actorEmail: string;
  targetUserId: string;
  targetEmail: string;
  action:
    | 'ADMIN_VERIFIED'
    | 'ADMIN_SUSPENDED'
    | 'ADMIN_REACTIVATED'
    | 'ADMIN_REVOKED'
    | 'BOOTSTRAP_INITIAL_ADMIN'
    | 'ADMIN_ACCESS_REVOKED'
    | 'ADMIN_ACCESS_SUSPENDED'
    | 'ADMIN_ACCESS_REACTIVATED'
    | 'ADMIN_APPLICATION_APPROVED';
  beforeStatus: string;
  afterStatus: string;
  timestamp: string;
  reason?: string;
}

// Deprecated: kept for migration compatibility
export interface AdminApplication {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  reason: string;
  requestedRole: AdminPermissionRole;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewedByEmail?: string;
  rejectionReason?: string;
}

// ============================================================================
// COMMAND & EVENT INFRASTRUCTURE TYPES
// ============================================================================

export type CommandType =
  | 'AUTHENTICATE_SESSION'
  | 'CLAIM_TEAM'
  | 'CLAIM_ROLE'
  | 'BIND_DEVICE'
  | 'REISSUE_DEVICE_ROLE'
  | 'START_EVENT'
  | 'START_ROUND'
  | 'END_ROUND'
  | 'CHANGE_EVENT_STATE'
  | 'PROPOSE_PURCHASE'
  | 'APPROVE_PURCHASE'
  | 'REJECT_PURCHASE'
  | 'REVERSE_PURCHASE'
  | 'SUBMIT_CANVAS'
  | 'SUBMIT_ARTIFACT'
  | 'DISPATCH_CRISIS'
  | 'ACKNOWLEDGE_CRISIS'
  | 'SUBMIT_CRISIS_RESPONSE'
  | 'RESOLVE_CRISIS'
  | 'OPEN_AUCTION'
  | 'PLACE_BID'
  | 'CLOSE_AUCTION'
  | 'PROPOSE_TRADE'
  | 'ACCEPT_TRADE'
  | 'REJECT_TRADE'
  | 'CANCEL_TRADE'
  | 'ASSIGN_JUDGE'
  | 'SUBMIT_JUDGE_SCORE'
  | 'ANNOUNCE'
  | 'LOCKDOWN'
  | 'REVEAL_RESULTS'
  | 'UPDATE_MARKET_PRICE'
  | 'ADJUST_STOCK'
  | 'ADD_MARKET_ITEM'
  | 'MANUAL_LEDGER_ADJUSTMENT'
  | 'GRANT_LOAN'
  | 'CREATE_SNAPSHOT'
  | 'RESTORE_SNAPSHOT'
  | 'RESET_SIMULATION';

export type CommandStatus =
  | 'PENDING'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CONFLICT'
  | 'RETRY';

export interface Command<T = any> {
  commandId: string;
  deviceId: string;
  userId: string;
  userEmail?: string;
  teamId?: string;
  role?: SimulationRole | 'ADMIN' | 'SUPER_ADMIN' | 'JUDGE' | 'MARSHAL' | 'PUBLIC';
  type: CommandType;
  payload: T;
  clientCreatedAt: string;
  attemptCount: number;
  status: CommandStatus;
  error?: string;
}

export interface EventFact<T = any> {
  id: string;
  sequence: number;
  commandId?: string;
  type: string;
  payload: T;
  actor: string;
  role?: string;
  teamId?: string;
  timestamp: string;
  serverTimestamp: number;
}

export interface CommandExecutionResult {
  success: boolean;
  commandId: string;
  eventId?: string;
  sequence?: number;
  code?: string;
  message?: string;
  data?: any;
  retryable?: boolean;
  idempotentReplay?: boolean;
  error?: {
    code: string;
    message: string;
    commandId?: string;
  };
  currentState?: Partial<AuthoritativeServerStateSummary>;
}

export interface AuthoritativeServerStateSummary {
  eventStatus: EventStatus;
  serverClock: {
    timeRemainingSeconds: number;
    isClockRunning: boolean;
    lastTickTimestamp: number;
  };
  isLockdownActive: boolean;
  latestSequence: number;
}


