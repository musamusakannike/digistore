"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export type SortOption =
    | "featured"
    | "newest"
    | "price-low"
    | "price-high"
    | "best-sellers"
    | "highest-rated";

interface SortDropdownProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
}

const sortOptions: { label: string; value: SortOption }[] = [
    { label: "Featured", value: "featured" },
    { label: "Newest Arrivals", value: "newest" },
    { label: "Price: Low to High", value: "price-low" },
    { label: "Price: High to Low", value: "price-high" },
    { label: "Best Sellers", value: "best-sellers" },
    { label: "Highest Rated", value: "highest-rated" },
];

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel = sortOptions.find((opt) => opt.value === value)?.label;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all min-w-[180px] justify-between"
            >
                <div className="flex items-center gap-2">
                    <span className="text-white/40">Sort by:</span>
                    <span>{selectedLabel}</span>
                </div>
                <ChevronDown
                    size={16}
                    className={`text-white/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-full min-w-[200px] bg-[#111] border border-white/10 rounded-xl shadow-2xl z-20 py-1 animate-in fade-in zoom-in-95 duration-200">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${value === option.value
                                ? "bg-white text-black font-medium"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            {option.label}
                            {value === option.value && <Check size={14} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
