"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiFetch } from "../../lib/api";
import { formatNaira } from "../../lib/money";

type SellerAnalytics = {
    salesOverTime: Array<{ _id: string; sales: number; revenue: number }>;
    topProducts: Array<{ _id: string; title: string; sales: number; revenue: number }>;
    stats: { totalSales: number; totalRevenue: number; orderCount: number };
};

// Simple CSS-only bar chart
export default function RevenueChart() {
    const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setIsLoading(true);
                setError(null);
                const res = await apiFetch<SellerAnalytics>("/analytics/seller?period=90d", { method: "GET" });
                if (!mounted) return;
                setAnalytics(res);
            } catch (e: any) {
                if (!mounted) return;
                setError(e?.message || "Failed to load chart");
            } finally {
                if (!mounted) return;
                setIsLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const points = useMemo(() => {
        const raw = analytics?.salesOverTime || [];
        const last = raw.slice(-12);
        const max = Math.max(1, ...last.map((p) => p.revenue || 0));
        return last.map((p) => {
            const height = (p.revenue / max) * 100;
            const label = p._id.slice(5); // MM-DD
            return { ...p, height, label };
        });
    }, [analytics?.salesOverTime]);

    return (
        <div className="glass-card p-6 border border-white/10 h-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
                    <p className="text-sm text-gray-500">Recent revenue performance</p>
                </div>
                <div className="text-white/50 text-sm">Last 90 days</div>
            </div>

            {isLoading ? (
                <div className="h-64 flex items-center justify-center text-white gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading chart...</span>
                </div>
            ) : error ? (
                <div className="h-64 flex items-center justify-center text-white/70">{error}</div>
            ) : points.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-white/70">No data yet.</div>
            ) : (
                <div className="h-64 flex items-end justify-between gap-2">
                    {points.map((p) => (
                        <div key={p._id} className="flex-1 flex flex-col items-center gap-2 group">
                            <div
                                className="w-full bg-linear-to-t from-white/10 to-white/30 transition-all duration-500 relative group-hover:from-white/20 group-hover:to-white/50"
                                style={{ height: `${p.height}%` }}
                            >
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 transition-opacity whitespace-nowrap">
                                    {formatNaira(p.revenue)}
                                </div>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">{p.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
