import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, FileQuestion } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

export const DetailLoadingState: React.FC = () => {
  return (
    <div
      data-testid="state-detail-loading"
      aria-label="Đang tải chi tiết khóa học"
      className="space-y-6 max-w-6xl mx-auto py-6"
    >
      <Skeleton className="h-6 w-1/4" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    </div>
  );
};

export const Detail404State: React.FC = () => {
  return (
    <div
      data-testid="state-detail-404"
      aria-label="Không tìm thấy khóa học"
      className="py-20 text-center space-y-4 max-w-md mx-auto"
    >
      <FileQuestion className="w-16 h-16 text-zinc-400 mx-auto" />
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Không tìm thấy khóa học
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị ẩn.
      </p>
      <Link
        to="/"
        data-testid="btn-back-catalog"
        aria-label="Quay lại danh sách khóa học"
        className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        Quay lại danh mục
      </Link>
    </div>
  );
};

interface DetailErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const DetailErrorState: React.FC<DetailErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div
      data-testid="state-detail-error"
      aria-label="Lỗi tải chi tiết khóa học"
      className="py-20 text-center space-y-4 max-w-md mx-auto"
    >
      <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Lỗi tải dữ liệu khóa học
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
      <button
        onClick={onRetry}
        data-testid="btn-retry-detail"
        aria-label="Thử tải lại thông tin khóa học"
        className="h-11 px-6 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        Thử lại
      </button>
    </div>
  );
};
