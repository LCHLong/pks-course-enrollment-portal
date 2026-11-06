import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import { Course } from '@/types/course';
import { CourseFormData } from '@/pages/admin/adminApi';
import { CourseFormInputs } from './CourseFormInputs';

interface CourseFormModalProps {
  isOpen: boolean;
  editingCourse: Course | null;
  isSubmitting: boolean;
  onSubmit: (data: CourseFormData) => Promise<void>;
  onClose: () => void;
}

export const CourseFormModal: React.FC<CourseFormModalProps> = ({
  isOpen,
  editingCourse,
  isSubmitting,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    category: '',
    instructor: '',
    description: '',
    price: 0,
    capacity: 20,
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingCourse) {
      setFormData({
        title: editingCourse.title,
        category: editingCourse.category,
        instructor: editingCourse.instructor,
        description: editingCourse.description || '',
        price: editingCourse.price,
        capacity: editingCourse.capacity,
        is_active: editingCourse.is_active,
      });
    } else {
      setFormData({
        title: '',
        category: '',
        instructor: '',
        description: '',
        price: 0,
        capacity: 20,
        is_active: true,
      });
    }
    setErrors({});
  }, [editingCourse, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      errs.title = 'Tiêu đề phải có ít nhất 3 ký tự';
    }
    if (!formData.category.trim()) errs.category = 'Vui lòng nhập danh mục';
    if (!formData.instructor.trim()) errs.instructor = 'Vui lòng nhập giảng viên';
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      errs.description = 'Mô tả chi tiết tối thiểu 10 ký tự';
    }
    if (formData.price < 0) errs.price = 'Học phí không được âm';
    if (formData.capacity <= 0) {
      errs.capacity = 'Sĩ số tối đa phải lớn hơn 0';
    } else if (editingCourse && formData.capacity < editingCourse.enrolled_count) {
      errs.capacity = `Sĩ số tối đa không thể nhỏ hơn số học viên đã ghi danh hiện tại: ${editingCourse.enrolled_count}`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-course-title"
      data-testid="modal-course-form"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <div
        data-testid="modal-create-course"
        className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 id="modal-course-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {editingCourse ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Hủy thao tác và đóng cửa sổ"
            data-testid="btn-cancel-course"
            className="w-9 h-9 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
          <CourseFormInputs formData={formData} setFormData={setFormData} errors={errors} />

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              aria-label="Lưu thông tin khóa học"
              data-testid="btn-submit-course"
              className="h-11 px-6 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 text-white dark:text-zinc-900 text-sm font-semibold inline-flex items-center gap-2 shadow-sm disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Đang lưu...' : 'Lưu khóa học'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
