import React from 'react';
import { Search, X, RotateCcw, Loader2 } from 'lucide-react';

interface CourseFiltersProps {
  search: string;
  category: string;
  categories: string[];
  isSearching?: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onReset: () => void;
}

export const CourseFilters: React.FC<CourseFiltersProps> = ({
  search,
  category,
  categories,
  isSearching = false,
  onSearchChange,
  onCategoryChange,
  onReset,
}) => {
  const hasActiveFilters = !!search.trim() || !!category;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        {isSearching ? (
          <Loader2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 animate-spin pointer-events-none" />
        ) : (
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        )}
        <input
          type="text"
          role="searchbox"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm kiếm khóa học theo tên hoặc giảng viên..."
          aria-label="Tìm kiếm khóa học theo tên hoặc giảng viên"
          data-testid="input-search-catalog"
          className="w-full h-11 pl-10 pr-10 text-base sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-400/10 focus:border-zinc-900 dark:focus:border-zinc-400 transition-colors"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            aria-label="Xóa từ khóa tìm kiếm"
            data-testid="btn-clear-search"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="sm:w-64">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Lọc khóa học theo danh mục"
          data-testid="select-filter-category"
          className="w-full h-11 px-3 text-base sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-400/10 focus:border-zinc-900 dark:focus:border-zinc-400 transition-colors cursor-pointer"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Clear All Filters Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          aria-label="Xóa tất cả bộ lọc tìm kiếm"
          data-testid="btn-clear-filter"
          className="h-11 px-4 text-xs sm:text-sm font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Xóa bộ lọc</span>
        </button>
      )}
    </div>
  );
};
