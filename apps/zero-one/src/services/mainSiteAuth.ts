// Main-site session handoff for ZERO → ONE.
//
// Mirrors the playground AuthContext flow (apps/playground/src/context/
// AuthContext.tsx): the main site links to zero-one with the JWT in the URL
// hash (`#token=<jwt>&api=<apiOrigin>` — see apps/web/src/lib/zeroOneUrl.ts).
// This module consumes that hash once, validates the token against the main
// API (/api/auth/me, cookie fallback included), and returns the verified
// main-site identity. When no handoff is present (LAN / venue mode) it
// returns null and the simulation keeps its local personas.

import { getMainApiCandidates, rememberMainApiOrigin, getLoginUrl } from '../lib/mainSite';
import { clearZeroOneToken, storeZeroOneToken, getZeroOneStoredToken } from '../lib/authToken';

export { getLoginUrl };

export interface MainSiteIdentity {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  token: string;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload = ''] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isExpiredToken(token: string): boolean {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== 'number') return false;
  return exp * 1000 <= Date.now();
}

/** Read `#token` / `#api` from the URL hash once, persist, strip from URL. */
function consumeHashToken(): { token: string | null; api: string | null } {
  try {
    const hash = window.location.hash;
    if (!hash) return { token: null, api: null };
    const params = new URLSearchParams(hash.slice(1));
    const token = params.get('token');
    const api = params.get('api');
    if (token) storeZeroOneToken(token);
    if (api) rememberMainApiOrigin(api);
    if (token || api) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    return { token, api };
  } catch {
    return { token: null, api: null };
  }
}

async function fetchMe(
  apiOrigin: string,
  jwt?: string | null
): Promise<{ user: Record<string, unknown> | null; token?: string; status: number }> {
  try {
    const headers: Record<string, string> = {};
    if (jwt) headers.Authorization = `Bearer ${jwt}`;
    const res = await fetch(`${apiOrigin}/api/auth/me`, { headers, credentials: 'include' });
    if (!res.ok) {
      // Stale bearer: retry once with cookies only.
      if (jwt && res.status === 401) {
        const retry = await fetch(`${apiOrigin}/api/auth/me`, { credentials: 'include' });
        if (!retry.ok) return { user: null, status: retry.status };
        const data = await retry.json().catch(() => null);
        const user = (data?.data || data?.user || null) as Record<string, unknown> | null;
        return { user, token: typeof data?.token === 'string' ? data.token : undefined, status: retry.status };
      }
      return { user: null, status: res.status };
    }
    const data = await res.json().catch(() => null);
    const user = (data?.data || data?.user || null) as Record<string, unknown> | null;
    return { user, token: typeof data?.token === 'string' ? data.token : undefined, status: res.status };
  } catch {
    return { user: null, status: 0 };
  }
}

function toIdentity(user: Record<string, unknown>, token: string): MainSiteIdentity | null {
  const id = (user.id ?? user.userId) as string | undefined;
  const email = user.email as string | undefined;
  const role = user.role as string | undefined;
  if (!id || !email || !role) return null;
  const name =
    (user.name as string | undefined) || email.split('@')[0] || 'Code.SCRIET Member';
  return {
    id,
    name,
    email,
    role,
    avatar: (user.avatar as string | null | undefined) ?? null,
    token,
  };
}

/**
 * Consume a main-site handoff (if present) or validate existing stored session.
 * Keeps authentication state consistent across refresh/navigation.
 */
export async function consumeMainSiteHandoff(): Promise<MainSiteIdentity | null> {
  if (typeof window === 'undefined') return null;
  const { token: hashToken } = consumeHashToken();
  const candidateToken = hashToken || getZeroOneStoredToken();
  if (!candidateToken || isExpiredToken(candidateToken)) {
    if (candidateToken) clearZeroOneToken();
    return null;
  }

  let sawReachable = false;

  // First check zero-one local backend /api/auth/me which cryptographically verifies the session
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${candidateToken}` },
      credentials: 'include',
    });
    if (res.ok) {
      sawReachable = true;
      const data = await res.json();
      if (data && data.authenticated && data.user) {
        storeZeroOneToken(candidateToken);
        return toIdentity(data.user, candidateToken);
      }
    }
  } catch {
    // Proceed to check main API candidates
  }

  for (const apiOrigin of getMainApiCandidates()) {
    const result = await fetchMe(apiOrigin, candidateToken);
    if (result.status !== 0) sawReachable = true;
    if (result.user) {
      rememberMainApiOrigin(apiOrigin);
      const resolved = result.token || candidateToken;
      storeZeroOneToken(resolved);
      return toIdentity(result.user, resolved);
    }
  }

  // Token rejected by every reachable host — drop it
  if (sawReachable) clearZeroOneToken();
  return null;
}
