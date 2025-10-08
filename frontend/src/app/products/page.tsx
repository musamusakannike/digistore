"use client";
import { useState } from "react";
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

const categories = [
  { id: "all", name: "All Products", icon: FaFileAlt },
  { id: "ebooks", name: "E-Books", icon: FaBook },
  { id: "music", name: "Music", icon: FaMusic },
  { id: "videos", name: "Videos", icon: FaVideo },
  { id: "graphics", name: "Graphics", icon: FaImage },
  { id: "software", name: "Software", icon: FaCode },
];

const products = [
  {
    id: 1,
    title: "Complete Web Development Course",
    description: "Learn HTML, CSS, JavaScript and React from scratch",
    price: 15000,
    category: "ebooks",
    rating: 4.8,
    reviews: 234,
    seller: "TechGuru NG",
    image:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Afrobeat Music Pack Vol. 1",
    description: "Professional Afrobeat loops and samples for producers",
    price: 8500,
    category: "music",
    rating: 4.9,
    reviews: 456,
    seller: "BeatMaker Pro",
    image:
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Nigerian Recipe Collection",
    description: "150+ authentic Nigerian recipes with step-by-step guides",
    price: 3500,
    category: "ebooks",
    rating: 4.7,
    reviews: 189,
    seller: "Naija Kitchen",
    image:
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    title: "Social Media Marketing Masterclass",
    description: "Complete video course on growing your brand online",
    price: 12000,
    category: "videos",
    rating: 4.6,
    reviews: 312,
    seller: "Digital Marketing Hub",
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    title: "Premium Logo Templates Bundle",
    description: "50+ professional logo templates for businesses",
    price: 6500,
    category: "graphics",
    rating: 4.8,
    reviews: 278,
    seller: "DesignPro Nigeria",
    image:
      "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    title: "Invoice & Receipt Generator",
    description: "Automated invoice creation software for businesses",
    price: 9500,
    category: "software",
    rating: 4.5,
    reviews: 145,
    seller: "BizTools NG",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop",
  },
  {
    id: 7,
    title: "Photography Presets Collection",
    description: "100+ Lightroom presets for stunning photos",
    price: 4500,
    category: "graphics",
    rating: 4.9,
    reviews: 523,
    seller: "PhotoMaster NG",
    image:
      "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&h=300&fit=crop",
  },
  {
    id: 8,
    title: "Financial Planning Guide",
    description: "Complete guide to personal finance management in Nigeria",
    price: 5000,
    category: "ebooks",
    rating: 4.7,
    reviews: 267,
    seller: "Money Matters NG",
    image:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=300&fit=crop",
  },
  {
    id: 9,
    title: "Fitness Training Videos Bundle",
    description: "30-day home workout program with nutrition guide",
    price: 7500,
    category: "videos",
    rating: 4.8,
    reviews: 398,
    seller: "FitLife Nigeria",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
  },
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch =
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 via-white to-rose-100">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center py-4 px-6 md:px-12 bg-white/60 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50 shadow-sm">
        <h1 className="text-2xl font-extrabold text-red-900 tracking-tight">
          DigiStore
        </h1>
        <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
          {["Features", "Pricing", "Contact"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="hover:text-red-800 transition-colors"
            >
              {link}
            </a>
          ))}
        </div>
        <button className="bg-red-900 text-white px-5 py-2.5 rounded-xl hover:bg-red-800 transition-all shadow-md">
          Get Started
        </button>
      </nav>

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
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 250 }}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="relative h-52">
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-red-900/90 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                    {formatPrice(product.price)}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <FaStar className="text-yellow-400" />
                    {product.rating} • {product.reviews} reviews
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                    <span className="text-sm text-gray-600">
                      by {product.seller}
                    </span>
                    <button className="flex items-center gap-2 bg-red-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-800 transition">
                      <FaShoppingCart className="text-xs" />
                      Buy Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-gray-500 text-lg">
              No products found matching your search.
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
