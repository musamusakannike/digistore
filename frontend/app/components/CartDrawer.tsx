"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useCart } from "../context/CartContext";
import { formatNaira } from "../lib/money";

export default function CartDrawer() {
    const { isCartOpen, closeCart, cartItems, cartTotal, updateItemQuantity, removeItem } = useCart();
    const drawerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const tax = cartTotal * 0.075;
    const total = cartTotal + tax;

    useGSAP(() => {
        const tl = gsap.timeline({ paused: true });

        // Ensure initial state
        gsap.set(drawerRef.current, { x: "100%" });
        gsap.set(overlayRef.current, { opacity: 0, pointerEvents: "none" });

        if (contentRef.current) {
            gsap.set(contentRef.current.children, { y: 20, opacity: 0 });
        }

        tl.to(overlayRef.current, {
            opacity: 1,
            pointerEvents: "all",
            duration: 0.3,
            ease: "power2.inOut"
        })
            .to(drawerRef.current, {
                x: "0%",
                duration: 0.5,
                ease: "power3.out"
            }, "-=0.3")
            .to(contentRef.current!.children, {
                y: 0,
                opacity: 1,
                stagger: 0.05,
                duration: 0.4,
                ease: "power2.out"
            }, "-=0.2");

        if (isCartOpen) {
            tl.play();
            document.body.style.overflow = 'hidden';
        } else {
            tl.reverse();
            document.body.style.overflow = 'unset';
        }

    }, [isCartOpen]);

    return (
        <div className="hidden md:block relative z-100">
            {/* Overlay */}
            <div
                ref={overlayRef}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity"
                onClick={closeCart}
            />

            {/* Drawer */}
            <div
                ref={drawerRef}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 shadow-2xl transform translate-x-full"
            >
                <div className="flex flex-col h-full" ref={contentRef}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <ShoppingBag className="w-5 h-5 text-white" />
                            <h2 className="text-xl font-bold text-white tracking-tight">Your Cart <span className="text-white/40 text-sm font-normal">({cartItems.length})</span></h2>
                        </div>
                        <button
                            onClick={closeCart}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                        >
                            <X className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {cartItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-2">
                                    <ShoppingBag className="w-8 h-8 text-white/20" />
                                </div>
                                <h3 className="text-lg font-medium text-white">Your cart is empty</h3>
                                <p className="text-white/40 max-w-xs">Looks like you haven't added anything to your cart yet.</p>
                                <button
                                    onClick={closeCart}
                                    className="mt-4 px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors"
                                >
                                    Start Browsing
                                </button>
                            </div>
                        ) : (
                            cartItems.map((item) => (
                                <div key={item.id} className="flex gap-4 group">
                                    {/* Product Image */}
                                    <div className="relative w-20 h-20 bg-white/5 rounded-xl overflow-hidden shrink-0 border border-white/5 group-hover:border-white/20 transition-colors">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="text-sm font-semibold text-white truncate pr-2">{item.name}</h3>
                                                <p className="text-sm font-bold text-white">{formatNaira(item.price)}</p>
                                            </div>
                                            <p className="text-xs text-white/40 mt-1">{item.category}</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center gap-3 bg-white/5 rounded-lg px-2 py-1 border border-white/5">
                                                <button
                                                    onClick={() => updateItemQuantity({ productId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                                                    className="text-white/40 hover:text-white transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-xs font-medium text-white w-3 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateItemQuantity({ productId: item.id, quantity: item.quantity + 1 })}
                                                    className="text-white/40 hover:text-white transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-white/40 hover:text-red-400 transition-colors p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {cartItems.length > 0 && (
                        <div className="p-6 border-t border-white/10 bg-[#0a0a0a]">
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/60">Subtotal</span>
                                    <span className="text-white font-medium">{formatNaira(cartTotal)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/60">VAT (7.5%)</span>
                                    <span className="text-white font-medium">{formatNaira(tax)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/60">Delivery</span>
                                    <span className="text-white/40 italic">Digital (instant)</span>
                                </div>
                                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-white font-bold">Total</span>
                                    <span className="text-xl font-bold text-white">{formatNaira(total)}</span>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <Link
                                    href="/checkout"
                                    onClick={closeCart}
                                    className="w-full py-3.5 bg-white text-black font-bold text-center rounded-xl hover:bg-gray-200 transition-transform active:scale-95 flex items-center justify-center gap-2 group"
                                >
                                    Checkout
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <button
                                    onClick={closeCart}
                                    className="w-full py-3.5 bg-transparent border border-white/10 text-white font-medium text-center rounded-xl hover:bg-white/5 transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
