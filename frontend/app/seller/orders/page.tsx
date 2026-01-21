"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { apiFetchEnvelope, type Pagination } from "../../lib/api";
import { formatNaira } from "../../lib/money";

type SellerOrderItem = {
  product?: { _id: string; title: string; slug: string; thumbnail?: string };
  title: string;
  price: number;
  quantity: number;
  seller: string;
};

type SellerOrder = {
  _id: string;
  buyer?: { firstName: string; lastName: string; email: string };
  items: SellerOrderItem[];
  status: "pending" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
};

export default function SellerOrdersPage() {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [pagination, setPagination] = useState<Pagination | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const qs = new URLSearchParams();
        qs.set("page", String(page));
        qs.set("limit", "10");

        const res = await apiFetchEnvelope<{ orders: SellerOrder[] }>(`/orders/seller/sales?${qs.toString()}`, {
          method: "GET",
        });

        if (!mounted) return;
        setOrders(res.data.orders || []);
        setPagination(res.pagination);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load sales");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [page]);

  const pages = pagination?.pages || 1;
  const canPrev = useMemo(() => page > 1, [page]);
  const canNext = useMemo(() => page < pages, [page, pages]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Orders</h1>
        <p className="text-gray-400 mt-1">View paid orders that include your products.</p>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="text-white font-semibold">Sales</div>
          <div className="text-white/40 text-sm">Total: {pagination?.total ?? orders.length}</div>
        </div>

        {isLoading ? (
          <div className="p-10 text-white flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading orders...</span>
          </div>
        ) : error ? (
          <div className="p-10 text-white">
            <div className="text-white/60 text-sm mb-2">Error</div>
            <div className="font-semibold">{error}</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-white">
            <div className="text-white/60 text-sm mb-2">No orders</div>
            <div className="font-semibold">No paid orders found yet.</div>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {orders.map((o) => {
              const buyerName = o.buyer ? `${o.buyer.firstName} ${o.buyer.lastName}` : "";
              const gross = o.items.reduce((sum, it) => sum + it.price * it.quantity, 0);

              const statusBadge =
                o.status === "completed"
                  ? "text-green-300 bg-green-500/10 border-green-500/20"
                  : o.status === "cancelled"
                    ? "text-red-300 bg-red-500/10 border-red-500/20"
                    : "text-yellow-300 bg-yellow-500/10 border-yellow-500/20";

              return (
                <div key={o._id} className="p-5 flex flex-col gap-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-white font-semibold truncate">
                        <Link href={`/orders/${o._id}`} className="hover:underline">
                          Order #{o._id.slice(-8)}
                        </Link>
                      </div>
                      <div className="text-white/40 text-sm truncate">
                        {buyerName}{buyerName ? " · " : ""}{o.buyer?.email || ""}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`text-xs px-2.5 py-1 border ${statusBadge} whitespace-nowrap`}>{o.status}</div>
                      <div className="text-white font-bold whitespace-nowrap">{formatNaira(gross)}</div>
                    </div>
                  </div>

                  <div className="text-white/50 text-sm">
                    {o.items.length} item{o.items.length === 1 ? "" : "s"} · {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!canPrev}
            className="px-3 py-2 bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5 flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <div className="text-white/50 text-sm">
            Page {page} of {pages}
          </div>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!canNext}
            className="px-3 py-2 bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5 flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
