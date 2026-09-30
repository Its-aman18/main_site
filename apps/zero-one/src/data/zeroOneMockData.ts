// =========================================================================
// ZERO → ONE FRONTEND MOCK DATA
// FRONTEND MOCK DATA - REPLACE WITH CODE.SCRIET API IN STEP 3
// =========================================================================

import {
  CodeScrietUser,
  Team,
  TeamMember,
  MarketItem,
  CrisisCard,
  JudgingCriteria,
} from '../types/index';
import { ZERO_ONE_CONFIG } from './zeroOneConfig';

// Mock Authenticated Normal Participant
export const mockUser: CodeScrietUser = {
  id: 'usr-aman-student',
  name: 'Aman Gupta',
  email: 'aman@scriet.edu',
  role: 'MEMBER',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
};

// Mock Squad Roles
export const mockRoles = [
  { role: 'CEO', title: 'Chief Executive Officer', focus: 'Product Vision, Strategy & Two-Key Approval' },
  { role: 'CFO', title: 'Chief Financial Officer', focus: 'Virtual Capital, Scarcity Procurement & Ledger' },
  { role: 'CTO', title: 'Chief Technology Officer', focus: 'Cloud Architecture, Tech Stack & Infrastructure' },
  { role: 'CMO', title: 'Chief Marketing Officer', focus: 'Growth Campaigns, User Acquisition & Pitch Deck' },
] as const;

// Mock Team Members
export const mockTeamMembers: TeamMember[] = [
  {
    id: 'mem-1',
    userId: 'usr-aman-student',
    displayName: 'Aman Gupta',
    email: 'aman@scriet.edu',
    role: 'CEO',
    deviceToken: 'DEV-AMAN-001',
    active: true,
    joinedAt: '2026-09-01T10:00:00.000Z',
    lastActiveAt: '2026-09-20T12:00:00.000Z',
  },
  {
    id: 'mem-2',
    userId: 'usr-priya',
    displayName: 'Priya Verma',
    email: 'priya@scriet.edu',
    role: 'CFO',
    deviceToken: 'DEV-PRIYA-002',
    active: true,
    joinedAt: '2026-09-01T10:05:00.000Z',
    lastActiveAt: '2026-09-20T12:00:00.000Z',
  },
  {
    id: 'mem-3',
    userId: 'usr-rahul',
    displayName: 'Rahul Sharma',
    email: 'rahul@scriet.edu',
    role: 'CTO',
    deviceToken: 'DEV-RAHUL-003',
    active: true,
    joinedAt: '2026-09-01T10:10:00.000Z',
    lastActiveAt: '2026-09-20T12:00:00.000Z',
  },
  {
    id: 'mem-4',
    userId: 'usr-sneha',
    displayName: 'Sneha Patel',
    email: 'sneha@scriet.edu',
    role: 'CMO',
    deviceToken: 'DEV-SNEHA-004',
    active: true,
    joinedAt: '2026-09-01T10:15:00.000Z',
    lastActiveAt: '2026-09-20T12:00:00.000Z',
  },
];

// Mock Primary Team
export const mockTeam: Team = {
  id: 'team-phoenix',
  teamCode: 'TEAM-01',
  name: 'Phoenix Dynamics',
  problemStatement: 'Manual multi-cloud load re-balancing creates costly 400ms transaction spikes.',
  targetCustomer: 'Fintech and high-throughput real-time streaming platforms in India and APAC.',
  equitySoldPct: 15,
  members: mockTeamMembers,
  healthScore: 92,
  healthBreakdown: {
    financial: 88,
    product: 94,
    marketing: 90,
    teamStability: 96,
  },
  status: 'ACTIVE',
  currentRound: 'ROUND_2',
  createdAt: '2026-09-01T09:00:00.000Z',
};

// Mock Competitor Leaderboard
export const mockLeaderboard = [
  { rank: 1, teamId: 'team-phoenix', teamName: 'Phoenix Dynamics', score: 94.6, balance: 824000, product: 'ApexFlow AI' },
  { rank: 2, teamId: 'team-quantum', teamName: 'QuantumLeap', score: 91.2, balance: 750000, product: 'Q-Crypt Core' },
  { rank: 3, teamId: 'team-zenith', teamName: 'Zenith Labs', score: 88.5, balance: 690000, product: 'NeuroGrid' },
  { rank: 4, teamId: 'team-hyper', teamName: 'HyperScale', score: 85.0, balance: 520000, product: 'OrbitPay' },
  { rank: 5, teamId: 'team-nexus', teamName: 'Nexus Forge', score: 82.4, balance: 480000, product: 'CarbonPulse' },
];

// Mock Judging Criteria
export const mockJudgingCriteria: JudgingCriteria[] = [
  { id: 'crit-innovation', name: 'Product Innovation & Technical Depth', maxScore: 25, weight: 0.25 },
  { id: 'crit-viability', name: 'Market Viability & Unit Economics', maxScore: 25, weight: 0.25 },
  { id: 'crit-resilience', name: 'Execution Resilience & Crisis Handling', maxScore: 25, weight: 0.25 },
  { id: 'crit-pitch', name: 'Pitch Delivery & Executive Q&A', maxScore: 25, weight: 0.25 },
];

// Mock Announcements
export const mockAnnouncements = [
  {
    id: 'ann-1',
    title: 'Round 2: Build & Market Scarcity is Live',
    message: 'The digital market is now open for bidding. Two-Key approval is active for all transactions above ₹1,00,000.',
    type: 'INFO',
    timestamp: '2026-10-15T11:00:00.000Z',
  },
  {
    id: 'ann-2',
    title: 'Cloud Credits Demand Surge (+20%)',
    message: 'Supply constraint detected in AWS / GCP infrastructure pools. Stock remaining is limited.',
    type: 'WARNING',
    timestamp: '2026-10-15T11:20:00.000Z',
  },
];
