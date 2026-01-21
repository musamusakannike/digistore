"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { apiFetch } from "../lib/api";
import { useAuth } from "./AuthContext";

// Dummy Cart Data
const dummyCartItems = [
    {
        id: "1",
        name: "Pro UI Kit Bundle",
        price: 49.00,
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
        quantity: 1,
        category: "Templates"
    },
    {
        id: "2",
        name: "SaaS Dashboard Template",
        price: 79.00,
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
        quantity: 1,
        category: "Software"
    }
];

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    category: string;
    slug?: string;
}

interface CartContextType {
    isCartOpen: boolean;
    toggleCart: () => void;
    closeCart: () => void;
    openCart: () => void;
    cartItems: CartItem[];
    cartTotal: number;
    refreshCart: () => Promise<void>;
    addItem: (args: { productId: string; quantity?: number }) => Promise<void>;
    updateItemQuantity: (args: { productId: string; quantity: number }) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    clear: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    const guestKey = "digistore_guest_cart";

    const loadGuestCart = (): CartItem[] => {
        if (typeof window === "undefined") return [];
        const raw = localStorage.getItem(guestKey);
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw) as CartItem[];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    const saveGuestCart = (items: CartItem[]) => {
        if (typeof window === "undefined") return;
        localStorage.setItem(guestKey, JSON.stringify(items));
    };

    const mapServerCart = (cart: any): CartItem[] => {
        const items = (cart?.items || []) as Array<{ product: any; quantity: number }>;
        return items
            .map((item) => {
                const product = item.product;
                if (!product) return null;
                const categoryName = product.category?.name || "";
                const price = product.discountPrice ?? product.price;
                return {
                    id: product._id,
                    name: product.title,
                    price,
                    image: product.thumbnail || product.images?.[0] || dummyCartItems[0]?.image,
                    quantity: item.quantity,
                    category: categoryName,
                    slug: product.slug,
                } as CartItem;
            })
            .filter(Boolean) as CartItem[];
    };

    const refreshCart = async () => {
        if (!isAuthenticated) {
            const guestItems = loadGuestCart();
            setCartItems(guestItems);
            return;
        }

        const data = await apiFetch<{ cart: any }>("/cart");
        setCartItems(mapServerCart(data.cart));
    };

    useEffect(() => {
        refreshCart();
    }, [isAuthenticated]);

    const toggleCart = () => setIsCartOpen(prev => !prev);
    const closeCart = () => setIsCartOpen(false);
    const openCart = () => setIsCartOpen(true);

    const addItem = async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
        if (!isAuthenticated) {
            const existing = loadGuestCart();
            const found = existing.find((i) => i.id === productId);
            if (found) {
                const next = existing.map((i) => (i.id === productId ? { ...i, quantity: i.quantity + quantity } : i));
                saveGuestCart(next);
                setCartItems(next);
                openCart();
                return;
            }

            const data = await apiFetch<{ product: any }>(`/products/${productId}`, { method: "GET", skipAuth: true });
            const p = data.product;
            const newItem: CartItem = {
                id: p._id,
                name: p.title,
                price: p.discountPrice ?? p.price,
                image: p.thumbnail || p.images?.[0] || dummyCartItems[0]?.image,
                quantity,
                category: p.category?.name || "",
                slug: p.slug,
            };

            const next = [...existing, newItem];
            saveGuestCart(next);
            setCartItems(next);
            openCart();
            return;
        }

        await apiFetch("/cart/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity }),
        });
        await refreshCart();
        openCart();
    };

    const updateItemQuantity = async ({ productId, quantity }: { productId: string; quantity: number }) => {
        if (!isAuthenticated) {
            const existing = loadGuestCart();
            const next = existing.map((i) => (i.id === productId ? { ...i, quantity } : i));
            saveGuestCart(next);
            setCartItems(next);
            return;
        }

        await apiFetch(`/cart/items/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity }),
        });
        await refreshCart();
    };

    const removeItem = async (productId: string) => {
        if (!isAuthenticated) {
            const existing = loadGuestCart();
            const next = existing.filter((i) => i.id !== productId);
            saveGuestCart(next);
            setCartItems(next);
            return;
        }

        await apiFetch(`/cart/items/${productId}`, { method: "DELETE" });
        await refreshCart();
    };

    const clear = async () => {
        if (!isAuthenticated) {
            saveGuestCart([]);
            setCartItems([]);
            return;
        }
        await apiFetch("/cart", { method: "DELETE" });
        await refreshCart();
    };

    const cartTotal = useMemo(() => cartItems.reduce((total, item) => total + (item.price * item.quantity), 0), [cartItems]);

    return (
        <CartContext.Provider value={{ isCartOpen, toggleCart, closeCart, openCart, cartItems, cartTotal, refreshCart, addItem, updateItemQuantity, removeItem, clear }}>
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
