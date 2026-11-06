import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Enrollment } from '@/types/enrollment';

interface CancelEnrollmentModalProps {
  enrollment: Enrollment | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const CancelEnrollmentModal: React.FC<CancelEnrollmentModalProps> = ({
  enrollment,
  isOpen,
  isSubmitting,
  onConfirm,
  onClose,
}) => {
  if (!isOpen || !enrollment) return null;

  const courseTitle = enrollment.course?.title || 'Khóa học';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-cancel-title"
      data-testid="modal-cancel-enrollment"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-[#991B1B] dark:text-[#F87171] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 id="modal-cancel-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Xác nhận hủy ghi danh
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Thao tác này sẽ hủy giữ chỗ của bạn
            </p>
          </div>
        </div>

        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Bạn có chắc chắn muốn hủy ghi danh khóa học{' '}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            &ldquo;{courseTitle}&rdquo;
          </span>
          ? Bạn sẽ cần đăng ký lại nếu muốn tham gia sau này.
        </p>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Đóng cửa sổ hủy ghi danh"
            data-testid="btn-close-cancel"
            className="h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-semibold transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            aria-label="Xác nhận hủy ghi danh"
            data-testid="btn-confirm-cancel"
            className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold inline-flex items-center gap-2 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Đang hủy...' : 'Hủy ghi danh'}
          </button>
        </div>
      </div>
    </div>
  );
};
