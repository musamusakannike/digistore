"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SlidersHorizontal, LayoutGrid, ChevronRight, Home } from "lucide-react";
import ProductsFilter from "../components/products/ProductsFilter";
import MobileFilters from "../components/products/MobileFilters";
import SortDropdown, { SortOption } from "../components/products/SortDropdown";
import ProductsGrid from "../components/products/ProductsGrid";
import Pagination from "../components/products/Pagination";

// All categories for digital products
const allCategories = [
    "Online Courses",
    "Software",
    "Stock Photos",
    "Fonts",
    "Music",
    "3D Models",
    "Templates",
    "E-books",
    "Video Games",
    "Audiobooks",
    "Digital Art",
    "Fitness Programs",
];

// Extended dummy product data (24+ products)
const allProducts = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop",
        title: "The Complete Digital Marketing Masterclass - 23 Courses in 1",
        category: "Online Courses",
        description: "Master digital marketing with this comprehensive course bundle. Learn SEO, social media marketing, email marketing, content marketing, and more.",
        rating: 4.8,
        reviewCount: 12453,
        price: 29.99,
        originalPrice: 199.99,
        discountPercent: 85,
        author: "Sarah Johnson",
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=600&fit=crop",
        title: "Professional Photo Editing Software Suite",
        category: "Software",
        description: "Industry-leading photo editing software with AI-powered tools, advanced filters, and professional-grade features.",
        rating: 4.9,
        reviewCount: 8932,
        price: 79.99,
        originalPrice: 149.99,
        discountPercent: 47,
        author: "TechVision Studios",
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1481627276234-cf5f7c2d8f15?w=800&h=600&fit=crop",
        title: "Premium Stock Photo Bundle - 10,000+ High-Res Images",
        category: "Stock Photos",
        description: "Massive collection of royalty-free stock photos covering business, nature, technology, lifestyle, and more.",
        rating: 4.7,
        reviewCount: 5621,
        price: 49.99,
        originalPrice: 299.99,
        discountPercent: 83,
    },
    {
        id: 4,
        image: "https://images.unsplash.com/photo-1509305717900-84f40e786d82?w=800&h=600&fit=crop",
        title: "Modern Font Collection - 150+ Premium Typefaces",
        category: "Fonts",
        description: "Curated collection of modern, elegant fonts for all your design projects with full commercial license.",
        rating: 4.6,
        reviewCount: 3245,
        price: 39.99,
        originalPrice: 89.99,
        discountPercent: 56,
        author: "TypeMaster Co.",
    },
    {
        id: 5,
        image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop",
        title: "Royalty-Free Music Pack - 500+ Tracks",
        category: "Music",
        description: "High-quality background music for videos, podcasts, presentations, and more.",
        rating: 4.8,
        reviewCount: 7834,
        price: 59.99,
        originalPrice: 199.99,
        discountPercent: 70,
        author: "AudioWave Productions",
    },
    {
        id: 6,
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop",
        title: "3D Character Models Pack - Game Ready Assets",
        category: "3D Models",
        description: "Professional 3D character models optimized for games and animations.",
        rating: 4.9,
        reviewCount: 4567,
        price: 89.99,
        originalPrice: 249.99,
        discountPercent: 64,
        author: "3D Art Studio",
    },
    {
        id: 7,
        image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=600&fit=crop",
        title: "Web Development Bootcamp - Zero to Hero",
        category: "Online Courses",
        description: "Complete web development course covering HTML, CSS, JavaScript, React, Node.js, and MongoDB.",
        rating: 4.9,
        reviewCount: 15678,
        price: 34.99,
        originalPrice: 149.99,
        discountPercent: 77,
        author: "CodeMaster Academy",
    },
    {
        id: 8,
        image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=600&fit=crop",
        title: "Business Website Templates - 50+ Designs",
        category: "Templates",
        description: "Modern, responsive website templates for businesses, portfolios, and landing pages.",
        rating: 4.7,
        reviewCount: 6234,
        price: 44.99,
        originalPrice: 99.99,
        discountPercent: 55,
        author: "WebDesign Pro",
    },
    {
        id: 9,
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop",
        title: "The Art of Productivity - E-book Bundle",
        category: "E-books",
        description: "10 bestselling e-books on productivity, time management, and personal development.",
        rating: 4.5,
        reviewCount: 2341,
        price: 19.99,
        originalPrice: 79.99,
        discountPercent: 75,
        author: "Productivity Press",
    },
    {
        id: 10,
        image: "https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=800&h=600&fit=crop",
        title: "Indie Game Development Toolkit",
        category: "Video Games",
        description: "Complete toolkit for indie game developers including sprites, sound effects, and templates.",
        rating: 4.8,
        reviewCount: 3456,
        price: 69.99,
        originalPrice: 159.99,
        discountPercent: 56,
        author: "GameDev Studio",
    },
    {
        id: 11,
        image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&h=600&fit=crop",
        title: "Bestseller Audiobook Collection - 25 Titles",
        category: "Audiobooks",
        description: "Listen to 25 bestselling audiobooks narrated by top voice actors.",
        rating: 4.7,
        reviewCount: 4521,
        price: 49.99,
        originalPrice: 199.99,
        discountPercent: 75,
        author: "Audio Library",
    },
    {
        id: 12,
        image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop",
        title: "Digital Art Masterclass Bundle",
        category: "Digital Art",
        description: "Learn digital art from scratch with 20+ hours of video tutorials and 500+ brushes.",
        rating: 4.9,
        reviewCount: 5678,
        price: 54.99,
        originalPrice: 129.99,
        discountPercent: 58,
        author: "ArtStation Academy",
    },
    {
        id: 13,
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
        title: "12-Week Fitness Transformation Program",
        category: "Fitness Programs",
        description: "Complete workout and nutrition program for total body transformation.",
        rating: 4.8,
        reviewCount: 8901,
        price: 39.99,
        originalPrice: 99.99,
        discountPercent: 60,
        author: "FitLife Pro",
    },
    {
        id: 14,
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop",
        title: "Python for Data Science Complete Course",
        category: "Online Courses",
        description: "Master Python programming for data analysis, machine learning, and AI.",
        rating: 4.9,
        reviewCount: 11234,
        price: 44.99,
        originalPrice: 179.99,
        discountPercent: 75,
        author: "DataScience Hub",
    },
    {
        id: 15,
        image: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=600&fit=crop",
        title: "UI Design Kit - 200+ Components",
        category: "Templates",
        description: "Comprehensive UI kit with 200+ components, 50+ screens, and design system.",
        rating: 4.8,
        reviewCount: 4567,
        price: 79.99,
        originalPrice: 199.99,
        discountPercent: 60,
        author: "DesignLab",
    },
    {
        id: 16,
        image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
        title: "E-commerce Photography Pack - 5000+ Images",
        category: "Stock Photos",
        description: "Professional product photography for e-commerce websites and marketing.",
        rating: 4.6,
        reviewCount: 3210,
        price: 89.99,
        originalPrice: 249.99,
        discountPercent: 64,
        author: "ShutterStock Pro",
    },
    {
        id: 17,
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop",
        title: "Electronic Music Production Bundle",
        category: "Music",
        description: "Everything you need to produce electronic music: samples, presets, and tutorials.",
        rating: 4.7,
        reviewCount: 5432,
        price: 99.99,
        originalPrice: 299.99,
        discountPercent: 67,
        author: "BeatMaker Pro",
    },
    {
        id: 18,
        image: "https://images.unsplash.com/photo-1610986603166-f78428624e76?w=800&h=600&fit=crop",
        title: "Architectural 3D Models Collection",
        category: "3D Models",
        description: "High-quality 3D architectural models for visualization and rendering projects.",
        rating: 4.8,
        reviewCount: 2345,
        price: 149.99,
        originalPrice: 399.99,
        discountPercent: 63,
        author: "ArchViz Studio",
    },
    {
        id: 19,
        image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=600&fit=crop",
        title: "Creative Writing E-book Collection",
        category: "E-books",
        description: "15 e-books on creative writing, storytelling, and publishing success.",
        rating: 4.5,
        reviewCount: 1890,
        price: 24.99,
        originalPrice: 89.99,
        discountPercent: 72,
        author: "Writer's Guild",
    },
    {
        id: 20,
        image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800&h=600&fit=crop",
        title: "Full-Stack Developer IDE & Tools",
        category: "Software",
        description: "Premium IDE with extensions, themes, and productivity tools for developers.",
        rating: 4.9,
        reviewCount: 9876,
        price: 69.99,
        originalPrice: 149.99,
        discountPercent: 53,
        author: "DevTools Inc.",
    },
    {
        id: 21,
        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop",
        title: "Mobile Game Assets - Fantasy Pack",
        category: "Video Games",
        description: "Complete fantasy game assets including characters, environments, and UI elements.",
        rating: 4.7,
        reviewCount: 2876,
        price: 59.99,
        originalPrice: 139.99,
        discountPercent: 57,
        author: "PixelForge Games",
    },
    {
        id: 22,
        image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=600&fit=crop",
        title: "Calligraphy Font Bundle - 80 Typefaces",
        category: "Fonts",
        description: "Beautiful calligraphy and script fonts perfect for invitations and branding.",
        rating: 4.8,
        reviewCount: 4123,
        price: 29.99,
        originalPrice: 79.99,
        discountPercent: 63,
        author: "FontCraft Studio",
    },
    {
        id: 23,
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop",
        title: "HIIT & Cardio Workout Series",
        category: "Fitness Programs",
        description: "30-day high-intensity workout program with video guidance and meal plans.",
        rating: 4.6,
        reviewCount: 6543,
        price: 29.99,
        originalPrice: 69.99,
        discountPercent: 57,
        author: "CardioMax Fitness",
    },
    {
        id: 24,
        image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&h=600&fit=crop",
        title: "Digital Illustration Brush Pack",
        category: "Digital Art",
        description: "1000+ professional Procreate and Photoshop brushes for digital artists.",
        rating: 4.9,
        reviewCount: 7654,
        price: 34.99,
        originalPrice: 89.99,
        discountPercent: 61,
        author: "BrushMaster",
    },
];

