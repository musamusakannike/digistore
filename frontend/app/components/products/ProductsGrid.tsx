"use client";

import ProductCard from "../ProductCard";
import { Package } from "lucide-react";

interface Product {
    id: number;
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
}

interface ProductsGridProps {
    products: Product[];
    isLoading?: boolean;
}

// Loading skeleton component
function ProductSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
            <div className="w-full h-64 bg-gray-200" />
            <div className="p-5">
                <div className="h-6 bg-gray-200 rounded w-20 mb-3" />
                <div className="h-5 bg-gray-200 rounded w-full mb-2" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="h-8 bg-gray-200 rounded w-20" />
                    <div className="h-10 bg-gray-200 rounded w-28" />
                </div>
            </div>
        </div>
    );
}

// Empty state component
function EmptyState() {
    return (
        <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Package size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 text-center max-w-md">
                We couldn&apos;t find any products matching your filters. Try adjusting your search criteria or clearing some filters.
            </p>
        </div>
    );
}

export default function ProductsGrid({ products, isLoading = false }: ProductsGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
                <ProductCard key={product.id} {...product} />
            ))}
        </div>
    );
}
