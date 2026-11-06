import React from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Users, Trash2, Power } from 'lucide-react';
import { Course } from '@/types/course';
import { formatCurrency } from '@/utils/formatCurrency';

interface AdminCourseRowProps {
  course: Course;
  onEdit: (course: Course) => void;
  onToggleActive: (course: Course) => void;
  onDelete: (course: Course) => void;
}

const getCapacityColor = (ratio: number) => {
  if (ratio >= 1) return 'bg-red-500 dark:bg-red-400';
  if (ratio >= 0.8) return 'bg-amber-500 dark:bg-amber-400';
  return 'bg-emerald-500 dark:bg-emerald-400';
};

export const AdminCourseRow: React.FC<AdminCourseRowProps> = ({
  course,
  onEdit,
  onToggleActive,
  onDelete,
}) => {
  const ratio = course.capacity > 0 ? course.enrolled_count / course.capacity : 0;
  const percent = Math.min(100, Math.round(ratio * 100));

  return (
    <tr
      role="row"
      aria-label={`Khóa học ${course.title}`}
      data-testid={`row-course-${course.id}`}
      className="border-b border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
    >
      <td className="py-4 px-4">
        <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm line-clamp-2" title={course.title}>
          {course.title}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {course.instructor}
        </div>
      </td>

      <td className="py-4 px-4 text-xs whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 whitespace-nowrap shrink-0">
          {course.category}
        </span>
      </td>

      <td className="py-4 px-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
        {formatCurrency(course.price)}
      </td>

      <td className="py-4 px-4 min-w-[160px]">
        <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1 font-mono">
          <span>{course.enrolled_count} / {course.capacity}</span>
          <span>{percent}%</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={course.enrolled_count}
          aria-valuemin={0}
          aria-valuemax={course.capacity}
          aria-label="Tỷ lệ học viên đã ghi danh"
          data-testid={`progress-capacity-${course.id}`}
          className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden"
        >
          <div className={`h-full rounded-full transition-all duration-300 ${getCapacityColor(ratio)}`} style={{ width: `${percent}%` }} />
        </div>
      </td>

      <td className="py-4 px-4 whitespace-nowrap">
        <span
          role="status"
          aria-label="Trạng thái hiển thị"
          data-testid={`badge-course-status-${course.id}`}
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
            course.is_active
              ? 'text-[#065F46] bg-[#ECFDF5] border-[#047857] dark:text-[#34D399] dark:bg-[#064E3B33] dark:border-[#065F46]'
              : 'text-[#92400E] bg-[#FFFBEB] border-[#B45309] dark:text-[#FBBF24] dark:bg-[#78350F33] dark:border-[#92400E]'
          }`}
        >
          {course.is_active ? 'Đang hoạt động' : 'Đã ẩn'}
        </span>
      </td>

      <td className="py-4 px-4 whitespace-nowrap text-right">
        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            role="switch"
            aria-checked={course.is_active}
            aria-label={`Kích hoạt hoặc ẩn khóa học ${course.title}`}
            data-testid={`btn-toggle-active-${course.id}`}
            onClick={() => onToggleActive(course)}
            title={course.is_active ? 'Ẩn khóa học' : 'Kích hoạt khóa học'}
            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${
              course.is_active
                ? 'border-emerald-200 dark:border-emerald-800/60 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                : 'border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Power className="w-4 h-4" />
          </button>

          <button
            type="button"
            role="button"
            aria-label={`Chỉnh sửa khóa học ${course.title}`}
            data-testid={`btn-edit-course-${course.id}`}
            onClick={() => onEdit(course)}
            title="Chỉnh sửa khóa học"
            className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <Link
            to={`/admin/enrollments?courseId=${course.id}`}
            role="link"
            aria-label={`Xem danh sách học viên đăng ký khóa học ${course.title}`}
            data-testid={`btn-view-enrollments-${course.id}`}
            title="Xem học viên ghi danh"
            className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <Users className="w-4 h-4" />
          </Link>

          <button
            type="button"
            role="button"
            aria-label={`Xóa khóa học ${course.title}`}
            data-testid={`btn-delete-course-${course.id}`}
            onClick={() => onDelete(course)}
            title="Xóa khóa học"
            className="w-9 h-9 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
