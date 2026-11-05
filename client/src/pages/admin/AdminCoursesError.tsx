import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AdminCoursesErrorProps {
  message: string;
  onRetry: () => void;
}

export const AdminCoursesError: React.FC<AdminCoursesErrorProps> = ({ message, onRetry }) => {
  return (
    <div
      role="alert"
      aria-label="Lỗi tải danh sách khóa học"
      data-testid="state-error-admin-courses"
      className="border border-red-200 dark:border-red-900/50 rounded-2xl p-6 sm:p-8 bg-red-50/80 dark:bg-red-950/20 text-center max-w-lg mx-auto space-y-4"
    >
      <div data-testid="error-alert" className="flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/40 text-[#991B1B] dark:text-[#F87171] flex items-center justify-center mb-2">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Không thể tải danh sách khóa học
        </h3>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-sm">
          {message}
        </p>
        <button
          type="button"
          onClick={onRetry}
          role="button"
          aria-label="Thử tải lại danh sách khóa học"
          data-testid="btn-retry-admin-courses"
          className="mt-4 h-11 px-5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm font-semibold inline-flex items-center gap-2 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Thử lại
        </button>
      </div>
    </div>
  );
};
