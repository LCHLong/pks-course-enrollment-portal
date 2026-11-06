import React from 'react';
import { AlertTriangle, SearchX } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export const DEFAULT_CATEGORIES = [
  'Fullstack Development',
  'Frontend Development',
  'Backend Development',
  'DevOps & Architecture',
  'Tin Học Văn Phòng',
];

export const CatalogLoadingState: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Đang tải danh sách khóa học"
      data-testid="state-catalog-loading"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="h-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 bg-white dark:bg-zinc-900"
        >
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
};

interface CatalogErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const CatalogErrorState: React.FC<CatalogErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div
      role="alert"
      aria-label="Lỗi tải danh mục khóa học"
      data-testid="state-catalog-error"
      className="py-16 text-center space-y-4 border border-red-500/20 rounded-2xl bg-red-50/50 dark:bg-red-950/20 p-6"
    >
      <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
        Không thể tải danh sách khóa học
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
      <button
        onClick={onRetry}
        aria-label="Thử tải lại danh mục"
        data-testid="btn-retry-catalog"
        className="h-11 px-6 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        Thử lại
      </button>
    </div>
  );
};

interface CatalogEmptyStateProps {
  onClearFilters: () => void;
}

export const CatalogEmptyState: React.FC<CatalogEmptyStateProps> = ({ onClearFilters }) => {
  return (
    <div
      role="status"
      aria-label="Không có khóa học nào"
      data-testid="state-catalog-empty"
      className="py-16 text-center space-y-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6"
    >
      <SearchX className="w-10 h-10 text-zinc-400 mx-auto" />
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
        Không tìm thấy khóa học nào phù hợp
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Vui lòng thử từ khóa tìm kiếm khác hoặc xóa bộ lọc danh mục.
      </p>
      <button
        onClick={onClearFilters}
        aria-label="Xóa tất cả bộ lọc tìm kiếm"
        data-testid="btn-clear-filter"
        className="h-11 px-6 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        Xóa bộ lọc
      </button>
    </div>
  );
};
