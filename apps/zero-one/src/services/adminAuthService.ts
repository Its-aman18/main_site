import {
  AdminAuthorization,
  AdminAuditLogEntry,
  AdminAuthorizationStatus,
  AdminPermissionRole,
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
  readEnvValue('BOOTSTRAP_SUPERADMIN_EMAIL') ||
  readEnvValue('SUPER_ADMIN_EMAIL') ||
  readEnvValue('VITE_BOOTSTRAP_SUPERADMIN_EMAIL') ||
  'applicationinformation73737@gmail.com';

// Parse optional comma-separated ADMIN_EMAILS / EXTRA_ADMIN_EMAILS from environment
const rawExtraAdminEmails =
  readEnvValue('ADMIN_EMAILS') ||
  readEnvValue('EXTRA_ADMIN_EMAILS') ||
  readEnvValue('VITE_ADMIN_EMAILS') ||
  '';

const parsedExtraAdmins: AdminAuthorization[] = rawExtraAdminEmails
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter((e) => e.length > 3 && e.includes('@'))
  .map((email, idx) => ({
    id: `auth-env-admin-${idx + 1}`,
    userId: `usr-env-admin-${idx + 1}`,
    email,
    name: email.split('@')[0],
    role: 'ADMIN' as AdminPermissionRole,
    status: 'ACTIVE' as const,
    verified: true,
    active: true,
    verifiedBy: 'SYSTEM_ENV',
    verifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Configured via ADMIN_EMAILS environment variable',
  }));

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
    id: 'auth-root-seed-admin',
    userId: 'usr-root-admin',
    email: 'admin@example.com',
    name: 'Code.SCRIET Seed Super Admin',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    verified: true,
    active: true,
    verifiedBy: 'SYSTEM_BOOTSTRAP',
    verifiedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    notes: 'Default root seed super admin from .env',
  },
  ...parsedExtraAdmins,
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
    afterStatus: 'ACTIVE (SUPER_ADMIN)',
    timestamp: '2026-01-01T00:00:00.000Z',
    reason: 'System bootstrap provisioning of authoritative administrator',
  },
];

// Presets for testing authentication and authorization transitions
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
      id: 'usr-root-admin',
      name: 'Code.SCRIET Seed Admin',
      email: 'admin@example.com',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    label: 'Platform Super Admin',
    expectedStatus: 'ACTIVE',
    badge: 'SUPER_ADMIN',
    description: 'Platform Super Admin from root environment.',
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
  if (email === BOOTSTRAP_ADMIN_EMAIL.toLowerCase() || email === 'admin@example.com') return true;
  const auth = getAdminAuthorization(email);
  return Boolean(auth && (auth.status === 'ACTIVE' || auth.active));
}

