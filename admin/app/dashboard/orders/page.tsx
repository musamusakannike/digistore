"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetchEnvelope, type Pagination } from "../../lib/api";

type OrderItem = {
  _id?: string;
  title: string;
  price: number;
  quantity: number;
  seller: string;
  product?: { _id: string; title: string };
};

type Order = {
  _id: string;
  orderNumber: string;
  buyer?: { _id: string; firstName: string; lastName: string; email: string };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: "pending" | "completed" | "cancelled" | "refunded";
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: string;
};

type OrdersResponse = { orders: Order[] };

function buildQuery(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, v);
  }
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export default function OrdersPage() {
  const [items, setItems] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("");

  const query = useMemo(() => {
    return buildQuery({ page: String(page), limit: "20", status, paymentStatus });
  }, [page, paymentStatus, status]);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiFetchEnvelope<OrdersResponse>(`/admin/orders${query}`);
      setItems(res.data.orders);
      setPagination(res.pagination);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load orders";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-zinc-400">View platform orders and payment status</p>
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

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="h-10 rounded-lg border border-white/10 bg-zinc-950/40 px-3 text-sm outline-none focus:border-white/20"
        >
          <option value="">All order statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => {
            setPage(1);
            setPaymentStatus(e.target.value);
          }}
          className="h-10 rounded-lg border border-white/10 bg-zinc-950/40 px-3 text-sm outline-none focus:border-white/20"
        >
          <option value="">All payment statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
        <div className="text-sm text-zinc-500 flex items-center">Showing {items.length} items</div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950/50 text-zinc-300">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Order</th>
              <th className="px-3 py-2 text-left font-medium">Buyer</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
              <th className="px-3 py-2 text-left font-medium">Total</th>
              <th className="px-3 py-2 text-left font-medium">Items</th>
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
                  No orders
                </td>
              </tr>
            ) : (
              items.map((o) => (
                <tr key={o._id} className="bg-zinc-900/20 align-top">
                  <td className="px-3 py-3">
                    <div className="font-medium text-zinc-100">{o.orderNumber}</div>
                    <div className="text-xs text-zinc-500">{new Date(o.createdAt).toLocaleString()}</div>
                  </td>
                  <td className="px-3 py-3 text-zinc-200">
                    {o.buyer ? (
                      <div>
                        <div className="text-sm">
                          {o.buyer.firstName} {o.buyer.lastName}
                        </div>
                        <div className="text-xs text-zinc-500">{o.buyer.email}</div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="rounded-md border border-white/10 bg-zinc-950/40 px-2 py-1 text-xs text-zinc-200 w-fit">
                        {o.status}
                      </span>
                      <span className="text-xs text-zinc-500">payment: {o.paymentStatus}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-zinc-200">₦{Number(o.totalAmount).toLocaleString()}</td>
                  <td className="px-3 py-3">
                    <div className="space-y-1">
                      {o.items.slice(0, 4).map((it, idx) => (
                        <div key={idx} className="text-xs text-zinc-300">
                          {it.title} <span className="text-zinc-500">x{it.quantity}</span>
                        </div>
                      ))}
                      {o.items.length > 4 ? <div className="text-xs text-zinc-500">+{o.items.length - 4} more</div> : null}
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
