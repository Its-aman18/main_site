// Main-site origin resolution for ZERO → ONE.
//
// Mirrors apps/playground/src/lib/utils.ts (getMainApiCandidates /
// getMainSiteOrigin) so zero-one validates sessions against the same main API
// and redirects to the same sign-in page. Only localhost and
// *.codescriet.dev origins are ever accepted, plus an explicit
// VITE_MAIN_API_URL override.

const CODESCRIET_API_ORIGIN = 'https://api.codescriet.dev';
const CODESCRIET_MAIN_SITE_ORIGIN = 'https://codescriet.dev';
const MAIN_API_ORIGIN_STORAGE_KEY = 'zo_main_api_origin';

function parseOrigin(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function isCodescrietHost(hostname: string): boolean {
  return hostname === 'codescriet.dev' || hostname.endsWith('.codescriet.dev');
}

function getConfiguredMainApiOrigin(): string | null {
  return parseOrigin(import.meta.env.VITE_MAIN_API_URL);
}

function isAllowedMainApiOrigin(origin: string): boolean {
  try {
    const hostname = new URL(origin).hostname.toLowerCase();
    if (isLocalHost(hostname) || isCodescrietHost(hostname)) return true;
    const configured = getConfiguredMainApiOrigin();
    if (!configured) return false;
    return new URL(configured).hostname.toLowerCase() === hostname;
  } catch {
    return false;
  }
}

function getStoredMainApiOrigin(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = parseOrigin(sessionStorage.getItem(MAIN_API_ORIGIN_STORAGE_KEY));
    if (!stored || !isAllowedMainApiOrigin(stored)) return null;
    return stored;
  } catch {
    return null;
  }
}

function getHashApiOverride(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const override = parseOrigin(params.get('api'));
    if (!override || !isAllowedMainApiOrigin(override)) return null;
    return override;
  } catch {
    return null;
  }
}

export function getMainApiCandidates(): string[] {
  const candidates: string[] = [];
  const push = (origin: string | null) => {
    if (!origin) return;
    if (!isAllowedMainApiOrigin(origin)) return;
    if (!candidates.includes(origin)) candidates.push(origin);
  };

  const currentHostname =
    typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const onCodescrietHost = !!currentHostname && isCodescrietHost(currentHostname);

  push(getHashApiOverride());
  push(getStoredMainApiOrigin());
  push(getConfiguredMainApiOrigin());

  if (onCodescrietHost) {
    push(CODESCRIET_API_ORIGIN);
  }

  if (currentHostname && isLocalHost(currentHostname)) {
    push('http://localhost:5001');
  }

  if (candidates.length === 0) {
    push(CODESCRIET_API_ORIGIN);
  }

  return candidates;
}

export function rememberMainApiOrigin(origin: string): void {
  if (typeof window === 'undefined') return;
  const parsed = parseOrigin(origin);
  if (!parsed || !isAllowedMainApiOrigin(parsed)) return;
  try {
    sessionStorage.setItem(MAIN_API_ORIGIN_STORAGE_KEY, parsed);
  } catch {
    // no-op
  }
}

export function getMainSiteOrigin(): string {
  const configured = parseOrigin(import.meta.env.VITE_MAIN_SITE_URL);
  if (configured) return configured;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (currentHostname && isLocalHost(currentHostname)) {
    return 'http://localhost:5173';
  }

  return CODESCRIET_MAIN_SITE_ORIGIN;
}
