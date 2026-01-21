"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { apiFetch } from "../../lib/api";

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>("Verifying payment...");

  useEffect(() => {
    if (!reference) {
      setIsLoading(false);
      setIsSuccess(false);
      setMessage("Missing payment reference.");
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch<{ transaction: any; order: any }>(`/payments/verify/${reference}`, { method: "GET" });
        if (!mounted) return;
        setIsSuccess(true);
        setMessage("Payment verified successfully. Your downloads are ready.");
      } catch (e: any) {
        if (!mounted) return;
        setIsSuccess(false);
        setMessage(e?.message || "Payment verification failed.");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [reference]);

  return (
    <main className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-[#0a0a0a] border border-white/10 p-10 text-center">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-white" />
              <h1 className="text-2xl font-bold text-white">Verifying payment</h1>
              <p className="text-white/50">Please wait while we confirm your transaction.</p>
            </div>
          ) : isSuccess ? (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              <h1 className="text-2xl font-bold text-white">Payment Successful</h1>
              <p className="text-white/50">{message}</p>
              <div className="flex gap-3 mt-4">
                <Link
                  href="/orders"
                  className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  View Orders
                </Link>
                <Link
                  href="/products"
                  className="px-6 py-3 bg-transparent border border-white/20 text-white font-bold rounded-xl hover:bg-white hover:text-black transition-colors"
                >
                  Keep Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="w-12 h-12 text-red-400" />
              <h1 className="text-2xl font-bold text-white">Payment Failed</h1>
              <p className="text-white/50">{message}</p>
              <div className="flex gap-3 mt-4">
                <Link
                  href="/checkout"
                  className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Retry Checkout
                </Link>
                <Link
                  href="/help"
                  className="px-6 py-3 bg-transparent border border-white/20 text-white font-bold rounded-xl hover:bg-white hover:text-black transition-colors"
                >
                  Get Help
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
