"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { apiFetch } from "../../../lib/api";

export default function VerifyEmailPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;

  const [isLoading, setIsLoading] = useState(true);
  const [ok, setOk] = useState<boolean | null>(null);
  const [message, setMessage] = useState("Verifying email...");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setOk(false);
      setMessage("Missing verification token.");
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        await apiFetch(`/auth/verify-email/${token}`, { method: "GET", skipAuth: true });
        if (!mounted) return;
        setOk(true);
        setMessage("Email verified successfully.");
      } catch (e: any) {
        if (!mounted) return;
        setOk(false);
        setMessage(e?.message || "Verification failed.");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <main className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#0a0a0a] border border-white/10 p-10 text-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-white" />
              <h1 className="text-2xl font-bold text-white">Verifying email</h1>
              <p className="text-white/50">Please wait...</p>
            </div>
          ) : ok ? (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              <h1 className="text-2xl font-bold text-white">Verified</h1>
              <p className="text-white/50">{message}</p>
              <Link
                href="/auth/signin"
                className="inline-flex mt-2 px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="w-12 h-12 text-red-400" />
              <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
              <p className="text-white/50">{message}</p>
              <Link
                href="/help"
                className="inline-flex mt-2 px-8 py-3 bg-transparent border border-white/20 text-white font-bold rounded-xl hover:bg-white hover:text-black transition-colors"
              >
                Get Help
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
