"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { apiFetch } from "../../lib/api";

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useGSAP(() => {
    gsap.fromTo(
      ".auth-content",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 },
    );
  }, { scope: containerRef });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);
      setMessage(null);
      await apiFetch(`/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
        skipAuth: true,
      });
      setMessage("Password reset successful. Redirecting...");
      setTimeout(() => router.push("/auth/signin"), 800);
    } catch (e: any) {
      setError(e?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black relative flex items-center justify-center overflow-hidden pt-14">
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gray-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div ref={containerRef} className="w-full max-w-125 p-6 relative z-10">
        <div className="glass-card rounded-0 p-8 md:p-10 border border-white/10">
          <div className="auth-content flex items-center justify-between mb-10">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white flex items-center justify-center rounded-0 group-hover:scale-105 transition-transform duration-300">
                <span className="text-black font-bold text-xl">D</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">DigiStore</span>
            </Link>
          </div>

          <div className="auth-content mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Set New Password</h1>
            <p className="text-gray-400">Create a strong password to secure your account.</p>
          </div>

          {message ? (
            <div className="auth-content bg-white/5 border border-white/10 p-4 text-white/80 mb-6">{message}</div>
          ) : null}
          {error ? (
            <div className="auth-content bg-red-500/10 border border-red-500/20 p-4 text-red-300 mb-6">{error}</div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="auth-content space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-400 ml-1">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-0 px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 focus:bg-white/5 transition-all pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 ml-1">Minimum 8 chars, with upper/lowercase, number and symbol.</p>
            </div>

            <div className="auth-content pt-2">
              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full bg-white text-black font-bold py-4 rounded-0 hover:bg-gray-200 transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <span>Update Password</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
