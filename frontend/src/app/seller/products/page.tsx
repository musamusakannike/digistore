"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSellerProducts, deleteProductApi, submitProductApi } from "@/lib/endpoints";
import type { Product } from "@/lib/types";
import Image from "next/image";
import { getAccessToken } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function SellerProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAccessToken();
      if (!token) return router.push("/auth");
      const data = await getSellerProducts();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      setBusyId(id);
      await deleteProductApi(id);
      await load();
    } catch (e) {
      alert((e as Error).message || "Failed to delete product");
    } finally {
      setBusyId(null);
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      setBusyId(id);
      await submitProductApi(id);
      alert("Product submitted for review");
      await load();
    } catch (e) {
      alert((e as Error).message || "Failed to submit product");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="pt-32 pb-12 px-6">Loading products...</div>;
  if (error) return <div className="pt-32 pb-12 px-6 text-red-700">{error}</div>;

  return (
    <div className="pt-32 pb-16 px-6 md:px-12">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
        <Link href="/seller/products/new" className="bg-maroon-700 text-white px-4 py-2 rounded-lg hover:bg-maroon-800">New Product</Link>
      </div>

      {items.length === 0 ? (
        <div className="max-w-6xl mx-auto mt-6 bg-white rounded-2xl shadow p-8 text-center text-gray-600">No products yet.</div>
      ) : (
        <div className="max-w-6xl mx-auto mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => (
            <div key={p._id} className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="relative h-40">
                <Image src={p.thumbnail || p.images?.[0] || "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop"} alt={p.title} fill className="object-cover" />
              </div>
              <div className="p-4">
                <div className="font-semibold text-gray-900 line-clamp-1">{p.title}</div>
                <div className="text-sm text-gray-600 capitalize">{p.status || 'draft'}</div>
                <div className="mt-3 flex gap-2">
                  <Link href={`/seller/products/${p._id}`} className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Edit</Link>
                  <button onClick={() => handleSubmit(p._id)} disabled={busyId === p._id} className="px-3 py-1 rounded-lg border border-maroon-300 text-maroon-700 hover:bg-maroon-50 disabled:opacity-60">Submit</button>
                  <button onClick={() => handleDelete(p._id)} disabled={busyId === p._id} className="px-3 py-1 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
