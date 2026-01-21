"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiFetch } from "../../lib/api";
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
    createdAt: string;
};

export default function RecentOrders() {
    const [orders, setOrders] = useState<SellerOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setIsLoading(true);
                setError(null);
                const res = await apiFetch<{ orders: SellerOrder[] }>("/orders/seller/sales?limit=5&page=1", { method: "GET" });
                if (!mounted) return;
                setOrders(res.orders || []);
            } catch (e: any) {
                if (!mounted) return;
                setError(e?.message || "Failed to load orders");
                setOrders([]);
            } finally {
                if (!mounted) return;
                setIsLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const todayCount = useMemo(() => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        return orders.filter((o) => new Date(o.createdAt).getTime() >= start.getTime()).length;
    }, [orders]);

    return (
        <div className="glass-card border border-white/10 overflow-hidden h-full">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
                    <p className="text-sm text-gray-500">You made {todayCount} sale{todayCount === 1 ? "" : "s"} today</p>
                </div>
                <Link href="/seller/orders" className="text-sm text-white hover:text-white/70 transition-colors">View All</Link>
            </div>

            {isLoading ? (
                <div className="p-8 text-white flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading...</span>
                </div>
            ) : error ? (
                <div className="p-8 text-white">
                    <div className="text-white/60 text-sm mb-2">Error</div>
                    <div className="font-semibold">{error}</div>
                </div>
            ) : orders.length === 0 ? (
                <div className="p-8 text-white/60">No recent sales.</div>
            ) : (
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-medium">Order</th>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders.map((order) => {
                                const customer = order.buyer ? `${order.buyer.firstName} ${order.buyer.lastName}` : "";
                                const amount = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
                                const productTitle = order.items[0]?.title || "";
                                const statusLabel = order.status === "completed" ? "Completed" : order.status === "cancelled" ? "Failed" : "Processing";
                                const statusClass =
                                    order.status === "completed"
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                        : order.status === "cancelled"
                                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                                            : "bg-blue-500/10 text-blue-400 border-blue-500/20";

                                return (
                                    <tr key={order._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{productTitle}</div>
                                            <div className="text-xs text-gray-500">ORD-{order._id.slice(-8).toUpperCase()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-300">{customer || order.buyer?.email || ""}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium border ${statusClass}`}>
                                                {statusLabel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-white font-medium">{formatNaira(amount)}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
