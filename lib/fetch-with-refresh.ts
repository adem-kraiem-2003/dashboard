const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

function withCsrf(init: RequestInit): RequestInit {
  if (typeof window === 'undefined') return init;
  const method = (init.method ?? 'GET').toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return init;

  const value = `; ${document.cookie}`;
  const parts = value.split('; csrf_token=');
  const token = parts.length === 2 ? parts.pop()?.split(';').shift() : null;
  if (!token) return init;

  const existingHeaders = new Headers(init.headers);
  existingHeaders.set('x-csrf-token', token);
  return { ...init, headers: existingHeaders };
}

/**
 * Wraps fetch with automatic CSRF header injection and a single token-refresh
 * retry on 401. Calls POST /auth/refresh (cookie-based) then retries.
 */
export async function fetchWithRefresh(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const res = await fetch(url, withCsrf(init));
  if (res.status !== 401) return res;

  const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!refreshRes.ok) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return res;
  }

  return fetch(url, withCsrf(init));
}
