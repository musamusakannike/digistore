"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";

// Register plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

const collections = [
    {
        id: 1,
        title: "Stock Photography",
        subtitle: "Monochrome & Minimalist",
        description: "Curated collection of high-contrast, professional-grade imagery for modern brands.",
        image: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop",
        badge: "Featured",
        link: "/collections/stock-photos"
    },
    {
        id: 2,
        title: "Editorial Design",
        subtitle: "Print & Digital",
        image: "https://images.unsplash.com/photo-1603406136476-85d8c3ec76a5?w=600&h=400&fit=crop",
        badge: "New",
        link: "/collections/ebooks"
    },
    {
        id: 3,
        title: "Productivity Tools",
        subtitle: "System & Workflow",
        image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=600&h=400&fit=crop",
        badge: "Popular",
        link: "/collections/software"
    }
];

export default function Collections() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        // Section title animation
        gsap.fromTo(".collections-title",
            { opacity: 0, y: 60 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".collections-title",
                    start: "top 85%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Main featured card animation
        gsap.fromTo(".featured-card",
            { opacity: 0, x: -50, scale: 0.95 },
            {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".featured-card",
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Side cards stagger animation
        gsap.fromTo(".side-card",
            { opacity: 0, x: 50, scale: 0.95 },
            {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 1,
                stagger: 0.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".side-cards",
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Parallax effect on scroll
        gsap.to(".parallax-image", {
            yPercent: -10,
            ease: "none",
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: 1
            }
        });

    }, { scope: containerRef });

    return (
        <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden bg-black">
            <div ref={containerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="collections-title flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 mb-4">
                            <span className="h-px w-8 bg-white/50"></span>
                            <span className="text-sm text-white/70 uppercase tracking-widest font-medium">Curated Sets</span>
                        </div>
                        <h2 className="section-title text-white">
                            Essential <span className="text-gray-500">Collections</span>
                        </h2>
                    </div>
                    <Link
                        href="/collections"
                        className="group flex items-center gap-2 text-white border-b border-white/30 pb-1 hover:border-white transition-all"
                    >
                        <span className="font-medium tracking-wide text-sm">VIEW ALL COLLECTIONS</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Collections Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* Main Featured Card */}
                    <div className="featured-card group relative overflow-hidden rounded-none h-[500px] md:h-[600px] lg:h-full border border-white/10">
                        <div className="absolute inset-0 parallax-image bg-gray-900">
                            <Image
                                src={collections[0].image}
                                alt={collections[0].title}
                                fill
                                className="object-cover transition-all duration-700 opacity-60 group-hover:opacity-100 group-hover:scale-105 grayscale group-hover:grayscale-0"
                            />
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="inline-block px-3 py-1 bg-white text-black text-xs font-bold uppercase tracking-wider">
                                    {collections[0].badge}
                                </span>
                                <span className="text-white/60 text-xs uppercase tracking-wider font-medium">
                                    {collections[0].subtitle}
                                </span>
                            </div>

                            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-none">
                                {collections[0].title}
                            </h3>
                            <p className="text-gray-400 mb-8 max-w-md font-light leading-relaxed">
                                {collections[0].description}
                            </p>

                            <Link
                                href={collections[0].link}
                                className="inline-flex items-center gap-3 group/btn text-white"
                            >
                                <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-black transition-all duration-300">
                                    <ArrowRight className="w-5 h-5 -rotate-45 group-hover/btn:rotate-0 transition-transform duration-300" />
                                </div>
                                <span className="font-medium tracking-wide text-sm group-hover/btn:translate-x-1 transition-transform">EXPLORE</span>
                            </Link>
                        </div>
                    </div>

                    {/* Side Cards */}
                    <div className="side-cards flex flex-col gap-4 lg:gap-6">
                        {collections.slice(1).map((collection) => (
                            <Link
                                key={collection.id}
                                href={collection.link}
                                className="side-card group relative overflow-hidden h-[240px] md:h-[290px] border border-white/10"
                            >
                                <div className="absolute inset-0 bg-gray-900">
                                    <Image
                                        src={collection.image}
                                        alt={collection.title}
                                        fill
                                        className="object-cover transition-all duration-700 opacity-60 group-hover:opacity-80 group-hover:scale-105 grayscale group-hover:grayscale-0"
                                    />
                                </div>

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />

                                {/* Content */}
                                <div className="absolute inset-0 p-8 flex flex-col justify-end items-start z-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Layers className="w-4 h-4 text-white/50" />
                                        <span className="text-white/50 text-xs font-bold uppercase tracking-wider">
                                            {collection.subtitle}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 group-hover:translate-x-2 transition-transform duration-300">
                                        {collection.title}
                                    </h3>

                                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 text-white border-b border-white pb-0.5">
                                        <span className="text-xs font-bold uppercase tracking-wider">Browse</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
