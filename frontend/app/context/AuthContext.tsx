"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, authStorage, type AuthUser } from "../lib/api";

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (args: { email: string; password: string }) => Promise<void>;
  register: (args: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: "buyer" | "seller";
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeAuthUser(raw: any): AuthUser {
  const id = raw?.id || raw?._id;
  return {
    id: id ? String(id) : "",
    firstName: raw?.firstName || "",
    lastName: raw?.lastName || "",
    email: raw?.email || "",
    role: raw?.role || "buyer",
    isEmailVerified: !!raw?.isEmailVerified,
    avatar: raw?.avatar || undefined,
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
    const data = await apiFetch<{ user: any }>("/users/profile");
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

    authStorage.setAccessToken(data.accessToken);
    authStorage.setUser(nextUser);

    setAccessToken(data.accessToken);
    setUser(nextUser);

    if (typeof window !== "undefined" && data.refreshToken) {
      localStorage.setItem("digistore_refresh_token", data.refreshToken);
    }
  };

  const register = async ({ firstName, lastName, email, password, role }: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: "buyer" | "seller";
  }) => {
    const data = await apiFetch<{ user: AuthUser; accessToken: string; refreshToken?: string }>("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password, role }),
      skipAuth: true,
    });

    const nextUser = normalizeAuthUser(data.user);

    authStorage.setAccessToken(data.accessToken);
    authStorage.setUser(nextUser);

    setAccessToken(data.accessToken);
    setUser(nextUser);

    if (typeof window !== "undefined" && data.refreshToken) {
      localStorage.setItem("digistore_refresh_token", data.refreshToken);
    }
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      authStorage.setAccessToken(null);
      authStorage.setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("digistore_refresh_token");
      }
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
      register,
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
