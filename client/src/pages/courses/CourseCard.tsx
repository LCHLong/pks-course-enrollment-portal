import React from 'react';
import { Link } from 'react-router-dom';
import { Course } from '@/types/course';
import { Badge } from '@/components/ui/Badge';
import { CourseCardFooter } from './CourseCardFooter';

export interface CourseCardExtended extends Course {
  is_enrolled?: boolean;
}

interface CourseCardProps {
  course: CourseCardExtended;
  onEnroll?: (course: CourseCardExtended) => void;
  isEnrolling?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEnroll,
  isEnrolling = false,
}) => {
  const isFull = course.enrolled_count >= course.capacity;

  return (
    <article
      aria-labelledby={`course-title-${course.id}`}
      data-testid={`card-course-${course.id}`}
      className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 bg-white dark:bg-zinc-900 shadow-sm hover:border-zinc-900 dark:hover:border-zinc-400 transition-all flex flex-col justify-between space-y-4"
    >
      <div className="space-y-3">
        {/* Header: Category & Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="neutral"
            data-testid={`badge-category-${course.id}`}
            aria-label={`Danh mục: ${course.category}`}
            className="truncate max-w-[150px]"
          >
            {course.category}
          </Badge>

          {isFull ? (
            <Badge
              variant="crimson"
              role="status"
              data-testid={`badge-status-${course.id}`}
              aria-label="Trạng thái: Đã hết chỗ"
            >
              Hết chỗ
            </Badge>
          ) : (
            <Badge
              variant="emerald"
              role="status"
              data-testid={`badge-status-${course.id}`}
              aria-label="Trạng thái: Còn chỗ"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#047857] dark:bg-[#34D399]" />
              Còn chỗ
            </Badge>
          )}
        </div>

        {/* Title & Instructor */}
        <div>
          <Link
            to={`/courses/${course.id}`}
            data-testid={`link-course-detail-${course.id}`}
            aria-label={`Xem chi tiết khóa học ${course.title}`}
          >
            <h3
              id={`course-title-${course.id}`}
              data-testid={`course-title-${course.id}`}
              className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 hover:underline"
              title={course.title}
            >
              {course.title}
            </h3>
          </Link>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Giảng viên: <span className="font-medium text-zinc-700 dark:text-zinc-300">{course.instructor}</span>
          </p>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
          {course.description}
        </p>
      </div>

      <CourseCardFooter
        course={course}
        onEnroll={onEnroll}
        isEnrolling={isEnrolling}
      />
    </article>
  );
};
