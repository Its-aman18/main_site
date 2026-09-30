import { getStoredAuthToken } from './authToken';

const BASE_ZERO_ONE_URL =
  import.meta.env.VITE_ZERO_ONE_URL ||
  (import.meta.env.DEV ? 'http://localhost:5175' : 'https://zero-one.codescriet.dev');

function getBaseUrl(): string {
  return BASE_ZERO_ONE_URL.replace(/\/+$/, '');
}

function buildZeroOneUrl(path = '/'): URL {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, `${getBaseUrl()}/`);
}

function getWebApiOriginForHandoff(): string | null {
  const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (!apiBase) {
    return import.meta.env.DEV ? 'http://localhost:5001' : 'https://api.codescriet.dev';
  }
  try {
    const parsed = new URL(apiBase, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    return parsed.origin;
  } catch {
    return null;
  }
}

export function isZeroOneOrigin(origin: string): boolean {
  if (origin === getBaseUrl()) return true;
  if (import.meta.env.DEV) {
    return origin === 'http://localhost:5175' || origin === 'http://127.0.0.1:5175';
  }
  return origin === 'https://zero-one.codescriet.dev';
}

export function addZeroOneAuthHandoff(url: URL): void {
  if (!isZeroOneOrigin(url.origin) || typeof window === 'undefined') return;

  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
  const token = getStoredAuthToken();
  if (token) {
    hashParams.set('token', token);
  }

  const apiOrigin = getWebApiOriginForHandoff();
  if (apiOrigin) {
    hashParams.set('api', apiOrigin);
  }

  url.hash = hashParams.toString();
}

export function getZeroOnePublicUrl(path = '/'): string {
  return buildZeroOneUrl(path).toString();
}

/**
 * Build a zero-one URL and append the auth token in the hash for one-time
 * handoff. The hash is consumed and removed by zero-one on load
 * (see apps/zero-one/src/services/mainSiteAuth.ts).
 */
export function getZeroOneLaunchUrl(path = '/'): string {
  const url = buildZeroOneUrl(path);
  addZeroOneAuthHandoff(url);
  return url.toString();
}
