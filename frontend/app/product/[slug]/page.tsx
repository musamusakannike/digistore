"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, ShoppingCart, ShieldCheck, Download, Loader2 } from "lucide-react";
import { apiFetch, apiFetchEnvelope } from "../../lib/api";
import { formatNaira } from "../../lib/money";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

type Product = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  discountPrice?: number;
  thumbnail: string;
  images: string[];
  files: Array<{ _id: string; name: string; url: string; size: number; type: string }>;
  category?: { name: string; slug: string };
  seller?: { _id: string; firstName: string; lastName: string; businessName?: string; avatar?: string; bio?: string; totalSales?: number };
  averageRating: number;
  reviewCount: number;
};

type Review = {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  user?: { firstName: string; lastName: string; avatar?: string };
};

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const router = useRouter();

  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const prod = await apiFetch<{ product: Product }>(`/products/slug/${slug}`, { method: "GET" });
        const prodData = prod.product;

        const reviewsRes = await apiFetchEnvelope<{ reviews: Review[] }>(
          `/reviews/product/${encodeURIComponent(prodData._id)}?limit=5`,
          { method: "GET" },
        );

        if (!mounted) return;
        setProduct(prodData);
        setReviews(reviewsRes.data.reviews || []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load product");
      } finally {
        if (!mounted) return;
        setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const price = useMemo(() => {
    if (!product) return 0;
    return product.discountPrice ?? product.price;
  }, [product]);

  const handleBuyNow = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    try {
      setIsBuying(true);
      const orderRes = await apiFetch<{ order: { _id: string } }>("/orders/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id, quantity: 1 }),
      });

      const payRes = await apiFetch<{ paymentUrl: string }>("/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderRes.order._id }),
      });

      window.location.href = payRes.paymentUrl;
    } catch (e: any) {
      setError(e?.message || "Failed to start checkout");
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <main className="min-h-screen bg-black pt-20">
      <div className="border-b border-white/10 bg-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/products" className="flex items-center gap-1 text-white/50 hover:text-white transition-colors">
              <ArrowLeft size={16} />
              <span>Products</span>
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-white font-medium">{product?.title || "Product"}</span>
          </nav>
        </div>
      </div>

      {isLoading ? (
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-16">
          <div className="bg-[#0a0a0a] border border-white/10 p-10 flex items-center gap-3 text-white">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading product...</span>
          </div>
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-16">
          <div className="bg-[#0a0a0a] border border-white/10 p-10 text-white">
            <div className="text-white/60 text-sm mb-2">Error</div>
            <div className="font-semibold">{error}</div>
          </div>
        </div>
      ) : !product ? null : (
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div className="relative w-full aspect-4/3 bg-[#0a0a0a] border border-white/10 overflow-hidden">
                <Image
                  src={product.thumbnail || product.images?.[0]}
                  alt={product.title}
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700 opacity-90"
                />
              </div>

              {product.images?.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.slice(0, 4).map((img) => (
                    <div key={img} className="relative aspect-4/3 bg-white/5 border border-white/10 overflow-hidden">
                      <Image src={img} alt={product.title} fill className="object-cover opacity-70 grayscale" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div>
                <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">
                  {product.category?.name || "Digital Product"}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{product.title}</h1>

                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-white fill-white" />
                    <span className="text-white font-medium">{(product.averageRating || 0).toFixed(1)}</span>
                  </div>
                  <span className="text-white/30">•</span>
                  <span className="text-white/50 text-sm">{product.reviewCount || 0} reviews</span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/50 text-sm">Instant download</span>
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-white/10 p-6 space-y-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-white/40 text-sm">Price</div>
                    <div className="text-3xl font-bold text-white">{formatNaira(price)}</div>
                    {product.discountPrice && (
                      <div className="text-white/30 text-sm line-through">{formatNaira(product.price)}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <ShieldCheck className="w-4 h-4" />
                    Secure payment
                  </div>
                </div>

                <div className="grid gap-3">
                  <button
                    onClick={() => addItem({ productId: product._id, quantity: 1 })}
                    className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isBuying}
                    className="w-full py-3.5 bg-transparent border border-white/20 text-white font-bold rounded-xl hover:bg-white hover:text-black transition-colors uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    {isBuying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Buy Now
                  </button>
                </div>

                <div className="text-xs text-center text-white/30">
                  Payments powered by Flutterwave (NGN)
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-white/10 p-6">
                <h2 className="text-white font-bold text-lg mb-3">About this product</h2>
                <p className="text-white/60 leading-relaxed">{product.description}</p>
              </div>

              <div className="bg-[#0a0a0a] border border-white/10 p-6">
                <h2 className="text-white font-bold text-lg mb-4">Reviews</h2>
                {reviews.length === 0 ? (
                  <div className="text-white/40">No reviews yet.</div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r._id} className="border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-white font-medium">
                            {(r.user?.firstName || "") + " " + (r.user?.lastName || "")}
                          </div>
                          <div className="flex items-center gap-1 text-white">
                            <Star className="w-4 h-4 fill-white" />
                            <span className="text-sm font-semibold">{r.rating}</span>
                          </div>
                        </div>
                        <div className="text-white/80 font-semibold mt-2">{r.title}</div>
                        <div className="text-white/60 mt-1">{r.comment}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {product.seller && (
                <div className="bg-[#0a0a0a] border border-white/10 p-6">
                  <h2 className="text-white font-bold text-lg mb-4">Seller</h2>
                  <div className="flex items-start gap-4">
                    <div className="relative w-12 h-12 bg-white/10 border border-white/10 overflow-hidden rounded-full">
                      {product.seller.avatar ? (
                        <Image src={product.seller.avatar} alt="Seller" fill className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-semibold">
                        {product.seller.businessName || `${product.seller.firstName} ${product.seller.lastName}`}
                      </div>
                      {product.seller.bio ? <div className="text-white/50 text-sm mt-1">{product.seller.bio}</div> : null}
                      <div className="text-white/40 text-sm mt-2">Total sales: {product.seller.totalSales || 0}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
