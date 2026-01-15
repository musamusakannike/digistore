"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import PriceRangeSlider from "./PriceRangeSlider";

interface ProductsFilterProps {
    categories: string[];
    selectedCategories: string[];
    onCategoryChange: (categories: string[]) => void;
    minPrice: number;
    maxPrice: number;
    priceRange: [number, number];
    onPriceChange: (min: number, max: number) => void;
    onClearAll: () => void;
}

export default function ProductsFilter({
    categories,
    selectedCategories,
    onCategoryChange,
    minPrice,
    maxPrice,
    priceRange,
    onPriceChange,
    onClearAll,
}: ProductsFilterProps) {
    const [isCategoryOpen, setIsCategoryOpen] = useState(true);
    const [isPriceOpen, setIsPriceOpen] = useState(true);

    const handleCategoryToggle = (category: string) => {
        if (selectedCategories.includes(category)) {
            onCategoryChange(selectedCategories.filter((c) => c !== category));
        } else {
            onCategoryChange([...selectedCategories, category]);
        }
    };

    const hasActiveFilters = selectedCategories.length > 0 || priceRange[0] > minPrice || priceRange[1] < maxPrice;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Filter Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                {hasActiveFilters && (
                    <button
                        onClick={onClearAll}
                        className="flex items-center gap-1 text-sm text-[#FF6B35] font-medium hover:text-[#D95F5F] transition-colors"
                    >
                        <X size={14} />
                        Clear all
                    </button>
                )}
            </div>

            {/* Categories Section */}
            <div className="border-b border-gray-100">
                <button
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    className="flex items-center justify-between w-full p-5 text-left hover:bg-gray-50 transition-colors"
                >
                    <span className="font-medium text-gray-900">Categories</span>
                    {isCategoryOpen ? (
                        <ChevronUp size={18} className="text-gray-500" />
                    ) : (
                        <ChevronDown size={18} className="text-gray-500" />
                    )}
                </button>

                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isCategoryOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="px-5 pb-5 space-y-3 max-h-64 overflow-y-auto">
                        {categories.map((category) => (
                            <label
                                key={category}
                                className="flex items-center gap-3 cursor-pointer group"
                            >
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(category)}
                                        onChange={() => handleCategoryToggle(category)}
                                        className="sr-only"
                                    />
                                    <div
                                        className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${selectedCategories.includes(category)
                                                ? "bg-[#FF6B35] border-[#FF6B35]"
                                                : "border-gray-300 group-hover:border-[#FF6B35]/50"
                                            }`}
                                    >
                                        {selectedCategories.includes(category) && (
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={3}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                                    {category}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Price Range Section */}
            <div>
                <button
                    onClick={() => setIsPriceOpen(!isPriceOpen)}
                    className="flex items-center justify-between w-full p-5 text-left hover:bg-gray-50 transition-colors"
                >
                    <span className="font-medium text-gray-900">Price Range</span>
                    {isPriceOpen ? (
                        <ChevronUp size={18} className="text-gray-500" />
                    ) : (
                        <ChevronDown size={18} className="text-gray-500" />
                    )}
                </button>

                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isPriceOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                        }`}
                >
                    <div className="px-5 pb-5">
                        <PriceRangeSlider
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            minValue={priceRange[0]}
                            maxValue={priceRange[1]}
                            onChange={onPriceChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
