import React from 'react';
import { Link } from 'react-router-dom';
import { Enrollment } from '@/types/enrollment';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

interface EnrollmentCardProps {
  enrollment: Enrollment;
  onCancelClick?: (enrollment: Enrollment) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'enrolled':
    case 'confirmed':
      return {
        label: status === 'confirmed' ? 'Đã xác nhận' : 'Đã ghi danh',
        className: 'text-[#065F46] bg-[#ECFDF5] border-[#047857] dark:text-[#34D399] dark:bg-[#064E3B33] dark:border-[#065F46]',
      };
    case 'pending':
      return {
        label: 'Chờ duyệt',
        className: 'text-[#92400E] bg-[#FFFBEB] border-[#B45309] dark:text-[#FBBF24] dark:bg-[#78350F33] dark:border-[#92400E]',
      };
    case 'cancelled':
    default:
      return {
        label: 'Đã hủy',
        className: 'text-[#991B1B] bg-[#FEF2F2] border-[#B91C1C] dark:text-[#F87171] dark:bg-[#7F1D1D33] dark:border-[#991B1B]',
      };
  }
};

export const EnrollmentCard: React.FC<EnrollmentCardProps> = ({ enrollment, onCancelClick }) => {
  const course = enrollment.course;
  const courseId = enrollment.course_id || course?.title || enrollment.id;
  const statusInfo = getStatusBadge(enrollment.status);
  const regDate = formatDate(enrollment.created_at);

  return (
    <div data-testid={`enrollment-card-${enrollment.id}`} className="h-full">
      <article
        role="article"
        aria-labelledby={`course-title-${enrollment.id}`}
        data-testid={`card-my-course-${enrollment.id}`}
        className="h-full border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 bg-white dark:bg-zinc-900 shadow-sm hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex flex-col justify-between space-y-4"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span
              role="status"
              aria-label={`Danh mục ${course?.category || 'Chung'}`}
              data-testid={`course-category-${enrollment.id}`}
              className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 truncate max-w-[150px]"
            >
              {course?.category || 'Khóa học'}
            </span>

            <span
              role="status"
              aria-label={`Trạng thái ghi danh: ${statusInfo.label}`}
              data-testid={`badge-enrollment-status-${enrollment.id}`}
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo.className}`}
            >
              <span data-testid="badge-status">{statusInfo.label}</span>
            </span>
          </div>

          <h3
            id={`course-title-${enrollment.id}`}
            data-testid={`course-title-${enrollment.id}`}
            className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2"
          >
            {course?.title || 'Khóa học'}
          </h3>

          <p
            role="text"
            aria-label={`Giảng viên: ${course?.instructor || 'Đang cập nhật'}`}
            data-testid={`course-instructor-${enrollment.id}`}
            className="text-xs text-zinc-500 dark:text-zinc-400"
          >
            Giảng viên: <span className="font-medium text-zinc-700 dark:text-zinc-300">{course?.instructor || 'PKS'}</span>
          </p>

          <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between pt-1">
            <span>Ngày đăng ký:</span>
            <time
              role="time"
              aria-label={`Ngày đăng ký: ${regDate}`}
              data-testid={`course-reg-date-${enrollment.id}`}
              className="font-mono font-medium text-zinc-700 dark:text-zinc-300"
            >
              {regDate}
            </time>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-medium text-zinc-400">Học phí</span>
            <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(course?.price ?? 0)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/courses/${courseId}`}
              role="link"
              aria-label={`Xem chi tiết khóa học ${course?.title || ''}`}
              data-testid={`btn-view-course-${enrollment.id}`}
              className="flex-1 h-11 px-3 text-xs sm:text-sm font-semibold rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 inline-flex items-center justify-center transition-colors shadow-sm"
            >
              Xem chi tiết
            </Link>

            {enrollment.status !== 'cancelled' && onCancelClick && (
              <button
                type="button"
                onClick={() => onCancelClick(enrollment)}
                role="button"
                aria-label={`Hủy ghi danh khóa học ${course?.title || ''}`}
                data-testid="btn-cancel-enrollment"
                className="h-11 px-3 text-xs font-semibold rounded-xl border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors"
              >
                Hủy
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};
