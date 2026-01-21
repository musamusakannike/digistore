"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    BarChart3,
    Settings,
    LogOut,
    Store
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navigation = [
    { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
    { name: "My Products", href: "/seller/products", icon: Package },
    { name: "Orders", href: "/seller/orders", icon: ShoppingCart },
    { name: "Analytics", href: "/seller/analytics", icon: BarChart3 },
    { name: "Settings", href: "/seller/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    return (
        <aside className="fixed inset-y-0 left-0 w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col z-50">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-white/10 bg-black/50 backdrop-blur-md">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white hover:opacity-80 transition-opacity">
                    <Store className="w-6 h-6" />
                    <span>DIGISTORE<span className="text-gray-500">.SELLER</span></span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300
                                ${isActive
                                    ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                }
                            `}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? "text-black" : "text-gray-400 group-hover:text-white"}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-white/10 bg-black/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
