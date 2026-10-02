import { request, requestBlob } from './_internal';
import type {
  Event,
  EventAdminRegistration,
  EventRegistrationExportFilters,
  EventRegistrationField,
  EventRegistrationFieldType,
  Registration,
  RegistrationAdditionalFieldInput,
} from '../api';

const EVENT_REGISTRATION_FIELD_TYPES: EventRegistrationFieldType[] = [
  'TEXT',
  'TEXTAREA',
  'NUMBER',
  'EMAIL',
  'PHONE',
  'URL',
];

const isEventRegistrationFieldType = (value: string): value is EventRegistrationFieldType =>
  EVENT_REGISTRATION_FIELD_TYPES.includes(value as EventRegistrationFieldType);

function normalizeEventRegistrationFields(input: unknown): EventRegistrationField[] | undefined {
  if (!Array.isArray(input)) return undefined;

  const usedIds = new Set<string>();
  const normalized: EventRegistrationField[] = [];

  input.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') return;
    const raw = entry as Record<string, unknown>;

    const label = typeof raw.label === 'string' ? raw.label.trim() : '';
    if (!label) return;

    const rawId =
      (typeof raw.id === 'string' && raw.id.trim()) ||
      (typeof raw.key === 'string' && raw.key.trim()) ||
      `field_${index + 1}`;

    let id = rawId;
    while (usedIds.has(id)) {
      id = `${rawId}_${index + 1}`;
    }
    usedIds.add(id);

    const rawType = typeof raw.type === 'string' ? raw.type.toUpperCase() : 'TEXT';
    const type = isEventRegistrationFieldType(rawType) ? rawType : 'TEXT';

    const toOptionalNumber = (value: unknown): number | undefined =>
      typeof value === 'number' && Number.isFinite(value) ? value : undefined;

    normalized.push({
      id,
      label,
      type,
      required: Boolean(raw.required),
      placeholder: typeof raw.placeholder === 'string' ? raw.placeholder : undefined,
      minLength: toOptionalNumber(raw.minLength),
      maxLength: toOptionalNumber(raw.maxLength),
      min: toOptionalNumber(raw.min),
      max: toOptionalNumber(raw.max),
      pattern: typeof raw.pattern === 'string' ? raw.pattern : undefined,
    });
  });

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeEventPayload(event: Event): Event {
  return {
    ...event,
    registrationFields: normalizeEventRegistrationFields(
      (event as Event & { registrationFields?: unknown }).registrationFields,
    ),
  };
}

