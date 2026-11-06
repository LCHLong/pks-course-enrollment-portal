import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export const MyCoursesEmpty: React.FC = () => {
  return (
    <section
      role="status"
      aria-label="Chưa có khóa học nào"
      data-testid="state-empty-my-courses"
      className="border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 text-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm"
    >
      <div data-testid="empty-state" className="max-w-md mx-auto flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mb-4 shadow-sm">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Bạn chưa đăng ký khóa học nào
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 mb-6 leading-relaxed">
          Hãy khám phá danh mục khóa học của PKS và bắt đầu hành trình nâng cao kỹ năng ngay hôm nay!
        </p>
        <Link
          to="/"
          role="link"
          aria-label="Khám phá danh mục khóa học"
          data-testid="btn-explore-courses"
          className="h-11 px-6 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-semibold inline-flex items-center justify-center shadow-sm transition-colors"
        >
          Khám phá khóa học
        </Link>
      </div>
    </section>
  );
};
