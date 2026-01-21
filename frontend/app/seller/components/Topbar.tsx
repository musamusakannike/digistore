"use client";

import { Bell, Search, User } from "lucide-react";

export default function Topbar() {
    return (
        <header className="h-16 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40">
            {/* Search (Dummy) */}
            <div className="relative hidden md:block w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search orders, products..."
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-black"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-white">Alex Morgan</div>
                        <div className="text-xs text-gray-500">Premium Seller</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-gray-200 to-gray-400 border border-white/20 overflow-hidden">
                        <User className="w-full h-full p-1 text-black" />
                    </div>
                </div>
            </div>
        </header>
    );
}
