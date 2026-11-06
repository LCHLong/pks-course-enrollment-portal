import React from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
import { Course } from '@/types/course';

interface AdminEnrollmentsStatsProps {
  course: Course | null;
}

export const AdminEnrollmentsStats: React.FC<AdminEnrollmentsStatsProps> = ({ course }) => {
  if (!course) return null;

  const remaining = Math.max(0, course.capacity - course.enrolled_count);

  return (
    <div
      role="region"
      aria-label="Thống kê sĩ số khóa học"
      data-testid="card-enrollment-stats"
      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
    >
      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Sĩ số tối đa</span>
          <p className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">{course.capacity}</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <UserCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Đã ghi danh</span>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{course.enrolled_count}</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <UserX className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Chỗ trống còn lại</span>
          <p className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">{remaining}</p>
        </div>
      </div>
    </div>
  );
};
