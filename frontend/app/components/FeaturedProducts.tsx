import ProductCard from "./ProductCard";
import Link from "next/link";

// Dummy product data
const featuredProducts = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=600&fit=crop",
        title: "The Complete Digital Marketing Masterclass - 23 Courses in 1",
        category: "Online Courses",
        description: "Master digital marketing with this comprehensive course bundle. Learn SEO, social media marketing, email marketing, content marketing, and more. Perfect for beginners and professionals looking to upgrade their skills.",
        rating: 4.8,
        reviewCount: 12453,
        price: 29.99,
        originalPrice: 199.99,
        discountPercent: 85,
        author: "Sarah Johnson",
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=600&fit=crop",
        title: "Professional Photo Editing Software Suite",
        category: "Software",
        description: "Industry-leading photo editing software with AI-powered tools, advanced filters, and professional-grade features. Lifetime license included with free updates.",
        rating: 4.9,
        reviewCount: 8932,
        price: 79.99,
        originalPrice: 149.99,
        discountPercent: 47,
        author: "TechVision Studios",
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1481627276234-cf5f7c2d8f15?w=800&h=600&fit=crop",
        title: "Premium Stock Photo Bundle - 10,000+ High-Res Images",
        category: "Stock Photos",
        description: "Massive collection of royalty-free stock photos covering business, nature, technology, lifestyle, and more. Perfect for designers, marketers, and content creators.",
        rating: 4.7,
        reviewCount: 5621,
        price: 49.99,
        originalPrice: 299.99,
        discountPercent: 83,
    },
    {
        id: 4,
        image: "https://images.unsplash.com/photo-1509305717900-84f40e786d82?w=800&h=600&fit=crop",
        title: "Modern Font Collection - 150+ Premium Typefaces",
        category: "Fonts",
        description: "Curated collection of modern, elegant fonts for all your design projects. Includes sans-serif, serif, script, and display fonts with full commercial license.",
        rating: 4.6,
        reviewCount: 3245,
        price: 39.99,
        originalPrice: 89.99,
        discountPercent: 56,
        author: "TypeMaster Co.",
    },
    {
        id: 5,
        image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop",
        title: "Royalty-Free Music Pack - 500+ Tracks",
        category: "Music",
        description: "High-quality background music for videos, podcasts, presentations, and more. Multiple genres including corporate, cinematic, upbeat, and ambient.",
        rating: 4.8,
        reviewCount: 7834,
        price: 59.99,
        originalPrice: 199.99,
        discountPercent: 70,
        author: "AudioWave Productions",
    },
    {
        id: 6,
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop",
        title: "3D Character Models Pack - Game Ready Assets",
        category: "3D Models",
        description: "Professional 3D character models optimized for games and animations. Includes rigged models with multiple texture variations and animations.",
        rating: 4.9,
        reviewCount: 4567,
        price: 89.99,
        originalPrice: 249.99,
        discountPercent: 64,
        author: "3D Art Studio",
    },
    {
        id: 7,
        image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&h=600&fit=crop",
        title: "Web Development Bootcamp - Zero to Hero",
        category: "Online Courses",
        description: "Complete web development course covering HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build real-world projects and get job-ready skills.",
        rating: 4.9,
        reviewCount: 15678,
        price: 34.99,
        originalPrice: 149.99,
        discountPercent: 77,
        author: "CodeMaster Academy",
    },
    {
        id: 8,
        image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=600&fit=crop",
        title: "Business Website Templates - 50+ Designs",
        category: "Templates",
        description: "Modern, responsive website templates for businesses, portfolios, and landing pages. Easy to customize with clean code and documentation.",
        rating: 4.7,
        reviewCount: 6234,
        price: 44.99,
        originalPrice: 99.99,
        discountPercent: 55,
        author: "WebDesign Pro",
    },
];

export default function FeaturedProducts() {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 md:px-16 lg:px-20 py-12">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
                        Featured Products
                    </h2>
                    <p className="text-gray-600">
                        Discover our handpicked selection of top-rated digital products
                    </p>
                </div>
                <Link
                    href="#"
                    className="text-sm font-semibold text-gray-900 hover:text-gray-700 underline decoration-gray-900 underline-offset-4"
                >
                    View all products
                </Link>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                ))}
            </div>

            {/* Load More Button */}
            <div className="flex justify-center mt-12">
                <button className="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                    Load More Products
                </button>
            </div>
        </section>
    );
}
