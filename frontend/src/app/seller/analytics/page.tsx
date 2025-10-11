"use client";
import { useEffect, useState } from "react";
import { getSellerAnalytics } from "@/lib/endpoints";
import type { SellerAnalytics } from "@/lib/endpoints";
import { getAccessToken } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function SellerAnalyticsPage() {
  const [data, setData] = useState<SellerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAccessToken();
        if (!token) return router.push("/auth");
        const res = await getSellerAnalytics();
        setData(res || {});
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) return <div className="pt-32 pb-12 px-6">Loading analytics...</div>;
  if (error) return <div className="pt-32 pb-12 px-6 text-red-700">{error}</div>;

  return (
    <div className="pt-32 pb-16 px-6 md:px-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Seller Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-gray-600">Total Orders</div>
          <div className="text-3xl font-bold text-gray-900">{data?.totalOrders ?? 0}</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-gray-600">Total Revenue</div>
          <div className="text-3xl font-bold text-gray-900">₦{(data?.totalRevenue ?? 0).toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-gray-600">Total Products</div>
          <div className="text-3xl font-bold text-gray-900">{data?.totalProducts ?? 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Top Products</h2>
          {(!data?.topProducts || data.topProducts.length === 0) ? (
            <div className="text-gray-600">No data yet.</div>
          ) : (
            <ul className="divide-y">
              {data.topProducts.map((tp, idx) => (
                <li key={idx} className="py-3 flex items-center justify-between">
                  <div className="font-medium text-gray-900 line-clamp-1">{tp.product.title}</div>
                  <div className="text-sm text-gray-700">₦{(tp.revenue ?? 0).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Orders</h2>
          {(!data?.recentOrders || data.recentOrders.length === 0) ? (
            <div className="text-gray-600">No recent orders.</div>
          ) : (
            <ul className="divide-y">
              {data.recentOrders.map((o, idx) => (
                <li key={idx} className="py-3 flex items-center justify-between">
                  <div className="text-gray-800">{o.id}</div>
                  <div className="text-sm text-gray-700">₦{(o.amount ?? 0).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
