"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

// Register plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

const testimonials = [
    {
        id: 1,
        content: "The minimalist design assets completely transformed our brand identity. Clean, professional, and exactly what we needed for our launch.",
        author: "Sarah Chen",
        role: "Creative Director",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        rating: 5,
    },
    {
        id: 2,
        content: "Incredible quality. I've been using the UI kits for three different projects now and they are consistently excellent and easy to customize.",
        author: "Marcus Johnson",
        role: "Product Designer",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        rating: 5,
    },
    {
        id: 3,
        content: "DigiStore has become my go-to for all digital resources. The curation is top-notch and saves me hours of searching for quality assets.",
        author: "Emily Rodriguez",
        role: "Frontend Developer",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        rating: 5,
    },
];

export default function Testimonials() {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Header animation
        gsap.fromTo(".testimonials-header",
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".testimonials-header",
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Testimonial cards stagger animation
        gsap.fromTo(".testimonial-card",
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: ".testimonials-grid",
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );

    }, { scope: containerRef });

    return (
        <section className="relative py-24 md:py-32 bg-[#050505] overflow-hidden border-t border-white/5">
            <div ref={containerRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="testimonials-header text-center mb-16">
                    <h2 className="section-title text-white mb-4">
                        Client <span className="text-gray-500">Stories</span>
                    </h2>
                    <p className="section-subtitle mx-auto text-white/40 font-light">
                        Trusted by visionary creators and brands worldwide
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="testimonials-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="testimonial-card bg-[#0a0a0a] border border-white/5 p-8 relative group hover:border-white/20 transition-colors duration-300"
                        >
                            {/* Quote Icon */}
                            <div className="mb-6 text-white/10 group-hover:text-white/30 transition-colors">
                                <Quote className="w-12 h-12" />
                            </div>

                            {/* Content */}
                            <p className="text-white/70 text-lg leading-relaxed mb-8 font-light italic">
                                &ldquo;{testimonial.content}&rdquo;
                            </p>

                            {/* Footer */}
                            <div className="flex items-center gap-4 mt-auto pt-6 border-t border-white/5">
                                <div className="relative w-12 h-12 grayscale group-hover:grayscale-0 transition-all duration-500">
                                    <Image
                                        src={testimonial.avatar}
                                        alt={testimonial.author}
                                        fill
                                        className="object-cover rounded-full"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">{testimonial.author}</h4>
                                    <p className="text-white/40 text-sm">{testimonial.role}</p>
                                </div>
                                <div className="ml-auto flex gap-0.5">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-3 h-3 text-white fill-white" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
