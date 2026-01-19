"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import {
    BookOpen, Code, Camera, Gamepad2, Music, Type, Box,
    Layout, GraduationCap, Headphones, Palette, Dumbbell,
    ArrowRight
} from "lucide-react";

// Register plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

const categories = [
    { id: 1, name: "E-books", icon: BookOpen, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop", count: "2.3k" },
    { id: 2, name: "Software", icon: Code, image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=400&fit=crop", count: "1.8k" },
    { id: 3, name: "Photos", icon: Camera, image: "https://cdn.pixabay.com/photo/2020/12/20/03/59/photography-5846035_1280.jpg?w=400&h=400&fit=crop", count: "15k" },
    { id: 4, name: "Games", icon: Gamepad2, image: "https://cdn.pixabay.com/photo/2015/12/23/22/39/minecraft-1106262_1280.png?w=400&h=400&fit=crop", count: "890" },
    { id: 5, name: "Music", icon: Music, image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop", count: "5.4k" },
    { id: 6, name: "Fonts", icon: Type, image: "https://images.unsplash.com/photo-1509305717900-84f40e786d82?w=400&h=400&fit=crop", count: "3.2k" },
    { id: 7, name: "3D Assets", icon: Box, image: "https://cdn.pixabay.com/photo/2017/03/04/14/19/helicopter-2116170_1280.jpg?w=400&h=400&fit=crop", count: "1.4k" },
    { id: 8, name: "Templates", icon: Layout, image: "https://cdn.pixabay.com/photo/2022/02/20/22/11/background-7025417_1280.png?w=400&h=400&fit=crop", count: "4.7k" },
    { id: 9, name: "Courses", icon: GraduationCap, image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=400&fit=crop", count: "2.8k" },
    { id: 10, name: "Audio", icon: Headphones, image: "https://cdn.pixabay.com/photo/2018/08/27/10/11/radio-cassette-3634616_1280.png?w=400&h=400&fit=crop", count: "1.6k" },
    { id: 11, name: "Art", icon: Palette, image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop", count: "8.9k" },
    { id: 12, name: "Fitness", icon: Dumbbell, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop", count: "560" },
];

export default function ShopByCategory() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Title animation
        gsap.fromTo(".categories-header",
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".categories-header",
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Category cards stagger animation
        gsap.fromTo(".category-item",
            { opacity: 0, y: 30, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.5,
                stagger: 0.05,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: ".categories-grid",
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Hover animations for each card
        const cards = containerRef.current?.querySelectorAll(".category-item");
        cards?.forEach((card) => {
            const icon = card.querySelector(".category-icon");
            const image = card.querySelector(".category-image");

            card.addEventListener("mouseenter", () => {
                gsap.to(icon, { y: -5, duration: 0.3 });
                gsap.to(image, { scale: 1.1, duration: 0.5 });
            });

            card.addEventListener("mouseleave", () => {
                gsap.to(icon, { y: 0, duration: 0.3 });
                gsap.to(image, { scale: 1, duration: 0.5 });
            });
        });

    }, { scope: containerRef });

    return (
        <section className="relative py-24 md:py-32 overflow-hidden bg-[#050505]">
            <div ref={containerRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="categories-header text-center mb-16">
                    <h2 className="section-title text-white mb-4">
                        Browse <span className="text-gray-500">Categories</span>
                    </h2>
                    <p className="section-subtitle mx-auto text-white/40 font-light">
                        Explore our extensive catalog of premium digital assets
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="categories-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <Link
                                key={category.id}
                                href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="category-item group relative aspect-[4/5] overflow-hidden bg-white/5 border border-white/5 hover:border-white/20 transition-colors"
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        fill
                                        className="category-image object-cover opacity-40 group-hover:opacity-20 grayscale transition-all duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="absolute inset-0 p-5 flex flex-col items-center justify-center text-center z-10">
                                    <div className="category-icon mb-4 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-black/50 backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all duration-300">
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    <h3 className="text-white font-medium text-lg mb-1 tracking-wide">
                                        {category.name}
                                    </h3>

                                    <span className="text-xs text-white/40 uppercase tracking-widest font-medium">
                                        {category.count} Items
                                    </span>
                                </div>

                                {/* Border corner accent */}
                                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </Link>
                        );
                    })}
                </div>

                {/* View All Button */}
                <div className="text-center mt-12">
                    <Link
                        href="/categories"
                        className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1"
                    >
                        <span className="text-sm font-medium tracking-widest uppercase">View Full Catalog</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}