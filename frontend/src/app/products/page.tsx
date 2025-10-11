"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaFilter,
  FaBook,
  FaMusic,
  FaVideo,
  FaImage,
  FaCode,
  FaFileAlt,
  FaStar,
  FaShoppingCart,
} from "react-icons/fa";
import Image from "next/image";
import { fetchProducts, createDirectOrder, initializePayment } from "@/lib/endpoints";
import { getAccessToken } from "@/lib/storage";
import type { Product } from "@/lib/types";
import Link from "next/link";

const categories = [
  { id: "all", name: "All Products", icon: FaFileAlt },
  { id: "ebooks", name: "E-Books", icon: FaBook },
  { id: "music", name: "Music", icon: FaMusic },
  { id: "videos", name: "Videos", icon: FaVideo },
  { id: "graphics", name: "Graphics", icon: FaImage },
  { id: "software", name: "Software", icon: FaCode },
];

// Fallback demo items in case API fails (keeps UI/UX consistent)
const demoProducts = [
  {
    _id: "demo-1",
    title: "Complete Web Development Course",
    description: "Learn HTML, CSS, JavaScript and React from scratch",
    price: 15000,
    category: "ebooks",
    rating: 4.8,
    reviewsCount: 234,
    seller: { _id: "s1", name: "TechGuru NG" },
    images: [
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop",
    ],
  },
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Product[]>(demoProducts as unknown as Product[]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch products with optional search
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProducts(searchQuery ? { search: searchQuery } : {});
        setItems(data.products || []);
      } catch (e) {
        setError((e as Error).message);
        setItems(demoProducts);
      } finally {
        setLoading(false);
      }
    };

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(run, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    return items.filter((product) => {
      const catVal = typeof product.category === 'string'
        ? product.category
        : (product.category?.slug || product.category?._id);
      const matchesCategory =
        selectedCategory === "all" || (catVal === selectedCategory);
      const matchesSearch =
        product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const handleBuyNow = async (productId?: string) => {
    try {
      if (!productId) return;
      const token = getAccessToken();
      if (!token) {
        window.location.href = "/auth";
        return;
      }
      const order = await createDirectOrder({ productId, quantity: 1, paymentMethod: "flutterwave" });
      const init = await initializePayment(order._id);
      if (init.paymentLink) {
        window.location.href = init.paymentLink;
      }
    } catch (e) {
      alert((e as Error).message || "Failed to start payment");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-white to-rose-100">

      {/* HERO SECTION */}
      <section className="pt-32 pb-12 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Discover Digital Products
          </h2>
          <p className="text-gray-600 text-lg mb-10">
            Explore thousands of premium digital goods by top Nigerian creators.
          </p>

          {/* SEARCH + FILTERS */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-900 focus:outline-none transition"
                />
              </div>
              <button className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition">
                <FaFilter />
                <span className="hidden md:inline">Filters</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {categories.map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedCategory(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedCategory === id
                      ? "bg-red-900 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="text-sm" />
                  {name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* PRODUCT GRID */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 max-w-7xl mx-auto"
        >
          <div className="mb-6 flex justify-between items-center text-gray-700">
            <p>
              Showing <span className="font-semibold">{filteredProducts.length}</span>{" "}
              products
            </p>
            <select className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-900 focus:outline-none">
              <option>Sort by: Popular</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Highest Rated</option>
              <option>Newest</option>
            </select>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading && (
              <div className="col-span-full text-center text-gray-500">Loading products...</div>
            )}
            {!loading && filteredProducts.map((product, idx) => (
              <motion.div
                key={product._id || idx}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 250 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="relative h-52">
                  <Link href={`/products/${product.slug || product._id}`}>
                    <Image
                      src={product.thumbnail || product.images?.[0] || "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop"}
                      alt={product.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="absolute top-3 right-3 bg-red-900/90 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                    {formatPrice(product.price || 0)}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <FaStar className="text-yellow-400" />
                    {(product.rating ?? 4.8)} • {(product.reviewsCount ?? 100)} reviews
                  </div>
                  <Link href={`/products/${product.slug || product._id}`} className="block">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                    <span className="text-sm text-gray-600">
                      by {typeof product.seller === 'object'
                        ? ((`${product.seller?.firstName ?? ''} ${product.seller?.lastName ?? ''}`.trim()) || product.seller?.name || 'Seller')
                        : 'Seller'}
                    </span>
                    <button onClick={() => handleBuyNow(product._id)} className="flex items-center gap-2 bg-red-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-800 transition">
                      <FaShoppingCart className="text-xs" />
                      Buy Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-20 text-gray-500 text-lg">
              No products found matching your search.
            </div>
          )}
          {error && (
            <div className="text-center mt-6 text-sm text-red-700">{error}</div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
