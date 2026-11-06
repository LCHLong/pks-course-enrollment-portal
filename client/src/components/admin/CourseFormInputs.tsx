import React from 'react';
import { CourseFormData } from '@/pages/admin/adminApi';

interface CourseFormInputsProps {
  formData: CourseFormData;
  setFormData: React.Dispatch<React.SetStateAction<CourseFormData>>;
  errors: Record<string, string>;
}

export const CourseFormInputs: React.FC<CourseFormInputsProps> = ({
  formData,
  setFormData,
  errors,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="course-title" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
          Tiêu đề khóa học
        </label>
        <input
          id="course-title"
          type="text"
          data-testid="input-course-title"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <input type="hidden" data-testid="input-title" value={formData.title} />
        {errors.title && <p role="alert" aria-live="polite" data-testid="error-course-title" className="text-xs text-red-600 mt-1">{errors.title}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="course-category" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Danh mục
          </label>
          <input
            id="course-category"
            type="text"
            data-testid="input-course-category"
            value={formData.category}
            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          {errors.category && <p role="alert" aria-live="polite" data-testid="error-course-category" className="text-xs text-red-600 mt-1">{errors.category}</p>}
        </div>
        <div>
          <label htmlFor="course-instructor" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Giảng viên phụ trách
          </label>
          <input
            id="course-instructor"
            type="text"
            data-testid="input-course-instructor"
            value={formData.instructor}
            onChange={(e) => setFormData((prev) => ({ ...prev, instructor: e.target.value }))}
            className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          {errors.instructor && <p role="alert" aria-live="polite" data-testid="error-course-instructor" className="text-xs text-red-600 mt-1">{errors.instructor}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="course-description" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
          Mô tả chi tiết
        </label>
        <textarea
          id="course-description"
          rows={3}
          data-testid="input-course-description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        {errors.description && <p role="alert" aria-live="polite" data-testid="error-course-description" className="text-xs text-red-600 mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="course-price" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Học phí (VND)
          </label>
          <input
            id="course-price"
            type="number"
            min="0"
            step="10000"
            data-testid="input-course-price"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
            className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          {errors.price && <p role="alert" aria-live="polite" data-testid="error-course-price" className="text-xs text-red-600 mt-1">{errors.price}</p>}
        </div>
        <div>
          <label htmlFor="course-capacity" className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Sĩ số tối đa
          </label>
          <input
            id="course-capacity"
            type="number"
            min="1"
            data-testid="input-course-capacity"
            value={formData.capacity}
            onChange={(e) => setFormData((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
            className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
          <input type="hidden" data-testid="input-capacity" value={formData.capacity} />
          {errors.capacity && <p role="alert" aria-live="polite" data-testid="error-course-capacity" className="text-xs text-red-600 mt-1">{errors.capacity}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          id="course-active"
          type="checkbox"
          data-testid="checkbox-course-active"
          checked={formData.is_active}
          onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
          className="w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900"
        />
        <label htmlFor="course-active" className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Hiển thị tuyển sinh công khai
        </label>
      </div>
    </div>
  );
};
