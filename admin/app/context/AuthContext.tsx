"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, authStorage, type AuthUser } from "../lib/api";

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (args: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeAuthUser(raw: unknown): AuthUser {
  const obj: Record<string, unknown> = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const id = obj.id ?? obj._id;
  return {
    id: id ? String(id) : "",
    firstName: typeof obj.firstName === "string" ? obj.firstName : "",
    lastName: typeof obj.lastName === "string" ? obj.lastName : "",
    email: typeof obj.email === "string" ? obj.email : "",
    role: (obj.role === "buyer" || obj.role === "seller" || obj.role === "admin" ? obj.role : "buyer"),
    isEmailVerified: !!obj.isEmailVerified,
    avatar: typeof obj.avatar === "string" && obj.avatar ? obj.avatar : undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(authStorage.getUser());
  const [accessToken, setAccessToken] = useState<string | null>(authStorage.getAccessToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const refreshProfile = async () => {
    if (!authStorage.getAccessToken()) return;
    const data = await apiFetch<{ user: unknown }>("/users/profile");
    const nextUser = normalizeAuthUser(data.user);
    authStorage.setUser(nextUser);
    setUser(nextUser);
  };

  const login = async ({ email, password }: { email: string; password: string }) => {
    const data = await apiFetch<{ user: AuthUser; accessToken: string; refreshToken?: string }>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });

    const nextUser = normalizeAuthUser(data.user);

    if (nextUser.role !== "admin") {
      authStorage.setAccessToken(null);
      authStorage.setUser(null);
      authStorage.setRefreshToken(null);
      setAccessToken(null);
      setUser(null);
      throw new Error("Admin access only");
    }

    authStorage.setAccessToken(data.accessToken);
    authStorage.setUser(nextUser);

    setAccessToken(data.accessToken);
    setUser(nextUser);

    if (data.refreshToken) {
      authStorage.setRefreshToken(data.refreshToken);
    }
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      authStorage.setAccessToken(null);
      authStorage.setUser(null);
      authStorage.setRefreshToken(null);
      setAccessToken(null);
      setUser(null);
    }
  };

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      accessToken,
      isAuthenticated: !!user && !!accessToken,
      isLoading,
      login,
      logout,
      refreshProfile,
    };
  }, [user, accessToken, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