export const FAKE_ZERO_ONE_EVENT: Event = {
  id: 'evt-zero-one-2026',
  title: 'ZERO → ONE 2026: The Campus Startup Simulation Flagship',
  slug: 'zero-one-2026',
  shortDescription: 'From ideas to market leadership. An intense real-time simulation where student founder squads build, spend, trade, survive market crises, and pitch live to an executive VC jury.',
  description:
    '### The Flagship Entrepreneurial Experience\n\n' +
    '**ZERO → ONE** is the signature digital ecosystem simulation created by **Code.SCRIET** for ambitious campus founders, software engineers, and strategists. ' +
    'Teams of 4 step into executive founder seats (CEO, CFO, CTO, CMO), receive ₹10,00,000 in virtual seed capital, and compete inside a high-stakes, server-authoritative live arena.\n\n' +
    '#### How The Simulation Works\n\n' +
    '1. **Dynamic Financial Treasury:** Every expense, cloud procurement, marketing campaign, and crisis tradeoff writes immutably to your squad\'s append-only financial ledger. Purchases over ₹1,00,000 require **Two-Key Approval** (CFO proposal + CEO sign-off).\n' +
    '2. **Live Digital Asset Market:** Asset prices fluctuate dynamically based on algorithmic supply and demand shocks.\n' +
    '3. **Real-Time Crisis Engine:** Unscheduled market disruptions hit founder screens with strict 6-minute response windows.\n' +
    '4. **Pitch Defense & Jury Deliberation:** Defend your startup canvas and product prototype live on the Auditorium stage.\n\n' +
    'Click **"Enter Zero-One Arena"** to launch directly into your founder command center.',
  status: 'UPCOMING',
  startDate: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
  endDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
  registrationStartDate: new Date(Date.now() - 7 * 86400 * 1000).toISOString(),
  registrationEndDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  venue: 'Main Auditorium & Innovation Lab A, SCRIET, CCS University Meerut',
  location: 'SCRIET Campus, Chaudhary Charan Singh University, Meerut (UP)',
  eventType: 'Flagship Competition',
  targetAudience: 'Student Founders, Software Engineers, Financial Strategists (Squads of 1–4)',
  capacity: 500,
  imageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80',
  imageGallery: [
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
  ],
  tags: ['zero-one', 'flagship', 'simulation', 'startup', 'arena', 'fintech', 'venture-capital'],
  featured: true,
  teamRegistration: true,
  teamMinSize: 1,
  teamMaxSize: 4,
  isRegistered: true,
  createdBy: '7b9962b4-a08c-4d24-9f28-8c722d81d20f',
  _count: { registrations: 64 },
  spotsRemaining: 436,
  agenda:
    '### Comprehensive Event Schedule\n\n' +
    '- **Round 1: Genesis & Treasury Setup (25 mins)**\n' +
    '  - Squad identity registration, device binding, and role claiming (CEO, CFO, CTO, CMO).\n' +
    '  - Initial seed disbursement of ₹10,00,000 into team ledger.\n\n' +
    '- **Round 2: Build & Live Market Scarcity (30 mins)**\n' +
    '  - Dynamic procurement of cloud credits, dev talent, legal compliance, and customer surveys.\n' +
    '  - Real-time price shocks and stock constraint management.\n\n' +
    '- **Round 3: Crisis Engine & Market Resilience (20 mins)**\n' +
    '  - High-severity flash crises dispatched to squad hubs with strict 6-minute resolution clocks.\n' +
    '  - Trade-off evaluation balancing cash runway against startup health score.\n\n' +
    '- **Round 4: Pitch Defense & Grand Reveal (45 mins)**\n' +
    '  - 3-minute executive pitch defense before the VC and alumni judging panel.\n' +
    '  - Synchronized live leaderboard reveal on the Main Auditorium screen.',
  learningOutcomes:
    'Hands-on mastery of startup runway forecasting, crisis decision-making under intense time pressure, two-key governance, unit economics, and venture capital pitch defense.',
  highlights: '₹10,00,000 Starting Virtual Capital • Live Order Book • 6-Minute Surge Crises • Executive VC Jury • CCSU Auditorium Live Screen • Instant Certificate Generation',
  speakers: [
    {
      name: 'Prof. S. K. Sharma',
      role: 'Head of Innovation & Venture Jury Chair',
      bio: 'Former Technology Director and Venture Advisor with 22+ years evaluating deep-tech and enterprise startups.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Ananya Verma',
      role: 'Principal Partner, Matrix Capital & SCRIET Alumni',
      bio: 'Early-stage angel investor backing B2B SaaS and consumer tech unicorns across South Asia.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    },
    {
      name: 'Rahul Deshmukh',
      role: 'Founder & CTO, CloudMatrix (Y Combinator W22)',
      bio: 'Scaled distributed cloud infra from 0 to 500,000 DAU. Mentoring student engineering squads.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    },
  ],
  resources: [
    {
      title: 'ZERO → ONE Official Rulebook v2.4',
      url: 'http://localhost:5175/#rules',
      type: 'pdf',
    },
    {
      title: 'Financial Runway & Unit Economics Template',
      url: 'http://localhost:5175/#ledger',
      type: 'slides',
    },
    {
      title: 'Pitch Defense Framework & Scoring Rubric',
      url: 'http://localhost:5175/#pitch',
      type: 'link',
    },
    {
      title: 'Live Arena Auditorium Screen',
      url: 'http://localhost:5175/#live-screen',
      type: 'link',
    },
  ],
  faqs: [
    {
      question: 'What is ZERO → ONE and who can participate?',
      answer: 'ZERO → ONE is Code.SCRIET’s flagship interactive startup simulation. All university students (Year 1–4 across Engineering, IT, and Management) can participate in squads of 1 to 4 founders.',
    },
    {
      question: 'How do I access the simulation arena?',
      answer: 'Click the "Enter Zero-One Arena" button on this page or visit http://localhost:5175/#onboarding. Your squad, role, and capital will be synced automatically.',
    },
    {
      question: 'What is the Two-Key Financial Approval rule?',
      answer: 'Any capital allocation of ₹1,00,000 or greater requires formal Two-Key authorization: proposed by the CFO and approved by the CEO before ledger execution.',
    },
    {
      question: 'How are winners evaluated?',
      answer: 'Squads are ranked by an authoritative formula combining final capital balance, business health score (financial, product, marketing, team stability), crisis resilience, and live jury pitch scores.',
    },
  ],
};

export const eventsApi = {
  getEvents: async (status?: string) => {
    try {
      const params = status ? `?status=${status}` : '';
      const events = await request<Event[]>(`/events${params}`);
      const normalized = events.map((event) => normalizeEventPayload(event));
      const hasZeroOne = normalized.some(
        (e) => e.slug === 'zero-one' || e.slug === 'zero-one-2026' || (e.tags || []).includes('zero-one')
      );
      if (!hasZeroOne) {
        normalized.unshift(FAKE_ZERO_ONE_EVENT);
      }
      return normalized;
    } catch {
      return [FAKE_ZERO_ONE_EVENT];
    }
  },
  getEvent: async (id: string, token?: string) => {
    if (id === 'zero-one' || id === 'zero-one-2026' || id === 'evt-zero-one-2026') {
      try {
        return normalizeEventPayload(await request<Event>(`/events/${id}`, token ? { token } : {}));
      } catch {
        return FAKE_ZERO_ONE_EVENT;
      }
    }
    try {
      return normalizeEventPayload(await request<Event>(`/events/${id}`, token ? { token } : {}));
    } catch (err) {
      if (id.toLowerCase().includes('zero')) {
        return FAKE_ZERO_ONE_EVENT;
      }
      throw err;
    }
  },
  createEvent: (data: Partial<Event>, token: string) =>
    request<Event>('/events', { method: 'POST', body: JSON.stringify(data), token }),
  updateEvent: (id: string, data: Partial<Event>, token: string) =>
    request<Event>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),
  deleteEvent: (id: string, token: string) =>
    request(`/events/${id}`, { method: 'DELETE', token }),
  getEventRegistrations: (eventId: string, token: string) =>
    request<EventAdminRegistration[]>(`/events/${eventId}/registrations`, { token }),
  getEventRegistrationStats: (eventId: string, token: string) =>
    request<{ total: number; participants: number; guests: number; attended: number }>(
      `/events/${eventId}/registrations/stats`,
      { token },
    ),
  deleteEventRegistration: (eventId: string, registrationId: string, token: string) =>
    request(`/events/${eventId}/registrations/${registrationId}`, { method: 'DELETE', token }),
  exportEventRegistrations: async (
    eventId: string,
    token: string,
    options?: { format?: 'xlsx' | 'csv'; filters?: EventRegistrationExportFilters },
  ) => {
    const params = new URLSearchParams();
    if (options?.format) {
      params.set('format', options.format);
    }

    const filters = options?.filters;
    if (filters?.year) params.set('year', filters.year);
    if (filters?.branch) params.set('branch', filters.branch);
    if (filters?.course) params.set('course', filters.course);
    if (filters?.userRole) params.set('userRole', filters.userRole);
    if (filters?.registrationType) params.set('registrationType', filters.registrationType);
    if (filters?.search) params.set('search', filters.search);

    const queryString = params.toString();
    return requestBlob(
      `/events/${eventId}/registrations/export${queryString ? `?${queryString}` : ''}`,
      { token },
    );
  },

  // Registrations
  registerForEvent: (
    eventId: string,
    token: string,
    additionalFields?: RegistrationAdditionalFieldInput[],
  ) =>
    request<Registration>(`/registrations/events/${eventId}`, {
      method: 'POST',
      body: JSON.stringify({
        ...(additionalFields ? { additionalFields } : {}),
      }),
      token,
    }),
  cancelRegistration: (eventId: string, token: string) =>
    request(`/registrations/events/${eventId}`, { method: 'DELETE', token }),
  getMyRegistrations: (token: string) =>
    request<Registration[]>('/registrations/my', { token }),
} as const;
