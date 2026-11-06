import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Course } from '@/types/course';
import { Enrollment, EnrollmentStatus } from '@/types/enrollment';
import { fetchAdminCourses, fetchCourseEnrollments, updateEnrollmentStatus } from './adminApi';

export function useAdminEnrollments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCourseId = searchParams.get('courseId') || '';

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAdminCourses()
      .then((data) => {
        setCourses(data);
        if (data.length > 0 && !selectedCourseId) {
          setSelectedCourseId(data[0].id);
        }
      })
      .catch((err) => toast.error(err?.message || 'Không thể tải danh sách khóa học'));
  }, [selectedCourseId]);

  const loadEnrollments = useCallback(async () => {
    if (!selectedCourseId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchCourseEnrollments(selectedCourseId);
      setEnrollments(data);
    } catch (err: any) {
      const msg = err?.message || 'Không thể tải danh sách học viên ghi danh';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

  const handleSelectCourse = (id: string) => {
    setSelectedCourseId(id);
    setSearchParams({ courseId: id });
  };

  const handleStatusChange = async (enrollmentId: string, nextStatus: EnrollmentStatus) => {
    const target = enrollments.find((e) => e.id === enrollmentId);
    if (!target) return;
    const oldStatus = target.status;

    try {
      const updated = await updateEnrollmentStatus(enrollmentId, nextStatus);
      setEnrollments((prev) => prev.map((e) => (e.id === enrollmentId ? { ...e, ...updated } : e)));

      const wasActive = (oldStatus as string) === 'enrolled' || (oldStatus as string) === 'confirmed';
      const willBeActive = (nextStatus as string) === 'enrolled' || (nextStatus as string) === 'confirmed';
      let countDelta = 0;
      if (wasActive && !willBeActive) countDelta = -1;
      else if (!wasActive && willBeActive) countDelta = 1;

      if (countDelta !== 0 && selectedCourseId) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === selectedCourseId
              ? { ...c, enrolled_count: Math.max(0, c.enrolled_count + countDelta) }
              : c
          )
        );
      }
      toast.success('Cập nhật trạng thái ghi danh thành công!');
    } catch (err: any) {
      toast.error(err?.message || 'Cập nhật trạng thái thất bại');
      throw err;
    }
  };

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      const name = e.user?.name || '';
      const email = e.user?.email || '';
      const matchSearch =
        !search.trim() ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [enrollments, search, statusFilter]);

  return {
    courses,
    selectedCourseId,
    selectedCourse,
    isLoading,
    errorMessage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredEnrollments,
    loadEnrollments,
    handleSelectCourse,
    handleStatusChange,
  };
}
