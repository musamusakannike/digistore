"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

type Stats = {
  users: { total: number; sellers: number; buyers: number };
  products: { total: number; approved: number; pending: number };
  orders: { total: number; completed: number; pending: number };
  revenue: { total: number; platformFee: number };
};

function StatCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/30 p-4">
      <div className="text-xs text-zinc-400">{title}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {hint ? <div className="mt-1 text-xs text-zinc-500">{hint}</div> : null}
    </div>
  );
}

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiFetch<Stats>("/admin/stats");
        if (mounted) setStats(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load stats";
        if (mounted) setError(message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-zinc-400">Platform health and key metrics</p>
        </div>
        <button
          onClick={() => location.reload()}
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

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total users" value={stats ? String(stats.users.total) : isLoading ? "..." : "-"} />
        <StatCard title="Total products" value={stats ? String(stats.products.total) : isLoading ? "..." : "-"} />
        <StatCard title="Total orders" value={stats ? String(stats.orders.total) : isLoading ? "..." : "-"} />
        <StatCard
          title="Total revenue"
          value={stats ? `₦${Number(stats.revenue.total).toLocaleString()}` : isLoading ? "..." : "-"}
          hint={stats ? `Platform fee (10%): ₦${Number(stats.revenue.platformFee).toLocaleString()}` : undefined}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-zinc-950/30 p-4">
          <div className="text-sm font-medium">Users</div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-zinc-950/40 p-3">
              <div className="text-xs text-zinc-400">Buyers</div>
              <div className="mt-1 text-lg font-semibold">{stats ? stats.users.buyers : isLoading ? "..." : "-"}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-zinc-950/40 p-3">
              <div className="text-xs text-zinc-400">Sellers</div>
              <div className="mt-1 text-lg font-semibold">{stats ? stats.users.sellers : isLoading ? "..." : "-"}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-zinc-950/40 p-3">
              <div className="text-xs text-zinc-400">Total</div>
              <div className="mt-1 text-lg font-semibold">{stats ? stats.users.total : isLoading ? "..." : "-"}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-950/30 p-4">
          <div className="text-sm font-medium">Products</div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-zinc-950/40 p-3">
              <div className="text-xs text-zinc-400">Approved</div>
              <div className="mt-1 text-lg font-semibold">{stats ? stats.products.approved : isLoading ? "..." : "-"}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-zinc-950/40 p-3">
              <div className="text-xs text-zinc-400">Pending</div>
              <div className="mt-1 text-lg font-semibold">{stats ? stats.products.pending : isLoading ? "..." : "-"}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-zinc-950/40 p-3">
              <div className="text-xs text-zinc-400">Total</div>
              <div className="mt-1 text-lg font-semibold">{stats ? stats.products.total : isLoading ? "..." : "-"}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-950/30 p-4">
          <div className="text-sm font-medium">Orders</div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg border border-white/10 bg-zinc-950/40 p-3">
              <div className="text-xs text-zinc-400">Completed</div>
              <div className="mt-1 text-lg font-semibold">{stats ? stats.orders.completed : isLoading ? "..." : "-"}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-zinc-950/40 p-3">
              <div className="text-xs text-zinc-400">Pending</div>
              <div className="mt-1 text-lg font-semibold">{stats ? stats.orders.pending : isLoading ? "..." : "-"}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-zinc-950/40 p-3">
              <div className="text-xs text-zinc-400">Total</div>
              <div className="mt-1 text-lg font-semibold">{stats ? stats.orders.total : isLoading ? "..." : "-"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
