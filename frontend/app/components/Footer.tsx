"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import {
    Send, MapPin, Phone, Mail, ArrowRight, Twitter, Instagram, Github, Linkedin, Facebook, Youtube, Heart
} from "lucide-react";

// Register plugins
gsap.registerPlugin(ScrollTrigger, useGSAP);

const footerLinks = {
    product: [
        { name: "Features", href: "/features" },
        { name: "Pricing", href: "/pricing" },
        { name: "Marketplace", href: "/marketplace" },
        { name: "Sitemap", href: "/sitemap" },
    ],
    company: [
        { name: "About", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Press", href: "/press" },
        { name: "Blog", href: "/blog" },
    ],
    support: [
        { name: "Help Center", href: "/help" },
        { name: "Terms", href: "/terms" },
        { name: "Privacy", href: "/privacy" },
    ],
};

const socialLinks = [
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Github, href: "https://github.com", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

export default function Footer() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [email, setEmail] = useState("");

    useGSAP(() => {
        gsap.fromTo(".footer-content",
            { opacity: 0, y: 30 },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: "footer",
                    start: "top 90%",
                }
            }
        );
    }, { scope: containerRef });

    return (
        <footer ref={containerRef} className="relative pt-24 bg-black border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 footer-content">
                {/* Top Section: Brand & Newsletter */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 mb-20">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white flex items-center justify-center">
                                <span className="text-black font-bold text-xl">D</span>
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">DigiStore</span>
                        </Link>
                        <p className="text-white/50 mb-8 max-w-sm font-light leading-relaxed">
                            The premium marketplace for digital assets. Curated quality for professionals and creatives.
                        </p>
                        <div className="flex gap-4">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-white hover:border-white hover:text-black transition-all duration-300"
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    <div className="lg:pl-12 border-l border-white/5">
                        <h4 className="text-white font-bold text-lg mb-2">Subscribe to our newsletter</h4>
                        <p className="text-white/40 mb-6 text-sm">Latest products and exclusive deals, weekly.</p>
                        <form className="flex gap-0">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="flex-1 bg-white/5 border border-white/10 px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-white/30 transition-all font-light"
                            />
                            <button className="bg-white text-black px-6 md:px-8 font-bold text-sm uppercase tracking-wide hover:bg-gray-200 transition-colors">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Middle Section: Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 border-t border-white/5 pt-12">
                    {/* Columns */}
                    <div>
                        <h5 className="text-white font-bold mb-6">Product</h5>
                        <ul className="space-y-4">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-white/50 hover:text-white transition-colors text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white font-bold mb-6">Company</h5>
                        <ul className="space-y-4">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-white/50 hover:text-white transition-colors text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white font-bold mb-6">Support</h5>
                        <ul className="space-y-4">
                            {footerLinks.support.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-white/50 hover:text-white transition-colors text-sm">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white font-bold mb-6">Contact</h5>
                        <ul className="space-y-4 text-sm text-white/50">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4" /> hello@digistore.com
                            </li>
                            <li className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> San Francisco, CA
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/5 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white/30 text-xs">
                        © {new Date().getFullYear()} DigiStore Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-white/30 text-xs">
                        <span>Made with</span>
                        <Heart className="w-3 h-3 text-white fill-white" />
                        <span>for creators</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}