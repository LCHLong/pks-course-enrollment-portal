import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { EnrollmentStatus } from '@/types/enrollment';

interface StatusChangeDropdownProps {
  enrollmentId: string;
  studentName: string;
  currentStatus: EnrollmentStatus;
  onChangeStatus: (status: EnrollmentStatus) => Promise<void>;
}

export const StatusChangeDropdown: React.FC<StatusChangeDropdownProps> = ({
  enrollmentId,
  studentName,
  currentStatus,
  onChangeStatus,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<EnrollmentStatus>(currentStatus);

  // Sync if prop changes externally
  React.useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as EnrollmentStatus;
    const prevStatus = status;
    setStatus(nextStatus);
    setIsUpdating(true);
    try {
      await onChangeStatus(nextStatus);
    } catch {
      // Revert upon error (e.g., 409 CAPACITY_FULL)
      setStatus(prevStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <select
        role="combobox"
        aria-label={`Thay đổi trạng thái ghi danh cho học viên ${studentName}`}
        data-testid={`select-enrollment-status-${enrollmentId}`}
        value={status}
        disabled={isUpdating}
        onChange={handleChange}
        className="h-9 pl-2.5 pr-8 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <option value="enrolled">Đã ghi danh</option>
        <option value="confirmed">Đã xác nhận</option>
        <option value="pending">Chờ xử lý</option>
        <option value="cancelled">Đã hủy</option>
      </select>
      {isUpdating && (
        <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-2 pointer-events-none text-zinc-500" />
      )}
    </div>
  );
};

export default StatusChangeDropdown;
