import React from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { Course } from '@/types/course';

interface AdminEnrollmentsFilterProps {
  courses: Course[];
  selectedCourseId: string;
  onSelectCourse: (courseId: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onClearFilter: () => void;
}

export const AdminEnrollmentsFilter: React.FC<AdminEnrollmentsFilterProps> = ({
  courses,
  selectedCourseId,
  onSelectCourse,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilter,
}) => {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="select-course" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Chọn khóa học để theo dõi danh sách ghi danh:
        </label>
        <select
          id="select-course"
          role="combobox"
          aria-label="Chọn khóa học để xem danh sách ghi danh"
          data-testid="select-course-enrollment"
          value={selectedCourseId}
          onChange={(e) => onSelectCourse(e.target.value)}
          className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title} ({course.enrolled_count}/{course.capacity} học viên)
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            role="searchbox"
            aria-label="Tìm kiếm học viên theo tên hoặc email"
            data-testid="input-search-enrollments"
            placeholder="Tìm kiếm theo tên hoặc email học viên..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div className="w-full sm:w-48 shrink-0">
          <select
            role="combobox"
            aria-label="Lọc theo trạng thái ghi danh"
            data-testid="select-filter-enrollment-status"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="enrolled">Đã ghi danh</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="pending">Chờ xử lý</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        {(search || statusFilter !== 'all') && (
          <button
            type="button"
            onClick={onClearFilter}
            role="button"
            aria-label="Xóa bộ lọc tìm kiếm học viên"
            data-testid="btn-clear-enrollment-filter"
            className="h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
};
