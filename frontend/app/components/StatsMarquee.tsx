"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Building2, Users, ShoppingBag, Award, TrendingUp, Globe, ArrowRight } from "lucide-react";

// Register plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

const stats = [
    { icon: Building2, value: "10k+", label: "Creators" },
    { icon: Users, value: "500k+", label: "Users" },
    { icon: ShoppingBag, value: "1M+", label: "Sales" },
    { icon: Award, value: "99%", label: "Satisfaction" },
    { icon: TrendingUp, value: "$50M", label: "Earnings" },
    { icon: Globe, value: "150+", label: "Countries" },
];

const brands = [
    "Adobe", "Figma", "Notion", "Slack", "Discord", "Spotify", "Shopify", "Stripe", "Webflow", "Canva"
];

export default function StatsMarquee() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Stats cards animation
        gsap.fromTo(".stat-item",
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".stats-grid",
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }, { scope: containerRef });

    return (
        <section className="relative py-24 bg-black overflow-hidden border-t border-white/5">
            <div ref={containerRef} className="relative">
                {/* Stats Grid */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                    <div className="stats-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 border-b border-white/10 pb-16">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="stat-item text-center group">
                                    <div className="mb-4 flex justify-center text-white/30 group-hover:text-white transition-colors duration-300">
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-1 tracking-tight">
                                        {stat.value}
                                    </div>
                                    <div className="text-white/40 text-xs uppercase tracking-widest font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Brands Marquee */}
                <div className="relative overflow-hidden">
                    {/* Gradient Fade Left */}
                    <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-black to-transparent z-10" />
                    {/* Gradient Fade Right */}
                    <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-black to-transparent z-10" />

                    <div className="flex animate-marquee">
                        {/* First set of brands */}
                        {[...brands, ...brands, ...brands].map((brand, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 mx-16 text-4xl font-bold text-white/10 hover:text-white/40 transition-colors cursor-default"
                            >
                                {brand}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Banner */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-32">
                    <div className="relative bg-[#111] border border-white/10 p-12 md:p-20 text-center overflow-hidden group">
                        {/* Hover effect background */}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                                Start Your Journey
                            </h3>
                            <p className="text-white/50 mb-10 text-lg font-light">
                                Join the world's most premium digital marketplace today.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button className="bg-white text-black px-8 py-4 font-bold text-sm uppercase tracking-wide hover:bg-gray-200 transition-colors">
                                    Get Started Free
                                </button>
                                <button className="border border-white/20 text-white px-8 py-4 font-bold text-sm uppercase tracking-wide hover:bg-white hover:text-black transition-all">
                                    View Pricing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
