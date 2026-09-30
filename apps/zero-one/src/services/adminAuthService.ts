import {
  AdminAuthorization,
  AdminAuditLogEntry,
  AdminAuthorizationStatus,
  CodeScrietUser,
} from '../types/index';

/**
 * Venue super-admin email. Resolves from the environment first so venues can
 * rotate it without a code change:
 * - browser (Vite): VITE_BOOTSTRAP_SUPERADMIN_EMAIL
 * - node (standalone server / Vite middleware): BOOTSTRAP_SUPERADMIN_EMAIL
 * Falls back to the built-in default for LAN / offline mode.
 */
function readEnvValue(key: string): string | undefined {
  try {
    const viteEnv = (import.meta as unknown as { env?: Record<string, string> })?.env;
    if (viteEnv && typeof viteEnv[key] === 'string' && viteEnv[key].trim()) {
      return viteEnv[key].trim();
    }
  } catch {
    // Not running under Vite — fall through to process.env.
  }
  try {
    // globalThis access (not a bare `process` reference) so browser builds
    // without @types/node still typecheck.
    const nodeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } })
      .process?.env;
    const value = nodeEnv?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  } catch {
    // Storage/env access blocked — use the fallback below.
  }
  return undefined;
}

export const BOOTSTRAP_ADMIN_EMAIL =
  readEnvValue('VITE_BOOTSTRAP_SUPERADMIN_EMAIL') ||
  readEnvValue('BOOTSTRAP_SUPERADMIN_EMAIL') ||
  'applicationinformation73737@gmail.com';

export const INITIAL_ADMIN_AUTHORIZATIONS: AdminAuthorization[] = [
  {
    id: 'auth-bootstrap-master',
    userId: 'usr-bootstrap-admin',
    email: BOOTSTRAP_ADMIN_EMAIL,
    name: 'Code.SCRIET Master Admin',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    verified: true,
    active: true,
    verifiedBy: 'SYSTEM_BOOTSTRAP',
    verifiedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    notes: 'Official permanent authoritative Super Admin for Code.SCRIET platform',
  },
  {
    id: 'auth-kavita-02',
    userId: 'usr-kavita',
    email: 'kavita@scriet.ac.in',
    name: 'Kavita Rao',
    role: 'EVENT_ADMIN',
    status: 'ACTIVE',
    verified: true,
    active: true,
    verifiedBy: BOOTSTRAP_ADMIN_EMAIL,
    verifiedAt: '2026-02-15T10:00:00.000Z',
    createdAt: '2026-02-15T10:00:00.000Z',
    updatedAt: '2026-02-15T10:00:00.000Z',
    notes: 'Technical Lead for Event Operations & Scarcity Engine',
  },
  {
    id: 'auth-rohan-03',
    userId: 'usr-rohan',
    email: 'rohan@scriet.ac.in',
    name: 'Rohan Mehta',
    role: 'EVENT_OPERATOR',
    status: 'SUSPENDED',
    verified: false,
    active: false,
    verifiedBy: BOOTSTRAP_ADMIN_EMAIL,
    verifiedAt: '2026-02-10T12:00:00.000Z',
    suspendedAt: '2026-02-24T18:00:00.000Z',
    createdAt: '2026-02-10T12:00:00.000Z',
    updatedAt: '2026-02-24T18:00:00.000Z',
    notes: 'Suspended by Super Admin due to audit token revocation',
  },
  {
    id: 'auth-vikram-04',
    userId: 'usr-vikram',
    email: 'vikram@scriet.ac.in',
    name: 'Vikram Singh',
    role: 'ADMIN',
    status: 'REVOKED',
    verified: false,
    active: false,
    verifiedBy: BOOTSTRAP_ADMIN_EMAIL,
    verifiedAt: '2026-02-01T10:00:00.000Z',
    revokedAt: '2026-02-20T16:00:00.000Z',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-20T16:00:00.000Z',
    notes: 'Access revoked by Super Admin due to squad competition conflict',
  },
];

export const INITIAL_ADMIN_AUDIT_LOGS: AdminAuditLogEntry[] = [
  {
    id: 'audit-001',
    actorUserId: 'system',
    actorEmail: 'system@scriet.dev',
    targetUserId: 'usr-bootstrap-admin',
    targetEmail: BOOTSTRAP_ADMIN_EMAIL,
    action: 'BOOTSTRAP_INITIAL_ADMIN',
    beforeStatus: 'NONE',
    afterStatus: 'SUPER_ADMIN',
    timestamp: '2026-01-01T00:00:00.000Z',
    reason: 'System bootstrap provisioning of authoritative administrator',
  },
  {
    id: 'audit-002',
    actorUserId: 'usr-bootstrap-admin',
    actorEmail: BOOTSTRAP_ADMIN_EMAIL,
    targetUserId: 'usr-kavita',
    targetEmail: 'kavita@scriet.ac.in',
    action: 'ADMIN_VERIFIED',
    beforeStatus: 'NONE',
    afterStatus: 'ACTIVE (EVENT_ADMIN)',
    timestamp: '2026-02-15T10:00:00.000Z',
    reason: 'Verified by Super Admin for technical operations',
  },
  {
    id: 'audit-003',
    actorUserId: 'usr-bootstrap-admin',
    actorEmail: BOOTSTRAP_ADMIN_EMAIL,
    targetUserId: 'usr-rohan',
    targetEmail: 'rohan@scriet.ac.in',
    action: 'ADMIN_SUSPENDED',
    beforeStatus: 'ACTIVE',
    afterStatus: 'SUSPENDED',
    timestamp: '2026-02-24T18:00:00.000Z',
    reason: 'Access suspended by Super Admin due to device token broadcast',
  },
  {
    id: 'audit-004',
    actorUserId: 'usr-bootstrap-admin',
    actorEmail: BOOTSTRAP_ADMIN_EMAIL,
    targetUserId: 'usr-vikram',
    targetEmail: 'vikram@scriet.ac.in',
    action: 'ADMIN_REVOKED',
    beforeStatus: 'ACTIVE',
    afterStatus: 'REVOKED',
    timestamp: '2026-02-20T16:00:00.000Z',
    reason: 'Revoked by Super Admin: active participating squad conflict',
  },
];

