"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, ChevronRight } from "lucide-react";
import { apiFetchEnvelope } from "../lib/api";
import { formatNaira } from "../lib/money";
import { useAuth } from "../context/AuthContext";

type Order = {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{ product: { _id: string; title: string; thumbnail?: string; slug?: string }; quantity: number }>;
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      setOrders([]);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await apiFetchEnvelope<{ orders: Order[] }>("/orders?limit=20", { method: "GET" });
        if (!mounted) return;
        setOrders(res.data.orders);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load orders");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  return (
    <main className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Orders</h1>
        </div>

        {!isAuthenticated ? (
          <div className="bg-[#0a0a0a] border border-white/10 p-10 text-center">
            <h2 className="text-2xl font-bold text-white">Sign in to view your purchases</h2>
            <p className="text-white/50 mt-2">Your digital downloads will appear here after checkout.</p>
            <Link
              href="/auth/signin"
              className="inline-flex mt-6 px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-white/10 p-6 animate-pulse h-24" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-[#0a0a0a] border border-white/10 p-8 text-white">
            <div className="text-white/60 text-sm mb-2">Error</div>
            <div className="font-semibold">{error}</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-white/10 p-10 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-5">
              <Package className="w-8 h-8 text-white/20" />
            </div>
            <h2 className="text-2xl font-bold text-white">No orders yet</h2>
            <p className="text-white/50 mt-2">Start building your digital library.</p>
            <Link
              href="/products"
              className="inline-flex mt-6 px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                href={`/orders/${order._id}`}
                className="bg-[#0a0a0a] border border-white/10 p-6 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-white font-bold">{order.orderNumber}</div>
                    <div className="text-white/40 text-sm mt-1">
                      {new Date(order.createdAt).toLocaleString("en-NG")}
                    </div>
                    <div className="text-white/50 text-sm mt-2">
                      Status: <span className="text-white">{order.paymentStatus}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{formatNaira(order.totalAmount)}</div>
                    <div className="text-white/40 text-sm mt-1">{order.items.length} item(s)</div>
                  </div>
                </div>

                {order.items[0]?.product?.thumbnail ? (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="relative w-14 h-14 bg-white/5 border border-white/10 overflow-hidden">
                      <Image src={order.items[0].product.thumbnail} alt="" fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-white/80 font-medium truncate">{order.items[0].product.title}</div>
                      {order.items.length > 1 ? (
                        <div className="text-white/40 text-sm">+ {order.items.length - 1} more</div>
                      ) : null}
                    </div>
                    <ChevronRight className="ml-auto w-4 h-4 text-white/30" />
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
