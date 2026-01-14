import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Collections() {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 md:px-16 lg:px-20 py-12">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                    Featured Categories
                </h2>
                <Link
                    href="#"
                    className="text-sm font-semibold text-gray-900 hover:text-gray-700 underline decoration-gray-900 underline-offset-4"
                >
                    View all
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-8 h-auto md:h-150">
                {/* Left Card - Large */}
                <div className="relative group overflow-hidden rounded-2xl bg-gray-100 h-125 md:h-full">
                    <Image
                        src="/images/hero/carousel1.jpg"
                        alt="Stock Photos"
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

                    <div className="absolute top-8 left-8">
                        <span className="inline-flex items-center rounded-full bg-[#FF6B35] px-4 py-1.5 text-sm font-medium text-white shadow-sm">
                            New Arrivals
                        </span>
                    </div>

                    <div className="absolute bottom-0 p-8 w-full md:w-4/5 lg:w-3/4">
                        <h3 className="text-3xl font-bold text-white mb-3 leading-tight">
                            High-Quality Stock Photos for Your Creative Projects
                        </h3>
                        <p className="text-gray-200 mb-6 text-lg">
                            Explore our curated collection of stunning, royalty-free images.
                        </p>
                        <button className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-900">
                            Browse Now
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Right Column - Stacked */}
                <div className="flex flex-col gap-4 lg:gap-8 h-full">
                    {/* Top Right Card */}
                    <div className="relative group flex-1 overflow-hidden rounded-2xl bg-gray-100 min-h-62.5">
                        <Image
                            src="https://images.unsplash.com/photo-1603406136476-85d8c3ec76a5?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=2070&auto=format&fit=crop"
                            alt="Ebooks"
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                    </div>

                    {/* Bottom Right Card */}
                    <div className="relative group flex-1 overflow-hidden rounded-2xl bg-[#FF6B35] min-h-62.5">
                        <Image
                             src="https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=2106&auto=format&fit=crop"
                            alt="Software"
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                    </div>
                </div>
            </div>
        </section>
    );
}
