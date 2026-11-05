import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Header } from '@/components/layout/Header';
import { CourseCard } from '@/components/course/CourseCard';
import { Course } from '@/types/course';

// Mock initial courses to demonstrate UI Card
const INITIAL_COURSES: Course[] = [
  {
    id: '1',
    title: 'Lập Trình Web Fullstack Chuyên Nghiệp (Node.js & React)',
    category: 'Fullstack Development',
    instructor: 'ThS. Hoàng Phúc (PKS Education)',
    description: 'Đào tạo thực chiến dự án Co-op, kiến trúc phân tầng RESTful API, PostgreSQL, React Vite và xử lý tải cao.',
    price: 1850000,
    capacity: 20,
    enrolled_count: 14,
    is_active: true,
    created_at: '2026-11-01',
    updated_at: '2026-11-01',
  },
  {
    id: '2',
    title: 'Luyện Thi Chứng Chỉ Quốc Tế MOS Excel Expert',
    category: 'Tin Học Văn Phòng',
    instructor: 'PKS Master Trainer',
    description: 'Trang bị kỹ năng xử lý dữ liệu nâng cao, trực quan hóa biểu đồ và tối ưu bảng tính phục vụ doanh nghiệp.',
    price: 950000,
    capacity: 25,
    enrolled_count: 25,
    is_active: true,
    created_at: '2026-11-02',
    updated_at: '2026-11-02',
  },
  {
    id: '3',
    title: 'Khóa Học Thiết Kế & Xây Dựng RESTful API Với Express & PostgreSQL',
    category: 'Backend Development',
    instructor: 'Kỹ Sư Nguyễn Minh',
    description: 'Nắm vững kỹ thuật xử lý Concurrency, Row Locking SELECT FOR UPDATE và tối ưu Database Indexing.',
    price: 1450000,
    capacity: 30,
    enrolled_count: 12,
    is_active: true,
    created_at: '2026-11-03',
    updated_at: '2026-11-03',
  },
];

export function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [courses] = useState<Course[]>(INITIAL_COURSES);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
        {/* Sonner Toast Notification */}
        <Toaster theme={isDarkMode ? 'dark' : 'light'} position="top-right" />

        {/* Header */}
        <Header
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          user={null}
        />

        {/* Main Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Catalog Banner */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Danh Sách Khóa Học Công Nghệ & Tin Học
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Tra cứu, tìm hiểu lộ trình và đăng ký ghi danh các khóa học Co-op thực chiến tại PKS.
              </p>
            </div>

            {/* Courses Grid: 1 col on mobile, 2 on tablet, 3 on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEnroll={(id) => alert(`Ghi danh khóa học ${id}`)}
                />
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          <p>© 2026 PKS Education & Technology. Tất cả quyền được bảo lưu.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
