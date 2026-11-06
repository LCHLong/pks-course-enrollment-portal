import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav
      aria-label="Điều hướng phân trang"
      className="flex items-center justify-center gap-1.5 sm:gap-2 pt-6"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isLoading}
        aria-label="Chuyển đến trang trước"
        data-testid="btn-pagination-prev"
        className="h-11 px-3 sm:px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline text-xs font-medium">Trang trước</span>
      </button>

      {pages.map((p) => {
        const isActive = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            disabled={isLoading}
            aria-label={`Trang ${p}`}
            aria-current={isActive ? 'page' : undefined}
            data-testid={`btn-page-${p}`}
            className={`w-11 h-11 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center ${
              isActive
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                : 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {p}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || isLoading}
        aria-label="Chuyển đến trang tiếp theo"
        data-testid="btn-pagination-next"
        className="h-11 px-3 sm:px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
      >
        <span className="hidden sm:inline text-xs font-medium">Trang sau</span>
        <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </nav>
  );
};
