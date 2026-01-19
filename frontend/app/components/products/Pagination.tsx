"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (count: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
}: PaginationProps) {
    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, "...", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
            }
        }
        return pages;
    };

    if (totalPages === 0) return null;

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-white/10 mt-12">
            {/* Items per page selector */}
            <div className="flex items-center gap-3 order-2 md:order-1">
                <span className="text-sm text-white/50">Show</span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="bg-[#0a0a0a] border border-white/20 text-white text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-white transition-colors cursor-pointer"
                >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                </select>
                <span className="text-sm text-white/50">per page</span>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2 order-1 md:order-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-white/10 rounded-lg text-white hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) => {
                        if (page === "...") {
                            return (
                                <span key={`ellipsis-${index}`} className="w-8 flex justify-center">
                                    <MoreHorizontal size={16} className="text-white/30" />
                                </span>
                            );
                        }

                        return (
                            <button
                                key={page}
                                onClick={() => onPageChange(page as number)}
                                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${currentPage === page
                                    ? "bg-white text-black font-bold"
                                    : "text-white/60 hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-white/10 rounded-lg text-white hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
