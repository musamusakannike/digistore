"use client";

import { useCart } from "../context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ArrowLeft, ShoppingBag } from "lucide-react";
import { formatNaira } from "../lib/money";

export default function CartPage() {
    const { cartItems, cartTotal, updateItemQuantity, removeItem } = useCart();

    const tax = cartTotal * 0.075;
    const total = cartTotal + tax;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[#000000]">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Shopping Cart</h1>
                </div>

                {cartItems.length === 0 ? (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag className="w-12 h-12 text-white/20" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Your cart is empty</h2>
                        <p className="text-white/40 max-w-md text-lg">Looks like you haven't added anything to your cart yet. Explore our marketplace to find premium digital assets.</p>
                        <Link
                            href="/"
                            className="mt-4 px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
                        >
                            Start Browsing
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-6 transition-all hover:border-white/10">
                                    {/* Product Image */}
                                    <div className="relative w-full sm:w-32 h-32 bg-white/5 rounded-xl overflow-hidden flex-shrink-0">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                                                <p className="text-sm text-white/40">{item.category}</p>
                                            </div>
                                            <p className="text-xl font-bold text-white">{formatNaira(item.price)}</p>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 sm:mt-0">
                                            <div className="flex items-center gap-4 bg-white/5 rounded-xl px-3 py-1.5 border border-white/5">
                                                <button
                                                    onClick={() => updateItemQuantity({ productId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                                                    className="text-white/40 hover:text-white transition-colors p-1"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="text-sm font-bold text-white w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateItemQuantity({ productId: item.id, quantity: item.quantity + 1 })}
                                                    className="text-white/40 hover:text-white transition-colors p-1"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="flex items-center gap-2 text-white/40 hover:text-red-400 transition-colors text-sm font-medium pr-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="hidden sm:inline">Remove</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 sticky top-24">
                                <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center justify-between text-white/60">
                                        <span>Subtotal</span>
                                        <span className="text-white font-medium">{formatNaira(cartTotal)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-white/60">
                                        <span>VAT (7.5%)</span>
                                        <span className="text-white font-medium">{formatNaira(tax)}</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                        <span className="text-lg font-bold text-white">Total</span>
                                        <span className="text-2xl font-bold text-white">{formatNaira(total)}</span>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-transform active:scale-95 flex items-center justify-center gap-2 group mb-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                >
                                    Checkout Now
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>

                                <p className="text-xs text-center text-white/30">
                                    Secure checkout powered by Flutterwave
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
