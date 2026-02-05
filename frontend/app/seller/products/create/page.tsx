"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { apiFetchEnvelope } from "../../../lib/api";

type Category = {
    _id: string;
    name: string;
    slug: string;
};

export default function CreateProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingCategories, setFetchingCategories] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        shortDescription: "",
        description: "",
        category: "",
        price: "",
        discountPrice: "",
        tags: "",
    });

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetchEnvelope<{ categories: Category[] }>("/categories", {
                    method: "GET",
                });
                setCategories(res.data.categories || []);
            } catch (e) {
                console.error("Failed to fetch categories", e);
            } finally {
                setFetchingCategories(false);
            }
        })();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const tagsArray = formData.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
                tags: tagsArray,
            };

            await apiFetchEnvelope("/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            router.push("/seller/products");
        } catch (err: any) {
            setError(err?.message || "Failed to create product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link
                    href="/seller/products"
                    className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Create Product</h1>
                    <p className="text-gray-400 mt-1">Add a new product to your store.</p>
                </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden p-6 md:p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-white/80 mb-1">
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20 transition-colors"
                                placeholder="Product Name"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-white/80 mb-1">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
                                >
                                    <option value="" disabled className="bg-neutral-900">
                                        Select a category
                                    </option>
                                    {fetchingCategories ? (
                                        <option disabled className="bg-neutral-900">
                                            Loading categories...
                                        </option>
                                    ) : (
                                        categories.map((cat) => (
                                            <option key={cat._id} value={cat._id} className="bg-neutral-900">
                                                {cat.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-white/80 mb-1">
                                    Price
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20 transition-colors"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label htmlFor="discountPrice" className="block text-sm font-medium text-white/80 mb-1">
                                    Discount Price (Optional)
                                </label>
                                <input
                                    type="number"
                                    id="discountPrice"
                                    name="discountPrice"
                                    min="0"
                                    step="0.01"
                                    value={formData.discountPrice}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20 transition-colors"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label htmlFor="tags" className="block text-sm font-medium text-white/80 mb-1">
                                    Tags (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="tags"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20 transition-colors"
                                    placeholder="Comma separated tags (e.g. digital, art, design)"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="shortDescription" className="block text-sm font-medium text-white/80 mb-1">
                                Short Description
                            </label>
                            <textarea
                                id="shortDescription"
                                name="shortDescription"
                                required
                                rows={2}
                                value={formData.shortDescription}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20 transition-colors"
                                placeholder="Brief summary of the product"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-white/80 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                rows={6}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20 transition-colors"
                                placeholder="Detailed description of the product"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/10">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Create Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
