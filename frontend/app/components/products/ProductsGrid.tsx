"use client";

import ProductCard from "../ProductCard";
import { Package } from "lucide-react";

interface Product {
    id: string;
    image: string;
    title: string;
    category: string;
    description: string;
    rating: number;
    reviewCount: number;
    price: number;
    originalPrice?: number;
    discountPercent?: number;
    author?: string;
    slug?: string;
}

interface ProductsGridProps {
    products: Product[];
    isLoading?: boolean;
}

// Loading skeleton component
function ProductSkeleton() {
    return (
        <div className="bg-[#0a0a0a] rounded-none overflow-hidden border border-white/5 animate-pulse">
            <div className="w-full h-64 bg-white/5" />
            <div className="p-5">
                <div className="h-4 bg-white/5 rounded w-20 mb-3" />
                <div className="h-5 bg-white/10 rounded w-full mb-2" />
                <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
                <div className="h-3 bg-white/5 rounded w-24 mb-4" />
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-4 bg-white/10 rounded w-24" />
                    <div className="h-4 bg-white/5 rounded w-16" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="h-8 bg-white/10 rounded w-20" />
                    <div className="h-8 bg-white/10 rounded w-20" />
                </div>
            </div>
        </div>
    );
}

// Empty state component
function EmptyState() {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 border border-white/5 rounded-2xl bg-white/5">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6">
                <Package size={40} className="text-white/40" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-white/50 text-center max-w-md">
                We couldn&apos;t find any products matching your filters. Try adjusting your search criteria or clearing some filters.
            </p>
        </div>
    );
}

export default function ProductsGrid({ products, isLoading = false }: ProductsGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                    <ProductSkeleton key={index} />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => (
                <ProductCard key={product.id} {...product} />
            ))}
        </div>
    );
}
