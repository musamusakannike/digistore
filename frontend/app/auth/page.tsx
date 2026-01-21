"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function SignUpPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"buyer" | "seller">("buyer");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { register } = useAuth();

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
            await register({ firstName, lastName, email, password, role });
            router.push("/");
        } catch (e: any) {
            setError(e?.message || "Failed to create account");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-black relative flex items-center justify-center overflow-hidden pt-14">
            {/* Background Effects */}
            <div className="absolute inset-0 grid-pattern opacity-20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gray-500/10 rounded-full blur-[100px] pointer-events-none" />

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
                        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                        <p className="text-gray-400">Join the premium marketplace for creators</p>
                    </div>

                    {error ? (
                        <div className="auth-content bg-red-500/10 border border-red-500/20 p-4 text-red-300 mb-6">
                            {error}
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Fields */}
                        <div className="auth-content flex flex-col md:flex-row gap-4">
                            <div className="flex-1 space-y-2">
                                <label htmlFor="firstName" className="text-sm font-medium text-gray-400 ml-1">First name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    placeholder="John"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-0 px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 focus:bg-white/5 transition-all"
                                    required
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <label htmlFor="lastName" className="text-sm font-medium text-gray-400 ml-1">Last name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    placeholder="Doe"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-0 px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-white/40 focus:bg-white/5 transition-all"
                                    required
                                />
                            </div>
                        </div>

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

                        <div className="auth-content space-y-2">
                            <label htmlFor="role" className="text-sm font-medium text-gray-400 ml-1">Account type</label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value as any)}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-0 px-4 py-3.5 text-white focus:outline-none focus:border-white/40 focus:bg-white/5 transition-all"
                            >
                                <option value="buyer">Buyer</option>
                                <option value="seller">Seller</option>
                            </select>
                        </div>
                        </div>

                        {/* Password */}
                        <div className="auth-content space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-gray-400 ml-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="Create a strong password"
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
                            <p className="text-xs text-gray-500 ml-1">Must be at least 8 characters long</p>
                        </div>

                        {/* Submit Button */}
                        <div className="auth-content pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-white text-black font-bold py-4 rounded-0 hover:bg-gray-200 transition-all transform hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Creating Account...</span>
                                    </>
                                ) : (
                                    <span>Sign Up</span>
                                )}
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="auth-content text-center pt-4">
                            <p className="text-gray-400 text-sm">
                                Already have an account?{" "}
                                <Link href="/auth/signin" className="text-white font-bold hover:underline">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Simple Footer Links */}
                <div className="mt-8 flex justify-center gap-6 text-xs text-gray-600 font-medium">
                    <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
                    <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
                    <Link href="/help" className="hover:text-gray-400 transition-colors">Help Center</Link>
                </div>
            </div>
        </div>
    );
}