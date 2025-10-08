import { API_BASE_URL } from './config';
import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from './storage';

async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (!res.ok) return null;
    const token = data?.data?.accessToken as string | undefined;
    if (token) setAccessToken(token);
    return token ?? null;
  } catch {
    return null;
  }
}

export type ApiOptions = RequestInit & { auth?: boolean };

export async function apiFetch<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = new Headers(options.headers as HeadersInit | undefined);
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  if (options.auth) {
    const token = getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const doFetch = async (): Promise<Response> => {
    return fetch(url, { ...options, headers });
  };

  let res = await doFetch();

  if (res.status === 401 && options.auth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      res = await doFetch();
    } else {
      clearTokens();
    }
  }

  let parsed: unknown = null;
  const text = await res.text();
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text as unknown; }

  if (!res.ok) {
    const anyParsed = parsed as { message?: string; error?: string } | null;
    const message = (anyParsed && (anyParsed.message || anyParsed.error)) || `Request failed with ${res.status}`;
    throw new Error(message);
  }

  const anyParsed = parsed as { data?: unknown } | null;
  return ((anyParsed && anyParsed.data !== undefined ? anyParsed.data : parsed) as unknown) as T;
}
