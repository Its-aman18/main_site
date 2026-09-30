// ZERO → ONE main-site session token.
//
// Mirrors apps/playground/src/lib/authToken.ts: the JWT handed over from the
// main site (see services/mainSiteAuth.ts) lives in sessionStorage under
// `zo_token`. A legacy `token` value in localStorage is migrated only when it
// looks like a real JWT (three dot-separated segments) — the old
// `mock-token-*` LAN values are intentionally left alone.

const ZERO_ONE_TOKEN_KEY = 'zo_token';
const LEGACY_TOKEN_KEY = 'token';

function safeGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    // Ignore storage write failures (private mode / blocked storage).
  }
}

function safeRemove(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // Ignore storage cleanup failures.
  }
}

function looksLikeJwt(value: string): boolean {
  return value.split('.').length === 3 && value.startsWith('eyJ');
}

export function getZeroOneStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  const sessionToken = safeGet(window.sessionStorage, ZERO_ONE_TOKEN_KEY);
  if (sessionToken) return sessionToken;

  // One-time migration of a real main-site JWT left under the legacy key.
  const legacy =
    safeGet(window.sessionStorage, LEGACY_TOKEN_KEY) ||
    safeGet(window.localStorage, LEGACY_TOKEN_KEY);
  if (legacy && looksLikeJwt(legacy)) {
    safeSet(window.sessionStorage, ZERO_ONE_TOKEN_KEY, legacy);
    return legacy;
  }
  return null;
}

export function storeZeroOneToken(token: string): void {
  if (typeof window === 'undefined') return;
  safeSet(window.sessionStorage, ZERO_ONE_TOKEN_KEY, token);
}

export function clearZeroOneToken(): void {
  if (typeof window === 'undefined') return;
  safeRemove(window.sessionStorage, ZERO_ONE_TOKEN_KEY);
}
