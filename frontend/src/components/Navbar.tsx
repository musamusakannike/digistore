"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUnreadCount } from '@/lib/endpoints';

export default function Navbar() {
  const [unread, setUnread] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await getUnreadCount();
        setUnread(res.count || 0);
      } catch {
        // ignore if unauthenticated
      }
    })();
  }, []);

  return (
    <nav className="flex justify-between items-center py-4 px-6 md:px-12 bg-white/70 backdrop-blur-md fixed top-0 left-0 right-0 z-50 shadow-sm border-b border-gray-200/60">
      <Link href="/" className="text-2xl font-bold text-maroon-700">DigiStore</Link>
      <div className="hidden md:flex items-center gap-6 text-gray-700 font-medium">
        <Link href="/products" className="hover:text-maroon-700">Products</Link>
        <Link href="/cart" className="hover:text-maroon-700">Cart</Link>
        <Link href="/orders" className="hover:text-maroon-700">Orders</Link>
        <Link href="/seller" className="hover:text-maroon-700">Seller</Link>
        <Link href="/notifications" className="relative hover:text-maroon-700">
          Notifications
          {unread > 0 && (
            <span className="absolute -top-2 -right-3 bg-maroon-700 text-white text-xs px-2 py-0.5 rounded-full">{unread}</span>
          )}
        </Link>
        <Link href="/profile" className="hover:text-maroon-700">Profile</Link>
      </div>
      <div className="flex gap-3">
        <Link href="/auth" className="border border-maroon-700 text-maroon-700 px-4 py-2 rounded-lg font-medium hover:bg-maroon-50 transition">Sign In</Link>
        <Link href="/auth" className="bg-maroon-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-maroon-800 transition">Get Started</Link>
      </div>
    </nav>
  );
}
