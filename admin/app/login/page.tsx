"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      await login({ email, password });
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">DigiStore Admin</h1>
          <p className="mt-1 text-sm text-zinc-400">Sign in with an admin account</p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-200">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="h-11 w-full rounded-lg border border-white/10 bg-zinc-950/40 px-3 text-sm outline-none focus:border-white/20"
              placeholder="admin@digistore.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-200">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="h-11 w-full rounded-lg border border-white/10 bg-zinc-950/40 px-3 text-sm outline-none focus:border-white/20"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-lg bg-white text-zinc-950 text-sm font-medium disabled:opacity-70"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-xs text-zinc-500">
          API base: <span className="text-zinc-400">{process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}</span>
        </div>
      </div>
    </div>
  );
}
