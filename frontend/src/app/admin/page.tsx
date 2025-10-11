"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminStats, getProfile } from "@/lib/endpoints";
import type { AdminStats, User } from "@/lib/types";
import { getAccessToken } from "@/lib/storage";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getAccessToken();
        if (!token) return router.push("/auth");
        const profile = await getProfile();
        if (profile.role !== "admin") {
          return router.push("/");
        }
        setUser(profile);
        const s = await getAdminStats();
        setStats(s);
      } catch (e) {
        setError((e as Error).message || "Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const nf = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }), []);

  if (loading) return <div className="pt-32 pb-12 px-6">Loading admin dashboard...</div>;
  if (error) return <div className="pt-32 pb-12 px-6 text-red-700">{error}</div>;

  return (
    <div className="pt-32 pb-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome{user ? `, ${user.firstName}` : ""}. Here are the latest platform stats.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users */}
          <StatCard
            title="Users"
            items={[
              { label: "Total", value: nf.format(stats?.users.total ?? 0) },
              { label: "Sellers", value: nf.format(stats?.users.sellers ?? 0) },
              { label: "Buyers", value: nf.format(stats?.users.buyers ?? 0) },
            ]}
          />

          {/* Products */}
          <StatCard
            title="Products"
            items={[
              { label: "Total", value: nf.format(stats?.products.total ?? 0) },
              { label: "Approved", value: nf.format(stats?.products.approved ?? 0) },
              { label: "Pending", value: nf.format(stats?.products.pending ?? 0) },
            ]}
          />

          {/* Orders */}
          <StatCard
            title="Orders"
            items={[
              { label: "Total", value: nf.format(stats?.orders.total ?? 0) },
              { label: "Completed", value: nf.format(stats?.orders.completed ?? 0) },
              { label: "Pending", value: nf.format(stats?.orders.pending ?? 0) },
            ]}
          />

          {/* Revenue */}
          <StatCard
            title="Revenue"
            items={[
              { label: "Total", value: `₦${nf.format(stats?.revenue.total ?? 0)}` },
              { label: "Platform Fee", value: `₦${nf.format(stats?.revenue.platformFee ?? 0)}` },
            ]}
          />
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickLink href="/admin/users" title="Manage Users" description="View, suspend or delete users" />
          <QuickLink href="/admin/products" title="Moderate Products" description="Approve, reject or suspend products" />
          <QuickLink href="/admin/orders" title="Orders" description="View and filter orders" />
          <QuickLink href="/admin/reviews" title="Reviews" description="Moderate product reviews" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="text-lg font-semibold text-gray-900">{title}</div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {items.map((it) => (
          <div key={it.label} className="p-3 rounded-xl border border-gray-200">
            <div className="text-sm text-gray-600">{it.label}</div>
            <div className="text-xl font-bold text-gray-900">{it.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <a href={href} className="bg-white rounded-2xl shadow p-6 hover:shadow-md transition block">
      <div className="text-lg font-semibold text-gray-900">{title}</div>
      <div className="text-gray-600">{description}</div>
    </a>
  );
}
