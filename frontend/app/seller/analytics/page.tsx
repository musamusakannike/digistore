"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { formatNaira } from "../../lib/money";

type SalesPoint = {
  _id: string;
  sales: number;
  revenue: number;
};

type TopProduct = {
  _id: string;
  title: string;
  sales: number;
  revenue: number;
};

type SellerAnalytics = {
  salesOverTime: SalesPoint[];
  topProducts: TopProduct[];
  stats: { totalSales: number; totalRevenue: number; orderCount: number };
};

export default function SellerAnalyticsPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [data, setData] = useState<SellerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await apiFetch<SellerAnalytics>(`/analytics/seller?period=${period}`, { method: "GET" });
        if (!mounted) return;
        setData(res);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load analytics");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [period]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-gray-400 mt-1">Track sales and revenue performance for your products.</p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as any)}
          className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-white/30"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last 1 year</option>
        </select>
      </div>

      {isLoading ? (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-10 text-white flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      ) : error ? (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-10 text-white">
          <div className="text-white/60 text-sm mb-2">Error</div>
          <div className="font-semibold">{error}</div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
              <div className="text-white/50 text-sm">Total sales</div>
              <div className="text-white text-3xl font-bold mt-2">{data?.stats.totalSales ?? 0}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
              <div className="text-white/50 text-sm">Revenue</div>
              <div className="text-white text-3xl font-bold mt-2">{formatNaira(data?.stats.totalRevenue ?? 0)}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
              <div className="text-white/50 text-sm">Orders</div>
              <div className="text-white text-3xl font-bold mt-2">{data?.stats.orderCount ?? 0}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <div className="text-white font-semibold">Top products</div>
              </div>
              <div className="divide-y divide-white/5">
                {(data?.topProducts || []).length === 0 ? (
                  <div className="p-6 text-white/60">No data yet.</div>
                ) : (
                  data?.topProducts?.map((p) => (
                    <div key={p._id} className="p-5 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-white font-semibold truncate">{p.title}</div>
                        <div className="text-white/50 text-sm">Sales: {p.sales}</div>
                      </div>
                      <div className="text-white font-bold whitespace-nowrap">{formatNaira(p.revenue)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <div className="text-white font-semibold">Sales over time</div>
              </div>
              <div className="divide-y divide-white/5">
                {(data?.salesOverTime || []).length === 0 ? (
                  <div className="p-6 text-white/60">No data yet.</div>
                ) : (
                  data?.salesOverTime?.map((p) => (
                    <div key={p._id} className="p-5 flex items-center justify-between gap-4">
                      <div className="text-white/70 text-sm">{p._id}</div>
                      <div className="flex items-center gap-4">
                        <div className="text-white/50 text-sm">{p.sales} sales</div>
                        <div className="text-white font-bold whitespace-nowrap">{formatNaira(p.revenue)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
