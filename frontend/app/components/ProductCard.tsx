"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart, ChevronDown, ChevronUp, Heart } from "lucide-react";

interface ProductCardProps {
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

export default function ProductCard({
    image,
    title,
    category,
    description,
    rating,
    reviewCount,
    price,
    originalPrice,
    discountPercent,
    author,
}: ProductCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Truncate description to 100 characters
    const truncatedDescription = description.length > 100
        ? description.substring(0, 100) + "..."
        : description;

    // Render star rating
    const renderStars = () => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={14}
                        className={`${star <= Math.floor(rating)
                            ? "fill-white text-white"
                            : star - 0.5 <= rating
                                ? "fill-white/50 text-white"
                                : "fill-white/10 text-white/10"
                            } transition-colors`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div
            className="group relative bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Discount Badge */}
            {discountPercent && (
                <div className="absolute top-4 right-4 z-10 bg-white text-black px-2 py-1 text-xs font-bold uppercase tracking-wider">
                    -{discountPercent}%
                </div>
            )}

            {/* Product Image */}
            <div className="relative w-full aspect-[4/3] bg-gray-900 overflow-hidden">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className={`object-cover transition-transform duration-700 grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 ${isHovered ? "scale-105" : "scale-100"
                        }`}
                />

                {/* Overlay on hover */}
                <div
                    className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"
                        }`}
                />
            </div>

            {/* Product Details */}
            <div className="p-5">
                {/* Category */}
                <span className="inline-block text-white/40 text-xs font-bold uppercase tracking-widest mb-2">
                    {category}
                </span>

                {/* Title */}
                <h3 className="text-lg font-medium text-white mb-2 line-clamp-1 group-hover:text-white/80 transition-colors">
                    {title}
                </h3>

                {/* Author */}
                {author && (
                    <p className="text-xs text-white/40 mb-3">
                        by <span className="text-white/60 hover:text-white transition-colors cursor-pointer">{author}</span>
                    </p>
                )}

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                    {renderStars()}
                    <span className="text-xs text-white/40">
                        ({reviewCount.toLocaleString()})
                    </span>
                </div>

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-white">
                                ${price.toFixed(2)}
                            </span>
                            {originalPrice && (
                                <span className="text-sm text-white/30 line-through">
                                    ${originalPrice.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        className="flex items-center gap-2 bg-white/10 hover:bg-white text-white hover:text-black px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all duration-300"
                    >
                        <ShoppingCart size={14} />
                        Add
                    </button>
                </div>
            </div>
        </div>
    );
}
