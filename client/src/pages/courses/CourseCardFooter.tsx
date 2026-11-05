import React from 'react';
import { Course } from '@/types/course';
import { formatCurrency } from '@/utils/formatCurrency';

interface CourseCardFooterProps {
  course: Course & { is_enrolled?: boolean };
  onEnroll?: (course: Course & { is_enrolled?: boolean }) => void;
  isEnrolling?: boolean;
}

export const CourseCardFooter: React.FC<CourseCardFooterProps> = ({
  course,
  onEnroll,
  isEnrolling = false,
}) => {
  const isFull = course.enrolled_count >= course.capacity;
  const isEnrolled = !!course.is_enrolled;
  const progressPercent = Math.min(
    100,
    Math.round((course.enrolled_count / course.capacity) * 100)
  );

  return (
    <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
      <div>
        <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1">
          <span>Sĩ số</span>
          <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
            {course.enrolled_count} / {course.capacity} học viên
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={course.enrolled_count}
          aria-valuemin={0}
          aria-valuemax={course.capacity}
          aria-label="Tỷ lệ lấp đầy sĩ số"
          data-testid={`progress-capacity-${course.id}`}
          className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden"
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isFull ? 'bg-zinc-400 dark:bg-zinc-600' : 'bg-zinc-900 dark:bg-zinc-100'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="shrink-0">
          <span className="text-[10px] text-zinc-400 block uppercase font-medium">Học phí</span>
          <span
            data-testid={`course-price-${course.id}`}
            aria-label={`Học phí: ${formatCurrency(course.price)}`}
            className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap shrink-0"
          >
            {formatCurrency(course.price)}
          </span>
        </div>

        {isEnrolled ? (
          <button
            disabled
            data-testid={`btn-enroll-disabled-${course.id}`}
            aria-label="Bạn đã ghi danh khóa học này"
            className="h-11 px-4 text-xs sm:text-sm font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-not-allowed border border-zinc-200 dark:border-zinc-700"
          >
            Đã ghi danh
          </button>
        ) : isFull ? (
          <button
            disabled
            data-testid={`btn-enroll-full-${course.id}`}
            aria-label="Khóa học đã hết chỗ"
            className="h-11 px-4 text-xs sm:text-sm font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-zinc-200 dark:border-zinc-700"
          >
            Đã hết chỗ
          </button>
        ) : (
          <button
            onClick={() => onEnroll?.(course)}
            disabled={isEnrolling}
            data-testid={`btn-enroll-${course.id}`}
            aria-label={`Ghi danh khóa học ${course.title}`}
            className="h-11 px-4 text-xs sm:text-sm font-semibold rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 transition-colors shadow-sm disabled:opacity-60"
          >
            {isEnrolling ? 'Đang xử lý...' : 'Ghi danh'}
          </button>
        )}
      </div>
    </div>
  );
};
