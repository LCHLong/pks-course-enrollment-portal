import React from 'react';
import { Enrollment, EnrollmentStatus } from '@/types/enrollment';
import { AdminEnrollmentRow } from './AdminEnrollmentRow';

interface AdminEnrollmentsTableProps {
  enrollments: Enrollment[];
  courseTitle?: string;
  onChangeStatus: (enrollmentId: string, status: EnrollmentStatus) => Promise<void>;
}

export const AdminEnrollmentsTable: React.FC<AdminEnrollmentsTableProps> = ({
  enrollments,
  courseTitle,
  onChangeStatus,
}) => {
  return (
    <div
      data-testid="admin-enrollment-table"
      className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shadow-sm"
    >
      <div className="overflow-x-auto">
        <table
          role="table"
          aria-label="Bảng danh sách học viên ghi danh"
          data-testid="table-enrollments"
          className="w-full text-left border-collapse"
        >
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/75 dark:bg-zinc-800/40 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <th className="py-3.5 px-4">Học viên & Email</th>
              <th className="py-3.5 px-4">Khóa học</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Ngày ghi danh</th>
              <th className="py-3.5 px-4">Trạng thái</th>
              <th className="py-3.5 px-4 text-right">Cập nhật trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <AdminEnrollmentRow
                key={enrollment.id}
                enrollment={enrollment}
                courseTitle={courseTitle}
                onChangeStatus={onChangeStatus}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
