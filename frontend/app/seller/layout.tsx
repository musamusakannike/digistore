"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { useAuth } from "../context/AuthContext";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated } = useAuth();

  const isSellerOrAdmin = user?.role === "seller" || user?.role === "admin";
  const allowUpgradeRoute = pathname === "/seller/settings" || pathname?.startsWith("/seller/settings/");

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/auth/signin");
      return;
    }

    const isSellerOrAdmin = user?.role === "seller" || user?.role === "admin";
    const allowUpgradeRoute = pathname === "/seller/settings" || pathname?.startsWith("/seller/settings/");
    if (!isSellerOrAdmin && !allowUpgradeRoute) {
      router.replace("/seller/settings");
    }
  }, [isAuthenticated, isLoading, pathname, router, user?.role]);

  if (isLoading) return null;
  if (!isAuthenticated) return null;
  if (!isSellerOrAdmin && !allowUpgradeRoute) return null;

  return (
    <div className="min-h-screen bg-[#050505] flex">
      <div className="hidden lg:block w-64 fixed inset-y-0 z-50">
        <Sidebar />
      </div>

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">{children}</div>
        </main>
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-50 brightness-100 contrast-150" />
      </div>
    </div>
  );
}
