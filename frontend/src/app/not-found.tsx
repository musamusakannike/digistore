"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  FaHome, 
  FaSearch, 
  FaArrowLeft,
  FaExclamationTriangle
} from "react-icons/fa";

export default function NotFoundPage() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-50 via-white to-red-50 flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center py-4 px-6 md:px-12 bg-white/70 backdrop-blur-md shadow-sm">
        <h1 className="text-2xl font-bold text-red-900">DigiStore</h1>
        <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
          <Link href="#features" className="hover:text-red-900">
            Features
          </Link>
          <Link href="#pricing" className="hover:text-red-900">
            Pricing
          </Link>
          <Link href="#contact" className="hover:text-red-900">
            Contact
          </Link>
        </div>
        <button className="bg-red-900 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition">
          Get Started
        </button>
      </nav>

      {/* 404 Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Animated 404 Number */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-[150px] md:text-[200px] font-bold text-red-900 leading-none opacity-20">
                404
              </h1>
            </motion.div>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-6"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100">
                <FaExclamationTriangle className="text-4xl text-red-900" />
              </div>
            </motion.div>

            {/* Main Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-red-900 mb-4">
                Page Not Found
              </h2>
              <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                Oops! The page you&apos;re looking for seems to have wandered off into the digital wilderness. 
                Let&apos;s get you back on track.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <button
                onClick={handleGoBack}
                className="flex items-center gap-2 px-6 py-3 border-2 border-red-900 text-red-900 rounded-lg font-medium hover:bg-red-50 transition"
              >
                <FaArrowLeft />
                Go Back
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 bg-red-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-800 transition"
              >
                <FaHome />
                Back to Home
              </Link>
              <Link
                href="/products"
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                <FaSearch />
                Browse Products
              </Link>
            </motion.div>

            {/* Suggestions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-2xl mx-auto"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Looking for something specific?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <Link
                  href="/products"
                  className="p-4 border border-gray-200 rounded-lg hover:border-red-900 hover:bg-red-50 transition group"
                >
                  <h4 className="font-semibold text-gray-900 group-hover:text-red-900 mb-1">
                    Browse All Products
                  </h4>
                  <p className="text-sm text-gray-600">
                    Explore our digital marketplace
                  </p>
                </Link>
                <Link
                  href="/seller"
                  className="p-4 border border-gray-200 rounded-lg hover:border-red-900 hover:bg-red-50 transition group"
                >
                  <h4 className="font-semibold text-gray-900 group-hover:text-red-900 mb-1">
                    Become a Seller
                  </h4>
                  <p className="text-sm text-gray-600">
                    Start selling your digital products
                  </p>
                </Link>
                <Link
                  href="/help"
                  className="p-4 border border-gray-200 rounded-lg hover:border-red-900 hover:bg-red-50 transition group"
                >
                  <h4 className="font-semibold text-gray-900 group-hover:text-red-900 mb-1">
                    Help Center
                  </h4>
                  <p className="text-sm text-gray-600">
                    Get answers to your questions
                  </p>
                </Link>
                <Link
                  href="/contact"
                  className="p-4 border border-gray-200 rounded-lg hover:border-red-900 hover:bg-red-50 transition group"
                >
                  <h4 className="font-semibold text-gray-900 group-hover:text-red-900 mb-1">
                    Contact Support
                  </h4>
                  <p className="text-sm text-gray-600">
                    We&apos;re here to help you
                  </p>
                </Link>
              </div>
            </motion.div>

            {/* Popular Products */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="mt-12"
            >
              <p className="text-gray-600 mb-4">
                Or check out some of our popular products:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/products/ebooks"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-red-900 hover:text-white transition font-medium"
                >
                  📚 E-Books
                </Link>
                <Link
                  href="/products/music"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-red-900 hover:text-white transition font-medium"
                >
                  🎵 Music
                </Link>
                <Link
                  href="/products/videos"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-red-900 hover:text-white transition font-medium"
                >
                  🎬 Videos
                </Link>
                <Link
                  href="/products/graphics"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-red-900 hover:text-white transition font-medium"
                >
                  🎨 Graphics
                </Link>
                <Link
                  href="/products/software"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-red-900 hover:text-white transition font-medium"
                >
                  💻 Software
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 text-sm">
            © 2025 DigiStore. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}