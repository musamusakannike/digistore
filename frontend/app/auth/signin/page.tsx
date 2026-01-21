"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useAuth } from "../../context/AuthContext";

export default function SignInPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { login } = useAuth();

    useGSAP(() => {
        gsap.fromTo(".auth-content",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1 }
        );
    }, { scope: containerRef });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setError(null);
            await login({ email, password });
            router.push("/");
        } catch (e: any) {
            setError(e?.message || "Failed to sign in");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-black relative flex items-center justify-center overflow-hidden pt-14">
            {/* Background Effects */}
            <div className="absolute inset-0 grid-pattern opacity-20" />
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-gray-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div ref={containerRef} className="w-full max-w-125 p-6 relative z-10">
                <div className="glass-card rounded-0 p-8 md:p-10 border border-white/10">
                    {/* Header */}
                    <div className="auth-content flex items-center justify-between mb-10">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-white flex items-center justify-center rounded-0 group-hover:scale-105 transition-transform duration-300">
                                <span className="text-black font-bold text-xl">D</span>
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">DigiStore</span>
                        </Link>
                    </div>

                    {/* Title */}
                    <div className="auth-content mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-gray-400">Enter your credentials to access your account</p>
                    </div>

                    {error ? (
                        <div className="auth-content bg-red-500/10 border border-red-500/20 p-4 text-red-300 mb-6">
                            {error}
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div className="auth-content space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-gray-400 ml-1">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-0 px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 focus:bg-white/5 transition-all"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="auth-content space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label htmlFor="password" className="text-sm font-medium text-gray-400">Password</label>
                                <Link href="/auth/forgot-password" className="text-xs text-white/60 hover:text-white transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                        </div>

                        {/* Submit Button */}
                        <div className="auth-content pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-white text-black font-bold py-4 rounded-0 hover:bg-gray-200 transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Signing In...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="auth-content text-center pt-4">
                            <p className="text-gray-400 text-sm">
                                Don't have an account?{" "}
                                <Link href="/auth" className="text-white font-bold hover:underline">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Simple Footer Links */}
                <div className="mt-8 flex justify-center gap-6 text-xs text-gray-600 font-medium">
                    <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
                    <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link>
                    <Link href="/help" className="hover:text-gray-400 transition-colors">Help</Link>
                </div>
            </div>
        </div>
    );
}
