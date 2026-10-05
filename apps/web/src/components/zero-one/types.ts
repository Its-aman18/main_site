export type ZeroOneView =
  | 'landing'
  | 'game'
  | 'map'
  | 'dashboard'
  | 'level'
  | 'team'
  | 'rankings'
  | 'register'
  | 'profile'
  | 'mission-control'
  | 'final-summary';

export type MissionNodeStatus = 'LOCKED' | 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'FAILED';

export interface MissionObjective {
  id: string;
  label: string;
  completed: boolean;
}

export interface ZeroOneLevelConfig {
  levelNumber: number;
  code: 'DISCOVER' | 'BUILD' | 'VALIDATE' | 'GROW' | 'SCALE' | 'FINAL';
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  iconName: 'Lightbulb' | 'Wrench' | 'Users' | 'TrendingUp' | 'Rocket' | 'Trophy';
  rewardXP: number;
  rewardScore: number;
  estimatedMinutes: number;
  objectives: MissionObjective[];
  defaultStatus: MissionNodeStatus;
}

export const ZERO_ONE_LEVELS: ZeroOneLevelConfig[] = [
  {
    levelNumber: 1,
    code: 'DISCOVER',
    title: 'DISCOVER',
    subtitle: 'Find the problem and validate the idea',
    tagline: 'Level 01 • Genesis & Problem Identification',
    description:
      'Every startup begins with a problem. Research target personas, calculate addressable market size (TAM/SAM/SOM), articulate your value proposition, and establish problem-solution fit.',
    iconName: 'Lightbulb',
    rewardXP: 250,
    rewardScore: 100,
    estimatedMinutes: 30,
    objectives: [
      { id: 'l1-o1', label: 'Define the core problem statement', completed: true },
      { id: 'l1-o2', label: 'Map primary and secondary user personas', completed: true },
      { id: 'l1-o3', label: 'Formulate value proposition and USP', completed: true },
      { id: 'l1-o4', label: 'Submit problem discovery pitch summary', completed: true },
    ],
    defaultStatus: 'COMPLETED',
  },
  {
    levelNumber: 2,
    code: 'BUILD',
    title: 'BUILD',
    subtitle: 'Turn idea into working solution',
    tagline: 'Level 02 • Architecture & MVP Development',
    description:
      'Build your MVP. Allocate your starting capital of ₹10,00,000 across product, technology, marketing, team, and operations, and prioritize essential features within strict budget constraints.',
    iconName: 'Wrench',
    rewardXP: 500,
    rewardScore: 250,
    estimatedMinutes: 60,
    objectives: [
      { id: 'l2-o1', label: 'Allocate ₹10,00,000 startup capital across departments', completed: true },
      { id: 'l2-o2', label: 'Prioritize core MVP features within remaining runway', completed: true },
      { id: 'l2-o3', label: 'Build initial clickable prototype or working code solution', completed: false },
      { id: 'l2-o4', label: 'Submit technical architecture & MVP demo deliverables', completed: false },
    ],
    defaultStatus: 'ACTIVE',
  },
  {
    levelNumber: 3,
    code: 'VALIDATE',
    title: 'VALIDATE',
    subtitle: 'Test with real users and get feedback',
    tagline: 'Level 03 • Market Feedback & Metric Consequence',
    description:
      'Test whether the startup actually works. Listen to simulated customer critiques, optimize pricing, calibrate marketing distribution, and watch metrics dynamically respond.',
    iconName: 'Users',
    rewardXP: 750,
    rewardScore: 350,
    estimatedMinutes: 45,
    objectives: [
      { id: 'l3-o1', label: 'Review customer friction points & pricing feedback', completed: false },
      { id: 'l3-o2', label: 'Execute strategic repositioning & pricing lever', completed: false },
      { id: 'l3-o3', label: 'Achieve >15% conversion and >70 satisfaction score', completed: false },
      { id: 'l3-o4', label: 'Submit validation synthesis report to Mission Control', completed: false },
    ],
    defaultStatus: 'LOCKED',
  },
  {
    levelNumber: 4,
    code: 'GROW',
    title: 'GROW',
    subtitle: 'Improve and scale your solution',
    tagline: 'Level 04 • Growth Engine & Crisis Survival',
    description:
      'Grow the startup under intense market pressure. Manage customer acquisition costs, sustain monthly runway, and resolve flash crises like competitor launches and server outages.',
    iconName: 'TrendingUp',
    rewardXP: 1000,
    rewardScore: 500,
    estimatedMinutes: 40,
    objectives: [
      { id: 'l4-o1', label: 'Scale active customer base to 1,000+ founders', completed: false },
      { id: 'l4-o2', label: 'Defend against competitor market disruption alert', completed: false },
      { id: 'l4-o3', label: 'Recover from critical infrastructure server outage', completed: false },
      { id: 'l4-o4', label: 'Sustain positive unit economics with controlled burn rate', completed: false },
    ],
    defaultStatus: 'LOCKED',
  },
  {
    levelNumber: 5,
    code: 'SCALE',
    title: 'SCALE',
    subtitle: 'Launch and pitch to the world',
    tagline: 'Level 05 • Global Launch & Strategic Scaling',
    description:
      'Take the startup from growth to scale. Choose your financing strategy (Bootstrap, Angel, VC), execute multi-region expansion, and counter aggressive competitor mega-rounds.',
    iconName: 'Rocket',
    rewardXP: 1250,
    rewardScore: 750,
    estimatedMinutes: 45,
    objectives: [
      { id: 'l5-o1', label: 'Select optimal capitalization model (Angel vs VC)', completed: false },
      { id: 'l5-o2', label: 'Expand geographic footprint from Campus to National', completed: false },
      { id: 'l5-o3', label: 'Formulate defense counter-strike to ₹5 Cr competitor round', completed: false },
      { id: 'l5-o4', label: 'Reach ₹5 Crore+ enterprise valuation threshold', completed: false },
    ],
    defaultStatus: 'LOCKED',
  },
  {
    levelNumber: 6,
    code: 'FINAL',
    title: 'ZERO → ONE',
    subtitle: 'Ultimate Pitch & VC Defense',
    tagline: 'Final Mission • The Auditorium Grand Stage',
    description:
      'Defend your complete venture on stage before the VC jury and alumni executive board. Present your traction, live demo, and vision to achieve ZERO → ONE.',
    iconName: 'Trophy',
    rewardXP: 2500,
    rewardScore: 1500,
    estimatedMinutes: 60,
    objectives: [
      { id: 'l6-o1', label: 'Deliver 3-minute executive pitch deck on stage', completed: false },
      { id: 'l6-o2', label: 'Demonstrate live product prototype to VC jury', completed: false },
      { id: 'l6-o3', label: 'Field technical and financial scrutiny Q&A', completed: false },
      { id: 'l6-o4', label: 'Unlock ZERO → ONE certified founder credential', completed: false },
    ],
    defaultStatus: 'LOCKED',
  },
];

