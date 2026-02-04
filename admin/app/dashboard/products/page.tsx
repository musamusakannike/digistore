"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetchEnvelope, type Pagination, apiFetch } from "../../lib/api";

type Product = {
  _id: string;
  title: string;
  slug: string;
  price: number;
  discountPrice?: number;
  status: "draft" | "pending" | "approved" | "rejected" | "suspended";
  isActive: boolean;
  isFeatured: boolean;
  rejectionReason?: string;
  category?: { _id: string; name: string };
  seller?: { _id: string; firstName: string; lastName: string; businessName?: string; email?: string };
  createdAt: string;
};

type ProductsResponse = { products: Product[] };

function buildQuery(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, v);
  }
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export default function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");

  const query = useMemo(() => {
    return buildQuery({ page: String(page), limit: "20", search, status });
  }, [page, search, status]);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiFetchEnvelope<ProductsResponse>(`/admin/products${query}`);
      setItems(res.data.products);
      setPagination(res.pagination);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load products";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = useCallback(
    async (path: string, body?: unknown) => {
    await apiFetch(path, {
      method: "PUT",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    await load();
    },
    [load],
  );

  const deleteProduct = useCallback(
    async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await apiFetch(`/admin/products/${id}`, { method: "DELETE" });
    await load();
    },
    [load],
  );

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-zinc-400">Approve, reject, suspend, and manage listings</p>
        </div>
        <button
          onClick={() => void load()}
          className="rounded-lg border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-200 hover:bg-white/5"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search products"
          className="h-10 rounded-lg border border-white/10 bg-zinc-950/40 px-3 text-sm outline-none focus:border-white/20 md:col-span-3"
        />
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="h-10 rounded-lg border border-white/10 bg-zinc-950/40 px-3 text-sm outline-none focus:border-white/20"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950/50 text-zinc-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Product</th>
              <th className="px-3 py-2 text-left font-medium">Seller</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-left font-medium">Price</th>
              <th className="px-3 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {isLoading ? (
              <tr>
                <td className="px-3 py-4 text-zinc-400" colSpan={5}>
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-zinc-400" colSpan={5}>
                  No products
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p._id} className="bg-zinc-900/20">
                  <td className="px-3 py-3">
                    <div className="font-medium text-zinc-100">{p.title}</div>
                    <div className="text-xs text-zinc-500">
                      {p.category?.name ? `${p.category.name} • ` : ""}
                      {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                    {p.status === "rejected" && p.rejectionReason ? (
                      <div className="mt-1 text-xs text-red-200">Reason: {p.rejectionReason}</div>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-zinc-200">
                    {p.seller ? (
                      <div>
                        <div className="text-sm">
                          {p.seller.businessName || `${p.seller.firstName} ${p.seller.lastName}`}
                        </div>
                        <div className="text-xs text-zinc-500">{p.seller.email}</div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="rounded-md border border-white/10 bg-zinc-950/40 px-2 py-1 text-xs text-zinc-200 w-fit">
                        {p.status}
                      </span>
                      <span className="text-xs text-zinc-500">{p.isActive ? "Active" : "Inactive"}</span>
                      {p.isFeatured ? <span className="text-xs text-emerald-200">Featured</span> : null}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-zinc-200">
                    <div>₦{Number(p.price).toLocaleString()}</div>
                    {p.discountPrice !== undefined ? (
                      <div className="text-xs text-zinc-500">Discount: ₦{Number(p.discountPrice).toLocaleString()}</div>
                    ) : null}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end flex-wrap gap-2">
                      {p.status !== "approved" ? (
                        <button
                          className="rounded-lg border border-white/10 bg-zinc-950/40 px-2 py-1 text-xs hover:bg-white/5"
                          onClick={() => void act(`/admin/products/${p._id}/approve`)}
                        >
                          Approve
                        </button>
                      ) : null}
                      {p.status !== "rejected" ? (
                        <button
                          className="rounded-lg border border-white/10 bg-zinc-950/40 px-2 py-1 text-xs hover:bg-white/5"
                          onClick={() => {
                            const reason = prompt("Rejection reason") || "";
                            if (!reason) return;
                            void act(`/admin/products/${p._id}/reject`, { reason });
                          }}
                        >
                          Reject
                        </button>
                      ) : null}
                      {p.status !== "suspended" ? (
                        <button
                          className="rounded-lg border border-white/10 bg-zinc-950/40 px-2 py-1 text-xs hover:bg-white/5"
                          onClick={() => void act(`/admin/products/${p._id}/suspend`)}
                        >
                          Suspend
                        </button>
                      ) : null}
                      <button
                        className="rounded-lg border border-white/10 bg-zinc-950/40 px-2 py-1 text-xs hover:bg-white/5"
                        onClick={() => void act(`/admin/products/${p._id}/featured`)}
                      >
                        {p.isFeatured ? "Unfeature" : "Feature"}
                      </button>
                      <button
                        className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-200 hover:bg-red-500/15"
                        onClick={() => void deleteProduct(p._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
        <div>
          {pagination ? (
            <span>
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-lg border border-white/10 bg-zinc-950/40 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/5 disabled:opacity-50"
            disabled={!pagination || pagination.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <button
            className="rounded-lg border border-white/10 bg-zinc-950/40 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/5 disabled:opacity-50"
            disabled={!pagination || pagination.page >= pagination.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