// Persona presets for testing authentication and authorization transitions
export const PRESET_USERS: {
  user: CodeScrietUser;
  label: string;
  expectedStatus: AdminAuthorizationStatus;
  badge: string;
  description: string;
}[] = [
  {
    user: {
      id: 'usr-bootstrap-admin',
      name: 'Code.SCRIET Master Admin',
      email: BOOTSTRAP_ADMIN_EMAIL,
      role: 'SUPERADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    label: 'Initial Bootstrap Super Admin',
    expectedStatus: 'ACTIVE',
    badge: 'SUPER_ADMIN',
    description: 'Permanent Super Admin. Can verify, suspend, and revoke admins.',
  },
  {
    user: {
      id: 'usr-aman-student',
      name: 'Aman Gupta',
      email: 'aman@scriet.edu',
      role: 'MEMBER',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
    label: 'Normal Student / Founder',
    expectedStatus: 'NONE',
    badge: 'MEMBER',
    description: 'Standard campus founder. Admin button hidden. No apply option.',
  },
  {
    user: {
      id: 'usr-kavita',
      name: 'Kavita Rao',
      email: 'kavita@scriet.ac.in',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    },
    label: 'Verified Event Admin',
    expectedStatus: 'ACTIVE',
    badge: 'EVENT_ADMIN',
    description: 'Super Admin verified. Admin button visible.',
  },
  {
    user: {
      id: 'usr-rohan',
      name: 'Rohan Mehta',
      email: 'rohan@scriet.ac.in',
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    label: 'Suspended Admin Account',
    expectedStatus: 'SUSPENDED',
    badge: 'SUSPENDED',
    description: 'Access suspended by Super Admin. Admin button hidden.',
  },
  {
    user: {
      id: 'usr-vikram',
      name: 'Vikram Singh',
      email: 'vikram@scriet.ac.in',
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    },
    label: 'Revoked Admin Account',
    expectedStatus: 'REVOKED',
    badge: 'REVOKED',
    description: 'Access revoked by Super Admin. Normal Code.SCRIET user.',
  },
];

// =========================================================================
// AUTHORIZATION ABSTRACTION INTERFACE (Requirement 6 & 18)
// TEMPORARY FRONTEND MOCK
// REPLACE WITH CODE.SCRIET AUTHORIZATION API IN STEP 3
// =========================================================================

export interface AuthorizationState {
  isAuthenticated: boolean;
  isVerifiedAdmin: boolean;
  authorizationLoading: boolean;
  loading: boolean; // Alias for authorizationLoading
  status: AdminAuthorizationStatus;
  role?: string;
  user?: CodeScrietUser | null;
  authorization?: AdminAuthorization | null;
}

/**
 * Returns the currently authenticated user from Code.SCRIET session.
 * Falls back to a signed-out guest — callers must not assume a user.
 */
export function getCurrentUser(): CodeScrietUser {
  try {
    const raw = localStorage.getItem('zero_one_user');
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CodeScrietUser>;
      if (parsed && typeof parsed.email === 'string' && parsed.email.includes('@')) {
        return parsed as CodeScrietUser;
      }
    }
  } catch {
    // fallback below
  }
  return {
    id: 'usr-guest',
    name: 'Guest Visitor',
    email: '',
    role: 'USER',
  };
}

/**
 * Returns the authoritative admin authorization record for an email or ID
 * TEMPORARY FRONTEND MOCK - REPLACE WITH CODE.SCRIET AUTHORIZATION API IN STEP 3
 */
export function getAdminAuthorization(emailOrId?: string): AdminAuthorization | undefined {
  const email = (emailOrId || getCurrentUser().email || '').toLowerCase().trim();
  try {
    const raw = localStorage.getItem('zero_one_admin_authorizations');
    if (raw) {
      const records: AdminAuthorization[] = JSON.parse(raw);
      return records.find((r) => r.email.toLowerCase() === email || r.userId === emailOrId);
    }
  } catch (e) {
    // fallback
  }
  return INITIAL_ADMIN_AUTHORIZATIONS.find((r) => r.email.toLowerCase() === email);
}

/**
 * Evaluates whether an email/user identity has verified active administrator status
 * TEMPORARY FRONTEND MOCK - REPLACE WITH CODE.SCRIET AUTHORIZATION API IN STEP 3
 */
export function isVerifiedAdmin(emailOrId?: string): boolean {
  const email = (emailOrId || getCurrentUser().email || '').toLowerCase().trim();
  if (email === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) return true;
  const auth = getAdminAuthorization(email);
  return Boolean(auth && (auth.status === 'ACTIVE' || auth.active));
}

