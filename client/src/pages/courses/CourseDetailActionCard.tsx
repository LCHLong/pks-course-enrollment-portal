import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatCurrency';
import { CourseCardExtended } from './CourseCard';

interface CourseDetailActionCardProps {
  course: CourseCardExtended;
  isAuthenticated: boolean;
  userRole?: string;
  isEnrolling: boolean;
  onActionClick: () => void;
}

export const CourseDetailActionCard: React.FC<CourseDetailActionCardProps> = ({
  course,
  isAuthenticated,
  userRole,
  isEnrolling,
  onActionClick,
}) => {
  const isFull = course.enrolled_count >= course.capacity;
  const isEnrolled = !!course.is_enrolled;
  const progressPercent = Math.min(
    100,
    Math.round((course.enrolled_count / course.capacity) * 100)
  );

  const getButtonText = () => {
    if (isEnrolling) return 'Đang xử lý...';
    if (!isAuthenticated) return 'Đăng nhập để ghi danh';
    if (userRole === 'admin') return 'Chế độ Quản trị';
    if (isEnrolled) return 'Đã ghi danh';
    if (isFull) return 'Đã hết chỗ';
    return 'Ghi danh ngay';
  };

  return (
    <aside
      aria-label="Thông tin đăng ký và học phí"
      data-testid="course-detail-action-card"
      className="lg:sticky lg:top-20"
    >
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block uppercase font-medium">Học phí</span>
            <span
              data-testid="course-detail-price"
              aria-label="Học phí khóa học"
              className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 whitespace-nowrap"
            >
              {formatCurrency(course.price)}
            </span>
          </div>
          {isFull ? (
            <Badge
              variant="crimson"
              role="status"
              data-testid="badge-status-detail"
              aria-label="Trạng thái: Đã hết chỗ"
            >
              Đã hết chỗ
            </Badge>
          ) : (
            <Badge
              variant="emerald"
              role="status"
              data-testid="badge-status-detail"
              aria-label="Trạng thái: Còn chỗ"
            >
              Còn chỗ
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Tình trạng sĩ số</span>
            <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
              {course.enrolled_count} / {course.capacity}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={course.enrolled_count}
            aria-valuemin={0}
            aria-valuemax={course.capacity}
            aria-label="Tiến độ sĩ số khóa học"
            data-testid="progress-capacity-detail"
            className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden"
          >
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFull ? 'bg-zinc-400' : 'bg-zinc-900 dark:bg-zinc-100'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <button
          onClick={onActionClick}
          disabled={isEnrolling || isEnrolled || isFull}
          data-testid="btn-enroll-action"
          aria-label="Ghi danh tham gia khóa học"
          className="w-full h-11 px-4 text-sm font-semibold rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {getButtonText()}
        </button>

        {isEnrolled && (
          <p className="text-xs text-center text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Bạn đã ghi danh khóa học này
          </p>
        )}
        {isFull && !isEnrolled && (
          <p className="text-xs text-center text-zinc-400">Khóa học đã đủ sĩ số tối đa</p>
        )}
      </Card>
    </aside>
  );
};
