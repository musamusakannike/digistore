"use client";
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';

const categories = [
    { id: 1, name: 'E-books', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop' },
    { id: 2, name: 'Software', image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=400&fit=crop' },
    { id: 3, name: 'Stock Photos', image: 'https://cdn.pixabay.com/photo/2020/12/20/03/59/photography-5846035_1280.jpg?w=400&h=400&fit=crop' },
    { id: 4, name: 'Video Games', image: 'https://cdn.pixabay.com/photo/2015/12/23/22/39/minecraft-1106262_1280.png?w=400&h=400&fit=crop' },
    { id: 5, name: 'Music', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop' },
    { id: 6, name: 'Fonts', image: 'https://images.unsplash.com/photo-1509305717900-84f40e786d82?w=400&h=400&fit=crop' },
    { id: 7, name: '3D Models', image: 'https://cdn.pixabay.com/photo/2017/03/04/14/19/helicopter-2116170_1280.jpg?w=400&h=400&fit=crop' },
    { id: 8, name: 'Templates', image: 'https://cdn.pixabay.com/photo/2022/02/20/22/11/background-7025417_1280.png?w=400&h=400&fit=crop' },
    { id: 9, name: 'Online Courses', image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=400&fit=crop' },
    { id: 10, name: 'Audiobooks', image: 'https://cdn.pixabay.com/photo/2018/08/27/10/11/radio-cassette-3634616_1280.png?w=400&h=400&fit=crop' },
    { id: 11, name: 'Digital Art', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop' },
    { id: 12, name: 'Fitness Programs', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop' },
];

export default function ShopByCategory() {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 md:px-16 lg:px-20 py-12">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
                Shop by Category
            </h2>

            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-500 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 lg:gap-10 mb-8">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="flex flex-col items-center group cursor-pointer"
                        >
                            <div className="relative w-full aspect-square rounded-full overflow-hidden mb-3 transition-transform duration-300 group-hover:scale-105">
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    width={200}
                                    height={200}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-sm md:text-base font-medium text-gray-800 text-center">
                                {category.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                    {isExpanded ? 'Hide categories' : 'Show categories'}
                    <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                </button>
            </div>
        </div>
    );
}