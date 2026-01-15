"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";

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
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
                        className={`${star <= Math.floor(rating)
                                ? "fill-[#FF6B35] text-[#FF6B35]"
                                : star - 0.5 <= rating
                                    ? "fill-[#FF6B35]/50 text-[#FF6B35]"
                                    : "fill-gray-200 text-gray-200"
                            } transition-colors`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div
            className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Discount Badge */}
            {discountPercent && (
                <div className="absolute top-4 right-4 z-10 bg-[#FF6B35] text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                    -{discountPercent}%
                </div>
            )}

            {/* Product Image */}
            <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className={`object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"
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
                <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold mb-3">
                    {category}
                </span>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 min-h-14">
                    {title}
                </h3>

                {/* Author */}
                {author && (
                    <p className="text-sm text-gray-600 mb-3">
                        by <span className="font-medium">{author}</span>
                    </p>
                )}

                {/* Description */}
                <div className="mb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {isExpanded ? description : truncatedDescription}
                    </p>
                    {description.length > 100 && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-1 text-[#FF6B35] text-sm font-semibold mt-2 hover:text-[#D95F5F] transition-colors"
                        >
                            {isExpanded ? (
                                <>
                                    Read less <ChevronUp size={16} />
                                </>
                            ) : (
                                <>
                                    Read more <ChevronDown size={16} />
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                    {renderStars()}
                    <span className="text-sm font-semibold text-gray-900">
                        {rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                        ({reviewCount.toLocaleString()})
                    </span>
                </div>

                {/* Price and Add to Cart */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gray-900">
                                ${price.toFixed(2)}
                            </span>
                            {originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                    ${originalPrice.toFixed(2)}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        className="flex items-center gap-2 bg-[#FF6B35] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#D95F5F] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                        <ShoppingCart size={18} />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
