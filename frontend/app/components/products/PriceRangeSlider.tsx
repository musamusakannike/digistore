"use client";

import { useState, useEffect, useRef } from "react";

interface PriceRangeSliderProps {
    minPrice: number;
    maxPrice: number;
    minValue: number;
    maxValue: number;
    onChange: (min: number, max: number) => void;
}

export default function PriceRangeSlider({
    minPrice,
    maxPrice,
    minValue,
    maxValue,
    onChange,
}: PriceRangeSliderProps) {
    const [localMin, setLocalMin] = useState(minValue);
    const [localMax, setLocalMax] = useState(maxValue);
    const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalMin(minValue);
        setLocalMax(maxValue);
    }, [minValue, maxValue]);

    const getPercentage = (value: number) => {
        return ((value - minPrice) / (maxPrice - minPrice)) * 100;
    };

    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const percentage = ((e.clientX - rect.left) / rect.width) * 100;
        const value = Math.round((percentage / 100) * (maxPrice - minPrice) + minPrice);

        // Determine which thumb to move
        const distToMin = Math.abs(value - localMin);
        const distToMax = Math.abs(value - localMax);

        if (distToMin < distToMax) {
            const newMin = Math.min(value, localMax - 1);
            setLocalMin(newMin);
            onChange(newMin, localMax);
        } else {
            const newMax = Math.max(value, localMin + 1);
            setLocalMax(newMax);
            onChange(localMin, newMax);
        }
    };

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || minPrice;
        const clampedValue = Math.max(minPrice, Math.min(value, localMax - 1));
        setLocalMin(clampedValue);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || maxPrice;
        const clampedValue = Math.min(maxPrice, Math.max(value, localMin + 1));
        setLocalMax(clampedValue);
    };

    const handleMinBlur = () => {
        onChange(localMin, localMax);
    };

    const handleMaxBlur = () => {
        onChange(localMin, localMax);
    };

    const handleMinSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        const newMin = Math.min(value, localMax - 1);
        setLocalMin(newMin);
        onChange(newMin, localMax);
    };

    const handleMaxSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        const newMax = Math.max(value, localMin + 1);
        setLocalMax(newMax);
        onChange(localMin, newMax);
    };

    return (
        <div className="w-full">
            {/* Visual Track */}
            <div
                ref={trackRef}
                className="relative h-2 bg-gray-200 rounded-full cursor-pointer mb-6"
                onClick={handleTrackClick}
            >
                {/* Active Range */}
                <div
                    className="absolute h-full bg-gradient-to-r from-[#FF6B35] to-[#FF8F6B] rounded-full"
                    style={{
                        left: `${getPercentage(localMin)}%`,
                        width: `${getPercentage(localMax) - getPercentage(localMin)}%`,
                    }}
                />

                {/* Min Thumb */}
                <div
                    className="absolute w-5 h-5 bg-white border-2 border-[#FF6B35] rounded-full shadow-md transform -translate-x-1/2 -translate-y-1.5 cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
                    style={{ left: `${getPercentage(localMin)}%` }}
                />

                {/* Max Thumb */}
                <div
                    className="absolute w-5 h-5 bg-white border-2 border-[#FF6B35] rounded-full shadow-md transform -translate-x-1/2 -translate-y-1.5 cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
                    style={{ left: `${getPercentage(localMax)}%` }}
                />
            </div>

            {/* Hidden Range Inputs for Accessibility */}
            <div className="relative h-0">
                <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={localMin}
                    onChange={handleMinSlider}
                    className="absolute w-full h-2 opacity-0 cursor-pointer pointer-events-auto -top-8"
                    style={{ zIndex: localMin > maxPrice - 10 ? 5 : 3 }}
                />
                <input
                    type="range"
                    min={minPrice}
                    max={maxPrice}
                    value={localMax}
                    onChange={handleMaxSlider}
                    className="absolute w-full h-2 opacity-0 cursor-pointer pointer-events-auto -top-8"
                    style={{ zIndex: 4 }}
                />
            </div>

            {/* Manual Input Fields */}
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Min</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input
                            type="number"
                            value={localMin}
                            onChange={handleMinChange}
                            onBlur={handleMinBlur}
                            onKeyDown={(e) => e.key === "Enter" && handleMinBlur()}
                            min={minPrice}
                            max={localMax - 1}
                            className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all"
                        />
                    </div>
                </div>
                <div className="text-gray-400 pt-5">—</div>
                <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Max</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input
                            type="number"
                            value={localMax}
                            onChange={handleMaxChange}
                            onBlur={handleMaxBlur}
                            onKeyDown={(e) => e.key === "Enter" && handleMaxBlur()}
                            min={localMin + 1}
                            max={maxPrice}
                            className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
