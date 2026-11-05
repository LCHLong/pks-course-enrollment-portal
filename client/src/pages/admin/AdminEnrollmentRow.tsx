import React from 'react';
import { Enrollment, EnrollmentStatus } from '@/types/enrollment';
import { formatDate } from '@/utils/formatDate';
import { StatusChangeDropdown } from '@/components/admin/StatusChangeDropdown';

interface AdminEnrollmentRowProps {
  enrollment: Enrollment;
  courseTitle?: string;
  onChangeStatus: (enrollmentId: string, status: EnrollmentStatus) => Promise<void>;
}

const getStatusBadgeInfo = (status: string) => {
  switch (status) {
    case 'enrolled':
      return {
        label: 'Đã ghi danh',
        className: 'text-[#065F46] border-[#047857] bg-[#ECFDF5] dark:text-[#34D399] dark:border-[#065F46] dark:bg-[#064E3B33]',
      };
    case 'confirmed':
      return {
        label: 'Đã xác nhận',
        className: 'text-[#065F46] border-[#047857] bg-[#ECFDF5] dark:text-[#34D399] dark:border-[#065F46] dark:bg-[#064E3B33]',
      };
    case 'pending':
      return {
        label: 'Chờ xử lý',
        className: 'text-[#92400E] border-[#B45309] bg-[#FFFBEB] dark:text-[#FBBF24] dark:border-[#92400E] dark:bg-[#78350F33]',
      };
    case 'cancelled':
    default:
      return {
        label: 'Đã hủy',
        className: 'text-[#991B1B] border-[#B91C1C] bg-[#FEF2F2] dark:text-[#F87171] dark:border-[#991B1B] dark:bg-[#7F1D1D33]',
      };
  }
};

export const AdminEnrollmentRow: React.FC<AdminEnrollmentRowProps> = ({
  enrollment,
  courseTitle,
  onChangeStatus,
}) => {
  const studentName = enrollment.user?.name || 'Học viên';
  const studentEmail = enrollment.user?.email || 'N/A';
  const title = enrollment.course?.title || courseTitle || 'Khóa học';
  const regDate = formatDate(enrollment.created_at);
  const badgeInfo = getStatusBadgeInfo(enrollment.status);

  return (
    <tr
      role="row"
      aria-label={`Học viên ${studentName}`}
      data-testid={`row-enrollment-${enrollment.id}`}
      className="border-b border-zinc-100 dark:border-zinc-800/80 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
    >
      <td className="py-4 px-4">
        <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
          {studentName}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          {studentEmail}
        </div>
      </td>

      <td className="py-4 px-4 text-xs font-medium text-zinc-700 dark:text-zinc-300 max-w-[200px] truncate" title={title}>
        {title}
      </td>

      <td className="py-4 px-4 text-xs font-mono whitespace-nowrap text-zinc-600 dark:text-zinc-400">
        {regDate}
      </td>

      <td className="py-4 px-4 whitespace-nowrap">
        <span
          role="status"
          aria-label={`Trạng thái ${badgeInfo.label}`}
          data-testid={`badge-enrollment-status-${enrollment.id}`}
          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeInfo.className}`}
        >
          {badgeInfo.label}
        </span>
      </td>

      <td className="py-4 px-4 whitespace-nowrap text-right">
        <StatusChangeDropdown
          enrollmentId={enrollment.id}
          studentName={studentName}
          currentStatus={enrollment.status}
          onChangeStatus={(status) => onChangeStatus(enrollment.id, status)}
        />
      </td>
    </tr>
  );
};
