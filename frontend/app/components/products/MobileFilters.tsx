"use client";

import { useEffect, useState } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import PriceRangeSlider from "./PriceRangeSlider";

interface MobileFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    categories: string[];
    selectedCategories: string[];
    onCategoryChange: (categories: string[]) => void;
    minPrice: number;
    maxPrice: number;
    priceRange: [number, number];
    onPriceChange: (min: number, max: number) => void;
    onClearAll: () => void;
    filterCount: number;
}

export default function MobileFilters({
    isOpen,
    onClose,
    categories,
    selectedCategories,
    onCategoryChange,
    minPrice,
    maxPrice,
    priceRange,
    onPriceChange,
    onClearAll,
    filterCount,
}: MobileFiltersProps) {
    const [tempCategories, setTempCategories] = useState(selectedCategories);
    const [tempPriceRange, setTempPriceRange] = useState(priceRange);

    useEffect(() => {
        if (isOpen) {
            setTempCategories(selectedCategories);
            setTempPriceRange(priceRange);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen, selectedCategories, priceRange]);

    const handleCategoryToggle = (category: string) => {
        if (tempCategories.includes(category)) {
            setTempCategories(tempCategories.filter((c) => c !== category));
        } else {
            setTempCategories([...tempCategories, category]);
        }
    };

    const handleApply = () => {
        onCategoryChange(tempCategories);
        onPriceChange(tempPriceRange[0], tempPriceRange[1]);
        onClose();
    };

    const handleReset = () => {
        setTempCategories([]);
        setTempPriceRange([minPrice, maxPrice]);
        onClearAll();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl transform transition-transform duration-300 ${isOpen ? "translate-y-0" : "translate-y-full"
                    }`}
                style={{ maxHeight: "85vh" }}
            >
                {/* Handle Bar */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <SlidersHorizontal size={20} className="text-gray-700" />
                        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                        {filterCount > 0 && (
                            <span className="px-2 py-0.5 bg-[#FF6B35] text-white text-xs font-semibold rounded-full">
                                {filterCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto" style={{ maxHeight: "calc(85vh - 140px)" }}>
                    {/* Categories */}
                    <div className="p-5 border-b border-gray-100">
                        <h4 className="font-medium text-gray-900 mb-4">Categories</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryToggle(category)}
                                    className={`px-4 py-2.5 text-sm rounded-xl border-2 transition-all duration-200 ${tempCategories.includes(category)
                                            ? "bg-[#FF6B35] text-white border-[#FF6B35]"
                                            : "bg-white text-gray-700 border-gray-200 hover:border-[#FF6B35]/50"
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="p-5">
                        <h4 className="font-medium text-gray-900 mb-4">Price Range</h4>
                        <PriceRangeSlider
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            minValue={tempPriceRange[0]}
                            maxValue={tempPriceRange[1]}
                            onChange={(min, max) => setTempPriceRange([min, max])}
                        />
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-3 p-5 border-t border-gray-100 bg-white">
                    <button
                        onClick={handleReset}
                        className="flex-1 py-3 px-4 text-gray-700 font-semibold text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        Reset All
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 py-3 px-4 bg-[#FF6B35] text-white font-semibold text-sm rounded-xl hover:bg-[#D95F5F] transition-colors shadow-lg shadow-[#FF6B35]/25"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
}