export interface LeaderboardTeamEntry {
  rank: number;
  teamId: string;
  teamName: string;
  points: number;
  level: number;
  status: 'Active' | 'Under Review' | 'Completed';
  isCurrentTeam?: boolean;
}

export interface PlayerBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Interactive Simulation Game Types & Decision State

export interface SimulationState {
  capital: number;           // e.g. Starting ₹10,00,000, currently ₹7,50,000
  score: number;             // e.g. 1,240 XP
  customers: number;         // e.g. 1,420
  revenue: number;           // Monthly Revenue e.g. ₹1,80,000
  burnRate: number;          // e.g. ₹65,000
  valuation: number;         // e.g. ₹4,20,00,000
  marketShare: number;       // e.g. 14%
  satisfaction: number;      // e.g. 74
  conversionRate: number;    // e.g. 19%
  researchPoints: number;    // e.g. 85 / 100
  
  // Level 1 Discover State
  selectedProblemId: string | null;
  discoverResearchFocus: 'CUSTOMER' | 'MARKET' | 'COMPETITION' | 'OPPORTUNITY';
  level1Submitted: boolean;

  // Level 2 Build State
  budget: {
    product: number;
    technology: number;
    marketing: number;
    team: number;
    operations: number;
  };
  features: {
    auth: boolean;
    productListing: boolean;
    aiRecommendation: boolean;
    analytics: boolean;
    mobileApp: boolean;
  };
  level2Submitted: boolean;

  // Level 3 Validate State
  priceModel: 'FREE' | 'LOW' | 'PREMIUM';
  marketingChannel: 'ORGANIC' | 'CAMPUS_AMBASSADORS' | 'PAID_ADS';
  targetSegment: 'STUDENTS' | 'FACULTY' | 'ENTERPRISES';
  level3Submitted: boolean;

  // Level 4 Grow State
  activeCrisisId: 'COMPETITOR' | 'SERVER' | 'TALENT' | null;
  crisisChoice: string | null;
  level4Submitted: boolean;

  // Level 5 Scale State
  fundingStrategy: 'BOOTSTRAP' | 'ANGEL' | 'VENTURE_CAPITAL';
  marketExpansion: 'CITY' | 'STATE' | 'NATIONAL' | 'GLOBAL';
  scaleCompetitorResponse: 'RAISE_FUNDING' | 'EXPAND_MARKET' | 'DEFEND_MARKET' | 'ACQUIRE_COMPETITOR';
  level5Submitted: boolean;

  // Final Summary Scores
  breakdown: {
    discover: number;
    build: number;
    validate: number;
    grow: number;
    scale: number;
    finalScore: number;
  };
}

export const INITIAL_SIMULATION_STATE: SimulationState = {
  capital: 750000,
  score: 1240,
  customers: 1420,
  revenue: 180000,
  burnRate: 65000,
  valuation: 42000000,
  marketShare: 14,
  satisfaction: 74,
  conversionRate: 19,
  researchPoints: 85,

  selectedProblemId: 'prob-b',
  discoverResearchFocus: 'CUSTOMER',
  level1Submitted: true,

  budget: {
    product: 200000,
    technology: 250000,
    marketing: 150000,
    team: 200000,
    operations: 100000,
  },
  features: {
    auth: true,
    productListing: true,
    aiRecommendation: false,
    analytics: false,
    mobileApp: false,
  },
  level2Submitted: false,

  priceModel: 'LOW',
  marketingChannel: 'CAMPUS_AMBASSADORS',
  targetSegment: 'STUDENTS',
  level3Submitted: false,

  activeCrisisId: 'COMPETITOR',
  crisisChoice: null,
  level4Submitted: false,

  fundingStrategy: 'VENTURE_CAPITAL',
  marketExpansion: 'NATIONAL',
  scaleCompetitorResponse: 'EXPAND_MARKET',
  level5Submitted: false,

  breakdown: {
    discover: 82,
    build: 91,
    validate: 76,
    grow: 88,
    scale: 94,
    finalScore: 86.2,
  },
};
