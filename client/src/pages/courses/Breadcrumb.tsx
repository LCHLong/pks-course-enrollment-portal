import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  category?: string;
  title: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ category, title }) => {
  return (
    <nav
      aria-label="Đường dẫn điều hướng"
      data-testid="breadcrumb-nav"
      className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 overflow-x-auto pb-1"
    >
      <Link
        to="/"
        aria-label="Quay lại danh mục khóa học"
        data-testid="breadcrumb-catalog"
        className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Trang chủ</span>
      </Link>

      {category && (
        <>
          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
          <Link
            to={`/?category=${encodeURIComponent(category)}`}
            className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors shrink-0 truncate max-w-[150px]"
          >
            {category}
          </Link>
        </>
      )}

      <ChevronRight className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
      <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-[300px]">
        {title}
      </span>
    </nav>
  );
};
