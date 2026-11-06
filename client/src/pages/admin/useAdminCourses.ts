import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Course } from '@/types/course';
import {
  fetchAdminCourses,
  createAdminCourse,
  updateAdminCourse,
  deleteAdminCourse,
  CourseFormData,
} from './adminApi';

export function useAdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchAdminCourses();
      setCourses(data);
    } catch (err: any) {
      const msg = err?.message || 'Không thể tải danh sách khóa học';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const categories = useMemo(() => {
    return Array.from(new Set(courses.map((c) => c.category).filter(Boolean)));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        !search.trim() ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.instructor.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'all' || c.category === category;
      return matchSearch && matchCategory;
    });
  }, [courses, search, category]);

  const handleFormSubmit = async (formData: CourseFormData) => {
    setIsSubmittingForm(true);
    try {
      if (editingCourse) {
        const updated = await updateAdminCourse(editingCourse.id, formData);
        setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        toast.success('Cập nhật khóa học thành công!');
      } else {
        const created = await createAdminCourse(formData);
        setCourses((prev) => [created, ...prev]);
        toast.success('Tạo khóa học mới thành công!');
      }
      setIsModalOpen(false);
      setEditingCourse(null);
    } catch (err: any) {
      toast.error(err?.message || 'Lưu khóa học thất bại');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleToggleActive = async (course: Course) => {
    try {
      const nextActive = !course.is_active;
      const updated = await updateAdminCourse(course.id, { is_active: nextActive });
      setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.info(nextActive ? 'Đã kích hoạt khóa học' : 'Đã ẩn khóa học khỏi danh mục tuyển sinh');
    } catch (err: any) {
      toast.error(err?.message || 'Cập nhật trạng thái hiển thị thất bại');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCourse) return;
    setIsDeleting(true);
    try {
      await deleteAdminCourse(deletingCourse.id);
      setCourses((prev) => prev.filter((c) => c.id !== deletingCourse.id));
      toast.success('Đã xóa khóa học thành công!');
      setDeletingCourse(null);
    } catch (err: any) {
      toast.error(err?.message || 'Xóa khóa học thất bại');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    courses,
    isLoading,
    errorMessage,
    search,
    setSearch,
    category,
    setCategory,
    categories,
    filteredCourses,
    isModalOpen,
    setIsModalOpen,
    editingCourse,
    setEditingCourse,
    isSubmittingForm,
    deletingCourse,
    setDeletingCourse,
    isDeleting,
    loadCourses,
    handleFormSubmit,
    handleToggleActive,
    handleConfirmDelete,
  };
}
