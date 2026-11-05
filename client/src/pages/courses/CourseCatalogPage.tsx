import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/components/ui/api';
import { useAuth } from '@/components/ui/AuthContext';
import { CourseCard, CourseCardExtended } from './CourseCard';
import { CourseFilters } from './CourseFilters';
import { Pagination } from './Pagination';
import { CatalogLoadingState, CatalogErrorState, CatalogEmptyState, DEFAULT_CATEGORIES } from './CatalogStates';

export const CourseCatalogPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseCardExtended[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams();
      q.set('page', String(page));
      q.set('limit', '9');
      if (debouncedSearch.trim()) q.set('search', debouncedSearch.trim());
      if (category.trim()) q.set('category', category.trim());

      const res = await api.get<{ courses: CourseCardExtended[]; pagination: { totalPages: number } }>(
        `/courses?${q.toString()}`
      );
      setCourses(res?.courses || []);
      setTotalPages(res?.pagination?.totalPages || 1);
    } catch (err: any) {
      const msg = err?.message || 'Không thể tải danh sách khóa học';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, category]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const updateFilters = (newSearch?: string, newCategory?: string, newPage?: number) => {
    const next = new URLSearchParams(searchParams);
    if (newSearch !== undefined) {
      if (newSearch.trim()) next.set('search', newSearch);
      else next.delete('search');
      next.set('page', '1');
    }
    if (newCategory !== undefined) {
      if (newCategory.trim()) next.set('category', newCategory);
      else next.delete('category');
      next.set('page', '1');
    }
    if (newPage !== undefined) next.set('page', String(newPage));
    setSearchParams(next);
  };

  const handleEnroll = async (course: CourseCardExtended) => {
    if (!isAuthenticated) {
      navigate(`/login?returnUrl=${encodeURIComponent(`/courses/${course.id}`)}`);
      return;
    }
    setEnrollingId(course.id);
    try {
      await api.post(`/courses/${course.id}/enroll`);
      toast.success('Ghi danh khóa học thành công!');
      fetchCourses();
    } catch (err: any) {
      toast.error(err?.message || 'Không thể ghi danh khóa học');
    } finally {
      setEnrollingId(null);
    }
  };

  const allCategories = useMemo(() => {
    const fromCourses = courses.map((c) => c.category).filter(Boolean);
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...fromCourses]));
  }, [courses]);

  return (
    <section aria-label="Danh mục khóa học PKS" data-testid="catalog-container" className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Danh Sách Khóa Học Công Nghệ & Tin Học
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Tra cứu, tìm hiểu lộ trình và đăng ký ghi danh các khóa học Co-op thực chiến tại PKS.
        </p>
      </div>

      <CourseFilters
        search={search}
        category={category}
        categories={allCategories}
        onSearchChange={(val) => updateFilters(val, undefined, 1)}
        onCategoryChange={(val) => updateFilters(undefined, val, 1)}
        onReset={() => setSearchParams(new URLSearchParams())}
      />

      {isLoading ? (
        <CatalogLoadingState />
      ) : error ? (
        <CatalogErrorState error={error} onRetry={fetchCourses} />
      ) : courses.length === 0 ? (
        <CatalogEmptyState onClearFilters={() => setSearchParams(new URLSearchParams())} />
      ) : (
        <div data-testid="course-catalog-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={handleEnroll}
              isEnrolling={enrollingId === course.id}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => updateFilters(undefined, undefined, p)}
        isLoading={isLoading}
      />
    </section>
  );
};
export default CourseCatalogPage;
