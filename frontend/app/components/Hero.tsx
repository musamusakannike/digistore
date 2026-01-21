"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight, Play, Star, Briefcase } from "lucide-react";
import Image from "next/image";

// Register GSAP
gsap.registerPlugin(useGSAP);

const stats = [
    { value: "50K+", label: "Digital Products" },
    { value: "100K+", label: "Happy Customers" },
    { value: "4.9", label: "Average Rating" },
];

const floatingProducts = [
    { src: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop", alt: "E-book", delay: 0 },
    { src: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=200&h=200&fit=crop", alt: "Software", delay: 0.2 },
    { src: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop", alt: "Music", delay: 0.4 },
];

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const heroContentRef = useRef<HTMLDivElement>(null);
    const floatingRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useGSAP(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        // Initial animations
        tl.fromTo(".hero-badge",
            { opacity: 0, y: 30, scale: 0.8 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8 }
        )
            .fromTo(".hero-title .word",
                { opacity: 0, y: 80, rotateX: -90 },
                { opacity: 1, y: 0, rotateX: 0, duration: 1, stagger: 0.1 },
                "-=0.4"
            )
            .fromTo(".hero-subtitle",
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8 },
                "-=0.6"
            )
            .fromTo(".hero-buttons",
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8 },
                "-=0.4"
            )
            .fromTo(".hero-stat",
                { opacity: 0, y: 40, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15 },
                "-=0.4"
            )
            .fromTo(".floating-product",
                { opacity: 0, scale: 0, rotate: -20 },
                { opacity: 1, scale: 1, rotate: 0, duration: 1, stagger: 0.2, ease: "elastic.out(1, 0.5)" },
                "-=0.8"
            );

        // Floating animation for products
        gsap.to(".floating-product", {
            y: "random(-20, 20)",
            x: "random(-10, 10)",
            rotation: "random(-5, 5)",
            duration: "random(3, 5)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: {
                each: 0.5,
                from: "random"
            }
        });

        // Animate background shapes
        gsap.to(".bg-shape", {
            scale: "random(1, 1.2)",
            opacity: "random(0.1, 0.2)",
            duration: "random(5, 10)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: 2
        });

    }, { scope: containerRef });

    // Mouse parallax effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / 50;
            const y = (e.clientY - rect.top - rect.height / 2) / 50;
            setMousePosition({ x, y });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen overflow-hidden bg-black"
        >
            {/* Animated Background Elements - Monochrome */}
            <div className="absolute inset-0 grid-pattern opacity-20" />

            {/* Floating Orbs - Subtle White/Gray */}
            <div
                className="bg-shape absolute top-20 left-10 w-96 h-96 rounded-full bg-white blur-[150px] opacity-10"
                style={{ transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)` }}
            />
            <div
                className="bg-shape absolute bottom-20 right-10 w-80 h-80 rounded-full bg-gray-500 blur-[120px] opacity-10"
                style={{ transform: `translate(${-mousePosition.x * 1.5}px, ${-mousePosition.y * 1.5}px)` }}
            />

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 md:pt-32 md:pb-40">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Left Content */}
                    <div ref={heroContentRef} className="text-center lg:text-left">
                        {/* Badge */}
                        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-0 border border-white/10 bg-white/5 backdrop-blur-md mb-8">
                            <span className="flex h-2 w-2 rounded-0 bg-white animate-pulse" />
                            <span className="text-sm text-white/90 font-medium tracking-wide">
                                NEW PRODUCTS ADDED DAILY
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="hero-title section-title text-white mb-6">
                            <span className="word inline-block">Discover</span>{" "}
                            <span className="word inline-block">Premium</span>
                            <br className="hidden sm:block" />
                            <span className="word inline-block gradient-text">Digital</span>{" "}
                            <span className="word inline-block gradient-text">Assets</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="hero-subtitle text-lg md:text-xl text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 font-light">
                            The definitive marketplace for creators and professionals.
                            Curated high-quality software, courses, and design assets.
                        </p>

                        {/* Buttons */}
                        <div className="hero-buttons flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                            <button className="btn-primary flex items-center justify-center gap-2 group">
                                <span>Explore Collection</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <a href="/seller/dashboard" className="btn-secondary flex items-center justify-center gap-2 group hover:bg-white/10">
                                <Briefcase className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                <span>Become Seller</span>
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-12 border-t border-white/10 pt-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="hero-stat text-center lg:text-left">
                                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                    <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Content - Floating Products */}
                    <div
                        ref={floatingRef}
                        className="relative h-96 lg:h-[500px] hidden lg:block"
                        style={{
                            transform: `translate(${mousePosition.x * -2}px, ${mousePosition.y * -2}px)`,
                            transition: "transform 0.3s ease-out"
                        }}
                    >
                        {/* Central Product Card - Monochrome Glass */}
                        <div className="floating-product absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-80 glass-card rounded-3xl p-4 animate-pulse-glow z-20 bg-black/40 border border-white/20">
                            <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4 grayscale hover:grayscale-0 transition-all duration-500">
                                <Image
                                    src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop"
                                    alt="Featured Product"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider">
                                    Bestseller
                                </div>
                            </div>
                            <h3 className="text-white font-semibold mb-2 text-lg">Modern UI Kit</h3>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold text-xl">$49.00</span>
                                <div className="flex items-center gap-1 text-white/80">
                                    <Star className="w-4 h-4 fill-white text-white" />
                                    <span className="text-sm">4.9</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating Mini Cards - Monochrome */}
                        {floatingProducts.map((product, index) => (
                            <div
                                key={index}
                                className="floating-product absolute w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-2xl grayscale hover:grayscale-0 transition-all duration-500"
                                style={{
                                    top: `${15 + index * 35}%`,
                                    left: index % 2 === 0 ? "5%" : "85%",
                                    opacity: 0.8
                                }}
                            >
                                <Image
                                    src={product.src}
                                    alt={product.alt}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}

                        {/* Decorative Rings - White/Grey */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5 animate-ring" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/10"
                            style={{ animationDirection: "reverse", animationDuration: "40s" }} />
                    </div>
                </div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        </section>
    );
}
