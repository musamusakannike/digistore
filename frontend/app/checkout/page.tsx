"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";
import { formatNaira } from "../lib/money";

type CartSummary = {
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cartItems, refreshCart, clear } = useCart();

  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        await refreshCart();
        const data = await apiFetch<{ summary: CartSummary }>("/cart", { method: "GET" });
        if (!mounted) return;
        setSummary(data.summary);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load checkout");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, refreshCart, router]);

  const canCheckout = useMemo(() => cartItems.length > 0, [cartItems.length]);

  const handlePay = async () => {
    if (!canCheckout) return;

    try {
      setIsPaying(true);
      setError(null);

      const orderRes = await apiFetch<{ order: { _id: string } }>("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const payRes = await apiFetch<{ paymentUrl: string; reference: string }>("/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderRes.order._id }),
      });

      await clear();
      window.location.href = payRes.paymentUrl;
    } catch (e: any) {
      setError(e?.message || "Failed to initialize payment");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <main className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">Checkout</h1>
        </div>

        {isLoading ? (
          <div className="bg-[#0a0a0a] border border-white/10 p-8 text-white flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Preparing your checkout...</span>
          </div>
        ) : error ? (
          <div className="bg-[#0a0a0a] border border-white/10 p-8 text-white">
            <div className="text-white/60 text-sm mb-2">Error</div>
            <div className="font-semibold">{error}</div>
          </div>
        ) : !canCheckout ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center space-y-6 bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
            <h2 className="text-2xl font-bold text-white">Your cart is empty</h2>
            <p className="text-white/40 max-w-md text-lg">Add a product to your cart to start checkout.</p>
            <Link
              href="/products"
              className="mt-2 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-6 transition-all hover:border-white/10"
                >
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-white font-bold text-lg">{item.name}</div>
                        <div className="text-white/40 text-sm">{item.category}</div>
                        <div className="text-white/30 text-xs mt-1">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-white font-bold">{formatNaira(item.price * item.quantity)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Order Summary</h2>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <ShieldCheck className="w-4 h-4" />
                    Secure
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-white/60">
                    <span>Subtotal</span>
                    <span className="text-white font-medium">{formatNaira(summary?.subtotal ?? 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/60">
                    <span>VAT (7.5%)</span>
                    <span className="text-white font-medium">{formatNaira(summary?.tax ?? 0)}</span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-lg font-bold text-white">Total</span>
                    <span className="text-2xl font-bold text-white">{formatNaira(summary?.total ?? 0)}</span>
                  </div>
                </div>

                <button
                  onClick={handlePay}
                  disabled={isPaying}
                  className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-transform active:scale-95 flex items-center justify-center gap-2 group mb-3"
                >
                  {isPaying ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                  Pay with Flutterwave
                </button>

                <p className="text-xs text-center text-white/30">All payments are processed in NGN via Flutterwave.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
