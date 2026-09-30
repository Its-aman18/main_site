// ZERO → ONE API base resolution.
//
// Same-origin by default (dev Vite middleware on :5175 and the prod
// standalone server on :5003 both serve /api from the same origin, so no
// CORS is involved). Set VITE_ZERO_ONE_API_URL only when the frontend and
// the backend run on different origins (split dev setup).

function parseOrigin(raw: string | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim().replace(/\/+$/, '');
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function getZeroOneApiBase(): string {
  if (typeof window !== 'undefined') {
    try {
      const override = parseOrigin(
        new URLSearchParams(window.location.search).get('zero_one_api') || undefined
      );
      if (override) return override;
    } catch {
      // ignore malformed query strings
    }
  }
  return parseOrigin(import.meta.env.VITE_ZERO_ONE_API_URL) || '';
}

export function resolveApiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getZeroOneApiBase()}${normalized}`;
}
