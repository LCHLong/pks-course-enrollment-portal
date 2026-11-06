import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, BookOpen } from 'lucide-react';
import { api } from '@/components/ui/api';
import { useAuth } from '@/components/ui/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumb } from './Breadcrumb';
import { CourseCardExtended } from './CourseCard';
import { DetailLoadingState, Detail404State, DetailErrorState } from './CourseDetailStates';
import { CourseDetailActionCard } from './CourseDetailActionCard';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState<CourseCardExtended | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [is404, setIs404] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const fetchCourse = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setIs404(false);
    setError(null);
    try {
      const res = await api.get<{ course?: CourseCardExtended } | CourseCardExtended>(`/courses/${id}`);
      const data = (res as any)?.course || res;
      setCourse(data);
    } catch (err: any) {
      if (err?.status === 404 || err?.code === 'COURSE_NOT_FOUND' || err?.status === 400) {
        setIs404(true);
      } else {
        setError(err?.message || 'Không thể tải thông tin khóa học');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handleActionClick = async () => {
    if (!course) return;
    if (!isAuthenticated) {
      navigate(`/login?returnUrl=${encodeURIComponent(`/courses/${course.id}`)}`);
      return;
    }
    if (user?.role === 'admin') {
      navigate('/admin/courses');
      return;
    }
    setIsEnrolling(true);
    try {
      await api.post(`/courses/${course.id}/enroll`);
      toast.success('Ghi danh khóa học thành công!');
      fetchCourse();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể ghi danh khóa học');
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) return <DetailLoadingState />;
  if (is404) return <Detail404State />;
  if (error || !course) return <DetailErrorState error={error || 'Đã có lỗi xảy ra.'} onRetry={fetchCourse} />;

  return (
    <main aria-label="Chi tiết khóa học" data-testid="course-detail-view" className="space-y-6 max-w-6xl mx-auto pb-16">
      <Breadcrumb category={course.category} title={course.title} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <Badge variant="neutral" data-testid="course-detail-category" aria-label={`Danh mục: ${course.category}`}>
              {course.category}
            </Badge>
            <h1 id="course-detail-title" data-testid="course-detail-title" className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
              {course.title}
            </h1>
          </div>

          <section aria-label="Thông tin giảng viên" data-testid="course-detail-instructor" className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300 font-bold shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Giảng viên phụ trách</p>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{course.instructor}</p>
            </div>
          </section>

          <section aria-label="Mô tả khóa học" data-testid="course-detail-description" className="space-y-3">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Mô tả tổng quan</h2>
            <div className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 whitespace-pre-line">
              {course.description}
            </div>
          </section>

          <section aria-label="Nội dung chương trình học" data-testid="course-detail-syllabus" className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Chương trình đào tạo chi tiết
            </h2>
            <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <p>• Học phần 1: Nền tảng tư duy, kiến trúc hệ thống và chuẩn mực mã nguồn sạch.</p>
              <p>• Học phần 2: Thực hành dự án Co-op giả lập môi trường doanh nghiệp thực tế.</p>
              <p>• Học phần 3: Đánh giá KCS, kiểm thử tự động và bảo vệ đồ án kết thúc khóa.</p>
            </div>
          </section>
        </div>

        <CourseDetailActionCard
          course={course}
          isAuthenticated={isAuthenticated}
          userRole={user?.role}
          isEnrolling={isEnrolling}
          onActionClick={handleActionClick}
        />
      </div>
    </main>
  );
};
export default CourseDetailPage;
