import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Enrollment } from '@/types/enrollment';
import { fetchStudentEnrollments, cancelStudentEnrollment } from './myCoursesApi';
import { MyCoursesHeader } from './MyCoursesHeader';
import { MyCoursesLoading } from './MyCoursesLoading';
import { MyCoursesEmpty } from './MyCoursesEmpty';
import { MyCoursesError } from './MyCoursesError';
import { EnrollmentCard } from './EnrollmentCard';
import { CancelEnrollmentModal } from './CancelEnrollmentModal';

export const MyCoursesPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cancellation modal state
  const [cancellingEnrollment, setCancellingEnrollment] = useState<Enrollment | null>(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const loadEnrollments = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchStudentEnrollments();
      setEnrollments(data);
    } catch (err: any) {
      const msg = err?.message || 'Không thể tải danh sách khóa học';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  const handleConfirmCancel = async () => {
    if (!cancellingEnrollment) return;
    setIsSubmittingCancel(true);
    try {
      await cancelStudentEnrollment(cancellingEnrollment.id);
      toast.success('Hủy ghi danh thành công!');
      setEnrollments((prev) =>
        prev.map((e) => (e.id === cancellingEnrollment.id ? { ...e, status: 'cancelled' } : e))
      );
      setCancellingEnrollment(null);
    } catch (err: any) {
      toast.error(err?.message || 'Hủy ghi danh thất bại');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  return (
    <main
      role="main"
      aria-label="Khóa học của tôi"
      data-testid="page-my-courses"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      <MyCoursesHeader totalCount={enrollments.length} />

      {isLoading && <MyCoursesLoading />}

      {!isLoading && errorMessage && (
        <MyCoursesError message={errorMessage} onRetry={loadEnrollments} />
      )}

      {!isLoading && !errorMessage && enrollments.length === 0 && <MyCoursesEmpty />}

      {!isLoading && !errorMessage && enrollments.length > 0 && (
        <div data-testid="my-courses-list">
          <section
            role="region"
            aria-label="Danh sách khóa học đã đăng ký"
            data-testid="list-my-courses"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {enrollments.map((enrollment) => (
              <EnrollmentCard
                key={enrollment.id}
                enrollment={enrollment}
                onCancelClick={(item) => setCancellingEnrollment(item)}
              />
            ))}
          </section>
        </div>
      )}

      <CancelEnrollmentModal
        enrollment={cancellingEnrollment}
        isOpen={!!cancellingEnrollment}
        isSubmitting={isSubmittingCancel}
        onConfirm={handleConfirmCancel}
        onClose={() => setCancellingEnrollment(null)}
      />
    </main>
  );
};

export default MyCoursesPage;
