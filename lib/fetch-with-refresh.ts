const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

/**
 * Wraps fetch with a single token-refresh retry on 401.
 * Calls POST /auth/refresh (cookie-based) then retries the original request.
 */
export async function fetchWithRefresh(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const res = await fetch(url, init);
  if (res.status !== 401) return res;

  const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!refreshRes.ok) return res;

  return fetch(url, init);
}
