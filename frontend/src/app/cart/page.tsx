"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import { getCart, updateCartItem, removeFromCart, clearCart, createOrder, initializePayment } from "@/lib/endpoints";
import type { Cart, CartItem, Product } from "@/lib/types";
import { getAccessToken } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAccessToken();
      if (!token) return router.push("/auth");
      const data = await getCart();
      console.log("Cart data: ", JSON.stringify(data, null, 2))
      setCart(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleQty = async (item: CartItem, delta: number) => {
    try {
      const pId = typeof item.product === 'object' ? (item.product as Product)._id : String(item.product);
      const nextQty = Math.max(1, (item.quantity || 1) + delta);
      const updated = await updateCartItem(pId, nextQty);
      setCart(updated);
    } catch (e) {
      alert((e as Error).message || "Failed to update quantity");
    }
  };

  const handleRemove = async (item: CartItem) => {
    try {
      const pId = typeof item.product === 'object' ? (item.product as Product)._id : String(item.product);
      const updated = await removeFromCart(pId);
      setCart(updated);
    } catch (e) {
      alert((e as Error).message || "Failed to remove item");
    }
  };

  const handleClear = async () => {
    try {
      const updated = await clearCart();
      setCart(updated);
    } catch (e) {
      alert((e as Error).message || "Failed to clear cart");
    }
  };

  const handleCheckout = async () => {
    try {
      const order = await createOrder({ paymentMethod: "flutterwave" });
      const init = await initializePayment(order._id);
      if (init.paymentLink) window.location.href = init.paymentLink;
    } catch (e) {
      alert((e as Error).message || "Failed to start checkout");
    }
  };

  const itemCount = useMemo(() => cart?.summary.itemCount ?? 0, [cart]);
  const totalPrice = useMemo(() => cart?.summary.total ?? 0, [cart]);

  if (loading) return <div className="pt-32 pb-12 px-6">Loading cart...</div>;
  if (error) return <div className="pt-32 pb-12 px-6 text-red-700">{error}</div>;

  return (
    <div className="pt-32 pb-16 px-6 md:px-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Cart</h1>

      {!cart || cart.cart.items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-600">Your cart is empty.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <div className="space-y-4">
              {cart.cart.items.map((item, idx) => {
                const p = item.product as Product;
                return (
                  <div key={idx} className="flex items-center gap-4 border-b border-gray-100 pb-4">
                    <div className="relative w-24 h-24 rounded overflow-hidden bg-gray-100">
                      <Image src={p?.thumbnail || p?.images?.[0] || "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=200&h=200&fit=crop"} alt={p?.title || "Product"} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 line-clamp-1">{p?.title || 'Product'}</div>
                      <div className="text-sm text-gray-600">₦{(item.price || 0).toLocaleString()}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <button onClick={() => handleQty(item, -1)} className="p-2 rounded border border-gray-300 hover:bg-gray-50"><FaMinus /></button>
                        <div className="px-3 py-1 border rounded">{item.quantity}</div>
                        <button onClick={() => handleQty(item, +1)} className="p-2 rounded border border-gray-300 hover:bg-gray-50"><FaPlus /></button>
                        <button onClick={() => handleRemove(item)} className="ml-4 p-2 rounded border border-red-300 text-red-700 hover:bg-red-50"><FaTrash /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow p-6 h-fit">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="flex justify-between text-gray-700 mb-2">
              <span>Items</span>
              <span>{itemCount}</span>
            </div>
            <div className="flex justify-between text-gray-900 font-semibold text-lg mb-4">
              <span>Total</span>
              <span>₦{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCheckout} className="flex-1 bg-maroon-700 text-white px-4 py-3 rounded-lg hover:bg-maroon-800">Checkout</button>
              <button onClick={handleClear} className="px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Clear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
