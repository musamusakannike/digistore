"use client";

import { useEffect, useMemo, useState } from "react";
import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { apiFetch, apiFetchEnvelope, type Pagination } from "../../lib/api";
import { formatNaira } from "../../lib/money";

type SellerAnalytics = {
    salesOverTime: Array<{ _id: string; sales: number; revenue: number }>;
    topProducts: Array<{ _id: string; title: string; sales: number; revenue: number }>;
    stats: { totalSales: number; totalRevenue: number; orderCount: number };
};

type SellerOrder = {
    _id: string;
    buyer?: { firstName: string; lastName: string; email: string };
};

export default function DashboardStats() {
    const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);
    const [approvedProductsTotal, setApprovedProductsTotal] = useState<number | null>(null);
    const [uniqueBuyers, setUniqueBuyers] = useState<number | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const [a, productsEnv, ordersEnv] = await Promise.all([
                    apiFetch<SellerAnalytics>("/analytics/seller?period=30d", { method: "GET" }),
                    apiFetchEnvelope<{ products: any[] }>("/products/seller/my-products?status=approved&limit=1&page=1", {
                        method: "GET",
                    }),
                    apiFetchEnvelope<{ orders: SellerOrder[] }>("/orders/seller/sales?limit=50&page=1", { method: "GET" }),
                ]);

                if (!mounted) return;
                setAnalytics(a);
                setApprovedProductsTotal((productsEnv.pagination as Pagination | undefined)?.total ?? 0);

                const buyers = new Set(
                    (ordersEnv.data.orders || [])
                        .map((o) => o.buyer?.email)
                        .filter(Boolean) as string[],
                );
                setUniqueBuyers(buyers.size);
            } catch {
                if (!mounted) return;
                setAnalytics({ salesOverTime: [], topProducts: [], stats: { totalSales: 0, totalRevenue: 0, orderCount: 0 } });
                setApprovedProductsTotal(0);
                setUniqueBuyers(0);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const avgOrderValue = useMemo(() => {
        const revenue = analytics?.stats.totalRevenue ?? 0;
        const orders = analytics?.stats.orderCount ?? 0;
        if (!orders) return 0;
        return revenue / orders;
    }, [analytics?.stats.orderCount, analytics?.stats.totalRevenue]);

    const stats = useMemo(
        () => [
            {
                label: "Total Revenue (30d)",
                value: analytics ? formatNaira(analytics.stats.totalRevenue) : "—",
                change: analytics ? `${analytics.stats.totalSales} sales` : "",
                icon: DollarSign,
            },
            {
                label: "Approved Products",
                value: approvedProductsTotal === null ? "—" : String(approvedProductsTotal),
                change: "",
                icon: ShoppingBag,
            },
            {
                label: "Customers (30d)",
                value: uniqueBuyers === null ? "—" : String(uniqueBuyers),
                change: "",
                icon: Users,
            },
            {
                label: "Avg Order Value",
                value: analytics ? formatNaira(avgOrderValue) : "—",
                change: analytics ? `${analytics.stats.orderCount} orders` : "",
                icon: TrendingUp,
            },
        ],
        [analytics, approvedProductsTotal, uniqueBuyers, avgOrderValue],
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <div key={index} className="glass-card hover:translate-y-[-4px] transition-transform duration-300 p-6 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-400 font-medium">{stat.label}</span>
                        <div className="p-2 bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                            <stat.icon className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    <div className="text-2xl font-bold text-white mb-2 tracking-tight">
                        {stat.value}
                    </div>

                    {stat.change ? (
                        <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">{stat.change}</div>
                    ) : (
                        <div className="h-4" />
                    )}

                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl -z-10 rounded-full group-hover:bg-white/10 transition-colors" />
                </div>
            ))}
        </div>
    );
}
