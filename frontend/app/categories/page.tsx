"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Grid } from "lucide-react";
import { apiFetch } from "../lib/api";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  productCount: number;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await apiFetch<{ categories: Category[] }>("/categories?isActive=true");
        if (!mounted) return;
        setCategories(data.categories);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load categories");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const fallbackImages = useMemo(
    () => [
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1509305717900-84f40e786d82?w=800&h=600&fit=crop",
    ],
    [],
  );

  return (
    <main className="min-h-screen bg-black pt-20">
      <div className="border-b border-white/10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-10">
          <div className="flex items-center gap-3 text-white/60 mb-4">
            <Grid className="w-5 h-5" />
            <span className="text-sm font-medium tracking-widest uppercase">Catalog</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">Categories</h1>
          <p className="text-white/50 text-lg font-light">Browse Nigerian-focused digital products by category.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-4/5 bg-white/5 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-[#0a0a0a] border border-white/10 p-6 text-white">
            <div className="text-white/60 text-sm mb-2">Error</div>
            <div className="font-semibold">{error}</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {categories.map((category, index) => (
              <Link
                key={category._id}
                href={`/category/${category.slug}`}
                className="group relative aspect-4/5 overflow-hidden bg-white/5 border border-white/5 hover:border-white/20 transition-colors"
              >
                <div className="absolute inset-0">
                  <Image
                    src={fallbackImages[index % fallbackImages.length]}
                    alt={category.name}
                    fill
                    className="object-cover opacity-30 group-hover:opacity-15 grayscale transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
                </div>

                <div className="absolute inset-0 p-5 flex flex-col items-center justify-center text-center z-10">
                  <div className="mb-4 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-black/50 backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all duration-300">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <h3 className="text-white font-medium text-lg mb-1 tracking-wide">{category.name}</h3>
                  <span className="text-xs text-white/40 uppercase tracking-widest font-medium">
                    {category.productCount} Items
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
