"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaApple,
  FaMicrosoft,
  FaGoogle,
  FaUber,
} from "react-icons/fa";
import Link from "next/link";

const images = [
  "/images/digital1.jpg",
  "/images/digital2.jpg",
  "/images/digital3.jpg",
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  // Auto-slide background
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-white text-gray-900">
      {/* Hero Section */}
      <section className="pt-28 md:pt-32 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-bold text-maroon-800 leading-tight">
            Buy and Sell Digital Products Easily
          </h2>
          <p className="mt-4 text-gray-600 text-lg">
            Join thousands of Nigerian creators selling PDFs, music, videos,
            and more — securely and instantly on DigiStore.
          </p>
          <div className="mt-6 flex justify-center md:justify-start gap-4">
            <Link href={"/auth"} className="bg-maroon-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-maroon-800 transition">
              Start Selling
            </Link>
            <Link href={"/products"} className="border border-maroon-700 text-maroon-700 px-6 py-3 rounded-lg font-medium hover:bg-maroon-50 transition">
              Explore Products
            </Link>
          </div>
        </div>

        {/* Right background image carousel */}
        <div className="relative md:w-1/2 w-full h-72 md:h-[450px] rounded-2xl overflow-hidden shadow-lg">
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={images[current]}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
        </div>
      </section>

      {/* Supporting companies section */}
      <section className="py-12 px-6 md:px-12 text-center">
        <h3 className="text-gray-600 font-medium mb-6">
          Trusted by companies worldwide
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-10 text-gray-500 text-4xl">
          <FaMicrosoft />
          <FaApple />
          <FaGoogle />
          <FaUber />
        </div>
      </section>
    </div>
  );
}
