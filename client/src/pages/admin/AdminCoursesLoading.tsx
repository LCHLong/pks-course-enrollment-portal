import React from 'react';

export const AdminCoursesLoading: React.FC = () => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Đang tải danh sách khóa học quản trị"
      data-testid="state-loading-admin-courses"
      className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shadow-sm p-4 space-y-4"
    >
      <div data-testid="loading-skeleton" className="space-y-3">
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="flex items-center gap-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 animate-pulse">
            <div className="h-5 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex-1" />
            <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg hidden sm:block" />
            <div className="h-5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-lg hidden md:block" />
            <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="h-9 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
          </div>
        ))}
      </div>
      <span className="sr-only">Đang tải danh sách khóa học...</span>
    </div>
  );
};
