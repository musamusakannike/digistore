"use client";

import { useEffect, useState } from "react";
import { X, SlidersHorizontal, Check } from "lucide-react";
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
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Bottom Sheet */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 rounded-t-3xl transform transition-transform duration-300 flex flex-col ${isOpen ? "translate-y-0" : "translate-y-full"
                    }`}
                style={{ maxHeight: "90vh" }}
            >
                {/* Handle Bar */}
                <div className="flex justify-center pt-3 pb-2 shrink-0">
                    <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-3">
                        <SlidersHorizontal size={20} className="text-white" />
                        <h3 className="text-lg font-bold text-white tracking-tight">Filters</h3>
                        {filterCount > 0 && (
                            <span className="px-2 py-0.5 bg-white text-black text-xs font-bold rounded-full">
                                {filterCount}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto min-h-0 flex-1">
                    {/* Categories */}
                    <div className="p-5 border-b border-white/5">
                        <h4 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">Categories</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {categories.map((category) => {
                                const isSelected = tempCategories.includes(category);
                                return (
                                    <button
                                        key={category}
                                        onClick={() => handleCategoryToggle(category)}
                                        className={`px-4 py-3 text-sm rounded-xl border transition-all duration-200 flex items-center justify-between gap-2 text-left ${isSelected
                                            ? "bg-white text-black border-white font-bold"
                                            : "bg-white/5 text-white/70 border-white/10 hover:border-white/30 hover:text-white"
                                            }`}
                                    >
                                        <span className="truncate">{category}</span>
                                        {isSelected && <Check size={14} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="p-5">
                        <h4 className="text-sm font-semibold text-white/90 uppercase tracking-wider mb-4">Price Range</h4>
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
                <div className="flex items-center gap-3 p-5 border-t border-white/10 bg-[#0a0a0a] shrink-0">
                    <button
                        onClick={handleReset}
                        className="flex-1 py-3.5 px-4 text-white font-semibold text-sm border border-white/20 rounded-xl hover:bg-white hover:text-black transition-colors uppercase tracking-wide"
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 py-3.5 px-4 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-wide border border-transparent shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    >
                        Show Results
                    </button>
                </div>
            </div>
        </div>
    );
}
