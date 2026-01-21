"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import ProductsGrid from "../components/products/ProductsGrid";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

type Product = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  category?: { name: string; slug: string };
  seller?: { firstName: string; lastName: string; businessName?: string };
  price: number;
  discountPrice?: number;
  thumbnail?: string;
  images?: string[];
  averageRating: number;
  reviewCount: number;
};

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    const data = await apiFetch<{ wishlist: Product[] }>("/users/wishlist", { method: "GET" });
    setProducts(data.wishlist || []);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      setProducts([]);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiFetch<{ wishlist: Product[] }>("/users/wishlist", { method: "GET" });
        if (!mounted) return;
        setProducts(data.wishlist || []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load wishlist");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const cards = useMemo(() => {
    return products.map((p) => ({
      id: p._id,
      slug: p.slug,
      image: p.thumbnail || p.images?.[0] || "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=600&fit=crop",
      title: p.title,
      category: p.category?.name || "",
      description: p.description,
      rating: p.averageRating || 0,
      reviewCount: p.reviewCount || 0,
      price: p.discountPrice ?? p.price,
      originalPrice: p.discountPrice ? p.price : undefined,
      discountPercent: p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : undefined,
      author: p.seller?.businessName || `${p.seller?.firstName || ""} ${p.seller?.lastName || ""}`.trim() || undefined,
    }));
  }, [products]);

  return (
    <main className="min-h-screen bg-black pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">Wishlist</h1>
        </div>

        {!isAuthenticated ? (
          <div className="bg-[#0a0a0a] border border-white/10 p-10 text-center">
            <h2 className="text-2xl font-bold text-white">Sign in to save favorites</h2>
            <p className="text-white/50 mt-2">Your wishlist syncs across devices when you are signed in.</p>
            <Link
              href="/auth/signin"
              className="inline-flex mt-6 px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-white/5 animate-pulse h-80" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-[#0a0a0a] border border-white/10 p-8 text-white">
            <div className="text-white/60 text-sm mb-2">Error</div>
            <div className="font-semibold">{error}</div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-white/10 p-10 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-5">
              <Heart className="w-8 h-8 text-white/20" />
            </div>
            <h2 className="text-2xl font-bold text-white">No favorites yet</h2>
            <p className="text-white/50 mt-2">Tap the heart on any product to save it here.</p>
            <Link
              href="/products"
              className="inline-flex mt-6 px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <ProductsGrid products={cards} />
        )}
      </div>
    </main>
  );
}
