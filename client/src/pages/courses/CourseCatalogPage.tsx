import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Local input state for 60fps typing without URL thrashing
  const [searchInput, setSearchInput] = useState(searchParam);
  const [debouncedSearch, setDebouncedSearch] = useState(searchParam);

  // In-memory cache to make filter toggling and pagination instantaneous (0ms latency)
  const cacheRef = useRef<Map<string, { courses: CourseCardExtended[]; totalPages: number }>>(new Map());

  // Synchronize local input if URL changes externally
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      const next = new URLSearchParams(searchParams);
      if (searchInput.trim()) {
        next.set('search', searchInput.trim());
      } else {
        next.delete('search');
      }
      next.set('page', '1');
      setSearchParams(next);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchInput]);

  // Fetch dynamic categories from backend
  useEffect(() => {
    api.get<{ categories: string[] }>('/courses/categories')
      .then((res) => {
        if (res?.categories && Array.isArray(res.categories)) {
          setDynamicCategories(res.categories);
        }
      })
      .catch(() => {});
  }, []);

  const fetchCourses = useCallback(async (bypassCache = false) => {
    setIsFetching(true);
    setError(null);

    const q = new URLSearchParams();
    q.set('page', String(pageParam));
    q.set('limit', '9');
    if (debouncedSearch.trim()) q.set('search', debouncedSearch.trim());
    if (categoryParam.trim()) q.set('category', categoryParam.trim());

    const cacheKey = q.toString();

    // Check memory cache first for instant UI response
    if (!bypassCache && cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey)!;
      setCourses(cached.courses);
      setTotalPages(cached.totalPages);
      setIsInitialLoading(false);
      setIsFetching(false);
      return;
    }

    try {
      const res = await api.get<{ courses: CourseCardExtended[]; pagination: { totalPages: number } }>(
        `/courses?${cacheKey}`
      );
      const newCourses = res?.courses || [];
      const newTotalPages = res?.pagination?.totalPages || 1;

      // Update memory cache
      cacheRef.current.set(cacheKey, {
        courses: newCourses,
        totalPages: newTotalPages,
      });

      setCourses(newCourses);
      setTotalPages(newTotalPages);
    } catch (err: any) {
      const msg = err?.message || 'Không thể tải danh sách khóa học';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsInitialLoading(false);
      setIsFetching(false);
    }
  }, [pageParam, debouncedSearch, categoryParam]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCategoryChange = (newCategory: string) => {
    const next = new URLSearchParams(searchParams);
    if (newCategory.trim()) {
      next.set('category', newCategory.trim());
    } else {
      next.delete('category');
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSearchParams(new URLSearchParams());
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
      // Invalidate cache and refetch
      cacheRef.current.clear();
      fetchCourses(true);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể ghi danh khóa học');
    } finally {
      setEnrollingId(null);
    }
  };

  const allCategories = useMemo(() => {
    const fromCourses = courses.map((c) => c.category).filter(Boolean);
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...dynamicCategories, ...fromCourses]));
  }, [courses, dynamicCategories]);

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
        search={searchInput}
        category={categoryParam}
        categories={allCategories}
        isSearching={isFetching}
        onSearchChange={(val) => setSearchInput(val)}
        onCategoryChange={handleCategoryChange}
        onReset={handleResetFilters}
      />

      {isInitialLoading && courses.length === 0 ? (
        <CatalogLoadingState />
      ) : error ? (
        <CatalogErrorState error={error} onRetry={() => fetchCourses(true)} />
      ) : courses.length === 0 ? (
        <CatalogEmptyState onClearFilters={handleResetFilters} />
      ) : (
        <div
          data-testid="course-catalog-grid"
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transition-opacity duration-200 ${
            isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'
          }`}
        >
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
        currentPage={pageParam}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={isFetching}
      />
    </section>
  );
};

export default CourseCatalogPage;
