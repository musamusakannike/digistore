'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ShoppingCart,
    User,
    Search,
    Menu,
    X,
    Home,
    Grid,
    Package,
    ChevronDown,
    Camera
} from 'lucide-react';

const categories = [
    'Software & Apps',
    'eBooks & Guides',
    'Graphics & Design',
    'Templates & Themes',
    'Audio & Music',
    'Video & Animation',
    'Photography',
    'Courses & Tutorials',
    'Fonts & Typography',
    'UI/UX Kits',
];

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);

    return (
        <>
            {/* Desktop Navbar */}
            <nav className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center">
                            <span className="ml-2 text-xl font-bold text-gray-900">DigiStore</span>
                        </Link>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-2xl mx-8">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search here..."
                                    className="w-full px-4 py-2 pl-10 pr-12 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <Camera className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Navigation Items */}
                        <div className="flex items-center space-x-6">
                            {/* Categories Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                    className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors"
                                >
                                    <Grid className="w-4 h-4" />
                                    <span className="text-sm font-medium">Categories</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isCategoriesOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setIsCategoriesOpen(false)}
                                        ></div>
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                                            {categories.map((category, index) => (
                                                <Link
                                                    key={index}
                                                    href={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setIsCategoriesOpen(false)}
                                                >
                                                    {category}
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Log In/Sign Up */}
                            <Link
                                href="/auth"
                                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                <User className="w-4 h-4" />
                                <span className="text-sm font-medium">Log In/Sign Up</span>
                            </Link>

                            {/* Cart */}
                            <Link
                                href="/cart"
                                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span className="text-sm font-medium">Cart</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navbar */}
            <nav className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Hamburger Menu */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-gray-700 hover:text-gray-900"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Logo */}
                        <Link href="/" className="flex items-center">
                            <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white rounded-sm transform rotate-45"></div>
                            </div>
                        </Link>

                        {/* Right Icons */}
                        <div className="flex items-center space-x-4">
                            <Link href="/auth">
                                <User className="w-5 h-5 text-gray-700" />
                            </Link>
                            <Link href="/cart">
                                <ShoppingCart className="w-5 h-5 text-gray-700" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Sidebar */}
            <div
                className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black bg-opacity-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>

                {/* Sidebar */}
                <div
                    className={`absolute left-0 top-0 bottom-0 w-80 bg-gray-50 shadow-xl transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white rounded-sm transform rotate-45"></div>
                            </div>
                            <span className="text-lg font-bold">recotad</span>
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-1 text-gray-500 hover:text-gray-700"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="p-4 bg-white border-b border-gray-200">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search here..."
                                className="w-full px-4 py-2 pl-10 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Camera className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="py-4">
                        <Link
                            href="/"
                            className="flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Home className="w-5 h-5" />
                            <span className="font-medium">Home</span>
                        </Link>

                        {/* Categories with Dropdown */}
                        <div>
                            <button
                                onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
                                className="flex items-center justify-between w-full px-6 py-3 text-gray-700 hover:bg-white transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <Grid className="w-5 h-5" />
                                    <span className="font-medium">Categories</span>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 text-orange-500 transition-transform ${isMobileCategoriesOpen ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            {/* Categories Submenu */}
                            {isMobileCategoriesOpen && (
                                <div className="bg-white py-2">
                                    {categories.map((category, index) => (
                                        <Link
                                            key={index}
                                            href={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                                            className="block px-12 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {category}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            href="/cart"
                            className="flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span className="font-medium">Cart</span>
                        </Link>

                        <Link
                            href="/orders"
                            className="flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Package className="w-5 h-5" />
                            <span className="font-medium">My Orders</span>
                        </Link>

                        <Link
                            href="/auth"
                            className="flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <User className="w-5 h-5" />
                            <span className="font-medium">Log In/Sign Up</span>
                        </Link>
                    </div>

                    {/* Promotional Banner */}
                    <div className="absolute bottom-20 left-0 right-0 px-6">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm font-semibold text-gray-800 mb-1">
                                Get 50% Off on Selected Items
                            </p>
                            <Link
                                href="/promotions"
                                className="text-sm text-orange-500 font-medium hover:text-orange-600"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Shop Now
                            </Link>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="absolute bottom-4 left-0 right-0 px-6">
                        <div className="flex items-center space-x-4 mb-3">
                            <a href="#" className="text-gray-700 hover:text-gray-900">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-700 hover:text-gray-900">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-700 hover:text-gray-900">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                        </div>
                        <p className="text-xs text-gray-500">© 2077 Ravish. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
