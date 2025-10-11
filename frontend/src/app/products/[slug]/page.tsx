"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import {
  fetchProductBySlug,
  fetchProduct,
  fetchRelatedProducts,
  addToCart,
  createDirectOrder,
  initializePayment,
  getProductReviews,
  createReviewApi,
  canReview,
} from "@/lib/endpoints";
import type { Product, Review } from "@/lib/types";
import { getAccessToken } from "@/lib/storage";

export default function ProductDetailsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [canReviewFlag, setCanReviewFlag] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const slug = params?.slug;
        let p: Product | null = null;
        if (!slug) return;
        try {
          const res = await fetchProductBySlug(slug);
          p = res;
        } catch {
          // If slug fetch fails, try as ID
          try { p = await fetchProduct(slug); } catch {}
        }
        if (!p) throw new Error("Product not found");
        setProduct(p);
        try {
          const rel = await fetchRelatedProducts(p._id);
          setRelated(rel.products || []);
        } catch {}
        try {
          const r = await getProductReviews(p._id, { page: 1, limit: 5 });
          setReviews(r.reviews || []);
        } catch {}
        try {
          const cr = await canReview(p._id);
          setCanReviewFlag(!!cr.canReview);
        } catch {}
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [params?.slug]);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const handleAddToCart = async () => {
    try {
      if (!product) return;
      const token = getAccessToken();
      if (!token) return router.push("/auth");
      await addToCart({ productId: product._id, quantity });
      alert("Added to cart");
    } catch (e) {
      alert((e as Error).message || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    try {
      if (!product) return;
      const token = getAccessToken();
      if (!token) return router.push("/auth");
      const order = await createDirectOrder({ productId: product._id, quantity, paymentMethod: "flutterwave" });
      const init = await initializePayment(order._id);
      if (init.paymentLink) window.location.href = init.paymentLink;
    } catch (e) {
      alert((e as Error).message || "Failed to start payment");
    }
  };

  const handleCreateReview = async () => {
    try {
      if (!product) return;
      const token = getAccessToken();
      if (!token) return router.push("/auth");
      await createReviewApi({ product: product._id, rating: reviewRating, comment: reviewText });
      const r = await getProductReviews(product._id, { page: 1, limit: 5 });
      setReviews(r.reviews || []);
      setReviewText("");
      alert("Review submitted");
    } catch (e) {
      alert((e as Error).message || "Failed to submit review");
    }
  };

  if (loading) return <div className="pt-32 pb-12 px-6">Loading...</div>;
  if (error) return <div className="pt-32 pb-12 px-6 text-red-700">{error}</div>;
  if (!product) return null;

  return (
    <div className="pt-32 pb-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <Image
            src={product.thumbnail || product.images?.[0] || "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop"}
            alt={product.title}
            width={800}
            height={600}
            className="w-full h-auto object-cover"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
          <div className="flex items-center gap-2 text-gray-600 mt-2">
            <FaStar className="text-yellow-400" />
            <span>{product.rating ?? 4.8} • {product.reviewsCount ?? 100} reviews</span>
          </div>
          <div className="mt-4 text-2xl font-semibold text-maroon-800">{formatPrice(product.price || 0)}</div>
          <p className="mt-4 text-gray-700 leading-relaxed">{product.description}</p>

          <div className="mt-6 flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
            />
            <button onClick={handleAddToCart} className="bg-maroon-700 text-white px-4 py-2 rounded-lg hover:bg-maroon-800">Add to Cart</button>
            <button onClick={handleBuyNow} className="border border-maroon-700 text-maroon-700 px-4 py-2 rounded-lg hover:bg-maroon-50">Buy Now</button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Reviews</h2>
          {reviews.length === 0 && <div className="text-gray-500">No reviews yet.</div>}
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaStar className="text-yellow-400" /> {r.rating} • {typeof r.user === 'object' ? r.user.name : 'User'}
                </div>
                <p className="text-gray-700 mt-1">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="text-lg font-semibold mb-3">Write a review</h3>
          {!canReviewFlag ? (
            <div className="text-gray-500 text-sm">Purchase required to review.</div>
          ) : (
            <div className="space-y-3">
              <label className="block text-sm">Rating</label>
              <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2">
                {[5,4,3,2,1].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <label className="block text-sm">Comment</label>
              <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={4} placeholder="Share your experience..." />
              <button onClick={handleCreateReview} className="bg-maroon-700 text-white px-4 py-2 rounded-lg hover:bg-maroon-800">Submit Review</button>
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="max-w-6xl mx-auto mt-12">
          <h3 className="text-xl font-semibold mb-4">Related Products</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((rp) => (
              <Link href={`/products/${rp.slug || rp._id}`} key={rp._id} className="bg-white rounded-2xl shadow p-4 hover:shadow-md transition">
                <div className="relative h-40 rounded overflow-hidden">
                  <Image src={rp.thumbnail || rp.images?.[0] || "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop"} alt={rp.title} fill className="object-cover" />
                </div>
                <div className="mt-3 font-medium text-gray-900 line-clamp-1">{rp.title}</div>
                <div className="text-sm text-maroon-800 mt-1">{formatPrice(rp.price || 0)}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
