"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createProductApi, fetchCategories } from "@/lib/endpoints";
import type { Category } from "@/lib/types";

export default function NewProductPage() {
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [tags, setTags] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCategories();
        setCategories(data.categories || []);
      } catch {
        // ignore
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const created = await createProductApi({
        title,
        description,
        shortDescription,
        category,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      router.push(`/seller/products/${created._id}`);
    } catch (e) {
      setError((e as Error).message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-16 px-6 md:px-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Create New Product</h1>
        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={6} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-2">
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
              <input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} required className="w-full border border-gray-300 rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (₦)</label>
              <input type="number" min={0} value={discountPrice ?? ''} onChange={(e) => setDiscountPrice(e.target.value === '' ? undefined : Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>
          <div className="pt-2">
            <button type="submit" disabled={loading} className="bg-maroon-700 text-white px-4 py-2 rounded-lg hover:bg-maroon-800 disabled:opacity-70">{loading ? 'Creating...' : 'Create Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
