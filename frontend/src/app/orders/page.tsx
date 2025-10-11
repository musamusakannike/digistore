"use client";
import { useCallback, useEffect, useState } from "react";
import { getUserOrders } from "@/lib/endpoints";
import type { Order, CartItem, Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { getAccessToken } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAccessToken();
      if (!token) return router.push("/auth");
      const data = await getUserOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const formatPrice = (amt: number) => `₦${(amt || 0).toLocaleString()}`;

  if (loading) return <div className="pt-32 pb-12 px-6">Loading orders...</div>;
  if (error) return <div className="pt-32 pb-12 px-6 text-red-700">{error}</div>;

  return (
    <div className="pt-32 pb-16 px-6 md:px-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-600">No orders yet.</div>
      ) : (
        <div className="space-y-6">
          {orders.map((o) => (
            <div key={o._id} className="bg-white rounded-2xl shadow p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-gray-700">
                  <div className="font-semibold">Order #{o._id}</div>
                  <div className="text-sm">Status: <span className="capitalize">{o.status}</span></div>
                </div>
                <div className="text-gray-900 font-semibold text-lg">{formatPrice(o.totalAmount)}</div>
              </div>
              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {o.items?.slice(0, 3).map((item: CartItem, idx) => {
                  const p = item.product as Product;
                  return (
                    <Link href={`/products/${p?.slug || p?._id}`} key={idx} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <div className="relative w-16 h-16 rounded overflow-hidden bg-gray-100">
                        <Image src={p?.thumbnail || p?.images?.[0] || "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=160&h=160&fit=crop"} alt={p?.title || 'Product'} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">{p?.title || 'Product'}</div>
                        <div className="text-xs text-gray-600">Qty: {item.quantity}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
