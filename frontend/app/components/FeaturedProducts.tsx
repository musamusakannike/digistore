"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import {
    Star, Heart, ShoppingCart, ArrowRight, Eye, Plus
} from "lucide-react";

// Register plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

const featuredProducts = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop",
        title: "Digital Marketing Masterclass",
        category: "Courses",
        rating: 4.8,
        price: 29.99,
        badge: "Bestseller",
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=600&fit=crop",
        title: "Pro Photo Editing Suite",
        category: "Software",
        rating: 4.9,
        price: 79.99,
        badge: "New",
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1481627276234-cf5f7c2d8f15?w=800&h=600&fit=crop",
        title: "Premium Stock Bundle",
        category: "Photos",
        rating: 4.7,
        price: 49.99,
        badge: "Popular",
    },
    {
        id: 4,
        image: "https://images.unsplash.com/photo-1509305717900-84f40e786d82?w=800&h=600&fit=crop",
        title: "Modern Font Collection",
        category: "Fonts",
        rating: 4.6,
        price: 39.99,
        badge: "Exclusive",
    },
    {
        id: 5,
        image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop",
        title: "Royalty-Free Music Pack",
        category: "Audio",
        rating: 4.8,
        price: 59.99,
        badge: "Trending",
    },
    {
        id: 6,
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop",
        title: "3D Character Models",
        category: "3D Assets",
        rating: 4.9,
        price: 89.99,
        badge: "Featured",
    },
];

const ProductCard = ({ product, index }: { product: typeof featuredProducts[0]; index: number }) => {
    const [isLiked, setIsLiked] = useState(false);

    return (
        <div className="product-card-item group relative bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-all duration-500">
            {/* Image Container */}
            <div className="relative aspect-4/3 overflow-hidden bg-gray-900">
                <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100 grayscale group-hover:grayscale-0"
                />

                {/* Badge */}
                <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-wider">
                        {product.badge}
                    </span>
                </div>

                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <button
                        onClick={() => setIsLiked(!isLiked)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${isLiked ? 'bg-white text-black' : 'bg-black/50 text-white hover:bg-white hover:text-black'}`}
                    >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-black/50 text-white hover:bg-white hover:text-black flex items-center justify-center backdrop-blur-md transition-colors">
                        <ShoppingCart className="w-4 h-4" />
                    </button>
                    <Link
                        href={`/products`}
                        className="w-10 h-10 rounded-full bg-black/50 text-white hover:bg-white hover:text-black flex items-center justify-center backdrop-blur-md transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">
                            {product.category}
                        </p>
                        <h3 className="text-white font-medium text-lg group-hover:text-white/80 transition-colors">
                            {product.title}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
                    <span className="text-xl font-bold text-white">${product.price}</span>
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-white fill-white" />
                        <span className="text-white/60 text-sm font-medium">{product.rating}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function FeaturedProducts() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Header animation
        gsap.fromTo(".products-header",
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".products-header",
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Products grid animation
        gsap.fromTo(".product-card-item",
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".products-grid",
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );

    }, { scope: containerRef });

    return (
        <section className="relative py-24 md:py-32 bg-black overflow-hidden">
            <div ref={containerRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="products-header flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                    <div>
                        <h2 className="section-title text-white mb-2">
                            Featured <span className="text-gray-500">Digitals</span>
                        </h2>
                        <p className="section-subtitle text-white/40 font-light">
                            Selection of our highest rated products this week
                        </p>
                    </div>
                    <Link
                        href="/products"
                        className="group flex items-center gap-2 text-white border border-white/20 px-6 py-3 hover:bg-white hover:text-black transition-all duration-300"
                    >
                        <span className="font-bold text-sm tracking-wide uppercase">View All Products</span>
                        <Plus className="w-4 h-4" />
                    </Link>
                </div>

                {/* Products Grid */}
                <div className="products-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredProducts.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                    ))}
                </div>

                {/* Bottom decorative line */}
                <div className="w-full h-px bg-white/10 mt-24" />
            </div>
        </section>
    );
}
