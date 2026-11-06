import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, BookOpen, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Trang không tìm thấy 404"
      data-testid="page-not-found"
      className="min-h-[60vh] flex items-center justify-center px-4 py-16"
    >
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative mx-auto w-24 h-24 rounded-3xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shadow-sm">
          <Compass className="w-12 h-12 stroke-[1.5]" />
          <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Không tìm thấy trang
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Đường dẫn bạn yêu cầu không tồn tại hoặc đã được chuyển sang địa chỉ mới. Vui lòng kiểm tra lại URL hoặc quay về trang chủ.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/courses"
            data-testid="btn-notfound-catalog"
            aria-label="Quay lại danh mục khóa học"
            className="w-full sm:w-auto h-11 px-5 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Xem danh mục khóa học</span>
          </Link>
          <Link
            to="/"
            data-testid="btn-notfound-home"
            aria-label="Về trang chủ"
            className="w-full sm:w-auto h-11 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
