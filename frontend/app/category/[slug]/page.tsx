"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import ProductsGrid from "../../components/products/ProductsGrid";
import SortDropdown, { type SortOption } from "../../components/products/SortDropdown";
import { apiFetchEnvelope } from "../../lib/api";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
};

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

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sortParam = useMemo(() => {
    if (sortBy === "price-low") return "price-asc";
    if (sortBy === "price-high") return "price-desc";
    if (sortBy === "newest") return "newest";
    if (sortBy === "best-sellers") return "popular";
    if (sortBy === "highest-rated") return "rating";
    return "popular";
  }, [sortBy]);

  useEffect(() => {
    if (!slug) return;

    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const categoryRes = await apiFetchEnvelope<{ category: Category }>(`/categories/slug/${slug}`, {
          method: "GET",
        });

        const productsRes = await apiFetchEnvelope<{ products: Product[] }>(
          `/products?category=${encodeURIComponent(slug)}&sort=${encodeURIComponent(sortParam)}&limit=24`,
          {
            method: "GET",
          },
        );

        if (!mounted) return;
        setCategory(categoryRes.data.category);
        setProducts(productsRes.data.products);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load category");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [slug, sortParam]);

  const cards = useMemo(() => {
    return products.map((p) => ({
      id: p._id,
      slug: p.slug,
      image: p.thumbnail || p.images?.[0] || "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=600&fit=crop",
      title: p.title,
      category: p.category?.name || category?.name || "",
      description: p.description,
      rating: p.averageRating || 0,
      reviewCount: p.reviewCount || 0,
      price: p.discountPrice ?? p.price,
      originalPrice: p.discountPrice ? p.price : undefined,
      discountPercent: p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : undefined,
      author: p.seller?.businessName || `${p.seller?.firstName || ""} ${p.seller?.lastName || ""}`.trim() || undefined,
    }));
  }, [products, category]);

  return (
    <main className="min-h-screen bg-black pt-20">
      <div className="border-b border-white/10 bg-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/categories"
              className="flex items-center gap-1 text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Categories</span>
            </Link>
            <ChevronRight size={14} className="text-white/30" />
            <span className="text-white font-medium">{category?.name || "Category"}</span>
          </nav>
        </div>
      </div>

      <div className="border-b border-white/10 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                {category?.name || "Browse Category"}
              </h1>
              <p className="text-white/50 text-lg font-light max-w-2xl">
                {category?.description || "Discover premium digital products curated for Nigerian creators and businesses."}
              </p>
            </div>
            <div className="hidden md:block">
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12">
        <div className="md:hidden mb-6">
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#0a0a0a] border border-white/5 animate-pulse">
                <div className="w-full aspect-4/3 bg-white/5" />
                <div className="p-5">
                  <div className="h-4 bg-white/5 w-24 mb-3" />
                  <div className="h-6 bg-white/10 w-3/4 mb-3" />
                  <div className="h-10 bg-white/5 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-[#0a0a0a] border border-white/10 p-6 text-white">
            <div className="text-white/60 text-sm mb-2">Error</div>
            <div className="font-semibold">{error}</div>
          </div>
        ) : (
          <>
            {category?.name && (
              <div className="mb-10 bg-white/5 border border-white/10 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 bg-black/50 border border-white/10 overflow-hidden">
                    <Image
                      src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=300&fit=crop"
                      alt={category.name}
                      fill
                      className="object-cover opacity-30 grayscale"
                    />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">{category.name}</div>
                    <div className="text-white/40 text-sm">{category.productCount} products available</div>
                  </div>
                </div>
                <Link
                  href="/products"
                  className="hidden sm:inline-flex items-center gap-2 text-white border border-white/20 px-5 py-2.5 hover:bg-white hover:text-black transition-all duration-300"
                >
                  View all products
                </Link>
              </div>
            )}

            <ProductsGrid products={cards} />
          </>
        )}
      </div>
    </main>
  );
}
