"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Category, Product, ProductFile } from "@/lib/types";
import {
  fetchProduct,
  fetchCategories,
  updateProductApi,
  uploadThumbnailApi,
  uploadImagesApi,
  deleteImageApi,
  uploadProductFilesApi,
  deleteProductFileApi,
  submitProductApi,
} from "@/lib/endpoints";
import Image from "next/image";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [tags, setTags] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imagesInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        if (!id) return;
        setLoading(true);
        setError(null);
        const [p, cats] = await Promise.all([
          fetchProduct(id),
          fetchCategories(),
        ]);
        setProduct(p);
        setCategories(cats.categories || []);
        // Initialize form
        setTitle(p.title || "");
        setShortDescription(p.shortDescription || "");
        setDescription(p.description || "");
        const catId = typeof p.category === 'object' ? (p.category?._id || '') : (p.category || '');
        setCategory(catId);
        setPrice(p.price || 0);
        setDiscountPrice(p.discountPrice);
        setTags((p.tags || []).join(", "));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const handleSave = async () => {
    try {
      if (!id) return;
      setSaving(true);
      await updateProductApi(id, {
        title,
        description,
        shortDescription,
        category,
        price: Number(price),
        discountPrice: discountPrice === undefined ? undefined : Number(discountPrice),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      const updated = await fetchProduct(id);
      setProduct(updated);
    } catch (e) {
      alert((e as Error).message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    try {
      setSaving(true);
      const updated = await uploadThumbnailApi(id, file);
      setProduct(updated);
    } catch (er) {
      alert((er as Error).message || "Thumbnail upload failed");
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !id) return;
    try {
      setSaving(true);
      const updated = await uploadImagesApi(id, files);
      setProduct(updated);
    } catch (er) {
      alert((er as Error).message || "Images upload failed");
    } finally {
      setSaving(false);
      if (imagesInputRef.current) imagesInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async (url: string) => {
    if (!id) return;
    try {
      setSaving(true);
      const updated = await deleteImageApi(id, url);
      setProduct(updated);
    } catch (er) {
      alert((er as Error).message || "Failed to delete image");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !id) return;
    try {
      setSaving(true);
      const updated = await uploadProductFilesApi(id, files);
      setProduct(updated);
    } catch (er) {
      alert((er as Error).message || "Files upload failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFile = async (file: ProductFile) => {
    if (!id) return;
    try {
      setSaving(true);
      const updated = await deleteProductFileApi(id, file._id);
      setProduct(updated);
    } catch (er) {
      alert((er as Error).message || "Failed to delete file");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await submitProductApi(id);
      alert("Product submitted for review");
    } catch (er) {
      alert((er as Error).message || "Failed to submit for review");
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  if (loading) return <div className="pt-32 pb-12 px-6">Loading product...</div>;
  if (error) return <div className="pt-32 pb-12 px-6 text-red-700">{error}</div>;
  if (!product) return null;

  return (
    <div className="pt-32 pb-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <button onClick={handleSubmitForReview} disabled={saving} className="bg-maroon-700 text-white px-4 py-2 rounded-lg hover:bg-maroon-800 disabled:opacity-70">Submit for Review</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2">
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                  <input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-4 py-2" />
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
                <button onClick={handleSave} disabled={saving} className="bg-maroon-700 text-white px-4 py-2 rounded-lg hover:bg-maroon-800 disabled:opacity-70">{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="bg-white rounded-2xl shadow p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-900">Media</h2>
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-1">Thumbnail</div>
              <div className="relative w-full h-40 rounded overflow-hidden bg-gray-100">
                <Image src={product.thumbnail || product.images?.[0] || "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop"} alt={product.title} fill className="object-cover" />
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadThumbnail} className="mt-2" />
            </div>
            <div className="mt-6">
              <div className="text-sm font-medium text-gray-700 mb-1">Images</div>
              <div className="grid grid-cols-3 gap-2">
                {(product.images || []).map((img, idx) => (
                  <div key={idx} className="relative group">
                    <Image src={img} alt={`img-${idx}`} width={120} height={90} className="w-full h-[90px] object-cover rounded" />
                    <button onClick={() => handleDeleteImage(img)} className="absolute top-1 right-1 text-xs bg-red-600 text-white px-2 py-0.5 rounded opacity-80 hover:opacity-100">Delete</button>
                  </div>
                ))}
              </div>
              <input ref={imagesInputRef} type="file" accept="image/*" onChange={handleUploadImages} multiple className="mt-2" />
            </div>
            <div className="mt-6">
              <div className="text-sm font-medium text-gray-700 mb-1">Files</div>
              <ul className="space-y-2">
                {(product.files || []).map((f) => (
                  <li key={f._id} className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded">
                    <span className="truncate mr-3">{f.name}</span>
                    <button onClick={() => handleDeleteFile(f)} className="px-3 py-1 rounded-lg border border-red-300 text-red-700 hover:bg-red-50">Delete</button>
                  </li>
                ))}
              </ul>
              <input type="file" onChange={handleUploadFiles} className="mt-2" />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="max-w-6xl mx-auto mt-8 bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
          <div className="mt-2 text-gray-700">{title}</div>
          <div className="text-maroon-800 font-semibold">{formatPrice(price || 0)}</div>
          <p className="mt-2 text-gray-600">{shortDescription}</p>
        </div>
      </div>
    </div>
  );
}
