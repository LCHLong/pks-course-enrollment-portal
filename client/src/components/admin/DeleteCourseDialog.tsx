import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Course } from '@/types/course';

interface DeleteCourseDialogProps {
  course: Course | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirmDelete: () => Promise<void>;
  onToggleActiveInstead?: () => Promise<void>;
  onClose: () => void;
}

export const DeleteCourseDialog: React.FC<DeleteCourseDialogProps> = ({
  course,
  isOpen,
  isDeleting,
  onConfirmDelete,
  onToggleActiveInstead,
  onClose,
}) => {
  if (!isOpen || !course) return null;

  const hasEnrollments = course.enrolled_count > 0;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dialog-delete-title"
      data-testid="modal-confirm-delete"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-[#991B1B] dark:text-[#F87171] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 id="dialog-delete-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {hasEnrollments ? 'Không thể xóa khóa học' : 'Xác nhận xóa khóa học'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {hasEnrollments ? 'Bảo toàn dữ liệu học viên' : 'Hành động này không thể hoàn tác'}
            </p>
          </div>
        </div>

        {hasEnrollments ? (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Khóa học <span className="font-semibold text-zinc-900 dark:text-zinc-100">&ldquo;{course.title}&rdquo;</span> hiện đang có{' '}
              <span className="font-bold text-red-600 dark:text-red-400">{course.enrolled_count}</span> học viên đã đăng ký.
            </p>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              Hệ thống không cho phép xóa khóa học đã có dữ liệu ghi danh. Bạn nên chuyển trạng thái sang <strong>Ẩn khóa học</strong> để tạm dừng tuyển sinh.
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Bạn có chắc chắn muốn xóa vĩnh viễn khóa học{' '}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">&ldquo;{course.title}&rdquo;</span>?
            Toàn bộ thông tin khóa học sẽ bị gỡ bỏ khỏi hệ thống.
          </p>
        )}

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3 flex-wrap">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            aria-label="Hủy xóa khóa học"
            data-testid="btn-cancel-delete"
            className="h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Hủy
          </button>

          {hasEnrollments ? (
            onToggleActiveInstead && (
              <button
                type="button"
                disabled={isDeleting}
                onClick={onToggleActiveInstead}
                className="h-11 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                {isDeleting ? 'Đang cập nhật...' : 'Chuyển sang Ẩn khóa học'}
              </button>
            )
          ) : (
            <button
              type="button"
              disabled={isDeleting}
              onClick={onConfirmDelete}
              aria-label="Xác nhận xóa khóa học vĩnh viễn"
              data-testid="btn-confirm-delete"
              className="h-11 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold inline-flex items-center gap-2 shadow-sm transition-colors disabled:opacity-60"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
