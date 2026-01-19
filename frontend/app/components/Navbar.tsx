"use client";

import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import {
    ShoppingCart,
    User,
    Search,
    Menu,
    X,
    Grid,
    Heart,
    ChevronDown,
} from "lucide-react";

// Register plugins
gsap.registerPlugin(useGSAP);

const categories = [
    { name: "Software & Apps", icon: "💻" },
    { name: "eBooks & Guides", icon: "📚" },
    { name: "Graphics & Design", icon: "🎨" },
    { name: "Templates & Themes", icon: "📄" },
    { name: "Audio & Music", icon: "🎵" },
    { name: "Video & Animation", icon: "🎬" },
    { name: "Photography", icon: "📷" },
    { name: "Courses & Tutorials", icon: "🎓" },
];

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useGSAP(() => {
        // Initial navbar animation
        gsap.fromTo(navRef.current,
            { y: -100, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        );
    }, { scope: navRef });

    return (
        <>
            {/* Desktop Navbar */}
            <nav
                ref={navRef}
                className={`hidden md:block fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled
                        ? "bg-black/80 backdrop-blur-md border-white/10 py-3"
                        : "bg-transparent border-transparent py-5"
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white flex items-center justify-center">
                                <span className="text-black font-bold text-lg">D</span>
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">DigiStore</span>
                        </Link>

                        {/* Search Bar */}
                        <div className={`flex-1 max-w-lg mx-12 transition-all duration-300 ${searchFocused ? "scale-105" : ""}`}>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                    className="w-full px-4 py-2.5 pl-10 bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all font-light text-sm"
                                />
                                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                            </div>
                        </div>

                        {/* Navigation Items */}
                        <div className="flex items-center gap-6">
                            {/* Categories Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${isCategoriesOpen ? "text-white" : "text-white/70 hover:text-white"
                                        }`}
                                >
                                    <span>Categories</span>
                                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isCategoriesOpen ? "rotate-180" : ""}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isCategoriesOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsCategoriesOpen(false)}
                                        />
                                        <div className="absolute top-full right-0 mt-4 w-64 bg-[#0a0a0a] border border-white/10 shadow-2xl z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="py-2">
                                                {categories.map((category, index) => (
                                                    <Link
                                                        key={index}
                                                        href={`/category/${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                                        onClick={() => setIsCategoriesOpen(false)}
                                                    >
                                                        <span className="opacity-50">{category.icon}</span>
                                                        <span>{category.name}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Icons */}
                            <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-6">
                                <Link
                                    href="/wishlist"
                                    className="relative text-white/70 hover:text-white transition-colors group"
                                >
                                    <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                </Link>

                                <Link
                                    href="/cart"
                                    className="relative text-white/70 hover:text-white transition-colors group"
                                >
                                    <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="absolute -top-2 -right-2 w-4 h-4 bg-white text-black text-[10px] font-bold flex items-center justify-center rounded-full">
                                        2
                                    </span>
                                </Link>

                                <Link
                                    href="/auth"
                                    className="text-white/70 hover:text-white transition-colors"
                                >
                                    <User className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navbar */}
            <nav className={`md:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? "bg-black/90 border-white/10" : "bg-transparent border-transparent"
                } py-4`}>
                <div className="px-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-white"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white tracking-tight">DigiStore</span>
                        </Link>

                        <Link href="/cart" className="relative text-white">
                            <ShoppingCart className="w-5 h-5" />
                            <span className="absolute -top-2 -right-2 w-3.5 h-3.5 bg-white text-black text-[9px] font-bold flex items-center justify-center rounded-full">
                                2
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-50 md:hidden bg-black transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-5">
                    <div className="flex items-center justify-between mb-8">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white flex items-center justify-center">
                                <span className="text-black font-bold">D</span>
                            </div>
                            <span className="text-xl font-bold text-white">DigiStore</span>
                        </Link>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-white/50 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                        </div>

                        <div className="flex flex-col gap-4">
                            <Link href="/" className="text-lg font-medium text-white">Home</Link>
                            <Link href="/categories" className="text-lg font-medium text-white">Categories</Link>
                            <Link href="/wishlist" className="text-lg font-medium text-white">Wishlist</Link>
                            <Link href="/cart" className="text-lg font-medium text-white">Cart</Link>
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <Link href="/auth" className="block w-full py-4 bg-white text-black text-center font-bold uppercase tracking-wide">
                                Sign In / Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
