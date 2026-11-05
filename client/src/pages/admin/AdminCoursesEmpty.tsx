import React from 'react';
import { BookOpen, RotateCcw } from 'lucide-react';

interface AdminCoursesEmptyProps {
  isFiltered: boolean;
  onClearFilter: () => void;
  onAddCourse: () => void;
}

export const AdminCoursesEmpty: React.FC<AdminCoursesEmptyProps> = ({
  isFiltered,
  onClearFilter,
  onAddCourse,
}) => {
  return (
    <div
      role="status"
      data-testid="state-empty-admin-courses"
      className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl p-10 text-center bg-white/50 dark:bg-zinc-900/50"
    >
      <div data-testid="empty-state" className="max-w-md mx-auto flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 mb-3">
          <BookOpen className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {isFiltered ? 'Không tìm thấy khóa học phù hợp' : 'Chưa có khóa học nào'}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
          {isFiltered
            ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác để xem kết quả.'
            : 'Hệ thống hiện chưa có khóa học nào. Hãy bắt đầu bằng cách tạo khóa học mới.'}
        </p>

        {isFiltered ? (
          <button
            type="button"
            onClick={onClearFilter}
            aria-label="Xóa bộ lọc tìm kiếm khóa học"
            data-testid="btn-clear-admin-filter"
            className="h-11 px-5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold inline-flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Xóa bộ lọc
          </button>
        ) : (
          <button
            type="button"
            onClick={onAddCourse}
            className="h-11 px-6 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 text-white dark:text-zinc-900 text-sm font-semibold transition-colors shadow-sm"
          >
            Thêm khóa học ngay
          </button>
        )}
      </div>
    </div>
  );
};