// Price range constants
const MIN_PRICE = 0;
const MAX_PRICE = 200;

export default function ProductsPage() {
    // Filter states
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState<[number, number]>([MIN_PRICE, MAX_PRICE]);
    const [sortBy, setSortBy] = useState<SortOption>("featured");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    // Mobile filter modal
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let result = [...allProducts];

        // Filter by category
        if (selectedCategories.length > 0) {
            result = result.filter((product) =>
                selectedCategories.includes(product.category)
            );
        }

        // Filter by price
        result = result.filter(
            (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
        );

        // Sort products
        switch (sortBy) {
            case "price-low":
                result.sort((a, b) => a.price - b.price);
                break;
            case "price-high":
                result.sort((a, b) => b.price - a.price);
                break;
            case "newest":
                result.sort((a, b) => b.id - a.id);
                break;
            case "best-sellers":
                result.sort((a, b) => b.reviewCount - a.reviewCount);
                break;
            case "highest-rated":
                result.sort((a, b) => b.rating - a.rating);
                break;
            default:
                // Featured - keep original order
                break;
        }

        return result;
    }, [selectedCategories, priceRange, sortBy]);

    // Pagination calculation
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Calculate active filter count for mobile badge
    const filterCount =
        selectedCategories.length +
        (priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE ? 1 : 0);

    // Handle clear all filters
    const handleClearAll = () => {
        setSelectedCategories([]);
        setPriceRange([MIN_PRICE, MAX_PRICE]);
        setCurrentPage(1);
    };

    // Handle price change
    const handlePriceChange = (min: number, max: number) => {
        setPriceRange([min, max]);
        setCurrentPage(1);
    };

    // Handle category change
    const handleCategoryChange = (categories: string[]) => {
        setSelectedCategories(categories);
        setCurrentPage(1);
    };

    // Handle items per page change
    const handleItemsPerPageChange = (count: number) => {
        setItemsPerPage(count);
        setCurrentPage(1);
    };

    return (
        <main className="min-h-screen bg-gray-50/50">
            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-4">
                    <nav className="flex items-center gap-2 text-sm">
                        <Link
                            href="/"
                            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <Home size={16} />
                            <span>Home</span>
                        </Link>
                        <ChevronRight size={14} className="text-gray-400" />
                        <span className="text-gray-900 font-medium">Products</span>
                    </nav>
                </div>
            </div>

            {/* Page Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        All Products
                    </h1>
                    <p className="text-gray-600">
                        Discover our complete collection of premium digital products
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8">
                {/* Mobile Filter Bar */}
                <div className="flex items-center justify-between gap-4 mb-6 md:hidden">
                    <button
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm"
                    >
                        <SlidersHorizontal size={18} />
                        Filters
                        {filterCount > 0 && (
                            <span className="px-2 py-0.5 bg-[#FF6B35] text-white text-xs font-semibold rounded-full">
                                {filterCount}
                            </span>
                        )}
                    </button>
                    <SortDropdown value={sortBy} onChange={setSortBy} />
                </div>

                {/* Desktop Layout */}
                <div className="flex gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block w-72 shrink-0">
                        <div className="sticky top-24">
                            <ProductsFilter
                                categories={allCategories}
                                selectedCategories={selectedCategories}
                                onCategoryChange={handleCategoryChange}
                                minPrice={MIN_PRICE}
                                maxPrice={MAX_PRICE}
                                priceRange={priceRange}
                                onPriceChange={handlePriceChange}
                                onClearAll={handleClearAll}
                            />
                        </div>
                    </aside>

                    {/* Products Area */}
                    <div className="flex-1 min-w-0">
                        {/* Desktop Sort Bar */}
                        <div className="hidden md:flex items-center justify-between mb-6">
                            <p className="text-sm text-gray-600">
                                Showing{" "}
                                <span className="font-semibold text-gray-900">
                                    {filteredProducts.length}
                                </span>{" "}
                                products
                            </p>
                            <div className="flex items-center gap-4">
                                <SortDropdown value={sortBy} onChange={setSortBy} />
                            </div>
                        </div>

                        {/* Active Filters Tags */}
                        {filterCount > 0 && (
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                {selectedCategories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() =>
                                            handleCategoryChange(
                                                selectedCategories.filter((c) => c !== category)
                                            )
                                        }
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B35]/10 text-[#FF6B35] text-sm font-medium rounded-full hover:bg-[#FF6B35]/20 transition-colors"
                                    >
                                        {category}
                                        <span className="text-[#FF6B35]">×</span>
                                    </button>
                                ))}
                                {(priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE) && (
                                    <button
                                        onClick={() => setPriceRange([MIN_PRICE, MAX_PRICE])}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B35]/10 text-[#FF6B35] text-sm font-medium rounded-full hover:bg-[#FF6B35]/20 transition-colors"
                                    >
                                        ${priceRange[0]} - ${priceRange[1]}
                                        <span className="text-[#FF6B35]">×</span>
                                    </button>
                                )}
                                <button
                                    onClick={handleClearAll}
                                    className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}

                        {/* Products Grid */}
                        <ProductsGrid products={paginatedProducts} />

                        {/* Pagination */}
                        {filteredProducts.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredProducts.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Modal */}
            <MobileFilters
                isOpen={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                categories={allCategories}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                minPrice={MIN_PRICE}
                maxPrice={MAX_PRICE}
                priceRange={priceRange}
                onPriceChange={handlePriceChange}
                onClearAll={handleClearAll}
                filterCount={filterCount}
            />
        </main>
    );
}
