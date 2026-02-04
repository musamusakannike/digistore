export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type ApiFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  skipAuth?: boolean;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

const ACCESS_TOKEN_KEY = "digistore_access_token";
const USER_KEY = "digistore_user";
const REFRESH_TOKEN_KEY = "digistore_refresh_token";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  isEmailVerified: boolean;
  avatar?: string;
};

export const authStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token: string | null) {
    if (typeof window === "undefined") return;
    if (!token) localStorage.removeItem(ACCESS_TOKEN_KEY);
    else localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  getUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },
  setUser(user: AuthUser | null) {
    if (typeof window === "undefined") return;
    if (!user) localStorage.removeItem(USER_KEY);
    else localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token: string | null) {
    if (typeof window === "undefined") return;
    if (!token) localStorage.removeItem(REFRESH_TOKEN_KEY);
    else localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
};

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = authStorage.getRefreshToken();

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
    credentials: "include",
  });

  const json = await res.json();
  if (!res.ok || !json?.success) return null;

  const token = json?.data?.accessToken as string | undefined;
  return token || null;
}

async function apiRequest(path: string, options: ApiFetchOptions = {}) {
  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };

  const token = authStorage.getAccessToken();
  if (!options.skipAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const doFetch = async (): Promise<Response> => {
    return fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  let res = await doFetch();

  if (res.status === 401 && !options.skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      authStorage.setAccessToken(newToken);
      headers.Authorization = `Bearer ${newToken}`;
      res = await doFetch();
    }
  }

  const json = await res.json();

  if (!res.ok || !json?.success) {
    const message = json?.error || json?.message || "Request failed";
    throw new Error(message);
  }

  return json as {
    success: true;
    message?: string;
    data?: unknown;
    pagination?: Pagination;
  };
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const json = await apiRequest(path, options);
  return json.data as T;
}

export async function apiFetchEnvelope<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<{ data: T; pagination?: Pagination; message?: string }> {
  const json = await apiRequest(path, options);
  return {
    data: json.data as T,
    pagination: json.pagination,
    message: json.message,
  };
}
