"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Dummy Cart Data
const dummyCartItems = [
    {
        id: 1,
        name: "Pro UI Kit Bundle",
        price: 49.00,
        image: "https://images.unsplash.com/photo-1558655146-d09347e0b7a9?q=80&w=2670&auto=format&fit=crop",
        quantity: 1,
        category: "Templates"
    },
    {
        id: 2,
        name: "SaaS Dashboard Template",
        price: 79.00,
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
        quantity: 1,
        category: "Software"
    }
];

interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
    category: string;
}

interface CartContextType {
    isCartOpen: boolean;
    toggleCart: () => void;
    closeCart: () => void;
    openCart: () => void;
    cartItems: CartItem[];
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems] = useState<CartItem[]>(dummyCartItems);

    const toggleCart = () => setIsCartOpen(prev => !prev);
    const closeCart = () => setIsCartOpen(false);
    const openCart = () => setIsCartOpen(true);

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ isCartOpen, toggleCart, closeCart, openCart, cartItems, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
