import React from 'react';
import { Plus, Search } from 'lucide-react';

interface AdminCoursesHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  onAddCourse: () => void;
}

export const AdminCoursesHeader: React.FC<AdminCoursesHeaderProps> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  onAddCourse,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Quản Lý Khóa Học
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Tạo mới, chỉnh sửa thông tin, điều chỉnh sĩ số và quản trị danh mục đào tạo của PKS.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddCourse}
          aria-label="Thêm khóa học mới"
          data-testid="btn-add-course"
          className="h-11 px-5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm khóa học</span>
          <span className="sr-only" data-testid="btn-create-course">Tạo khóa học</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            role="searchbox"
            aria-label="Tìm kiếm khóa học theo tên"
            data-testid="input-search-admin-courses"
            placeholder="Tìm kiếm khóa học theo tên, giảng viên..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        <div className="w-full sm:w-56 shrink-0">
          <select
            role="combobox"
            aria-label="Lọc theo danh mục khóa học"
            data-testid="select-filter-admin-category"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
