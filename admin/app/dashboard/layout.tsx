"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={
        "block rounded-lg px-3 py-2 text-sm transition-colors " +
        (active ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white")
      }
    >
      {label}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user?.role !== "admin") {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router, user?.role]);

  if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-50" />;
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return <div className="min-h-screen bg-zinc-950 text-zinc-50" />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex max-w-7xl gap-6 p-6">
        <aside className="w-64 shrink-0">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-4">
            <div className="mb-4">
              <div className="text-sm font-semibold">DigiStore Admin</div>
              <div className="mt-1 text-xs text-zinc-400">{user.email}</div>
            </div>
            <nav className="space-y-1">
              <NavItem href="/dashboard" label="Overview" />
              <NavItem href="/dashboard/users" label="Users" />
              <NavItem href="/dashboard/products" label="Products" />
              <NavItem href="/dashboard/orders" label="Orders" />
              <NavItem href="/dashboard/categories" label="Categories" />
            </nav>
            <button
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
              className="mt-4 w-full rounded-lg border border-white/10 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-200 hover:bg-white/5"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-5">{children}</div>
          <div className="mt-4 text-xs text-zinc-500">© {new Date().getFullYear()} DigiStore</div>
        </main>
      </div>
    </div>
  );
}
