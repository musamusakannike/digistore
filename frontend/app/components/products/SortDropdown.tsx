"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export type SortOption =
    | "featured"
    | "price-low"
    | "price-high"
    | "newest"
    | "best-sellers"
    | "highest-rated";

interface SortDropdownProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
    { value: "featured", label: "Featured" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "newest", label: "Newest First" },
    { value: "best-sellers", label: "Best Sellers" },
    { value: "highest-rated", label: "Highest Rated" },
];

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = sortOptions.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue: SortOption) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-300 transition-all duration-200 min-w-[180px] justify-between shadow-sm"
            >
                <span className="flex items-center gap-2">
                    <span className="text-gray-400">Sort by:</span>
                    <span className="text-gray-900">{selectedOption?.label}</span>
                </span>
                <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${value === option.value
                                    ? "text-[#FF6B35] bg-[#FF6B35]/5"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <span>{option.label}</span>
                            {value === option.value && (
                                <Check size={16} className="text-[#FF6B35]" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
