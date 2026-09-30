// =========================================================================
// ZERO → ONE EVENT CONFIGURATION SPECIFICATION
// Centralized configuration for dates, venue, team size, rounds, and rules.
// FRONTEND MOCK DATA - REPLACE WITH CODE.SCRIET API IN STEP 3
// =========================================================================

export interface ZeroOneEventConfig {
  id: string;
  name: string;
  slug: string;
  edition: string;
  tagline: string;
  dates: {
    start: string;
    end: string;
    displayDate: string;
  };
  venue: {
    campus: string;
    building: string;
    auditorium: string;
    displayLocation: string;
  };
  teamRequirements: {
    minMembers: number;
    maxMembers: number;
    requiredRoles: ('CEO' | 'CFO' | 'CTO' | 'CMO')[];
  };
  economics: {
    initialVirtualCapital: number; // in INR
    initialCapitalDisplay: string;
    twoKeyThreshold: number; // Purchases >= threshold require CEO + CFO approval
    twoKeyThresholdDisplay: string;
    undoWindowSeconds: number;
  };
  rounds: {
    id: string;
    number: number;
    name: string;
    description: string;
    durationMinutes: number;
  }[];
  rules: {
    category: string;
    rulesList: string[];
  }[];
}

export const ZERO_ONE_CONFIG: ZeroOneEventConfig = {
  id: 'zero-one-2026',
  name: 'ZERO → ONE',
  slug: 'zero-one',
  edition: 'Flagship Edition 2026',
  tagline: 'From ideas to startups. The flagship campus simulation event.',
  dates: {
    start: '2026-10-15T09:00:00.000Z',
    end: '2026-10-16T18:00:00.000Z',
    displayDate: 'October 15 – 16, 2026',
  },
  venue: {
    campus: 'Chhatrapati Shahu Ji Maharaj University (CSJMU)',
    building: 'School of Chemical Sciences & IT (SCRIET)',
    auditorium: 'Auditorium Hall A & Digital Labs',
    displayLocation: 'Main SCRIET Auditorium & Innovation Lab',
  },
  teamRequirements: {
    minMembers: 4,
    maxMembers: 4,
    requiredRoles: ['CEO', 'CFO', 'CTO', 'CMO'],
  },
  economics: {
    initialVirtualCapital: 1000000,
    initialCapitalDisplay: '₹10,00,000',
    twoKeyThreshold: 100000,
    twoKeyThresholdDisplay: '₹1,00,000',
    undoWindowSeconds: 60,
  },
  rounds: [
    {
      id: 'round-1',
      number: 1,
      name: 'Ideation & Formation',
      description: 'Squad lock-in, role appointment, and initial balance disbursement.',
      durationMinutes: 25,
    },
    {
      id: 'round-2',
      number: 2,
      name: 'Build & Market Scarcity',
      description: 'Dynamic digital market bidding, infrastructure unlock, and asset accumulation.',
      durationMinutes: 30,
    },
    {
      id: 'round-3',
      number: 3,
      name: 'Crisis Surge & Resilience',
      description: 'Unscheduled scenario injects requiring role-specific trade-offs within 6 minutes.',
      durationMinutes: 20,
    },
    {
      id: 'round-4',
      number: 4,
      name: 'Auditorium Pitching & Reveal',
      description: 'Final 3-minute executive pitch before jury and live scoreboard lock.',
      durationMinutes: 45,
    },
  ],
  rules: [
    {
      category: 'Squad Integrity',
      rulesList: [
        'Teams must consist of exactly 4 members with uniquely assigned roles (CEO, CFO, CTO, CMO).',
        'Cross-team asset trading must occur through verified transaction offers with explicit counterparty consent.',
      ],
    },
    {
      category: 'Financial Governance',
      rulesList: [
        'Every team starts with ₹10,00,000 in virtual capital.',
        'Purchases equal to or exceeding ₹1,00,000 mandate Two-Key confirmation (CFO proposal + CEO approval).',
        'Uncommitted purchase intents may be cancelled within the 60-second undo window.',
      ],
    },
    {
      category: 'Crisis Protocol',
      rulesList: [
        'Surge crises have a strict 6-minute expiration clock.',
        'Unresolved crises incur automatic 15% team health decay upon timeout.',
      ],
    },
  ],
};
