"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SlidersHorizontal, ChevronRight, Home } from "lucide-react";
import ProductsFilter from "../components/products/ProductsFilter";
import MobileFilters from "../components/products/MobileFilters";
import SortDropdown, { SortOption } from "../components/products/SortDropdown";
import ProductsGrid from "../components/products/ProductsGrid";
import Pagination from "../components/products/Pagination";
import { apiFetchEnvelope } from "../lib/api";
import { formatNaira } from "../lib/money";

type Category = { _id: string; name: string; slug: string; productCount: number };
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

const MIN_PRICE = 0;
const MAX_PRICE = 500000;

export default function ProductsPage() {
    // Filter states
    const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);
    const [sortBy, setSortBy] = useState<SortOption>("featured");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    // Mobile filter modal
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const categorySlugs = useMemo(() => {
        const map = new Map(availableCategories.map((c) => [c.name, c.slug]));
        return selectedCategories.map((name) => map.get(name)).filter(Boolean) as string[];
    }, [availableCategories, selectedCategories]);

    const sortParam = useMemo(() => {
        if (sortBy === "price-low") return "price-asc";
        if (sortBy === "price-high") return "price-desc";
        if (sortBy === "newest") return "newest";
        if (sortBy === "best-sellers") return "popular";
        if (sortBy === "highest-rated") return "rating";
        return "popular";
    }, [sortBy]);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await apiFetchEnvelope<{ categories: Category[] }>("/categories?isActive=true", { method: "GET" });
                if (!mounted) return;
                setAvailableCategories(res.data.categories);
            } catch {
                if (!mounted) return;
                setAvailableCategories([]);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setIsLoading(true);
                setError(null);

                const params = new URLSearchParams();
                params.set("page", String(currentPage));
                params.set("limit", String(itemsPerPage));
                if (categorySlugs.length > 0) params.set("category", categorySlugs.join(","));
                if (priceRange[0] > MIN_PRICE) params.set("minPrice", String(priceRange[0]));
                if (priceRange[1] < MAX_PRICE) params.set("maxPrice", String(priceRange[1]));
                params.set("sort", sortParam);

                const res = await apiFetchEnvelope<{ products: Product[] }>(`/products?${params.toString()}`, { method: "GET" });
                if (!mounted) return;

                setProducts(res.data.products);
                setTotalItems(res.pagination?.total || 0);
                setTotalPages(res.pagination?.pages || 0);
            } catch (e: any) {
                if (!mounted) return;
                setError(e?.message || "Failed to load products");
                setProducts([]);
                setTotalItems(0);
                setTotalPages(0);
            } finally {
                if (!mounted) return;
                setIsLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [categorySlugs, priceRange, sortParam, currentPage, itemsPerPage]);

    const productCards = useMemo(() => {
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

    // Calculate active filter count for mobile badge
    const filterCount =
        selectedCategories.length +
        (priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE ? 1 : 0);

    // Handle clear all filters
    const handleClearAll = () => {
        setSelectedCategories([]);
        setPriceRange([MIN_PRICE, MAX_PRICE]);
        setCurrentPage(1);
    };

    // Handle price change
    const handlePriceChange = (min: number, max: number) => {
        setPriceRange([min, max]);
        setCurrentPage(1);
    };

    // Handle category change
    const handleCategoryChange = (categories: string[]) => {
        setSelectedCategories(categories);
        setCurrentPage(1);
    };

    // Handle items per page change
    const handleItemsPerPageChange = (count: number) => {
        setItemsPerPage(count);
        setCurrentPage(1);
    };

    return (
        <main className="min-h-screen bg-black pt-20">
            {/* Breadcrumb */}
            <div className="border-b border-white/10 bg-black">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link
                            href="/"
                            className="flex items-center gap-1 text-white/50 hover:text-white transition-colors"
                        >
                            <Home size={16} />
                            <span>Home</span>
                        </Link>
                        <ChevronRight size={14} className="text-white/30" />
                        <span className="text-white font-medium">Products</span>
                    </nav>
                </div>
            </div>

            {/* Page Header */}
            <div className="border-b border-white/10 bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-10">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                        All Products
                    </h1>
                    <p className="text-white/50 text-lg font-light">
                        Discover our complete collection of premium digital products
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12">
                {/* Mobile Filter Bar */}
                <div className="flex items-center justify-between gap-4 mb-8 md:hidden">
                    <button
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white shadow-sm hover:bg-white/10 transition-colors"
                    >
                        <SlidersHorizontal size={18} />
                        Filters
                        {filterCount > 0 && (
                            <span className="px-2 py-0.5 bg-white text-black text-xs font-bold rounded-full">
                                {filterCount}
                            </span>
                        )}
                    </button>
                    <SortDropdown value={sortBy} onChange={setSortBy} />
                </div>

                {/* Desktop Layout */}
                <div className="flex gap-10">
                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block w-72 shrink-0">
                        <div className="sticky top-28">
                            <ProductsFilter
                                categories={availableCategories.map((c) => c.name)}
                                selectedCategories={selectedCategories}
                                onCategoryChange={handleCategoryChange}
                                minPrice={MIN_PRICE}
                                maxPrice={MAX_PRICE}
                                priceRange={priceRange}
                                onPriceChange={handlePriceChange}
                                onClearAll={handleClearAll}
                            />
                        </div>
                    </aside>

                    {/* Products Area */}
                    <div className="flex-1 min-w-0">
                        {/* Desktop Sort Bar */}
                        <div className="hidden md:flex items-center justify-between mb-8">
                            <p className="text-sm text-white/50">
                                Showing{" "}
                                <span className="font-semibold text-white">
                                    {totalItems}
                                </span>{" "}
                                products
                            </p>
                            <div className="flex items-center gap-4">
                                <SortDropdown value={sortBy} onChange={setSortBy} />
                            </div>
                        </div>

                        {/* Active Filters Tags */}
                        {filterCount > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-8">
                                {selectedCategories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() =>
                                            handleCategoryChange(
                                                selectedCategories.filter((c) => c !== category)
                                            )
                                        }
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full hover:bg-white/20 transition-colors border border-white/5"
                                    >
                                        {category}
                                        <span className="text-white/50">×</span>
                                    </button>
                                ))}
                                {(priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE) && (
                                    <button
                                        onClick={() => setPriceRange([MIN_PRICE, MAX_PRICE])}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white text-sm font-medium rounded-full hover:bg-white/20 transition-colors border border-white/5"
                                    >
                                        {formatNaira(priceRange[0])} - {formatNaira(priceRange[1])}
                                        <span className="text-white/50">×</span>
                                    </button>
                                )}
                                <button
                                    onClick={handleClearAll}
                                    className="text-sm text-white/50 hover:text-white underline underline-offset-2 transition-colors ml-2"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}

                        {/* Products Grid */}
                        {error ? (
                            <div className="bg-[#0a0a0a] border border-white/10 p-6 text-white">
                                <div className="text-white/60 text-sm mb-2">Error</div>
                                <div className="font-semibold">{error}</div>
                            </div>
                        ) : (
                            <ProductsGrid products={productCards} isLoading={isLoading} />
                        )}

                        {/* Pagination */}
                        {totalItems > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Modal */}
            <MobileFilters
                isOpen={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                categories={availableCategories.map((c) => c.name)}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                minPrice={MIN_PRICE}
                maxPrice={MAX_PRICE}
                priceRange={priceRange}
                onPriceChange={handlePriceChange}
                onClearAll={handleClearAll}
                filterCount={filterCount}
            />
        </main>
    );
}
