"use client";

import { X } from "lucide-react";
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
    const handleCategoryToggle = (category: string) => {
        if (selectedCategories.includes(category)) {
            onCategoryChange(selectedCategories.filter((c) => c !== category));
        } else {
            onCategoryChange([...selectedCategories, category]);
        }
    };

    const hasFilters =
        selectedCategories.length > 0 ||
        priceRange[0] > minPrice ||
        priceRange[1] < maxPrice;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Filters</h3>
                {hasFilters && (
                    <button
                        onClick={onClearAll}
                        className="text-xs font-medium text-white/50 hover:text-white transition-colors flex items-center gap-1"
                    >
                        <X size={12} />
                        Clear All
                    </button>
                )}
            </div>

            {/* Categories */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                    Categories
                </h4>
                <div className="space-y-2.5">
                    {categories.map((category) => {
                        const isSelected = selectedCategories.includes(category);
                        return (
                            <label
                                key={category}
                                className="flex items-center gap-3 cursor-pointer group"
                            >
                                <div
                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected
                                        ? "bg-white border-white"
                                        : "bg-transparent border-white/20 group-hover:border-white/50"
                                        }`}
                                >
                                    {isSelected && (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="w-3.5 h-3.5 text-black"
                                        >
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={isSelected}
                                    onChange={() => handleCategoryToggle(category)}
                                />
                                <span
                                    className={`text-sm transition-colors ${isSelected ? "text-white font-medium" : "text-white/60 group-hover:text-white/80"
                                        }`}
                                >
                                    {category}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4 pt-4 border-t border-white/10">
                <h4 className="text-sm font-semibold text-white/90 uppercase tracking-wider">
                    Price Range
                </h4>
                <PriceRangeSlider
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange}
                    onChange={onPriceChange}
                />
            </div>
        </div>
    );
}
