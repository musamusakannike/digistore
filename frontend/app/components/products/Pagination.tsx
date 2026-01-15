"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (count: number) => void;
}

const itemsPerPageOptions = [12, 24, 48];

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
}: PaginationProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getVisiblePages = () => {
        const pages: (number | "ellipsis")[] = [];
        const showPages = 5;

        if (totalPages <= showPages + 2) {
            // Show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage <= 3) {
                // Near start
                for (let i = 2; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push("ellipsis");
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Near end
                pages.push("ellipsis");
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // In middle
                pages.push("ellipsis");
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push("ellipsis");
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8">
            {/* Items info and per page selector */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                    Showing <span className="font-semibold text-gray-900">{startItem}-{endItem}</span> of{" "}
                    <span className="font-semibold text-gray-900">{totalItems}</span> products
                </span>

                <div className="hidden sm:flex items-center gap-2">
                    <span className="text-gray-500">Show:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
                        className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] cursor-pointer"
                    >
                        {itemsPerPageOptions.map((count) => (
                            <option key={count} value={count}>
                                {count}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 ${currentPage === 1
                            ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                            : "bg-white text-gray-700 border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35]"
                        }`}
                >
                    <ChevronLeft size={18} />
                </button>

                {/* Page Numbers - Desktop */}
                <div className="hidden sm:flex items-center gap-1">
                    {getVisiblePages().map((page, index) =>
                        page === "ellipsis" ? (
                            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                                ...
                            </span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${currentPage === page
                                        ? "bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/25"
                                        : "bg-white text-gray-700 border border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35]"
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>

                {/* Page indicator - Mobile */}
                <div className="sm:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl">
                    <span className="text-sm font-semibold text-gray-900">{currentPage}</span>
                    <span className="text-sm text-gray-400">/</span>
                    <span className="text-sm text-gray-500">{totalPages}</span>
                </div>

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 ${currentPage === totalPages
                            ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                            : "bg-white text-gray-700 border-gray-200 hover:border-[#FF6B35] hover:text-[#FF6B35]"
                        }`}
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
