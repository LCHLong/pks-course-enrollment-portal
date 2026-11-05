import React from 'react';
import { Course } from '@/types/course';
import { formatCurrency } from '@/utils/formatCurrency';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  isEnrolling?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEnroll,
  isEnrolling = false,
}) => {
  const isFull = course.enrolled_count >= course.capacity;
  const progressPercent = Math.min(
    100,
    Math.round((course.enrolled_count / course.capacity) * 100)
  );

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 bg-white dark:bg-zinc-900 shadow-sm hover:border-zinc-900 dark:hover:border-zinc-400 transition-all flex flex-col justify-between space-y-4">
      {/* 1. Header Card: Danh mục & Trạng thái Còn chỗ/Hết chỗ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          {/* Trường 2: Danh mục (category) */}
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 truncate">
            {course.category}
          </span>

          {/* Trường 8: Trạng thái (Còn chỗ / Hết chỗ) với Deep Muted Colors */}
          {isFull ? (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-red-700/40 dark:border-red-500/30 text-[#991B1B] dark:text-[#F87171] bg-[#FEF2F2] dark:bg-[#7F1D1D33] flex-shrink-0">
              Đã hết chỗ
            </span>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-700/50 dark:border-emerald-500/40 text-[#065F46] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#064E3B33] flex items-center gap-1.5 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#047857] dark:bg-[#34D399]"></span> Còn chỗ
            </span>
          )}
        </div>

        {/* Trường 1: Tên khóa học (title) */}
        <div>
          <h3 
            className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2"
            title={course.title}
          >
            {course.title}
          </h3>
          {/* Trường 3: Giảng viên (instructor) */}
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Giảng viên: <span className="font-medium text-zinc-700 dark:text-zinc-300">{course.instructor}</span>
          </p>
        </div>

        {/* Trường 4: Mô tả ngắn (description) */}
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
          {course.description}
        </p>
      </div>

      {/* 2. Footer Card: Sĩ số, Học phí, Tiến độ & Nút Ghi danh */}
      <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
        {/* Trường 6 & 7: Sĩ số (capacity) & Đã ghi danh (enrolled_count) kèm Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1">
            <span>Sĩ số</span>
            <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
              {course.enrolled_count} / {course.capacity} học viên
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFull ? 'bg-zinc-400 dark:bg-zinc-600' : 'bg-zinc-900 dark:bg-zinc-100'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Trường 5: Học phí (price) & Nút Ghi danh (Vùng chạm >= 44px trên mobile) */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="shrink-0">
            <span className="text-[10px] text-zinc-400 block uppercase font-medium">Học phí</span>
            <span className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
              {formatCurrency(course.price)}
            </span>
          </div>

          <button
            onClick={() => onEnroll?.(course.id)}
            disabled={isFull || isEnrolling}
            className={`h-11 sm:h-9 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center shrink-0 ${
              isFull
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-zinc-200 dark:border-zinc-700'
                : 'bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-sm'
            }`}
          >
            {isEnrolling ? 'Đang xử lý...' : isFull ? 'Đã hết chỗ' : 'Ghi danh'}
          </button>
        </div>
      </div>
    </div>
  );
};
