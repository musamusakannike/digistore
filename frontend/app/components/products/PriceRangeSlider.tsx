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
                className="relative h-1.5 bg-white/20 rounded-full cursor-pointer mb-6"
                onClick={handleTrackClick}
            >
                {/* Active Range */}
                <div
                    className="absolute h-full bg-white rounded-full"
                    style={{
                        left: `${getPercentage(localMin)}%`,
                        width: `${getPercentage(localMax) - getPercentage(localMin)}%`,
                    }}
                />

                {/* Min Thumb */}
                <div
                    className="absolute w-4 h-4 bg-black border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1.5 cursor-grab active:cursor-grabbing transition-transform hover:scale-125 hover:bg-white hover:border-black"
                    style={{ left: `${getPercentage(localMin)}%` }}
                />

                {/* Max Thumb */}
                <div
                    className="absolute w-4 h-4 bg-black border-2 border-white rounded-full shadow-lg transform -translate-x-1/2 -translate-y-1.5 cursor-grab active:cursor-grabbing transition-transform hover:scale-125 hover:bg-white hover:border-black"
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
                    <label className="block text-xs text-white/40 mb-1 uppercase tracking-wider font-bold">Min Price</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">$</span>
                        <input
                            type="number"
                            value={localMin}
                            onChange={handleMinChange}
                            onBlur={handleMinBlur}
                            onKeyDown={(e) => e.key === "Enter" && handleMinBlur()}
                            min={minPrice}
                            max={localMax - 1}
                            className="w-full bg-white/5 border border-white/10 pl-7 pr-3 py-2 text-sm text-white rounded-lg focus:outline-none focus:border-white/40 transition-all font-medium"
                        />
                    </div>
                </div>
                <div className="text-white/20 pt-6">—</div>
                <div className="flex-1">
                    <label className="block text-xs text-white/40 mb-1 uppercase tracking-wider font-bold">Max Price</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">$</span>
                        <input
                            type="number"
                            value={localMax}
                            onChange={handleMaxChange}
                            onBlur={handleMaxBlur}
                            onKeyDown={(e) => e.key === "Enter" && handleMaxBlur()}
                            min={localMin + 1}
                            max={maxPrice}
                            className="w-full bg-white/5 border border-white/10 pl-7 pr-3 py-2 text-sm text-white rounded-lg focus:outline-none focus:border-white/40 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
