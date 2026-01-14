"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
    id: number;
    badge: string;
    title: React.ReactNode;
    description?: string;
    buttonText: string;
    image: string;
    bgColor: string;
}

const slides: Slide[] = [
    {
        id: 1,
        badge: "Exclusive collection for everyone",
        title: (
            <>
                Up to <span className="font-bold">60% off</span> on
                <br />
                all digital items till
                <br />
                <span className="font-bold">September 11</span>
            </>
        ),
        buttonText: "Shop now",
        image: "/images/hero/carousel1.jpg",
        bgColor: "bg-[#F4A4A4]",
    },
    {
        id: 2,
        badge: "New Arrival",
        title: (
            <>
                Discover the <span className="font-bold">Future</span> of
                <br />
                Digital <span className="font-bold">Creativity</span>
                <br />
                today
            </>
        ),
        buttonText: "Explore Now",
        image: "/images/hero/carousel1.jpg",
        bgColor: "bg-[#F4A4A4]",
    },
];

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    // Auto-play
    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={`relative w-full overflow-hidden transition-colors duration-500 flex justify-center items-center`}>
            <div className={`mx-auto max-w-7xl min-w-[80vw] px-4 sm:px-6 lg:px-8 h-150 md:h-125 flex items-center relative rounded-2xl md:mt-10 overflow-hidden ${slides[currentSlide].bgColor}`}>

                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src={slides[currentSlide].image}
                        alt="Hero background"
                        fill
                        className="object-cover transition-transform duration-700"
                        priority
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 z-10" />
                </div>

                {/* Navigation Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 z-20 p-2 rounded-full bg-white/30 hover:bg-white/50 text-gray-800 transition-all hidden md:block"
                    aria-label="Previous slide"
                >
                    <ChevronLeft size={24} />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute right-4 z-20 p-2 rounded-full bg-white/30 hover:bg-white/50 text-gray-800 transition-all hidden md:block"
                    aria-label="Next slide"
                >
                    <ChevronRight size={24} />
                </button>

                {/* Slide Content */}
                <div className="relative z-20 w-full h-full flex flex-col justify-center items-center md:items-start pl-0 md:pl-12 text-center md:text-left">

                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/90 text-[#D95F5F] font-semibold text-sm shadow-sm mb-6">
                        {slides[currentSlide].badge}
                    </span>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-medium leading-[1.1] tracking-tight drop-shadow-sm mb-4">
                        {slides[currentSlide].title}
                    </h1>

                    <button className="bg-white text-black px-8 py-3 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors shadow-lg mt-4 cursor-pointer">
                        {slides[currentSlide].buttonText}
                    </button>

                    {/* Indicators */}
                    <div className="flex space-x-2 mt-8 md:mt-12">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === index ? "w-8 bg-[#FF6B6B]" : "w-8 bg-white/50 hover:bg-white/80"
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
