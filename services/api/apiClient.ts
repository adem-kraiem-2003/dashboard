import type { ApiError } from '@/types/api.types';
import { API_CONFIG } from '@/lib/api-config';

// ── Token helpers ─────────────────────────────────────────────────────────────

/**
 * Retrieve a specific cookie value by name.
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

// ── Error class ───────────────────────────────────────────────────────────────

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

// ── Core request ──────────────────────────────────────────────────────────────

interface RequestOptions {
  /** Attach Authorization header with the stored JWT token. Default: false */
  auth?: boolean;
  headers?: HeadersInit;
  /** Next.js ISR revalidation in seconds. Only applies to GET requests in server components. */
  revalidate?: number;
  /** Next.js cache tags for on-demand revalidation. */
  tags?: string[];
}

/**
 * Generic typed HTTP request wrapper.
 * Throws `ApiRequestError` on non-2xx responses.
 */
export async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Inject CSRF token for state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCookie('csrf_token');
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }
  }

  // Build Next.js fetch options for server-side caching (ISR)
  const fetchOptions: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  };

  // Only apply caching to GET requests on the server
  if (method === 'GET' && typeof window === 'undefined') {
    fetchOptions.next = {};
    if (options.revalidate !== undefined) {
      fetchOptions.next.revalidate = options.revalidate;
    }
    if (options.tags?.length) {
      fetchOptions.next.tags = options.tags;
    }
  }

  const response = await fetch(`${API_CONFIG.baseURL}${path}`, fetchOptions);

  if (!response.ok) {
    let apiError: ApiError = {
      message: `Request failed with status ${response.status}`,
      statusCode: response.status,
    };

    try {
      const parsed = await response.json();
      apiError = {
        message: parsed?.message ?? apiError.message,
        statusCode: response.status,
        error: parsed?.error,
      };
    } catch {
      // response body is not JSON — keep the default message
    }

    throw new ApiRequestError(apiError.message, apiError.statusCode, apiError.error);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
