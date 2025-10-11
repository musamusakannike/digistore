"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProfile } from "@/lib/endpoints";
import type { User } from "@/lib/types";
import { getAccessToken } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function SellerDashboardHome() {
  const [user, setUser] = useState<User | null>(null);
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
        const u = await getProfile();
        setUser(u);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) return <div className="pt-32 pb-12 px-6">Loading seller dashboard...</div>;
  if (error) return <div className="pt-32 pb-12 px-6 text-red-700">{error}</div>;

  const isSeller = user?.role === 'seller' || user?.role === 'admin';

  return (
    <div className="pt-32 pb-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        {!isSeller && (
          <div className="mt-4 p-4 rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-800">
            Your account is not a seller yet. Please verify your email and contact support to enable seller features.
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/seller/products" className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition">
            <div className="text-lg font-semibold text-gray-900">My Products</div>
            <div className="text-gray-600">View and manage your products</div>
          </Link>
          <Link href="/seller/products/new" className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition">
            <div className="text-lg font-semibold text-gray-900">Create Product</div>
            <div className="text-gray-600">Add a new product to your catalog</div>
          </Link>
          <Link href="/orders" className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition">
            <div className="text-lg font-semibold text-gray-900">Orders</div>
            <div className="text-gray-600">Track customer orders</div>
          </Link>
          <Link href="/seller/settings" className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition">
            <div className="text-lg font-semibold text-gray-900">Seller Settings</div>
            <div className="text-gray-600">Become Seller & Bank Details</div>
          </Link>
          <Link href="/seller/analytics" className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition">
            <div className="text-lg font-semibold text-gray-900">Analytics</div>
            <div className="text-gray-600">Sales & performance overview</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
