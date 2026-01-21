"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { apiFetchEnvelope, type Pagination } from "../../lib/api";
import { formatNaira } from "../../lib/money";

type SellerProduct = {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  price: number;
  discountPrice?: number;
  status: "draft" | "pending" | "approved" | "rejected";
  isActive: boolean;
  createdAt: string;
  category?: { name: string; slug: string };
};

export default function SellerProductsPage() {
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<SellerProduct[]>([]);
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
        qs.set("limit", "12");
        if (status !== "all") qs.set("status", status);

        const res = await apiFetchEnvelope<{ products: SellerProduct[] }>(
          `/products/seller/my-products?${qs.toString()}`,
          { method: "GET" },
        );
        if (!mounted) return;
        setProducts(res.data.products || []);
        setPagination(res.pagination);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load products");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [page, status]);

  const pages = pagination?.pages || 1;

  const canPrev = useMemo(() => page > 1, [page]);
  const canNext = useMemo(() => page < pages, [page, pages]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Products</h1>
          <p className="text-gray-400 mt-1">Manage your digital products, pricing, and publishing status.</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white/30"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="text-white font-semibold">Products</div>
          <div className="text-white/40 text-sm">Total: {pagination?.total ?? products.length}</div>
        </div>

        {isLoading ? (
          <div className="p-10 text-white flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading products...</span>
          </div>
        ) : error ? (
          <div className="p-10 text-white">
            <div className="text-white/60 text-sm mb-2">Error</div>
            <div className="font-semibold">{error}</div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-white">
            <div className="text-white/60 text-sm mb-2">No products</div>
            <div className="font-semibold">You haven't created any products yet.</div>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {products.map((p) => {
              const price = p.discountPrice ?? p.price;
              const statusColor =
                p.status === "approved"
                  ? "text-green-300 bg-green-500/10 border-green-500/20"
                  : p.status === "pending"
                    ? "text-yellow-300 bg-yellow-500/10 border-yellow-500/20"
                    : p.status === "rejected"
                      ? "text-red-300 bg-red-500/10 border-red-500/20"
                      : "text-white/70 bg-white/5 border-white/10";

              return (
                <div key={p._id} className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative w-16 h-16 bg-white/5 border border-white/10 overflow-hidden">
                      {p.thumbnail ? (
                        <Image src={p.thumbnail} alt={p.title} fill className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-semibold truncate">{p.title}</div>
                      <div className="text-white/40 text-sm truncate">
                        {p.category?.name || "Uncategorized"} · {p.isActive ? "Active" : "Inactive"}
                      </div>
                      <div className="text-white/30 text-xs mt-1 truncate">/{p.slug}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6">
                    <div className="text-white font-bold whitespace-nowrap">{formatNaira(price)}</div>
                    <div className={`text-xs px-2.5 py-1 border ${statusColor} whitespace-nowrap`}>{p.status}</div>
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
